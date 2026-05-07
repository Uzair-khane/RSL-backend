const express = require('express');
const router = express.Router();
const Payment = require('../../models/payment');
const Bookings = require('../../models/booking');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//  PAGE — Payments List
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
    console.log(error);
  }
});

//  DATA — Payments List (DataTable)
router.post('/list', async (req, res) => {
  try {
    const { filter_status } = req.body;

    let whereClause = { isDeleted: 0 };
    if (filter_status && filter_status !== '0') {
      whereClause.payment_status = filter_status;
    }

    const payments = await Payment.findAll({
      where: whereClause,
      include: [{
        model: Bookings,
        as: 'booking',
        attributes: ['id', 'name', 'email', 'contact_no', 'from_location', 'to_location', 'pickup_date', 'pickup_time']
      }],
      order: [['createdAt', 'DESC']]
    });

    const data = payments.map((p, index) => {
      const booking = p.booking;

      let statusBadge = '';
      if (p.payment_status === 'pending') {
        statusBadge = `<span class="badge badge-warning"> Pending</span>`;
      } else if (p.payment_status === 'completed') {
        statusBadge = `<span class="badge badge-success">Approved</span>`;
      } else {
        statusBadge = `<span class="badge badge-danger"> Rejected</span>`;
      }

      let screenshotBtn = '-';
      if (p.screenshot) {
        screenshotBtn = `<button onclick="viewScreenshot('${p.screenshot}')" class="btn btn-sm btn-info">📸 View</button>`;
      }

   let actionBtns = '-';
      if (p.payment_status === 'pending') {
        actionBtns = `<div class="action-btns">
          <button onclick="approvePayment(${p.id})" class="btn btn-sm btn-success">Approve</button>
          <button onclick="rejectPayment(${p.id})" class="btn btn-sm btn-danger">Reject</button>
        </div>`;
      } else if (p.payment_status === 'completed') {
        actionBtns = `<div class="action-btns">
          <button onclick="deletePayment(${p.id})" class="btn btn-sm btn-secondary">Delete</button>
        </div>`;
      } else {
        actionBtns = `<div class="action-btns">
          <button onclick="approvePayment(${p.id})" class="btn btn-sm btn-success">Re-Approve</button>
          <button onclick="deletePayment(${p.id})" class="btn btn-sm btn-secondary">Delete</button>
        </div>`;
      }

      return [
        index + 1,
        `#${p.booking_id}`,
        booking?.name || '-',
        booking?.contact_no || '-',
        booking?.email || '-',
        `<strong>PKR ${p.amount}</strong>`,
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
      data: data
    });

  } catch (error) {
    console.log(error);
    return res.send({ draw: 0, recordsTotal: 0, recordsFiltered: 0, data: [] });
  }
});

//  APPROVE PAYMENT
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

    await payment.update({ payment_status: 'completed' });
    await payment.booking.update({
      amount_status: 'collected',
      booking_status: 'process'
    });

    try {
      const msg = {
        to: payment.booking.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'RSL — Payment Approved! Booking Confirmed',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0693E3;">Real Smart Limousine</h2>
            <p>Hello <strong>${payment.booking.name}</strong>,</p>
            <p>Your payment has been verified and booking is confirmed!</p>
            <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking ID:</strong> #${payment.booking_id}</p>
              <p><strong>Amount:</strong> PKR ${payment.amount}</p>
              <p><strong>Status:</strong> Confirmed</p>
            </div>
            <p>Your driver will contact you shortly. Thank you for choosing RSL!</p>
            <hr/>
            <p style="color: #999; font-size: 12px;">Real Smart Limousine</p>
          </div>
        `
      };
      await sgMail.send(msg);
      console.log('Approval email sent to customer');
    } catch (emailError) {
      console.log(' Email error:', emailError.message);
    }

    return res.send({ success: true, message: 'Payment approved successfully!' });

  } catch (error) {
    return res.send({ success: false, message: 'Error: ' + error.message });
  }
});

// REJECT PAYMENT
router.post('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOne({
      where: { id, isDeleted: 0 }
    });

    if (!payment) {
      return res.send({ success: false, message: 'Payment not found.' });
    }

    await payment.update({ payment_status: 'failed' });

    return res.send({ success: true, message: 'Payment rejected.' });

  } catch (error) {
    return res.send({ success: false, message: 'Error: ' + error.message });
  }
});

module.exports = router;