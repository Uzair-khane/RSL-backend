const   { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize")
const Setting = require("../../models/setting");
const baseUrl = '/ap';
const fs = require('fs');
const routeUrl = '/general-setting/list';
const SettingImage = require("../../models/setting-image");
const ActivityLogs = require("../../models/activity-log");
const users = require("../../models/user");
const { activityLogsSave } = require("../../modules/activity-logs");
moment = require('moment')
// find DataTable
const SettingList = async (req, res) => {
    let result = await Setting.findOne({
        where: {
            isDeleted: 0
        }
    })
    let SettingGallery = await SettingImage.findAll({
        where:{
            isDeleted: 0,
           
        }
    })
    res.render("admin/setting", {
        title: 'KPCTA | General Setting',
        pageTitle: 'General Setting',
        baseUrl: baseUrl,
        result: result,
        SettingGallery:SettingGallery,
        successFlash: req.flash('success'),
        errorFlash: req.flash('error').join('<br />'),
    })
}

// multiple images add
const imagesAdd = async (req, res) => {
    let { title} = req.body;
    let galleryData = [];
    
    var dir = "./public/uploads/admin/setting-image/";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    
    var imagename = '';
    if(req.files.images){
        req.files.images.forEach(element => {
            imagename = dir  + title +"-" +Date.now()/1000 + "-" + element.name.replace(/\s+/g, '_').toLowerCase();
            // Use the mv() method to place the file somewhere on your server
            element.mv(imagename, function (err) {
                if (err) {
                    return res.send({success: false, message: 'Directory does not exist.'});
                }
            });
            imagename = imagename.substring(9); 
           galleryData.push({
                id: req.params.id,
                title: title + "-" + element.name.replace(/\s+/g, '_').toLowerCase(),
                image_url: imagename,
                type: 'section1'
           })
        });
    }else{
        return res.send({success: false, message: `Image File must be choose...!`});
    }

    if(galleryData){
        await SettingImage.bulkCreate(galleryData, {
            returning: true,
            ignoreDuplicates: true 
        }).then((recordCreated) => {
            console.log(recordCreated, "recordCreated")
                if(recordCreated){
                    return res.send({success: true, message: 'Record has been added successfully.'});
                } else {
                    return res.send({success: false, message: 'Something went wrong, try again please!'});
                }
            }).catch((err) => {
                return res.send({success: false, message: `${err.message}`});
            })
    }
    else{
        return res.send({success: false, message: `Image File must be choose...!`});
    }
}

//  setting Update Page
const SettingUpdate = async (req, res) => {
    let {
        result_id,
        organization_name,
        copyright_text,
        email1,
        email2,
        contact_no,
        twitter_link,
        facebook_link, 
        youtube_link,
        instagram_link,
        andriod_app_link,
        ios_app_link,
        address1,
        address2,
        map_address,
        section1_text,
        section1_description,
        old_image1,
        old_image2,
        mobile_logo_small_edit,
        mobile_logo_large_edit
    } = req.body
    const values = {}
    let errorFlag = false; 

    if(organization_name == ''){
        req.flash('error', "Organization Name Required!");
        errorFlag = true;
    } 
    if(copyright_text == ''){
        req.flash('error', "Footer Text Required!");
        errorFlag = true;
    } 
    if(email1 == ''){
        req.flash('error', "Primary Email Required!");
        errorFlag = true;
    }
    if(address1 == ''){
        req.flash('error', "Primary Address Required!");
        errorFlag = true;
    } 
    if(map_address == ''){
        req.flash('error', "Map Address Required!");
        errorFlag = true;
    } 

    var dir = "./public/uploads/admin/setting/";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    let colorLogoFile = '';
    var colorLogo = '';
    if (req.files && req.files.logo_color != undefined) {
        colorLogoFile = req.files.logo_color;
        colorLogo = dir + Date.now() / 1000 + "-" + colorLogoFile.name.replace(/\s+/g, '_').toLowerCase();
        //Use the mv() method to place the file somewhere on your server
        colorLogoFile.mv(colorLogo, function (err) {
            if (err) {
                console.log(err)
                // return res.redirect("/baseUrl/routeUrl");
            }
        });
        colorLogo = colorLogo.substring(9);
        values.logo_color = colorLogo;
        if (old_image1 != undefined && old_image1 != '') {
            var path = `./public/${old_image1}`;
            fs.unlink(path, (err) => {
                if (!err) {
                    console.log(`Logo Color deleted: ${old_image1}`)
                }
            })
        }

    }
    
    let whitLogoFile = '';
    var whitLogo = '';
    if (req.files && req.files.logo_white != undefined) {
        whitLogoFile = req.files.logo_white;
        whitLogo = dir + Date.now() / 1000 + "-" + whitLogoFile.name.replace(/\s+/g, '_').toLowerCase();
        //Use the mv() method to place the file somewhere on your server
        whitLogoFile.mv(whitLogo, function (err) {
            if (err) {
                console.log(err)
                // return res.redirect("/baseUrl/routeUrl");
            }
        });
        whitLogo = whitLogo.substring(9);
        values.logo_white = whitLogo
        if (old_image2 != undefined && old_image2 != '') {
            var path = `./public/${old_image2}`;
            fs.unlink(path, (err) => {
                if (!err) {
                    console.log(`White Color deleted: ${old_image2}`)
                }
            })
        }
    }

    let smallLogoFile = '';
    var smallLogo = '';
    if (req.files && req.files.mobile_logo_small != undefined) {
        smallLogoFile = req.files.mobile_logo_small;
        smallLogo = dir + Date.now() / 1000 + "-" + smallLogoFile.name.replace(/\s+/g, '_').toLowerCase();
        //Use the mv() method to place the file somewhere on your server
        smallLogoFile.mv(smallLogo, function (err) {
            if (err) {
                console.log(err)
                // return res.redirect("/baseUrl/routeUrl");
            }
        });
        smallLogo = smallLogo.substring(9);
        values.mobile_logo_small = smallLogo
        if (mobile_logo_small_edit != undefined && mobile_logo_small_edit != '') {
            var path = `./public/${mobile_logo_small_edit}`;
            fs.unlink(path, (err) => {
                if (!err) {
                    console.log(`White Color deleted: ${mobile_logo_small_edit}`)
                }
            })
        }
    }

    let largeLogoFile = '';
    var largeLogo = '';
    if (req.files && req.files.mobile_logo_large != undefined) {
        largeLogoFile = req.files.mobile_logo_large;
        largeLogo = dir + Date.now() / 1000 + "-" + largeLogoFile.name.replace(/\s+/g, '_').toLowerCase();
        //Use the mv() method to place the file somewhere on your server
        largeLogoFile.mv(largeLogo, function (err) {
            if (err) {
                console.log(err)
                // return res.redirect("/baseUrl/routeUrl");
            }
        });
        largeLogo = largeLogo.substring(9);
        values.mobile_logo_large = largeLogo
        if (mobile_logo_large_edit != undefined && mobile_logo_large_edit != '') {
            var path = `./public/${mobile_logo_large_edit}`;
            fs.unlink(path, (err) => {
                if (!err) {
                    console.log(`White Color deleted: ${mobile_logo_large_edit}`)
                }
            })
        }
    }

    if (errorFlag == true ) {
        return res.redirect(baseUrl +routeUrl);
    } else {
        values.organization_name=organization_name;
        values.copyright_text = copyright_text;
        values.email1 = email1;
        values.email2 = email2;
        values.contact_no = contact_no;
        values.twitter_link = twitter_link;
        values.facebook_link = facebook_link;
        values.youtube_link  = youtube_link;
        values.instagram_link = instagram_link;
        values.andriod_app_link = andriod_app_link;
        values.ios_app_link = ios_app_link;
        values.address1 = address1;
        values.address2 = address2;
        values.map_address = map_address;
        values.section1_text = section1_text;
        values.section1_description  = section1_description;
        await Setting.update(
            values, {
                where: {
                    id: result_id
                }
            }
        ).then((result) => {
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "update", detail = `General setting has been updated.`)
            /**********************./Activity Logs**************************************** */
            req.flash('success', "Record Updated Successfully...!");
            return res.redirect(baseUrl+routeUrl);
        }).catch((error) => {
            console.log(error)
            req.flash('error', err.message);
            return res.redirect(baseUrl+routeUrl);
        })
    }
}

