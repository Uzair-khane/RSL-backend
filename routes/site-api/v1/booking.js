
const express = require('express'),
    router = express.Router();

const { BookingController } = require('../../../controllers/site-api/v1/controlling');


// #add survey Form
router.post('/add', async (req, res) => {
    return BookingController.bookingAdd(req, res);
})

module.exports = router;