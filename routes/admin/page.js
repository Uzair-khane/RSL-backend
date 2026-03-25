const   express         = require('express'),
        router          = express.Router();
        
const { PageController } = require('../../controllers');

// #Page
router.get('/list', async(req, res)=>{
  return PageController.pagePage(req,res);
})

// #List
router.post('/list',async(req, res)=>{
  return PageController.pageList(req, res);
});

// #Add 
router.post('/add', async(req, res)=>{
  return PageController.pageAdd(req, res);
})

// #Update 
router.post('/update', async(req, res)=>{
  return PageController.pageUpdate(req, res);
})

// #View 
router.get('/view/:page_id', async(req, res)=>{
  return PageController.pageView(req, res);
})


module.exports = router;