const   express         = require('express'),
        router          = express.Router();
        
const { CarImagesController } = require('../../controllers');


router.get('/list/:id', async(req, res)=>{
  return CarImagesController.Page(req,res);
})

// #car imaged List
router.post('/list/:id',async(req, res)=>{
  return CarImagesController.List(req, res);
} );

// # Add 
router.post('/add/:id', async(req, res)=>{
  return CarImagesController.Add(req, res);
})

// # update 
// router.post('/update', async(req, res)=>{
//   return CarImagesController.Update(req, res);
// })


module.exports = router;