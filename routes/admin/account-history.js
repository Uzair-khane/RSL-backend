const   express         = require('express'),
        router          = express.Router();

const {AccountHistoryController} = require("../../controllers");


router.get('/list', async(req, res)=>{
  return AccountHistoryController.Page(req, res);
})

// #bookinghistory List
router.post('/list',async(req, res)=>{
  return AccountHistoryController.List(req, res);
} );

// // #department update 
router.post('/update', async(req, res)=>{
  return AccountHistoryController.AmountCollect(req, res);
})


module.exports = router;