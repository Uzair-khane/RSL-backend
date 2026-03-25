const ActivityLogs = require("../models/activity-log")
const activityLogsSave = async (req, action, detail) => {
    return new Promise((resolve, reject) => {
        try {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            ActivityLogs.create({
                user_id: req.user.id,
                ip_address: ip,
                action: action,
                detail: detail
            }).then(result => {
                return resolve(result);
            }).catch(error => {
                return reject(error);
            })
        } catch (error) {
            return reject(error)
        }
    })
}

module.exports = {
    activityLogsSave
}