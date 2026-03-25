const User = require('../../models/user')
const fs = require('fs');
const passport        = require('passport');
const { v4: uuidv4 }  = require('uuid');
const { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize");
const { activityLogsSave } = require('../../modules/activity-logs');
const { apLoginRateLimit } = require('../../middleware/request-rate-limit');
const baseUrl = '/ap';
const routeUrl = '/ap/auth';


// #Login Get
const loginGet = async (req, res) => {
    res.render('admin/login', {
        title: 'KPCTA | Admin Login',
        baseUrl: baseUrl,
        actionUrl: routeUrl,
        successFlash: req.flash('success'),
        errorFlash: req.flash('error'),
    })
}

// #Login Post
const loginPost = async (req, res, next) => {
    passport.authenticate('admin_user', async function (err, user, info) {
        if (err) {
            req.flash('error', "" + err); // will generate a 500 error
            return res.redirect(routeUrl+'/login');
        }
        // Generate a JSON response reflecting authentication status
        if (!user) {
            req.flash('error', "" + info.message);
            return res.redirect(routeUrl+'/login');
        }
        req.login(user, async loginErr => {
            if (loginErr) {
                req.flash('error', "" + loginErr);
                return res.redirect(routeUrl+'/login');
            }
            user.is_active = 1;
            user.save();
            req.flash('success', "" + user.username);

            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "login", detail = `${user.name} is logged in.`)
            /**********************./Activity Logs**************************************** */
            // Reset Limit rate
            await apLoginRateLimit.resetKey(user.username);
            return res.redirect(baseUrl+'/home');
        });
    })(req, res, next);
}

// #Logout Admin 
const logoutGet =  async (req, res)=>{
    if(req.user && req.user != undefined) {
        const username = req.user.username;
        User.findOne({
            where: { username: username } 
        }).then(user => {
            user.token = null;
            user.is_active = 0;
            user.last_login = new Date();
            user.save();
            req.session.destroy();
            return res.redirect(routeUrl+'/login');
        }).catch(error => {
            req.session.destroy();
            req.flash('error','LoggedOutError: '+error);
            return res.redirect(routeUrl+'/login');
        })
    } else {
        return res.redirect(routeUrl+'/login');
    }
}

//#Register Admin 
const registerAdmin =  async (req, res)=>{
    const { flag, email, password, full_name, user_type } = req.query;
    if( flag &&
        flag == 'secret_user' &&
        email &&
        password &&
        full_name 
        ) {
        var dir = "./public/uploads/admin/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        User.create({
            role_id: 1,
            uuid: uuidv4(),
            email: email,
            username: email,
            password: password,
            name: full_name,
            user_type: user_type,
            profile_image: 'admin/images/admin-avatar.png'
        }).then(async (regUser) => {
            return res.send({
                success: true,
                message: `Success! User created successfully.`,
                data: regUser
            })
        }).catch((err) => {
            return res.send({
                success: false,
                message: `Error: ${err.message}. Seems this user is already exist. Try again with different user!`
            })
        })
    } else {
        return res.send({
            success: false,
            message: `Sorry! You are not authorized to create this user. Contact with your system administrator.`
        })
    }
}

module.exports = {
    loginGet,
    registerAdmin,
    loginPost,
    logoutGet
};