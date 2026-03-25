const   express         = require('express'),
        router          = express.Router();
        
const { PricesController } = require('../../controllers');


router.get('/list', async(req, res)=>{
  return PricesController.Page(req,res);
})

// #department List
router.post('/list',async(req, res)=>{
  return PricesController.List(req, res);
} );

// #department Add 
router.post('/add', async(req, res)=>{
  return PricesController.Add(req, res);
})

// #department update 
router.post('/update', async(req, res)=>{
  return PricesController.Update(req, res);
})


module.exports = router;