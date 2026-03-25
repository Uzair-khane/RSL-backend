const   { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize"),
        sharpFileUpload = require("../../modules/sharp-file-upload"),
        fs = require('fs'),
        { randomString } = require('../../middleware/random-string');
const Page = require("../../models/page");
const { replaceString } = require("../../modules/regix");
const { activityLogsSave } = require("../../modules/activity-logs");

const baseUrl = '/ap';
const routeUrl = '/ap/page';

// #Get Page
const pagePage = async (req, res) => {
    res.render('admin/page-list', {
        successFlash: req.flash('success'),
        errorFlash: req.flash('error').join('<br />'),
        title: 'KPCTA | Page',
        pageTitle: `Pages`,
        baseUrl: baseUrl,
        actionUrl: `${routeUrl}`
    })
}
// Get list
const pageList = async (req, res) => {
    let { start, length, draw } = req.body;
    var searchStr = {};
    searchStr.isDeleted = 0;

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    let dataList  = await Page.findAll({
        where: searchStr,
        offset: Number(start),
        limit: length != -1 ? Number(length) : null,
        order: [['id','DESC']]
    });
    let recordsTotal = await Page.count({where: { isDeleted: 0 }});
    let recordsFiltered = await Page.count({ where:searchStr });
    
    dataList.forEach(async item => {
        i++;
        no++;
        let status = item.status ? 'checked':'';
        let seeMore = item.description.length > 200 ? ` ... <a href="${routeUrl}/view/${item.id}?slug=${item.slug}">Read more</a>`:'';
        dataArr = [
            no,
            `<a href="${routeUrl}/view/${item.id}?slug=${item.slug}">
                <div class="media mt-0">
                    <div class="media-user me-2">
                        <div class=""><img alt="No image" class="rounded-circle avatar avatar-md" src="/${item.image_url }"></div>
                    </div>
                    <div class="media-body">
                        <h6 class="mb-0 mt-1">${item.title}</h6>
                    </div>
                </div>
            </a>`,
            `<code>${item.slug}</code>`,
            `<span class="badge rounded-pill bg-warning badge">${item.type.toUpperCase()}</span>`,
            `${item.description.substring(0, 200)}` + seeMore,
            `<div class="form-group" data-toggle="tooltip" title="Active/In-active">
                <label class="custom-switch form-switch mb-0">
                    <input type="checkbox" name="custom-switch-radio" class="custom-switch-input" ${status} id="customSwitch${item.id}" onchange="changeStatus('${item.id}','pages')">
                    <span class="custom-switch-indicator"></span>
                </label>
            </div>`,
            `<span class="badge rounded-pill bg-default badge">${item.createdAt}</span>`,
            `<span class="badge rounded-pill bg-warning badge">${item.last_updated}</span>`,
            `<button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit" onclick="editRecord('${item.id}','pages')">
                <span class="fe fe-edit fs-12"></span>
            </button>
            <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','pages')">
                <span class="fe fe-trash-2 fs-12"></span>
            </button>`
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
// Add
const pageAdd = async (req, res) => {
    const { title, type, description } = req.body;
    if( title.trim() != '') {

        /******************************File Upload****************************************************** */
        var dir = "./public/uploads/admin/pages/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        let pImage = '';
        if (req.files && req.files.image_url != undefined) { 
            // Preview Image
            pImage = await sharpFileUpload.fileToUpload(req.files.image_url, dir, 1900, 800);
        } else {
            return res.send({
                success: false,
                message: `Please upload display image.`
            })
        }
        /******************************./File Upload***************************************************** */
        let slug = await replaceString(title);
        Page.create({
            title: title,
            type: type,
            slug: slug,
            image_url: pImage,
            description: description
        }).then(async (recordCreated) => {
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "add", detail = `Page of ${title} has been added.`)
            /**********************./Activity Logs**************************************** */
            return res.send({
                success: true,
                message: `Success! Record has been created successfully.`
            })
        }).catch((err) => {
            return res.send({
                success: false,
                message: `Error: ${err.message}`
            })
        })
    } else {
        return res.send({
            success: false,
            message: `Oops! Something went wrong. Please fill the required fields.`
        })
    }
}
// Update
const pageUpdate = async (req, res) => {
    const { id, title, type, description } = req.body;
    let inputs = {};
    inputs.title = title;
    inputs.type = type;
    inputs.description = description;
    inputs.slug = await replaceString(title);

    /******************************File Upload****************************************************** */
    var dir = "./public/uploads/admin/pages/";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let pImage = '';
    if (req.files && req.files.image_url != undefined) { 
        // Preview Image
        pImage = await sharpFileUpload.fileToUpload(req.files.image_url, dir, 1900, 800);
        inputs.image_url = pImage;
    }
    /******************************./File Upload***************************************************** */

    Page.update(
        inputs,
    {
        where: { id: id }
    }
    ).then((recordCreated) => {
        if(recordCreated){
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "add", detail = `Page of ${title} has been added.`)
            /**********************./Activity Logs**************************************** */
            res.send({success: true, message: 'Record has been updated successfully.'});
        } else {
            res.send({success: false, message: 'Oops! Something went wrong.'});
        }
    }).catch((err) => {
        res.send({success: false, message: 'Oops! Something went wrong. '+err});
    })
}

// View
const pageView = async (req, res) => {
    const { page_id } = req.params;
    if(page_id) {
        const result = await Page.findOne({
            where: {
                id: page_id,
                isDeleted: 0
            }
        });
        if(result) {
            res.render('admin/page-detail', {
                successFlash: req.flash('success'),
                errorFlash: req.flash('error').join('<br />'),
                result: result,
                title: `KPCTA | ${result.title}`,
                pageTitle: `${result.title}`,
                baseUrl: baseUrl,
                actionUrl: `${routeUrl}`
            })
        }
    }
}


module.exports = {
    pagePage,
    pageList,
    pageAdd,
    pageUpdate,
    pageView
}