const express = require('express');
const router = express.Router();
const { applyDriver } = require('../../../controllers/site-api/v1/driver-application');

router.post('/apply', async (req, res) => {
    return applyDriver(req, res);
});

module.exports = router;