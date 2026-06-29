const express = require('express');
const router = express.Router();

const {
  updateLocation,
  getLatestLocation,
  syncOfflineLocations,
  getOfflineLocations
} = require('../../../controllers/site-api/v1/tracking');

// Driver location update
router.post('/update-location', async (req, res) => {
  return updateLocation(req, res);
});

// Get latest location
router.get('/location/:booking_id', async (req, res) => {
  return getLatestLocation(req, res);
});

// Sync offline GPS locations
router.post('/offline-sync', async (req, res) => {
  return syncOfflineLocations(req, res);
});

// Get offline route history
router.get('/offline-location/:booking_id', async (req, res) => {
  return getOfflineLocations(req, res);
});

module.exports = router;