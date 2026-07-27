var express = require('express'),
    { verifyToken } = require('../../../middleware/auth/api_verify_token'),
    router = express.Router();

const baseUrl = '/api/site/v1';

// IMPORT
const booking = require('./booking');
const general = require('./general');
const auth = require('./auth');
const payment = require('./payment');
const tracking = require('./tracking');
const safety = require('./safety');
const ai = require("./ai");
const driverApplication = require('./driver-application');
// USE
router.use(`${baseUrl}/booking`, booking);
router.use(`${baseUrl}/general`, general);
router.use(`${baseUrl}/auth`, auth);
router.use(`${baseUrl}/payment`, payment);
router.use(`${baseUrl}/tracking`, tracking);
router.use(`${baseUrl}/safety`, safety);
router.use(`${baseUrl}/ai`, ai);
router.use(`${baseUrl}/driver-application`, driverApplication);
module.exports = router;