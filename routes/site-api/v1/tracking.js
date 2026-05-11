const express = require('express');
const router = express.Router();
const { updateLocation, getLatestLocation } = require('../../../controllers/site-api/v1/tracking');

// Driver location update
router.post('/update-location', async (req, res) => {
  return updateLocation(req, res);
});

// Get latest location
router.get('/location/:booking_id', async (req, res) => {
  return getLatestLocation(req, res);
});

module.exports = router;