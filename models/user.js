const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;
const role = require('./role');
const bcrypt = require("bcryptjs");

var users = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING
  },
  name: {
    type: DataTypes.STRING
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mobile_no: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
    // get() {
    //   let which_img = this.getDataValue('profile_image');
    //   if(which_img.startsWith('https://')) {
    //     return which_img;
    //   }
    //   return process.env.BASE_URL + which_img;
    // }
  },
  profile_image_thumb: {
    type: DataTypes.STRING,
    allowNull: true
  },
  background_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // male,female
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_approved: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  user_type: {
    type: DataTypes.ENUM,
    values: ['admin', 'admin_editor', 'admin_reader', 'user', 'guest'],
    defaultValue: 'user'
  },
  is_notification: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  register_from: {
    type: DataTypes.STRING(10),
    defaultValue: 'site'
  },
  provider: {
    type: DataTypes.STRING(20),
    defaultValue: 'local'
  },
  token: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  reset_token: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  mobile_token: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  reset_mobile_token: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  mobile_device_token: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  verify_token: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  verify_otp: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  is_active: {
    type: Sequelize.TINYINT,
    defaultValue: 0
  },
  last_login: {
    type: Sequelize.DATE,
    allowNull: true,
    get() {
      return moment(this.getDataValue('last_login')).fromNow();
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cnic: {
    type: DataTypes.STRING,
    allowNull: true
  },

  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  isDeleted: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    get() {
      return moment(this.getDataValue('createdAt')).fromNow();
    }
  },
  updatedAt: {
    type: DataTypes.DATE,
    get() {
      return moment(this.getDataValue('updatedAt')).fromNow();
    }
  }
}, { freezeTableName: true });

users.beforeSave((user) => {
  if (user.changed('password')) {
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
  }

});
users.prototype.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

users.belongsTo(role, { foreignKey: 'role_id', as: 'roles' });

module.exports = users;