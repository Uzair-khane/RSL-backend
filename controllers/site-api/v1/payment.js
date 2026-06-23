const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const Payment = require('../../../models/payment');
const Bookings = require('../../../models/booking');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* =====================================================
   CUSTOMER RECEIPT EMAIL
===================================================== */
async function sendReceiptEmail(email, name, amount, bookingId) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'RSL — Payment Submitted Successfully!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0693E3;">Real Smart Limousine</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your payment has been submitted successfully and is under review.</p>

        <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking ID:</strong> #${bookingId}</p>
          <p><strong>Amount:</strong> PKR ${amount}</p>
          <p><strong>Status:</strong> Pending Verification</p>
          <p><strong>Bank:</strong> Bank Alfalah</p>
        </div>

        <p>Our team will verify your payment shortly.</p>
        <hr/>
        <p style="color: #999; font-size: 12px;">Real Smart Limousine — Luxury Ride Booking</p>
      </div>
    `
  };

  await sgMail.send(msg);
}

/* =====================================================
   ADMIN PAYMENT NOTIFICATION EMAIL
===================================================== */
async function sendAdminNotification(payment, booking) {
  const msg = {
    to: process.env.SENDGRID_FROM_EMAIL,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'RSL — New Payment Received! Verification Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0693E3;">Real Smart Limousine — Admin Alert</h2>
        <p>A new payment has been submitted and requires verification.</p>

        <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333;">Payment Details</h3>
          <p><strong>Booking ID:</strong> #${booking.id}</p>
          <p><strong>Customer:</strong> ${booking.name}</p>
          <p><strong>Email:</strong> ${booking.email}</p>
          <p><strong>Phone:</strong> ${booking.contact_no}</p>
          <p><strong>Amount:</strong> PKR ${payment.amount}</p>
          <p><strong>Reference:</strong> ${payment.transfer_reference}</p>
          <p><strong>Bank:</strong> Bank Alfalah</p>
          <p><strong>Status:</strong> Pending Verification</p>
        </div>

        <p>Please login to admin panel to verify this payment.</p>
        <hr/>
        <p style="color: #999; font-size: 12px;">Real Smart Limousine — Admin Panel</p>
      </div>
    `
  };

  await sgMail.send(msg);
}

/* =====================================================
   1. CREATE PAYMENT INTENT
===================================================== */
const createPaymentIntent = async (req, res) => {
  try {
    const { booking_id, amount } = req.body;

    if (!booking_id || !amount) {
      return res.send({
        success: false,
        message: 'booking_id and amount are required.'
      });
    }

    const booking = await Bookings.findOne({
      where: {
        id: booking_id,
        isDeleted: 0
      }
    });

    if (!booking) {
      return res.send({
        success: false,
        message: 'Booking not found.'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'pkr',
      metadata: {
        booking_id,
        customer_name: booking.name,
        customer_email: booking.email
      }
    });

    return res.send({
      success: true,
      message: 'Payment intent created.',
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });

  } catch (error) {
    return res.send({
      success: false,
      message: 'Error: ' + error.message
    });
  }
};

/* =====================================================
   2. CONFIRM PAYMENT — BANK TRANSFER + SCREENSHOT
===================================================== */
const confirmPayment = async (req, res) => {
  try {
    const {
      booking_id,
      amount,
      payment_type,
      payment_method,
      transfer_reference
    } = req.body;

    const screenshot = req.files?.screenshot;

    if (!booking_id || !amount) {
      return res.send({
        success: false,
        message: 'booking_id and amount are required.'
      });
    }

    const booking = await Bookings.findOne({
      where: {
        id: booking_id,
        isDeleted: 0
      }
    });

    if (!booking) {
      return res.send({
        success: false,
        message: 'Booking not found.'
      });
    }

    let screenshotPath = null;

    if (screenshot) {
      const fs = require('fs');
      const uploadDir = 'uploads/payments/';

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      screenshotPath = `${uploadDir}${fileName}`;

      await screenshot.mv(screenshotPath);
    }

    const payment = await Payment.create({
      booking_id,
      stripe_payment_id: transfer_reference || `BANK_${Date.now()}`,
      amount,
      currency: 'PKR',
      payment_status: 'pending',
      payment_method: payment_method || 'bank_transfer',
      payment_type: payment_type || 'bank_transfer',
      bank_name: 'Bank Alfalah',
      account_number: '55095002418458',
      transfer_reference: transfer_reference || '',
      screenshot: screenshotPath,
      description: `Bank transfer for booking #${booking_id}`
    });

    await booking.update({
      amount_status: 'withdriver',
      booking_status: 'process',
      payment_status: 'pending',
      payment_method: payment_method || 'bank_transfer',
      paid_at: new Date()
    });

    try {
      await sendReceiptEmail(
        booking.email,
        booking.name,
        amount,
        booking_id
      );

      console.log('✅ Customer receipt email sent:', booking.email);
    } catch (emailError) {
      console.log('⚠️ Customer email error:', emailError.message);
    }

    try {
      await sendAdminNotification(payment, booking);
      console.log('✅ Admin payment notification sent');
    } catch (emailError) {
      console.log('⚠️ Admin email error:', emailError.message);
    }

    return res.send({
      success: true,
      message: 'Payment submitted! We will verify your transfer shortly.',
      payment_id: payment.id,
      booking_id,
      payment_status: 'pending'
    });

  } catch (error) {
    return res.send({
      success: false,
      message: 'Error: ' + error.message
    });
  }
};

/* =====================================================
   3. PAYMENT HISTORY
===================================================== */
const paymentHistory = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const payments = await Payment.findAll({
      where: {
        booking_id,
        isDeleted: 0
      },
      order: [['createdAt', 'DESC']]
    });

    return res.send({
      success: true,
      message: 'Payment history fetched.',
      data: payments
    });

  } catch (error) {
    return res.send({
      success: false,
      message: 'Error: ' + error.message
    });
  }
};

