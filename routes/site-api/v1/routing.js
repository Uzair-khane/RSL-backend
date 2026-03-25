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
      
        
        
// #USE
router.use(`${baseUrl}/booking`, booking);
router.use(`${baseUrl}/general`, general);   
 


/********************************************************************************* */


module.exports = router;