const express = require('express');
const router = express.Router();
const DriverLocation = require('../../../models/driver_location');

/* =====================================================
   POST — DRIVER LOCATION UPDATE
===================================================== */
const updateLocation = async (req, res) => {
  try {
    const { driver_id, booking_id, latitude, longitude, status } = req.body;

    if (!driver_id || !booking_id || latitude === undefined || longitude === undefined) {
      return res.send({
        success: false,
        message: 'driver_id, booking_id, latitude and longitude are required.'
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.send({
        success: false,
        message: 'Invalid latitude or longitude.'
      });
    }

    const location = await DriverLocation.create({
      driver_id,
      booking_id,
      latitude: lat,
      longitude: lng,
      status: status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const io = req.app.get('socketio');

    if (io) {
      io.emit('driver-location-update', {
        driver_id,
        booking_id,
        latitude: lat,
        longitude: lng,
        status: status || 'active'
      });
    }

    return res.send({
      success: true,
      message: 'Location updated successfully.',
      data: {
        id: location.id,
        driver_id,
        booking_id,
        latitude: lat,
        longitude: lng,
        status: status || 'active'
      }
    });

  } catch (error) {
    console.error('Update Location Error:', error);

    return res.send({
      success: false,
      message: 'Error: ' + error.message
    });
  }
};

/* =====================================================
   GET — LATEST DRIVER LOCATION
===================================================== */
const getLatestLocation = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!booking_id) {
      return res.send({
        success: false,
        message: 'booking_id is required.'
      });
    }

    const location = await DriverLocation.findOne({
      where: {
        booking_id,
        isDeleted: 0
      },
      order: [['createdAt', 'DESC']]
    });

    if (!location) {
      return res.send({
        success: false,
        message: 'No location found.',
        data: null
      });
    }

    return res.send({
      success: true,
      message: 'Latest location fetched.',
      data: {
        id: location.id,
        driver_id: location.driver_id,
        booking_id: location.booking_id,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        status: location.status,
        createdAt: location.createdAt,
        updatedAt: location.updatedAt
      }
    });

  } catch (error) {
    console.error('Get Location Error:', error);

    return res.send({
      success: false,
      message: 'Error: ' + error.message,
      data: null
    });
  }
};

module.exports = {
  updateLocation,
  getLatestLocation
};