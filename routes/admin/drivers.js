const   express         = require('express'),
        router          = express.Router();
        
const { DriversController } = require('../../controllers');


router.get('/list', async(req, res)=>{
  return DriversController.Page(req,res);
})

// # List
router.post('/list',async(req, res)=>{
  return DriversController.List(req, res);
} );

// # Add 
router.post('/add', async(req, res)=>{
  return DriversController.Add(req, res);
})

// # update 
router.post('/update', async(req, res)=>{
  return DriversController.Update(req, res);
})


module.exports = router;