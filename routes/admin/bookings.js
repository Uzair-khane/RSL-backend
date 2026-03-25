const   express         = require('express'),
        router          = express.Router();
        
const { BookingsController } = require('../../controllers');


router.get('/list', async(req, res)=>{
  return BookingsController.Page(req,res);
})

// #booking List
router.post('/list',async(req, res)=>{
  return BookingsController.List(req, res);
} );

// #department Add 
// router.post('/add', async(req, res)=>{
//   return BookingsController.Add(req, res);
// })

// // #department update 
router.post('/update', async(req, res)=>{
  return BookingsController.StatusUpdate(req, res);
})


module.exports = router;