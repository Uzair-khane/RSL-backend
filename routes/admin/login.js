const   express       = require('express'),
        router        = express.Router();
  const {LoginController}  = require("../../controllers");
const { apLoginRateLimit } = require('../../middleware/request-rate-limit');

const baseUrl = '/ap';
// #Login Get
router.get('/login', async (req, res) => {
  if(req.user && req.user.user_type == 'admin' && req.isAuthenticated()) {
    return res.redirect(`${baseUrl}/home`);
  }
  return LoginController.loginGet(req, res);
});

// #This will login a user
router.post('/login', apLoginRateLimit, function (req, res, next) {
  return LoginController.loginPost(req, res, next);
});

// # Logout Admin
router.get('/logout', (req, res) => {
  return LoginController.logoutGet(req, res);
})

// // =================== quick start to create admin panel user ========================
router.get('/register/admin-user', async (req, res) => {
  return LoginController.registerAdmin(req, res);
})
// // =================== ./admin panel user ========================



module.exports = router;