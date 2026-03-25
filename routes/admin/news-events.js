const   express         = require('express'),
        router          = express.Router();
        
const { NewsAndEventsController } = require('../../controllers');


router.get('/list', async(req, res)=>{
  return NewsAndEventsController.Page(req,res);
})

// # List
router.post('/list',async(req, res)=>{
  return NewsAndEventsController.List(req, res);
} );

// # Add 
router.post('/add', async(req, res)=>{
  return NewsAndEventsController.Add(req, res);
})

// # update 
router.post('/update', async(req, res)=>{
  return NewsAndEventsController.Update(req, res);
})


module.exports = router;