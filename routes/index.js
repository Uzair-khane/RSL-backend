var express     = require('express'),
    router      = express.Router();

    const baseUrl = '/ap'
    const baseUrlWeb = '/api/site';
    const baseUrlMobile = '/api/mobile';

    router.get('/', async (req, res) => {
        if(req.user && req.user.user_type == 'admin' && req.isAuthenticated()) {
            return res.redirect(`${baseUrl}/home`);
        }
        return res.redirect('/ap/auth/login');
    });

    router.get('/view/apis', async (req, res) => {
        const protocol = req.protocol;
        const host = req.headers.host;
        const type = req.query.type;
        let apis = [];
        let successMsg = true;
        let apiCounter = 0;
        /**--------------WEB API's------------------- */
        if(type == 'web') {
            apis = await webApis();
            apis.forEach(elem => {
                apiCounter += elem.data.length;
            })
        /**--------------MOBILE API's------------------- */
        } else if(type == 'mobile') {
            apis = await mobileApis();
            apis.forEach(elem => {
                apiCounter += elem.data.length;
            })
        } else {
            apis = [
                {
                    method: '',
                    url: ``,
                    description: 'Please enter correct type, like: web or mobile.'
                }
            ];
            successMsg = false;
        }
        res.render('admin/snippets/view-apis', {
            success: successMsg,
            apisList: apis,
            apiCounter: apiCounter,
            protocol: protocol+'://',
            host: host,
            type: (type == 'web' || type == 'mobile') ? `<code>${type.toUpperCase()}</code>` : '<i>[INVALID TYPE]</i>',
            successFlash: req.flash('success'),
            errorFlash: req.flash('error'),
        });
    })


    // WEB APIs
    const webApis = async () => {
        return [
            /******auth apis****** */
            {
                type: 'Authed User',
                data: [
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/auth/login`,
                        description: 'N/A'
                    },
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/auth/register`,
                        description: 'Send body Params like: <br>Username: <code>username</code><br>Password: <code>password</code><br>Confirm Password: <code>confirm_password</code><br> Name: <code>name</code><br>Mobile No: <code>mobile_no</code> <br><code>Verify By: <code>verify_by</code>For Email: email Or For Mobile OTP:otp'
                    },
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/auth/verify-user`,
                        description: 'Send body Params like: <br>For Token: <code>token</code> <br> For OTP: <code>otp</code>'
                    },
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/auth/forget-password`,
                        description: 'Send body Params like: <br>Email: <code>email</code>'
                    },
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/auth/reset-password`,
                        description: 'Send body Params like: <br>OTP: <code>otp</code><br>password: <code>password</code><br>Confirm Password: <code>confirm_password</code>'
                    },
                    {
                        method: 'get',
                        url: `${baseUrlWeb}/auth/me`,
                        description: 'Get logged in user information. Send token in header. Token name in is: <code>x-access-token</code>'
                    },
                    {
                        method: 'get',
                        url: `${baseUrlWeb}/auth/logout`,
                        description: 'Logout user sending token in header. Token name is: <code>x-access-token</code>'
                    },
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/auth/google-login`,
                        description: 'Send the params as you are sending for register a user.'
                    },
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/auth/facebook-login`,
                        description: 'Send the params as you are sending for register a user.'
                    },
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/auth/resend-otp`,
                        description: 'Send body Params like: <br><code>username</code> to resend OTP.'
                    },
                ]
            },
            /******./auth & chat apis****** */

            /******User related apis****** */
            {
                type: 'User Related',
                data: [
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/user/profile`,
                        description: 'Get user profile. Send Token in header: <code>x-access-token</code><br> Send body params, like Other User UUID: <code>uuid</code> '
                    },
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/user/profile-update`,
                        description: 'Update user profile. Send Token in header: <code>x-access-token</code><br> Send the following params in req body: <br> User Name: <code>name</code><br>Email: <code>email</code><br>About: <code>about</code><br>Country: <code>country</code><br>City: <code>city</code><br>Gender: <code>gender</code><br>Background Image: <code>background_image</code><br>For image: <code>image_url</code>. Send in image as multipart/form-data and in server will be received as <code>req.files.image_url</code>'
                    },
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/user/password-update`,
                        description: 'Update user password. Send Token in header: <code>x-access-token</code><br> Send the following params in req body: <br> New Password: <code>password</code><br>Confirm Password: <code>confirm_password</code><br>Old Password: <code>old_password</code>'
                    },
                    {
                        method: 'get',
                        url: `${baseUrlWeb}/user/profile-delete`,
                        description: 'Get user conversations user has chatted with. Send Token in header: <code>x-access-token</code>'
                    },
                ]
            },
            /******./User related apis****** */

            /******home apis****** */
            {
                type: 'Home',
                data: [
                    {
                        method: 'get',
                        url: `${baseUrlWeb}/home/settings`,
                        description: 'Get general setting items, like <code>logo, email, addresses, contact#</code>, etc. of the website'
                    },
                    {
                        method: 'post',
                        url: `${baseUrlWeb}/home/contact-us`,
                        description: 'Add feeback or contact us. Send params in body: <code>full_name | email | description</code>'
                    },
                ]
            },
            /******./home apis****** */

            /******pages apis****** */
            {
                type: 'Pages',
                data: [
                    {
                        method: 'get',
                        url: `${baseUrlWeb}/page/get`,
                        description: 'Get List and single page record(s): To get single record, send query param, like: <code>slug</code>. For type like footer or header send query param like <code>type=header</code> or <code>type=footer</code>.'
                    },
                ]
            },
            /******./pages apis****** */

            /******menu apis****** */
            {
                type: 'Menus',
                data: [
                    {
                        method: 'get',
                        url: `${baseUrlWeb}/menu/list/:type`,
                        description: 'Get menus of the header: send type in query params, like: <code>header, footer, section</code>'
                    },
                    {
                        method: 'get',
                        url: `${baseUrlWeb}/menu/page/:slug`,
                        description: 'Get single page by its <code>slug</code>: send <code>slug</code> in query params'
                    }
                ]
            },
            /******./menu apis****** */

            /******socketio****** */
            {
                type: 'SocketIO',
                data: [
                    {
                        method: 'event',
                        url: `/user-chat-message`,
                        description: '<code>user-chat-message</code> event is used to send and recieve messages in realtime.'
                    },
                    {
                        method: 'event',
                        url: `/is-typing`,
                        description: '<code>is-typing</code> is used to display if user is typing a message.'
                    }
                ]
            },
            /******./socketio****** */

            /******general search****** */
            {
                type: 'General Search',
                data: [
                    {
                        method: 'get',
                        url: `${baseUrlWeb}/home/search`,
                        description: 'General search for all items. Send query param <code>q</code>'
                    }
                ]
            },
            /******./general search****** */

            /******warning****** */
            {
                type: 'Warning',
                data: [
                    {
                        method: 'get',
                        url: `${baseUrlWeb}/warning/list`,
                        description: 'Get warning OR travel update list. Send query param <code>type=warning OR type=travel_update</code>.'
                    },
                    {
                        method: 'get',
                        url: `${baseUrlWeb}/warning/detail`,
                        description: 'Get warning OR travel update single record. Send query param <code>id</code>, <code>slug</code>.'
                    },
                ]
            },
            /******./warning****** */
            
        ]
    }

    // MOBILE APIs
    const mobileApis = async () => {
        return [
            {
                type: '',
                data: [
                    {
                        method: '',
                        url: `${baseUrlMobile}/`,
                        description: ''
                    }
                ]
            }
        ]
    }

module.exports = router;