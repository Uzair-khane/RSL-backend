const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const users = require('./user');
const { DataTypes } = Sequelize;
const Notification = sequelize.define('notifications', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    // Notification created by
    user_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Notification created for
    user_for: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // postid, blogid, districtid, and so on.
    source_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // post, district, poi, attraction, and so on.
    source: {
        type: DataTypes.ENUM(
            'new',
            'user',
            'seller',
            'post',
            'comment',
            'reply',
            'destination',
            'district',
            'attraction',
            'poi',
            'blog',
            'tour_package',
            'book_stay',
            'social_event',
            'local_product',
            'itinerary',
            'gallery',
            'kp_investment'
        ),
        defaultValue: 'new'
    },
    action: {
        type: DataTypes.ENUM(
            'new',
            'created',
            'updated',
            'deleted',
            'viewed',
            'edited',
            'liked',
            'commented',
            'replied',
            'shared',
            'started following',
            'unfollowed',
            'pending',
            'processing',
            'accepted',
            'rejected',
            'requested'
        ),
        defaultValue: 'new'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_read:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_single_read:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        get() {
            return moment(this.getDataValue('createdAt')).fromNow();
        }
    },
}, { freezeTableName: true });

// #created_for
users.hasMany(Notification, { as: 'notifications_user_for', foreignKey: 'user_for' });
Notification.belongsTo(users, { as: 'user_for_notification', foreignKey: 'user_for' });
// #created_by
users.hasMany(Notification, { as: 'notifications_user_by', foreignKey: 'user_by' });
Notification.belongsTo(users, { as: 'user_by_notification', foreignKey: 'user_by' });

module.exports = Notification;