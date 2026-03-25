const { Sequelize } = require("sequelize");
const User  = require("../models/user"),
      Role  = require("../models/role");
// Admin User Strategy
const adminUser = async (username, password, done) => {
  User.findOne({
    include: [{
      model: Role,
      as: 'roles'
    }],
    where: { username: username, user_type: 'admin', status: 1 }
  }).then((user) => {
    if (!user) {
      return done(null, false, { message: `Username ${username} was not found. OR Your account has been disabled. Contact with your System Administrator.` });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        return done(null, false, {message: err});
      }
      if (isMatch) {
        return done(null, user);
      } else if(!isMatch) {
        return done(null, false, {message: 'Your password is invalid.'});
      }
    });
  });
}
// For website side users
const siteUser = async (username, password, done) => {
  User.findOne({
    attributes: {
      exclude: ['register_from','status','isDeleted','reset_token','mobile_token','reset_mobile_token','mobile_device_token','verify_token','verify_otp','provider'],
      include: [
        [
            Sequelize.literal(`(
            SELECT COUNT(*) FROM user_follows WHERE user_follows.follower_id = users.id )`),
            'user_followers_count'
        ],
        [
            Sequelize.literal(`(
            SELECT COUNT(*) FROM user_follows WHERE user_follows.following_id = users.id )`),
            'user_following_count'
        ],
        [
            Sequelize.literal(`(
            SELECT COUNT(*) FROM posts WHERE posts.user_id = users.id AND posts.type = 'blob' AND posts.status = 1 AND posts.isDeleted = 0 )`),
            'posts_count'
        ],
        [
          Sequelize.literal(`(
          SELECT COUNT(*) FROM messages WHERE messages.receiver_id = users.id AND is_seen = 0 )`),
          'unread_messages'
        ],
        [
          Sequelize.literal(`(
          SELECT COUNT(*) FROM notifications WHERE notifications.user_for = users.id AND notifications.is_read = 0 )`),
          'notifications_count'
        ]
      ]
    },
    where: { username: username, status: 1, is_approved:  1, user_type: {[Sequelize.Op.not]:'admin'} }
  }).then((user) => {
    if (!user) {
      return done(null, false, { message: `Username ${username} was not found. OR Your account has been disabled. OR your account has not been verified. Contact with System Administrator.` });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        return done(null, false, {message: err});
      }
      if (isMatch) {
        return done(null, user);
      } else if(!isMatch) {
        return done(null, false, {message: 'Your password is invalid.'});
      }
    });
  });
}   
  // For mobile side users
const mobileUser = async (username, password, done) => {
  User.findOne({
    where: { username: username, status: 1, is_approved: 1, user_type: {[Sequelize.Op.not]:'admin'} }
  }).then((user) => {
    if (!user) {
      return done(null, false, { message: `Username ${username} was not found. OR Your account has been disabled. Contact with System Administrator.` });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        return done(null, false, {message: err});
      }
      if (isMatch) {
        return done(null, user);
      } else if(!isMatch) {
        return done(null, false, {message: 'Your password is invalid.'});
      }
    });
  });
}

module.exports = {
  adminUser,
  siteUser,
  mobileUser
}