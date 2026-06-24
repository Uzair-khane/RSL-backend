const express = require('express');
const router = express.Router();

const Payment = require('../../models/payment');
const Bookings = require('../../models/booking');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// PAGE — Payments List
router.get('/list', async (req, res) => {
  try {
    return res.render('admin/payments/list', {
      title: 'Payments',
      pageTitle: 'Payments',
      actionUrl: '/ap/payments',
      baseUrl: process.env.BASE_URL,
      successFlash: req.flash('success'),
      errorFlash: req.flash('error').join('<br />'),
    });
  } catch (error) {
    console.log('PAYMENTS PAGE ERROR =>', error);
    return res.status(500).send('Server Error');
  }
});

// DATA — Payments List
router.post('/list', async (req, res) => {
  try {
    const { filter_status } = req.body;

    const whereClause = { isDeleted: 0 };

    if (filter_status && filter_status !== '0') {
      whereClause.payment_status = filter_status;
    }

    const payments = await Payment.findAll({
      where: whereClause,
      include: [{
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
          'pickup_time'
        ]
      }],
      order: [['createdAt', 'DESC']]
    });

    const data = payments.map((p, index) => {
      const booking = p.booking;

      let statusBadge = '';

      if (p.payment_status === 'pending') {
        statusBadge = `
    <span style="
      background:#ffc107;
      color:#000;
      padding:6px 12px;
      border-radius:20px;
      font-size:12px;
      font-weight:700;
      display:inline-block;
      min-width:90px;
      text-align:center;
    ">Pending</span>`;
      } else if (p.payment_status === 'verified') {
        statusBadge = `
    <span style="
      background:#28a745;
      color:#fff !important;
      padding:6px 12px;
      border-radius:20px;
      font-size:12px;
      font-weight:700;
      display:inline-block;
      min-width:90px;
      text-align:center;
    ">Verified</span>`;
      } else if (p.payment_status === 'completed') {
        statusBadge = `
    <span style="
      background:#20c997;
      color:#fff !important;
      padding:6px 12px;
      border-radius:20px;
      font-size:12px;
      font-weight:700;
      display:inline-block;
      min-width:90px;
      text-align:center;
    ">Completed</span>`;
      } else if (p.payment_status === 'cash_collected') {
        statusBadge = `
    <span style="
      background:#007bff;
      color:#fff !important;
      padding:6px 12px;
      border-radius:20px;
      font-size:12px;
      font-weight:700;
      display:inline-block;
      min-width:120px;
      text-align:center;
    ">Cash Collected</span>`;
      } else if (p.payment_status === 'failed' || p.payment_status === 'rejected') {
        statusBadge = `
    <span style="
      background:#dc3545;
      color:#fff !important;
      padding:6px 12px;
      border-radius:20px;
      font-size:12px;
      font-weight:700;
      display:inline-block;
      min-width:90px;
      text-align:center;
    ">Rejected</span>`;
      } else {
        statusBadge = `
    <span style="
      background:#6c757d;
      color:#fff !important;
      padding:6px 12px;
      border-radius:20px;
      font-size:12px;
      font-weight:700;
      display:inline-block;
      min-width:90px;
      text-align:center;
    ">${p.payment_status || '-'}</span>`;
      }

      let screenshotBtn = '-';

      if (p.screenshot) {
        screenshotBtn = `
    <button
      onclick="viewScreenshot('${p.screenshot}')"
      style="
        background:#0693E3;
        color:#fff;
        border:none;
        padding:7px 16px;
        border-radius:8px;
        font-size:12px;
        font-weight:700;
        cursor:pointer;
      ">
      View
    </button>`;
      }

      let actionBtns = '-';
      if (p.payment_status === 'pending') {
        actionBtns = `
          <div class="action-btns">
            <button onclick="approvePayment(${p.id})" class="btn btn-sm btn-success">Verify</button>
            <button onclick="rejectPayment(${p.id})" class="btn btn-sm btn-danger">Reject</button>
            <button onclick="cashCollected(${p.id})" class="btn btn-sm btn-primary">Cash Collected</button>
          </div>
        `;
      } else if (
        p.payment_status === 'verified' ||
        p.payment_status === 'completed' ||
        p.payment_status === 'cash_collected'
      ) {
        actionBtns = `
          <div class="action-btns">
            <button onclick="deletePayment(${p.id})" class="btn btn-sm btn-secondary">Delete</button>
          </div>
        `;
      } else {
        actionBtns = `
          <div class="action-btns">
            <button onclick="approvePayment(${p.id})" class="btn btn-sm btn-success">Re-Verify</button>
            <button onclick="deletePayment(${p.id})" class="btn btn-sm btn-secondary">Delete</button>
          </div>
        `;
      }

      return [
        index + 1,
        `#${p.booking_id}`,
        booking?.name || '-',
        booking?.contact_no || '-',
        booking?.email || '-',
        `<strong>PKR ${p.amount}</strong>`,
        p.payment_method || '-',
        p.transfer_reference || '-',
        screenshotBtn,
        statusBadge,
        new Date(p.createdAt).toLocaleDateString(),
        actionBtns
      ];
    });

    return res.send({
      draw: req.body.draw,
      recordsTotal: data.length,
      recordsFiltered: data.length,
      data
    });

  } catch (error) {
    console.log('PAYMENTS LIST ERROR =>', error);
    return res.send({
      draw: req.body.draw || 0,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: []
    });
  }
});

