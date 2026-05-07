const express = require('express');
const router = express.Router();
const { 
  createPaymentIntent, 
  confirmPayment, 
  paymentHistory,
  approvePayment,
  rejectPayment,
  getAllPayments
} = require('../../../controllers/site-api/v1/payment');

// ✅ Customer Routes
router.post('/create-intent', async (req, res) => {
  return createPaymentIntent(req, res);
});

router.post('/confirm', async (req, res) => {
  return confirmPayment(req, res);
});

router.get('/history/:booking_id', async (req, res) => {
  return paymentHistory(req, res);
});

// ✅ Admin Routes
router.get('/all', async (req, res) => {
  return getAllPayments(req, res);
});

router.put('/approve/:id', async (req, res) => {
  return approvePayment(req, res);
});

router.put('/reject/:id', async (req, res) => {
  return rejectPayment(req, res);
});

module.exports = router;