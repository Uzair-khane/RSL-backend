const   express         = require('express'),
        router          = express.Router();
        
const { DriversCarsController } = require('../../controllers');


router.get('/list', async(req, res)=>{
  return DriversCarsController.Page(req,res);
})

// # List
router.post('/list',async(req, res)=>{
  return DriversCarsController.List(req, res);
} );

// # Add 
router.post('/add', async(req, res)=>{
  return DriversCarsController.Add(req, res);
})

// # update 
router.post('/revoke', async(req, res)=>{
  return DriversCarsController.Revoke(req, res);
})


module.exports = router;