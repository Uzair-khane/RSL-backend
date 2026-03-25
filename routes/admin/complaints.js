const   express         = require('express'),
        router          = express.Router();
        
const { ComplaintsController } = require('../../controllers');


router.get('/list', async(req, res)=>{
  return ComplaintsController.Page(req,res);
})

// # List
router.post('/list',async(req, res)=>{
  return ComplaintsController.List(req, res);
} );

// # Add 
router.post('/add', async(req, res)=>{
  return ComplaintsController.Add(req, res);
})

// # update 
router.post('/update', async(req, res)=>{
  return CarsController.Update(req, res);
})


module.exports = router;