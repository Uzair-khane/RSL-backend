const   express         = require('express'),
        router          = express.Router();
        
const { CarsController } = require('../../controllers');


router.get('/list', async(req, res)=>{
  return CarsController.Page(req,res);
})

// # List
router.post('/list',async(req, res)=>{
  return CarsController.List(req, res);
} );

// # Add 
router.post('/add', async(req, res)=>{
  return CarsController.Add(req, res);
})

// # update 
router.post('/update', async(req, res)=>{
  return CarsController.Update(req, res);
})


module.exports = router;