// VERIFY PAYMENT
router.post('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOne({
      where: { id, isDeleted: 0 },
      include: [{ model: Bookings, as: 'booking' }]
    });

    if (!payment) {
      return res.send({ success: false, message: 'Payment not found.' });
    }

    await payment.update({
      payment_status: 'verified'
    });

    if (payment.booking) {
      await payment.booking.update({
        amount_status: 'collected',
        booking_status: 'process',
        payment_status: 'verified',
        payment_method: payment.payment_method || 'card',
        paid_at: new Date()
      });
    }

    try {
      if (payment.booking && payment.booking.email && process.env.SENDGRID_FROM_EMAIL) {
        await sgMail.send({
          to: payment.booking.email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: 'RSL — Payment Verified! Booking Confirmed',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #0693E3;">Real Smart Limousine</h2>
              <p>Hello <strong>${payment.booking.name || 'Customer'}</strong>,</p>
              <p>Your payment has been verified and your booking is confirmed.</p>
              <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Booking ID:</strong> #${payment.booking_id}</p>
                <p><strong>Amount:</strong> PKR ${payment.amount}</p>
                <p><strong>Payment Status:</strong> Verified</p>
                <p><strong>Booking Status:</strong> Confirmed</p>
              </div>
              <p>Your driver will contact you shortly. Thank you for choosing RSL!</p>
              <hr/>
              <p style="color: #999; font-size: 12px;">Real Smart Limousine</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.log('VERIFY EMAIL ERROR =>', emailError.message);
    }

    return res.send({
      success: true,
      message: 'Payment verified successfully!'
    });

  } catch (error) {
    console.log('VERIFY PAYMENT ERROR =>', error);
    return res.send({
      success: false,
      message: error.message || 'Verification failed.'
    });
  }
});

// REJECT PAYMENT
router.post('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOne({
      where: { id, isDeleted: 0 },
      include: [{ model: Bookings, as: 'booking' }]
    });

    if (!payment) {
      return res.send({ success: false, message: 'Payment not found.' });
    }

    await payment.update({
      payment_status: 'rejected'
    });

    if (payment.booking) {
      await payment.booking.update({
        amount_status: 'withdriver',
        booking_status: 'pending',
        payment_status: 'rejected'
      });
    }

    return res.send({
      success: true,
      message: 'Payment rejected successfully.'
    });

  } catch (error) {
    console.log('REJECT PAYMENT ERROR =>', error);
    return res.send({
      success: false,
      message: error.message || 'Rejection failed.'
    });
  }
});

// CASH COLLECTED
router.post('/cash-collected/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOne({
      where: { id, isDeleted: 0 },
      include: [{ model: Bookings, as: 'booking' }]
    });

    if (!payment) {
      return res.send({ success: false, message: 'Payment not found.' });
    }

    await payment.update({
      payment_status: 'cash_collected',
      payment_method: 'cash'
    });

    if (payment.booking) {
      await payment.booking.update({
        amount_status: 'collected',
        booking_status: 'process',
        payment_status: 'cash_collected',
        payment_method: 'cash',
        paid_at: new Date()
      });
    }

    try {
      if (payment.booking && payment.booking.email && process.env.SENDGRID_FROM_EMAIL) {
        await sgMail.send({
          to: payment.booking.email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: 'RSL — Cash Payment Collected',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #0693E3;">Real Smart Limousine</h2>
              <p>Hello <strong>${payment.booking.name || 'Customer'}</strong>,</p>
              <p>Your cash payment has been collected and your booking is confirmed.</p>
              <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Booking ID:</strong> #${payment.booking_id}</p>
                <p><strong>Amount:</strong> PKR ${payment.amount}</p>
                <p><strong>Payment Method:</strong> Cash</p>
                <p><strong>Payment Status:</strong> Cash Collected</p>
              </div>
              <p>Thank you for choosing RSL!</p>
              <hr/>
              <p style="color: #999; font-size: 12px;">Real Smart Limousine</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.log('CASH EMAIL ERROR =>', emailError.message);
    }

    return res.send({
      success: true,
      message: 'Cash payment marked as collected.'
    });

  } catch (error) {
    console.log('CASH COLLECTED ERROR =>', error);
    return res.send({
      success: false,
      message: error.message || 'Cash collection failed.'
    });
  }
});

module.exports = router;