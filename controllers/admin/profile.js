const User = require("../../models/user");
const sharpFileUpload = require("../../modules/sharp-file-upload")
const fs = require("fs");
const baseUrl = '/ap';
const routeUrl = '/ap/profile';
const bcrypt = require("bcryptjs");
// # Edit the Profile
const UserEdit = async (req, res) => {
    try {
        let userData = await User.findOne({
            where: {
                id: req.user.id,
                isDeleted: 0
            }
        })
        res.render("admin/profile", {
            userData: userData,
            baseUrl: baseUrl,
            successFlash: req.flash('success'),
            errorFlash: req.flash('error').join('<br />'),
            title: 'KPCTA | Profile',
            pageTitle: 'Edit Profile'
        })
    } catch (err) {
        req.flash('error', err.message);
        return res.redirect(baseUrl + '/home');
    }
}
// # Update the Profile
const UserProfileUpdate = async (req, res) => {
    try {
        let { name, email, contact_no, profile_image_edit, id, gender } = req.body
        let errorFlag = false;
        let value = {}
        if (name == '') {
            req.flash('error', "Name Required!");
            errorFlag = true;
        }
        if (email == '') {
            req.flash('error', "Email Required!");
            errorFlag = true;
        }
        if (contact_no == '') {
            req.flash('error', "Contact No Required!");
            errorFlag = true;
        }
        var dir = "./public/uploads/admin/profile/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        let sampleFile = '';
        var imagename = '';
        var imagenameThumb = '';
        if (req.files && req.files.profile_image != undefined) {

            imagename = await sharpFileUpload.fileToUpload(req.files.profile_image, dir, 200, 200);
            imagenameThumb = await sharpFileUpload.fileToUpload(req.files.profile_image, dir, 100, 100);

            if (profile_image_edit != undefined && profile_image_edit != '' && profile_image_edit != 'admin/images/avatar/user-avatar.png') {
                var path = `./public/${profile_image_edit}`;
                fs.unlink(path, (err) => {
                    if (!err) {
                        console.log(`displayImage deleted: ${profile_image_edit}`)
                    }
                })
            }
            value.profile_image = imagename;
            value.profile_image_thumb = imagenameThumb;
        }
        if (errorFlag == true) {
            return res.redirect(routeUrl + '/edit');
        } else {
            value.name = name;
            value.email = email;
            value.mobile_no = contact_no
            value.gender = gender
            User.update(
                value, {
                where: {
                    id: id
                }
            }
            ).then(async (recordCreated) => {
                if (recordCreated) {
                    req.flash('success', "Profile has been updated successfully!");
                    return res.redirect(routeUrl + '/edit');
                } else {
                    req.flash('error', "Something went wrong, try again please!");
                    return res.redirect(routeUrl + '/edit');
                }
            }).catch((err) => {
                req.flash('error', err.message);
                return res.redirect(routeUrl + '/edit');

            })
        }
    } catch (err) {
        req.flash('error', err.message);
        return res.redirect(routeUrl + '/edit');
    }

}
const ProfilePasswordUpdate = async (req, res) => {
    try {
        let { id, old_password, confirmpassword, password } = req.body
        let value = {}
        if (password == '') {
            return res.send({ success: false, message: 'Password Required.' });
        }
        if (confirmpassword == '') {
            return res.send({ success: false, message: 'Confirm Password Required.' });
        }
        const hashpassword = await bcrypt.hash(confirmpassword, 10);
        if (await bcrypt.compare(old_password, req.user.password)) {
            value.password = hashpassword
            await User.update(
                value, {
                where: {
                    id: id
                }
            }
            ).then((recordCreated) => {
                if (recordCreated) {
                    return res.send({ success: true, message: 'password has been updated successfully.' });
                }
            }).catch((err) => {
                return res.send({ success: false, message: ' password went wrong. ' + err });
            })

        } else {
            return res.send({ success: false, message: "Do Not match Old Password, try again please!" });

        }
    } catch (err) {
        req.flash('error', err.message);
        return res.redirect(routeUrl + '/edit');
    }

}


module.exports = {
    UserEdit,
    UserProfileUpdate,
    ProfilePasswordUpdate
}