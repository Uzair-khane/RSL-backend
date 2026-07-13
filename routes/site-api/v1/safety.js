const express = require('express');
const router = express.Router();

const SafetyAlert = require('../../../models/SafetyAlert');
const DriverLocation = require('../../../models/driver_location');
const { sendEmail } = require('../../../helpers/sendEmail');

/* =====================================================
   GET LATEST CAR / DRIVER LOCATION BY BOOKING
===================================================== */
async function getLatestCarLocation(booking_id) {
  try {
    if (!booking_id) return null;

    const latestLocation = await DriverLocation.findOne({
      where: {
        booking_id,
        isDeleted: 0
      },
      order: [['createdAt', 'DESC']]
    });

    if (!latestLocation) return null;

    return {
      latitude: Number(latestLocation.latitude),
      longitude: Number(latestLocation.longitude),
      driver_id: latestLocation.driver_id,
      createdAt: latestLocation.createdAt
    };

  } catch (error) {
    console.error('Latest Car Location Error:', error.message);
    return null;
  }
}

/* =====================================================
   SEND ADMIN EMAIL
===================================================== */
async function sendAdminEmail({
  type,
  booking_id,
  customer_id,
  driver_id,
  driver_phone,
  passenger_latitude,
  passenger_longitude,
  carLocation,
  reason
}) {
  try {
    const passengerMapLink =
      passenger_latitude && passenger_longitude
        ? `https://www.google.com/maps?q=${passenger_latitude},${passenger_longitude}`
        : null;

    const carMapLink =
      carLocation && carLocation.latitude && carLocation.longitude
        ? `https://www.google.com/maps?q=${carLocation.latitude},${carLocation.longitude}`
        : null;

    let subject = 'RSL Safety Alert';
    let color = '#f59e0b';
    let title = 'Safety Alert';

    if (type === 'sos') {
      subject = '🚨 SOS EMERGENCY ALERT — RSL';
      color = '#dc2626';
      title = 'SOS Emergency Alert';
    }

    if (type === 'breakdown') {
      subject = '🔧 VEHICLE BREAKDOWN ALERT — RSL';
      color = '#f59e0b';
      title = 'Vehicle Breakdown Alert';
    }

    if (type === 'misbehaviour') {
      subject = '⚠️ DRIVER MISBEHAVIOUR REPORT — RSL';
      color = '#7c3aed';
      title = 'Driver Misbehaviour Report';
    }

    const result = await sendEmail({
      to: process.env.ADMIN_ALERT_EMAIL,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:20px;border:2px solid ${color};border-radius:12px;">
          
          <h2 style="color:${color};margin-bottom:10px;">
            ${title}
          </h2>

          <p style="font-size:14px;color:#555;">
            A safety alert has been triggered from the RSL passenger safety system.
          </p>

          <hr/>

          <h3>Alert Details</h3>
          <p><strong>Alert Type:</strong> ${type}</p>
          <p><strong>Booking ID:</strong> ${booking_id || 'N/A'}</p>
          <p><strong>Customer ID:</strong> ${customer_id || 'N/A'}</p>
          <p><strong>Driver ID:</strong> ${driver_id || carLocation?.driver_id || 'N/A'}</p>
          <p><strong>Driver Phone:</strong> ${driver_phone || 'N/A'}</p>
          <p><strong>Reason:</strong> ${reason || 'N/A'}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>

          <hr/>

          <h3>Passenger Current Location</h3>
          ${passengerMapLink
          ? `<p><a href="${passengerMapLink}" target="_blank" style="color:${color};font-weight:bold;">Open Passenger Location on Google Maps</a></p>
                 <p>Lat: ${passenger_latitude}, Lng: ${passenger_longitude}</p>`
          : `<p style="color:gray;">Passenger location not available.</p>`
        }

          <h3>Car / Driver Latest Location</h3>
          ${carMapLink
          ? `<p><a href="${carMapLink}" target="_blank" style="color:${color};font-weight:bold;">Open Car Current Location on Google Maps</a></p>
                 <p>Lat: ${carLocation.latitude}, Lng: ${carLocation.longitude}</p>
                 <p><strong>Last Updated:</strong> ${carLocation.createdAt || 'N/A'}</p>`
          : `<p style="color:gray;">Car current location not available yet.</p>`
        }

          <hr/>

          <h3>Recommended Admin Action</h3>
          ${type === 'misbehaviour'
          ? `<ul>
                   <li>Immediately call the passenger.</li>
                   <li>Call the driver and verify the situation.</li>
                   <li>Track the ride live using the car location.</li>
                   <li>If passenger is at risk, escalate to emergency response.</li>
                   <li>Mark alert resolved only after passenger safety is confirmed.</li>
                 </ul>`
          : `<ul>
                   <li>Open the live location immediately.</li>
                   <li>Contact passenger and driver.</li>
                   <li>Dispatch help if required.</li>
                   <li>Resolve alert after the situation is handled.</li>
                 </ul>`
        }

          <p style="margin-top:20px;font-size:12px;color:gray;">
            RSL — Real Smart Limousine Safety System
          </p>

        </div>
      `
    });

    if (!result.success) {
      throw new Error(result.message || 'Admin safety email failed.');
    }

    console.log(`✅ ${type.toUpperCase()} admin email sent`);

  } catch (error) {
    console.error('❌ Admin Email Error:', error.message);
  }
}

/* =====================================================
   CREATE SAFETY ALERT COMMON FUNCTION
===================================================== */
async function createSafetyAlert({
  type,
  message,
  booking_id,
  customer_id,
  driver_id,
  driver_phone,
  latitude,
  longitude,
  reason
}) {
  const carLocation = await getLatestCarLocation(booking_id);

  const alert = await SafetyAlert.create({
    booking_id,
    customer_id,
    driver_id: driver_id || carLocation?.driver_id || null,
    alert_type: type,
    message,
    reason: reason || null,
    driver_phone: driver_phone || null,
    latitude,
    longitude,
    status: 'pending'
  });

  await sendAdminEmail({
    type,
    booking_id,
    customer_id,
    driver_id: driver_id || carLocation?.driver_id || null,
    driver_phone,
    passenger_latitude: latitude,
    passenger_longitude: longitude,
    carLocation,
    reason
  });

  return {
    alert,
    carLocation
  };
}

/* =====================================================
   POST SOS ALERT
===================================================== */
router.post('/sos', async (req, res) => {
  try {
    const {
      booking_id,
      customer_id,
      driver_id,
      driver_phone,
      latitude,
      longitude
    } = req.body;

    const result = await createSafetyAlert({
      type: 'sos',
      message: 'SOS Emergency Alert',
      booking_id,
      customer_id,
      driver_id,
      driver_phone,
      latitude,
      longitude
    });

    return res.json({
      success: true,
      message: 'SOS alert sent successfully.',
      alert: result.alert,
      car_location: result.carLocation
    });

  } catch (error) {
    console.error('SOS Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send SOS alert.'
    });
  }
});

/* =====================================================
   POST BREAKDOWN ALERT
===================================================== */
router.post('/breakdown', async (req, res) => {
  try {
    const {
      booking_id,
      customer_id,
      driver_id,
      driver_phone,
      latitude,
      longitude
    } = req.body;

    const result = await createSafetyAlert({
      type: 'breakdown',
      message: 'Vehicle Breakdown Reported',
      booking_id,
      customer_id,
      driver_id,
      driver_phone,
      latitude,
      longitude
    });

    return res.json({
      success: true,
      message: 'Breakdown reported successfully.',
      alert: result.alert,
      car_location: result.carLocation
    });

  } catch (error) {
    console.error('Breakdown Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to report breakdown.'
    });
  }
});

/* =====================================================
   POST DRIVER MISBEHAVIOUR REPORT
===================================================== */
router.post('/misbehaviour', async (req, res) => {
  try {
    const {
      booking_id,
      customer_id,
      driver_id,
      driver_phone,
      latitude,
      longitude,
      reason
    } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for misbehaviour report.'
      });
    }

    const result = await createSafetyAlert({
      type: 'misbehaviour',
      message: 'Driver Misbehaviour Reported',
      booking_id,
      customer_id,
      driver_id,
      driver_phone,
      latitude,
      longitude,
      reason
    });

    return res.json({
      success: true,
      message: 'Misbehaviour report sent successfully. Admin has been notified.',
      alert: result.alert,
      car_location: result.carLocation
    });

  } catch (error) {
    console.error('Misbehaviour Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to report misbehaviour.'
    });
  }
});

/* =====================================================
   GET ALL ALERTS
===================================================== */
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await SafetyAlert.findAll({
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      total: alerts.length,
      alerts
    });

  } catch (error) {
    console.error('Get Alerts Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts.'
    });
  }
});

/* =====================================================
   RESOLVE ALERT
===================================================== */
router.put('/resolve/:id', async (req, res) => {
  try {
    const alertId = req.params.id;

    const [updatedRows] = await SafetyAlert.update(
      {
        status: 'resolved'
      },
      {
        where: {
          id: alertId
        }
      }
    );

    if (!updatedRows) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Alert resolved successfully.'
    });

  } catch (error) {
    console.error('Resolve Alert Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to resolve alert.'
    });
  }
});

module.exports = router;