const express = require('express');
const router = express.Router();
const DriverLocation = require('../../../models/driver_location');

// ✅ Driver location update karo (Driver app se aayega)
const updateLocation = async (req, res) => {
  try {
    const { driver_id, booking_id, latitude, longitude } = req.body;

    if (!driver_id || !booking_id || !latitude || !longitude) {
      return res.send({ success: false, message: 'All fields required.' });
    }

    // Database mein save karo
    await DriverLocation.create({
      driver_id,
      booking_id,
      latitude,
      longitude,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Socket se customer ko bhejo
    const { users } = require('../../../lib/socketio');
    const io = req.app.get('socketio');

    // Sab connected users ko bhejo (testing ke liye)
    io.emit('driver-location-update', {
      driver_id,
      booking_id,
      latitude,
      longitude
    });

    return res.send({
      success: true,
      message: 'Location updated!',
      data: { driver_id, booking_id, latitude, longitude }
    });

  } catch (error) {
    return res.send({ success: false, message: 'Error: ' + error.message });
  }
};

// ✅ Latest driver location fetch karo
const getLatestLocation = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const location = await DriverLocation.findOne({
      where: { booking_id, isDeleted: 0 },
      order: [['createdAt', 'DESC']]
    });

    if (!location) {
      return res.send({ success: false, message: 'No location found.' });
    }

    return res.send({
      success: true,
      data: location
    });

  } catch (error) {
    return res.send({ success: false, message: 'Error: ' + error.message });
  }
};

module.exports = { updateLocation, getLatestLocation };