// activity logs
// #Get list page
const activityLogsPage = async (req, res) => {
    const userList = await users.findAll({ attributes: ['id','name','username'], where: { user_type: "admin"} });
    const actionList = ['add','view','update','delete','login'];
    res.render('admin/activity-logs-list', {
        successFlash: req.flash('success'),
        errorFlash: req.flash('error').join('<br />'),
        title: 'KPCTA | Activity Logs',
        pageTitle: 'Activity Logs',
        baseUrl: baseUrl,
        actionUrl: `${baseUrl}/general-setting`,
        userList: userList,
        actionList: actionList
    })
}

// #find DataTable 
const activityLogsData = async (req, res) => {
    let { start, length, draw, filter_action, filter_user, filter_detail } = req.body;
    var searchStr = {};
    searchStr.status = 1;
    if (filter_detail.trim() != '') {
        searchStr.detail = {
            [Op.like]: `%${filter_detail}%`
        }
    }
    if(filter_action != 'all') {
        searchStr.action = filter_action;
    }
    if(filter_user != 'all') {
        searchStr.user_id = filter_user;
    }
    const dataList  = await ActivityLogs.findAll({
        include: [{
            model: users,
            as: 'user',
            attributes: ['id','name','username','profile_image']
        }],
        where: searchStr,
        offset: Number(start),
        limit: length != -1 ? Number(length) : null,
        order: [['id','DESC']]
    });
    const recordsTotal = await ActivityLogs.count({where: { status: 1 }});
    const recordsFiltered = await ActivityLogs.count({ where: searchStr });
    
    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    dataList.forEach(async (item) => {
        i++;
        no++;
        dataArr = [
            no,
            `<span class="badge bg-default badge">${item.ip_address}</span>`,
            `<div class="media mt-0">
                <div class="media-user me-2">
                    <div class=""><img alt="No image" class="rounded-circle avatar avatar-md" src="/${item.user.profile_image }"></div>
                </div>
                <div class="media-body">
                    <h6 class="mb-0 mt-1">${item.user.name}</h6>
                </div>
            </div>`,
            `<span class="badge bg-warning badge">${item.action}</span>`,
            `<span class="text-muted">${item.detail}</span>`,
            `<span class="badge bg-default badge"><strong>${moment(item.createdAt).format('lll')}</strong> - (${moment(item.createdAt).fromNow()})</span>`
        ];
        dataArr2.push(dataArr)
    });
    
    var data = JSON.stringify({
        "draw": draw,
        "recordsTotal": recordsTotal,
        "recordsFiltered": recordsFiltered,
        "data": dataArr2
    });
    return res.send(data);
}

module.exports = {
    SettingList,
    imagesAdd,
    SettingUpdate,
    activityLogsPage,
    activityLogsData
}