var express = require('express'),
    { verifyToken } = require('../../../middleware/auth/api_verify_token'),
    router = express.Router();

const baseUrl = '/api/site/v1';

// IMPORT
const booking  = require('./booking');   
const general  = require('./general');
const auth     = require('./auth');
const payment  = require('./payment');
const tracking = require('./tracking'); 
const safety = require('./safety');
// USE
router.use(`${baseUrl}/booking`, booking);
router.use(`${baseUrl}/general`, general);   
router.use(`${baseUrl}/auth`, auth);
router.use(`${baseUrl}/payment`, payment);
router.use(`${baseUrl}/tracking`, tracking); 
router.use(`${baseUrl}/safety`, safety);
module.exports = router;