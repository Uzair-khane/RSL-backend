const express = require('express');
const router = express.Router();
const { BookingController } = require('../../../controllers/site-api/v1/controlling');

// POST — Nai booking
router.post('/add', async (req, res) => {
  return BookingController.bookingAdd(req, res);
});

// GET — History
router.get('/history', async (req, res) => {
  return BookingController.bookingHistory(req, res);
});

// GET — Single status
router.get('/status/:id', async (req, res) => {
  return BookingController.bookingStatus(req, res);
});

// PUT — Cancel
router.put('/cancel/:id', async (req, res) => {
  return BookingController.bookingCancel(req, res);
});

module.exports = router;