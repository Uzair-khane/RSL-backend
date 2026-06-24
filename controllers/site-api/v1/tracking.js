const DriverLocation = require('../../../models/driver_location');
const RideRoute = require('../../../models/ride_route');

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

    const locationStatus = status || 'active';

    const location = await DriverLocation.create({
      driver_id,
      booking_id,
      latitude: lat,
      longitude: lng,
      status: locationStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    let rideRoute = await RideRoute.findOne({
      where: {
        booking_id,
        isDeleted: 0
      }
    });

    if (!rideRoute) {
      rideRoute = await RideRoute.create({
        booking_id,
        start_latitude: lat,
        start_longitude: lng,
        end_latitude: lat,
        end_longitude: lng,
        status: locationStatus === 'completed' ? 'completed' : 'started',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      await rideRoute.update({
        end_latitude: lat,
        end_longitude: lng,
        status: locationStatus === 'completed' ? 'completed' : 'started',
        updatedAt: new Date()
      });
    }

    const io = req.app.get('socketio');

    if (io) {
      io.emit('driver-location-update', {
        driver_id,
        booking_id,
        latitude: lat,
        longitude: lng,
        status: locationStatus
      });
    }

    return res.send({
      success: true,
      message: 'Location and ride route updated successfully.',
      data: {
        id: location.id,
        driver_id,
        booking_id,
        latitude: lat,
        longitude: lng,
        status: locationStatus,
        ride_route_id: rideRoute.id
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