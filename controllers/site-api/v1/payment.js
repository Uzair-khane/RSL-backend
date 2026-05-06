const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../../../models/payment');
const Bookings = require('../../../models/booking');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Customer ko receipt email bhejo
async function sendReceiptEmail(email, name, amount, bookingId) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'RSL — Payment Successful!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0693E3;">Real Smart Limousine</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your payment has been received successfully!</p>
        <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking ID:</strong> #${bookingId}</p>
          <p><strong>Amount Paid:</strong> PKR ${amount}</p>
          <p><strong>Status:</strong> ✅ Confirmed</p>
        </div>
        <p>Thank you for choosing RSL. Your driver will contact you shortly.</p>
        <hr/>
        <p style="color: #999; font-size: 12px;">Real Smart Limousine — Luxury Ride Booking</p>
      </div>
    `
  };
  await sgMail.send(msg);
}

// ✅ 1. CREATE PAYMENT INTENT
const createPaymentIntent = async (req, res) => {
  try {
    const { booking_id, amount } = req.body;

    if (!booking_id || !amount) {
      return res.send({ success: false, message: 'booking_id and Amount are required' });
    }

    // Booking check karo
    const booking = await Bookings.findOne({
      where: { id: booking_id, isDeleted: 0 }
    });

    if (!booking) {
      return res.send({ success: false, message: 'Booking Not Found' });
    }

    // Stripe payment intent banao
    // Amount cents mein hona chahiye — PKR ke liye paisa
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'pkr',
      metadata: {
        booking_id: booking_id,
        customer_name: booking.name,
        customer_email: booking.email,
      }
    });

    return res.send({
      success: true,
      message: 'Payment intent created.',
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });

  } catch (error) {
    return res.send({ success: false, message: 'Error: ' + error.message });
  }
};

// ✅ 2. CONFIRM PAYMENT
const confirmPayment = async (req, res) => {
  try {
    const { booking_id, stripe_payment_id, amount } = req.body;

    if (!booking_id || !stripe_payment_id || !amount) {
      return res.send({ success: false, message: 'All field are required.' });
    }

    // Booking check karo
    const booking = await Bookings.findOne({
      where: { id: booking_id, isDeleted: 0 }
    });

    if (!booking) {
      return res.send({ success: false, message: 'Booking Not Found' });
    }

    // Payment save karo
    const payment = await Payment.create({
      booking_id,
      stripe_payment_id,
      amount,
      currency: 'PKR',
      payment_status: 'completed',
      payment_method: 'card',
      description: `Payment for booking #${booking_id}`
    });

    // Booking status update karo
    await booking.update({ 
      amount_status: 'collected',
      booking_status: 'process'
    });

    // Customer ko receipt email bhejo
    try {
      await sendReceiptEmail(
        booking.email,
        booking.name,
        amount,
        booking_id
      );
      console.log('✅ The receipt email has been sent.:', booking.email);
    } catch (emailError) {
      console.log('⚠️ Email error:', emailError.message);
    }

    return res.send({
      success: true,
      message: 'Payment successful! The receipt email has been sent.',
      payment_id: payment.id
    });

  } catch (error) {
    return res.send({ success: false, message: 'Error: ' + error.message });
  }
};

// ✅ 3. PAYMENT HISTORY
const paymentHistory = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const payments = await Payment.findAll({
      where: { booking_id, isDeleted: 0 },
      order: [['createdAt', 'DESC']]
    });

    return res.send({
      success: true,
      message: 'Payment history fetched.',
      data: payments
    });

  } catch (error) {
    return res.send({ success: false, message: 'Error: ' + error.message });
  }
};

module.exports = { createPaymentIntent, confirmPayment, paymentHistory };