/* =====================================================
   4. APPROVE PAYMENT — ADMIN
===================================================== */
const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOne({
      where: {
        id,
        isDeleted: 0
      },
      include: [
        {
          model: Bookings,
          as: 'booking'
        }
      ]
    });

    if (!payment) {
      return res.send({
        success: false,
        message: 'Payment not found.'
      });
    }

    await payment.update({
      payment_status: 'completed'
    });

    await payment.booking.update({
      amount_status: 'collected',
      booking_status: 'process',
      payment_status: 'paid',
      payment_method: payment.payment_method || 'bank_transfer',
      paid_at: new Date()
    });

    try {
      const confirmMsg = {
        to: payment.booking.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'RSL — Payment Approved! Booking Confirmed',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0693E3;">Real Smart Limousine</h2>
            <p>Hello <strong>${payment.booking.name}</strong>,</p>
            <p>Great news! Your payment has been verified and your booking is confirmed.</p>

            <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking ID:</strong> #${payment.booking_id}</p>
              <p><strong>Amount:</strong> PKR ${payment.amount}</p>
              <p><strong>Status:</strong> Confirmed</p>
            </div>

            <p>Your driver will contact you shortly. Thank you for choosing RSL.</p>
            <hr/>
            <p style="color: #999; font-size: 12px;">Real Smart Limousine — Luxury Ride Booking</p>
          </div>
        `
      };

      await sgMail.send(confirmMsg);
      console.log('✅ Approval email sent to customer');
    } catch (emailError) {
      console.log('⚠️ Approval email error:', emailError.message);
    }

    return res.send({
      success: true,
      message: 'Payment approved successfully.',
      booking_payment_status: 'paid'
    });

  } catch (error) {
    return res.send({
      success: false,
      message: 'Error: ' + error.message
    });
  }
};

/* =====================================================
   5. REJECT PAYMENT — ADMIN
===================================================== */
const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOne({
      where: {
        id,
        isDeleted: 0
      },
      include: [
        {
          model: Bookings,
          as: 'booking'
        }
      ]
    });

    if (!payment) {
      return res.send({
        success: false,
        message: 'Payment not found.'
      });
    }

    await payment.update({
      payment_status: 'failed'
    });

    if (payment.booking) {
      await payment.booking.update({
        payment_status: 'failed'
      });
    }

    return res.send({
      success: true,
      message: 'Payment rejected.',
      booking_payment_status: 'failed'
    });

  } catch (error) {
    return res.send({
      success: false,
      message: 'Error: ' + error.message
    });
  }
};

/* =====================================================
   6. ALL PAYMENTS — ADMIN
===================================================== */
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: {
        isDeleted: 0
      },
      include: [
        {
          model: Bookings,
          as: 'booking',
          attributes: [
            'id',
            'name',
            'email',
            'contact_no',
            'from_location',
            'to_location',
            'pickup_date',
            'pickup_time',
            'payment_status',
            'payment_method',
            'paid_at'
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.send({
      success: true,
      message: 'All payments fetched.',
      data: payments
    });

  } catch (error) {
    return res.send({
      success: false,
      message: 'Error: ' + error.message
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  paymentHistory,
  approvePayment,
  rejectPayment,
  getAllPayments
};