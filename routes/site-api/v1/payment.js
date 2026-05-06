const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment, paymentHistory } = 
  require('../../../controllers/site-api/v1/payment');

// POST — Payment intent banao
router.post('/create-intent', async (req, res) => {
  return createPaymentIntent(req, res);
});

// POST — Payment confirm karo
router.post('/confirm', async (req, res) => {
  return confirmPayment(req, res);
});

// GET — Payment history
router.get('/history/:booking_id', async (req, res) => {
  return paymentHistory(req, res);
});

module.exports = router;