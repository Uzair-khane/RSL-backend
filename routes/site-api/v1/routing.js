var express     = require('express'),
    // MIDDLEWARES
    { verifyToken } = require('../../../middleware/auth/api_verify_token'),
    router      = express.Router();

const baseUrl = '/api/site/v1';

// ROUTES
// #IMPORT

/***********************************@Auth ****************************************/
const   booking                = require('./booking'),   
        general                    =require('./general');
      const auth = require('./auth');
        
        
// #USE
router.use(`${baseUrl}/booking`, booking);
router.use(`${baseUrl}/general`, general);   
 router.use(`${baseUrl}/auth`, auth);


/********************************************************************************* */


module.exports = router;