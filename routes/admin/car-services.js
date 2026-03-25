const   express         = require('express'),
        router          = express.Router();
        
const { CarServicesController } = require('../../controllers');


router.get('/list', async(req, res)=>{
  return CarServicesController.Page(req,res);
})

// #department List
router.post('/list',async(req, res)=>{
  return CarServicesController.List(req, res);
} );

// #department Add 
router.post('/add', async(req, res)=>{
  return CarServicesController.Add(req, res);
})

// #department update 
router.post('/update', async(req, res)=>{
  return CarServicesController.Update(req, res);
})


module.exports = router;