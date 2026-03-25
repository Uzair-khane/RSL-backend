const   express         = require('express'),
        router          = express.Router();

const {AccountsController} = require("../../controllers");


router.get('/list', async(req, res)=>{
  return AccountsController.Page(req, res);
})

// #bookinghistory List
router.post('/list',async(req, res)=>{
  return AccountsController.List(req, res);
} );

// // #department update 
router.post('/update', async(req, res)=>{
  return AccountsController.AmountCollect(req, res);
})


module.exports = router;