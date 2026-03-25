const   express         = require('express'),
        router          = express.Router();
const {ProfileController} = require("../../controllers")
  // #Profile Edit
  router.get('/edit', async(req, res)=>{
    return ProfileController.UserEdit(req,res);
  })
  // #Profile Update
  router.post('/update-profile', async(req, res)=>{
    return ProfileController.UserProfileUpdate(req,res);
  })
   // #Profile Password Update
   router.post('/update-profile-password', async(req, res)=>{
    return ProfileController.ProfilePasswordUpdate(req,res);
  })
  module.exports = router