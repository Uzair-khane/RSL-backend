var express = require('express');
var router = express.Router();
const SafetyAlert = require('../../../models/SafetyAlert');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ─── Email Function ───────────────────────────────────
async function sendAdminEmail(type, booking_id, customer_id, lat, lng) {
  try {
    const mapsLink = lat && lng 
      ? `https://www.google.com/maps?q=${lat},${lng}` 
      : 'Location not available';

    const subject = type === 'sos' 
      ? '🚨 SOS EMERGENCY ALERT — RSL' 
      : '🔧 Vehicle Breakdown Alert — RSL';

    const color = type === 'sos' ? 'red' : 'orange';

    await sgMail.send({
      to: process.env.ADMIN_ALERT_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: subject,
      html: `
        <div style="font-family:Arial; max-width:600px; margin:auto; padding:20px; 
             border:2px solid ${color}; border-radius:10px;">
          <h2 style="color:${color};">${subject}</h2>
          <hr/>
          <p><b>Booking ID:</b> #${booking_id || 'N/A'}</p>
          <p><b>Customer ID:</b> ${customer_id || 'N/A'}</p>
          <p><b>Time:</b> ${new Date().toLocaleString()}</p>
          <p><b>Location:</b> <a href="${mapsLink}">Open Google Map</a></p>
          <hr/>
          <p style="color:gray; font-size:12px;">RSL — Real Smart Limousine Safety System</p>
        </div>
      `
    });

    console.log(`✅ Admin email sent for ${type}`);
  } catch (err) {
    console.error('❌ Email error:', err.message);
  }
}

// ─── POST /safety/sos ─────────────────────────────────
router.post('/sos', async (req, res) => {
  const { booking_id, customer_id, driver_id, latitude, longitude } = req.body;
  try {
    await SafetyAlert.create({
      booking_id, 
      customer_id, 
      driver_id,
      alert_type: 'sos',
      message: 'SOS Emergency Alert',
      latitude, 
      longitude
    });
    await sendAdminEmail('sos', booking_id, customer_id, latitude, longitude);
    res.json({ success: true, message: 'SOS alert sent! Admin notified.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── POST /safety/breakdown ───────────────────────────
router.post('/breakdown', async (req, res) => {
  const { booking_id, customer_id, driver_id, latitude, longitude } = req.body;
  try {
    await SafetyAlert.create({
      booking_id, 
      customer_id, 
      driver_id,
      alert_type: 'breakdown',
      message: 'Vehicle Breakdown Reported',
      latitude, 
      longitude
    });
    await sendAdminEmail('breakdown', booking_id, customer_id, latitude, longitude);
    res.json({ success: true, message: 'Breakdown reported! Help is on the way.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /safety/alerts ───────────────────────────────
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await SafetyAlert.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PUT /safety/resolve/:id ──────────────────────────
router.put('/resolve/:id', async (req, res) => {
  try {
    await SafetyAlert.update(
      { status: 'resolved' },
      { where: { id: req.params.id } }
    );
    res.json({ success: true, message: 'Alert resolved' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;