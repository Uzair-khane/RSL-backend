var jwt     = require('jsonwebtoken');
var config  = require('../../config/jwtConfig');

function verifyToken(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token)
    return res.send({ success: false, message: 'Failed to authenticate your request. Try login again, please!' });
    
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err)
    return res.send({ success: false, message: 'Authorization failed. Seems your session has been expired.' });
     
    // if everything good, save to request for use in other routes
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;