const   { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize"),
        sharpFileUpload = require("../../modules/sharp-file-upload"),
        fs = require('fs'),
        { randomString } = require('../../middleware/random-string');
const { v4: uuidv4 }  = require('uuid');
const Menu = require("../../models/menu");
const role = require("../../models/role");
const RoleMenu = require("../../models/role_menus");
const User = require("../../models/user");
const { activityLogsSave } = require("../../modules/activity-logs");

const baseUrl = '/ap';
const routeUrl = '/ap/rbac';

// #Get Menus Page
const menuPage = async (req, res) => {
    res.render('admin/rbac/menu-list', {
        successFlash: req.flash('success'),
        errorFlash: req.flash('error').join('<br />'),
        title: 'KPCTA | RBAC-Menus',
        pageTitle: 'RBAC Menus',
        baseUrl: baseUrl,
        actionUrl: `${routeUrl}/menus`
    })
}
// Get menus list
const menuList = async (req, res) => {
    let { start, length, draw, search } = req.body;
    var searchStr = {};
    searchStr.isDeleted = 0;
    searchStr.parent_id = 0;
    if(search && search['value']){
        searchStr.title = {
            [Op.like]: `%${search['value']}%`
        }
    }

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    let menuData  = await Menu.findAll({
        where: searchStr,
        offset: Number(start),
        limit: length != -1 ? Number(length) : null,
        order: [['id','ASC']]
    });
    let Total = await Menu.count({where: { isDeleted: 0, parent_id: 0 }});
    let Filtered = await Menu.count({ where:searchStr });

    menuData.forEach(async item => {
        i++;
        no++;
        let status = item.status ? 'checked':'';
        let typeMainMenu = item.type == 'main-menu' ? 'selected':'';
        let typeSubMenu = item.type == 'sub-menu' ? 'selected':'';
        let typeOther = item.type == 'other' ? 'selected':'';
        let isSubMenus = '';
        let statusSwitch = 'N/A';
        if(item.type == 'sub-menu') {
            isSubMenus = `<a href="${routeUrl}/menus/${item.id}/sub-menus" data-bs-toggle="tooltip" title="Add SubMenus for ${item.title}">
                <button type="button" class="btn btn-info btn-sm position-relative">
                    <span class="fe fe-plus"></span> Parent & Child
                </button>
            </a>`;
            statusSwitch = `<div class="form-group" data-toggle="tooltip" title="Active/In-active">
                <label class="custom-switch form-switch mb-0">
                    <input type="checkbox" name="custom-switch-radio" class="custom-switch-input" ${status} id="customSwitch${item.id}" onchange="changeStatus('${item.id}','menus')">
                    <span class="custom-switch-indicator"></span>
                </label>
            </div>`;
        } else if(item.type == 'main-menu') {
            isSubMenus = `<a href="${routeUrl}/menus/${item.id}/sub-menus" data-bs-toggle="tooltip" title="Add Sub Parent for ${item.title}">
                <button type="button" class="btn btn-success btn-sm position-relative">
                    <span class="fe fe-plus"></span> Only Parent
                </button>
            </a>`;
            statusSwitch = `<div class="form-group" data-toggle="tooltip" title="Active/In-active">
                <label class="custom-switch form-switch mb-0">
                    <input type="checkbox" name="custom-switch-radio" class="custom-switch-input" ${status} id="customSwitch${item.id}" onchange="changeStatus('${item.id}','menus')">
                    <span class="custom-switch-indicator"></span>
                </label>
            </div>`;
        } else {
            isSubMenus = `<a href="${routeUrl}/menus/${item.id}/sub-menus" data-bs-toggle="tooltip" title="Add Sub Other for ${item.title}">
                <button type="button" class="btn btn-warning btn-sm position-relative">
                    <span class="fe fe-plus"></span> Sub of Other
                </button>
            </a>`;
        }

        const queryParam = item.query_param != null && item.query_param != '' ? `?${item.query_param}`:'';
        dataArr = [
            no,
            item.title,
            `<code>${item.route}</code>`,
            `<code>${item.slug}${queryParam}</code>`,
            `<code>${item.icon}</code>`,
            `${item.sort}`,
            `${statusSwitch}`,
            `<div class="form-group mt-0 mb-0">
                <select class="form-control form-select select2 menu-type" name="type" id="${item.id}">
                    <option value="main-menu" ${typeMainMenu}>Only Parent</option>
                    <option value="sub-menu" ${typeSubMenu}>Parent & Child</option>
                    <option value="other" ${typeOther}>Other</option>
                </select>
            </div>`,
            `${isSubMenus}
            <button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit" onclick="editRecord('${item.id}','menus')">
                <span class="fe fe-edit fs-12"></span>
            </button>
            <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','menus')">
                <span class="fe fe-trash-2 fs-12"></span>
            </button>`
        ];
        dataArr2.push(dataArr)
    });
    
    var data = JSON.stringify({
        "draw": draw,
        "recordsTotal": Total,
        "recordsFiltered": Filtered,
        "data": dataArr2
    });
    return res.send(data);
}
// Add Menus
const addMenu = async (req, res) => {
    let { title, slug, query_param, route, icon, sort, type } = req.body;
    Menu.create({
        title: title,
        slug: slug,
        query_param: query_param.trim() != '' ? query_param:null,
        route: route,
        icon: icon,
        sort: sort,
        type: type,
        status: false
    }).then((recordCreated) => {
        if(recordCreated){
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "add", detail = `${title} Menu has been added.`)
            /**********************./Activity Logs**************************************** */
            res.send({success: true, message: 'Record has been added successfully.'});
        } else {
            res.send({success: false, message: 'Oops! Something went wrong.'});
        }
    }).catch((err) => {
        res.send({success: false, message: 'Oops! Something went wrong. '+err});
    })
}
// Update Menus
const updateMenu = async (req, res) => {
    let { id, title, slug, query_param, route, icon, sort, type } = req.body;
    Menu.update({
        title: title,
        slug: slug,
        query_param: query_param.trim() != '' ? query_param:null,
        route: route,
        icon: icon,
        sort: sort,
        type: type
    },{
        where: { id: id }
    }
    ).then((recordCreated) => {
        if(recordCreated){
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "update", detail = `${title} Menu has been added.`)
            /**********************./Activity Logs**************************************** */
            res.send({success: true, message: 'Record has been updated successfully.'});
        } else {
            res.send({success: false, message: 'Oops! Something went wrong.'});
        }
    }).catch((err) => {
        res.send({success: false, message: 'Oops! Something went wrong. '+err});
    })
}
// Menu type change
const typeChangeMenu = async (req, res) => {
    let { id, type } = req.body;
    try {
        const typeUpdate = await Menu.update({
                type: type
            },
            {
                where: {
                    id: id
                }
            }
        );
        if(typeUpdate) {
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "update", detail = `Menu ID = ${id} type has been changed to ${type}.`)
            /**********************./Activity Logs**************************************** */
            return res.send({success: true, message: `Record type has been changed to ${type}.`});
        }
    } catch(error) {
        return res.send({success: false, message: `Oops! something went wrong. ${error}`});
    }
}

/*******************SUB MENUS********************** */
// #Get SubMenus Page
const subMenuPage = async (req, res) => {
    const { menu_id } = req.params;
    const menuData = await Menu.findOne({ where: { id: menu_id, isDeleted: 0 }});
    res.render('admin/rbac/sub-menu-list', {
        successFlash: req.flash('success'),
        errorFlash: req.flash('error').join('<br />'),
        title: menuData.type == 'sub-menu' ? 'KPCTA | RBAC-Sub Menus' : 'KPCTA | RBAC-Sub',
        pageTitle: menuData.type == 'sub-menu' ? `RBAC Sub Menus`:'RBAC',
        baseUrl: baseUrl,
        actionUrl: `${routeUrl}/menus/${menu_id}/sub-menus`,
        menuData: menuData
    })
}
// Get sub menus list
const subMenuList = async (req, res) => {
    let { menu_id, start, length, draw } = req.body;
    const parentMenu = await Menu.findOne({ attributes: ['type'], where: { id: menu_id, isDeleted: 0 }})
    var searchStr = {};
    searchStr.isDeleted = 0;
    searchStr.parent_id = menu_id;

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    let menuData  = await Menu.findAll({
        where: searchStr,
        offset: Number(start),
        limit: length != -1 ? Number(length) : null,
        order: [['id','ASC']]
    });
    let Total = await Menu.count({where: { isDeleted: 0, parent_id: menu_id }});
    let Filtered = await Menu.count({ where:searchStr });

    menuData.forEach(async item => {
        i++;
        no++;
        let status = item.status ? 'checked':'';
        let statusSwitch = 'N/A';
        if(parentMenu.type != 'other' && parentMenu.type != 'main-menu') {
            statusSwitch = `<div class="form-group" data-toggle="tooltip" title="Active/In-active">
                <label class="custom-switch form-switch mb-0">
                    <input type="checkbox" name="custom-switch-radio" class="custom-switch-input" ${status} id="customSwitch${item.id}" onchange="changeStatus('${item.id}','menus')">
                    <span class="custom-switch-indicator"></span>
                </label>
            </div>`;
        }

        const queryParam = item.query_param != null && item.query_param != '' ? `?${item.query_param}`:'';

        dataArr = [
            no,
            item.title,
            `<code>${item.route}</code>`,
            `<code>${item.slug}${queryParam}</code>`,
            `<code>${item.icon}</code>`,
            `${item.sort}`,
            statusSwitch,
            `<button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit" onclick="editRecord('${item.id}','menus')">
                <span class="fe fe-edit fs-12"></span>
            </button>
            <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','menus')">
                <span class="fe fe-trash-2 fs-12"></span>
            </button>`
        ];
        dataArr2.push(dataArr)
    });
    
    var data = JSON.stringify({
        "draw": draw,
        "recordsTotal": Total,
        "recordsFiltered": Filtered,
        "data": dataArr2
    });
    return res.send(data);
}
// Add Sub Menus
const addSubMenu = async (req, res) => {
    let { menu_id, menu_parent_type, title, slug, query_param, route, icon, sort } = req.body;
    Menu.create({
        parent_id: menu_id,
        type: menu_parent_type,
        title: title,
        slug: slug,
        query_param: query_param,
        route: route,
        icon: icon,
        sort: sort,
        status: false
    }).then((recordCreated) => {
        if(recordCreated){
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "add", detail = `Menu ID = ${menu_id} submenu ${title} has been added.`)
            /**********************./Activity Logs**************************************** */
            res.send({success: true, message: 'Record has been added successfully.'});
        } else {
            res.send({success: false, message: 'Oops! Something went wrong.'});
        }
    }).catch((err) => {
        res.send({success: false, message: 'Oops! Something went wrong. '+err});
    })
}
// Update Sub Menus
const updateSubMenu = async (req, res) => {
    let { id, parent_id, menu_parent_type, title, slug, query_param, route, icon, sort } = req.body;
    Menu.update({
        type: menu_parent_type,
        title: title,
        slug: slug,
        query_param: query_param,
        route: route,
        icon: icon,
        sort: sort,
        updatedAt: new Date
    },{
        where: { id: id, parent_id: parent_id }
    }
    ).then((recordCreated) => {
        if(recordCreated){
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "update", detail = `Menu ID = ${parent_id} submenu ${title} has been updated.`)
            /**********************./Activity Logs**************************************** */
            res.send({success: true, message: 'Record has been updated successfully.'});
        } else {
            res.send({success: false, message: 'Oops! Something went wrong.'});
        }
    }).catch((err) => {
        res.send({success: false, message: 'Oops! Something went wrong. '+err});
    })
}

/*******************ROLES********************** */
// #Get Role Page
const rolePage = async (req, res) => {
    res.render('admin/rbac/role-list', {
        successFlash: req.flash('success'),
        errorFlash: req.flash('error').join('<br />'),
        title: 'KPCTA | RBAC-Roles',
        pageTitle: `RBAC Roles`,
        baseUrl: baseUrl,
        actionUrl: `${routeUrl}/roles`
    })
}
// Get roles list
const roleList = async (req, res) => {
    let { start, length, draw } = req.body;
    var searchStr = {};
    searchStr.isDeleted = 0;

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    let roleData  = await role.findAll({
        where: searchStr,
        offset: Number(start),
        limit: length != -1 ? Number(length) : null,
        order: [['id','DESC']]
    });
    let Total = await role.count({where: { isDeleted: 0 }});
    let Filtered = await role.count({ where:searchStr });
    
    roleData.forEach(async item => {
        i++;
        no++;
        let status = item.status ? 'checked':'';
        let actions = '';
        let statusDisabled = '';
        if(item.id == 1) {
            statusDisabled = 'disabled readonly';
            actions =   `<button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" readonly disabled>
                            <span class="fe fe-lock fs-12"></span>
                        </button>`;
        } else {
            actions =   `<button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','roles')">
                            <span class="fe fe-trash-2 fs-12"></span>
                        </button>`;
        }
        dataArr = [
            no,
            item.title,
            `<div class="form-group" data-toggle="tooltip" title="Active/In-active">
                <label class="custom-switch form-switch mb-0">
                    <input type="checkbox" name="custom-switch-radio" class="custom-switch-input" ${status} id="customSwitch${item.id}" onchange="changeStatus('${item.id}','roles')" ${statusDisabled}>
                    <span class="custom-switch-indicator"></span>
                </label>
            </div>`,
            `<a href="${routeUrl}/roles/${item.id}/rolemenus/manage">
                <button type="button" class="btn btn-info btn-sm position-relative" data-bs-toggle="tooltip" title="Manage Role for ${item.title}">
                    <span class="fe fe-plus"></span> Manage Role
                </button>
            </a>`,
            `<button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit" onclick="editRecord('${item.id}','roles')">
                <span class="fe fe-edit fs-12"></span>
            </button>
            ${actions}`
        ];
        dataArr2.push(dataArr)
    });
    
    var data = JSON.stringify({
        "draw": draw,
        "recordsTotal": Total,
        "recordsFiltered": Filtered,
        "data": dataArr2
    });
    return res.send(data);
}
// Add Role
const addRole = async (req, res) => {
    let { title } = req.body;
    role.create({
        title: title
    }).then((recordCreated) => {
        if(recordCreated){
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "add", detail = `${title} Role has been added.`)
            /**********************./Activity Logs**************************************** */
            res.send({success: true, message: 'Record has been added successfully.'});
        } else {
            res.send({success: false, message: 'Oops! Something went wrong.'});
        }
    }).catch((err) => {
        res.send({success: false, message: 'Oops! Something went wrong. '+err});
    })
}
// Update Role
const updateRole = async (req, res) => {
    let { id, title } = req.body;
    role.update({
        title: title,
    },{
        where: { id: id }
    }
    ).then((recordCreated) => {
        if(recordCreated){
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "update", detail = `${title} Role has been updated.`)
            /**********************./Activity Logs**************************************** */
            res.send({success: true, message: 'Record has been updated successfully.'});
        } else {
            res.send({success: false, message: 'Oops! Something went wrong.'});
        }
    }).catch((err) => {
        res.send({success: false, message: 'Oops! Something went wrong. '+err});
    })
}

/*******************MANAGE ROLE MENUS********************** */
// #Get Role menus Page
const roleMenuPage = async (req, res) => {
    const { id } = req.params;
    const roleData = await role.findOne({ where: { id: id, isDeleted: 0, status: 1 }});

    res.render('admin/rbac/role-menu-list', {
        successFlash: req.flash('success'),
        errorFlash: req.flash('error').join('<br />'),
        title: 'KPCTA | RBAC-Roles',
        pageTitle: `RBAC Role Menus`,
        baseUrl: baseUrl,
        actionUrl: `${routeUrl}/roles/${id}/rolemenus`,
        roleData: roleData ? roleData:{}
    })
}
// Get menus list
const roleMenuList = async (req, res) => {
    let { role_id, start, length, draw } = req.body;
    var searchStr = {};
    searchStr.isDeleted = 0;

    /***** Find already assigned menus to a ROLE *****/
    const roleMenusData = await RoleMenu.findAll({ attributes: ['id','menu_id'], where: { role_id: role_id }});
    const menuIds = [];
    roleMenusData.forEach(val => {
        menuIds.push(Number(val.menu_id));
    })
    if(menuIds.length > 0) {
        searchStr.id = {
            [Op.notIn]: menuIds
        }
    }
    /***** ./Find already assigned menus to a ROLE *****/

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    let menuData  = await Menu.findAll({
        attributes: ['id','parent_id','title', 'route', 'slug', 'type'],
        where: searchStr,
        offset: Number(start),
        limit: length != -1 ? Number(length) : null,
        order: [['route','ASC']]
    });
    let Total = await Menu.count({where: { isDeleted: 0, id: { [Op.notIn]: menuIds } }});
    let Filtered = await Menu.count({ where:searchStr });
    
    menuData.forEach(async item => {
        i++;
        no++;

        let title = '';
        if(item.parent_id == 0) {
            if(item.type == 'main-menu') {
                title = `${item.title} <span class="badge rounded-pill bg-success badge">Parent</span>`;
            } else if(item.type == 'sub-menu') {
                title = `${item.title} <span class="badge rounded-pill bg-purple badge">Parent & Child</span>`;
            } else {
                title = `${item.title} <span class="badge rounded-pill bg-warning badge">Other</span>`;
            }
        } else if(item.parent_id != 0 && item.type == 'main-menu') {
            title = `${item.title} <span class="badge rounded-pill bg-success badge">Sub of Parent</span>`;
        } else if(item.parent_id != 0 && item.type == 'sub-menu') {
            title = `${item.title} <span class="badge rounded-pill bg-purple badge">Sub of Parent & Child</span>`;
        } else {
            title = `${item.title} <span class="badge rounded-pill bg-warning badge">Sub of Other</span>`;
        }

        dataArr = [
            no,
            title,
            `<code>${item.route}</code>`,
            `<code>${item.slug}</code>`,
            `<button class="btn btn-success btn-sm" data-bs-toggle="tooltip" title="Grant Access" onclick="grantAccess('${item.id}')">
                Grant Access
            </button>`
        ];
        dataArr2.push(dataArr)
    });
    
    var data = JSON.stringify({
        "draw": draw,
        "recordsTotal": Total,
        "recordsFiltered": Filtered,
        "data": dataArr2
    });
    return res.send(data);
}

// Get menus list
const roleBasedMenuList = async (req, res) => {
    let { role_id, start, length, draw } = req.body;
    var searchStr = {};
    searchStr.role_id = Number(role_id);

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    let menuData  = await RoleMenu.findAll({
        include: [{
            model: Menu,
            as: 'menus'
        }],
        where: searchStr,
        offset: Number(start),
        limit: length != -1 ? Number(length) : null,
        order: [
            ['id', 'ASC' ]
        ]
    });
    let Total = await RoleMenu.count({where: { role_id: role_id }});
    let Filtered = await RoleMenu.count({ where:searchStr });
    
    menuData.forEach(async item => {
        i++;
        no++;

        let title = '';
        if(item.menus.parent_id == 0) {
            if(item.menus.type == 'main-menu') {
                title = `${item.menus.title} <span class="badge rounded-pill bg-success badge">Parent</span>`;
            } else if(item.menus.type == 'sub-menu') {
                title = `${item.menus.title} <span class="badge rounded-pill bg-purple badge">Parent & Child</span>`;
            } else {
                title = `${item.menus.title} <span class="badge rounded-pill bg-warning badge">Other</span>`;
            }
        } else if(item.menus.parent_id != 0 && item.menus.type == 'main-menu') {
            title = `${item.menus.title} <span class="badge rounded-pill bg-success badge">Sub of Parent</span>`;
        } else if(item.menus.parent_id != 0 && item.menus.type == 'sub-menu') {
            title = `${item.menus.title} <span class="badge rounded-pill bg-purple badge">Sub of Parent & Child</span>`;
        } else {
            title = `${item.menus.title} <span class="badge rounded-pill bg-warning badge">Sub of Other</span>`;
        }

        dataArr = [
            no,
            title,
            `<code>${item.menus.route}</code>`,
            `<code>${item.menus.slug}</code>`,
            `<button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Remove Access" onclick="removeAccess('${item.id}')">
                Remove Access
            </button>`
        ];
        dataArr2.push(dataArr)
    });
    
    var data = JSON.stringify({
        "draw": draw,
        "recordsTotal": Total,
        "recordsFiltered": Filtered,
        "data": dataArr2
    });
    return res.send(data);
}

// Grant access to a role
const grantAccessRoleMenu = async (req, res) => {
    const { role_id, menu_id } = req.body;
    RoleMenu.create({
        role_id: role_id,
        menu_id: menu_id
    }).then((recordCreated) => {
        if(recordCreated){
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "add", detail = `Menu ID = ${menu_id} access has been assigned to Role ID = ${role_id}.`)
            /**********************./Activity Logs**************************************** */
            res.send({ success: true, message: "Menu ACCESS has been ASSIGNED." });
        } else {
            res.send({ success: false, message: "Something went wrong, try again please!" });
        }
    }).catch((err) => {
        res.send({ success: false, message: "Something went wrong. "+err.message });
    })
}

// Remove access from a role
const removeAccessRoleMenu = async (req, res) => {
    const { role_id, role_menu_id } = req.body;
    RoleMenu.destroy({
        where: {
            role_id: role_id,
            id: role_menu_id
        }
    }).then((recordCreated) => {
        if(recordCreated){
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "add", detail = `Menu ID = ${menu_id} access has been removed from Role ID = ${role_id}.`)
            /**********************./Activity Logs**************************************** */
            res.send({ success: true, message: "Menu ACCESS has been REMOVED." });
        } else {
            res.send({ success: false, message: "Something went wrong, try again please!" });
        }
    }).catch((err) => {
        res.send({ success: false, message: "Something went wrong. "+err.message });
    })
}
/*******************./ROLE MENUS********************** */

/*******************SYSTEM USERS********************** */
// #Get System User Page
const systemUserPage = async (req, res) => {
    const rolesData = await role.findAll({ where: { status: 1, isDeleted: 0 }});
    res.render('admin/rbac/system-user-list', {
        successFlash: req.flash('success'),
        errorFlash: req.flash('error').join('<br />'),
        title: 'KPCTA | RBAC-System-Users',
        pageTitle: `RBAC System Users`,
        baseUrl: baseUrl,
        actionUrl: `${routeUrl}/system-users`,
        rolesData: rolesData
    })
}
// Get System User list
const systemUserList = async (req, res) => {
    let { start, length, draw } = req.body;
    var searchStr = {};
    searchStr.isDeleted = 0;
    searchStr.user_type = 'admin';

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    let userData  = await User.findAll({
        include: [{
            model: role,
            as: 'roles',
            attributes: ['id','title']
        }],
        where: searchStr,
        offset: Number(start),
        limit: length != -1 ? Number(length) : null,
        order: [['id','DESC']]
    });
    let Total = await User.count({where: { isDeleted: 0, user_type: 'admin' }});
    let Filtered = await User.count({ where:searchStr });
    
    userData.forEach(async item => {
        i++;
        no++;
        let status = item.status ? 'checked':'';
        dataArr = [
            no,
            `<a href="#">
                <div class="media mt-0">
                    <div class="media-user me-2">
                        <div class=""><img alt="No image" class="rounded-circle avatar avatar-md" src="/${item.profile_image }"></div>
                    </div>
                    <div class="media-body">
                        <h6 class="mb-0 mt-1">${item.name}</h6>
                    </div>
                </div>
            </a>`,
            `<code>${item.username}</code>`,
            `<code>${item.email}</code>`,
            `<code>${item.mobile_no}</code>`,
            `<span class="badge rounded-pill bg-success badge">${item.roles.title}</span>`,
            `<div class="form-group" data-toggle="tooltip" title="Active/In-active">
                <label class="custom-switch form-switch mb-0">
                    <input type="checkbox" name="custom-switch-radio" class="custom-switch-input" ${status} id="customSwitch${item.id}" onchange="changeStatus('${item.id}','users')">
                    <span class="custom-switch-indicator"></span>
                </label>
            </div>`,
            `<span class="badge rounded-pill bg-default badge">${item.createdAt}</span>`,
            `<button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit" onclick="editRecord('${item.id}','users')">
                <span class="fe fe-edit fs-12"></span>
            </button>
            <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','users')">
                <span class="fe fe-trash-2 fs-12"></span>
            </button>`
        ];
        dataArr2.push(dataArr)
    });
    
    var data = JSON.stringify({
        "draw": draw,
        "recordsTotal": Total,
        "recordsFiltered": Filtered,
        "data": dataArr2
    });
    return res.send(data);
}
// Add System User
const addSystemUser = async (req, res) => {
    const { name, username, password, mobile_no, role_id } = req.body;
    if( name.trim() != '' &&
        username.trim() != '' &&
        password.trim() != '' &&
        mobile_no.trim() != '' &&
        role_id != undefined
        ) {

        /******************************File Upload****************************************************** */
        var dir = "./public/uploads/admin/profile/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        let pImage = '';
        let thumbImage = '';
        if (req.files && req.files.profile_image != undefined) { 
            // Preview Image
            pImage = await sharpFileUpload.fileToUpload(req.files.profile_image, dir, 200, 200);
            // Creation thumbnail Image 
            thumbImage = await sharpFileUpload.fileToUpload(req.files.profile_image, dir, 100, 100);
        }
        /******************************./File Upload***************************************************** */

        User.create({
            uuid: uuidv4(),
            name: name,
            email: username,
            username: username,
            password: password,
            user_type: 'admin',
            mobile_no: mobile_no,
            role_id: role_id,
            profile_image: pImage,
            profile_image_thumb: thumbImage,
            status: true,
            register_from: 'admin'
        }).then(async (regUser) => {
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "add", detail = `${name} with ${username} has been added.`)
            /**********************./Activity Logs**************************************** */
            return res.send({
                success: true,
                message: `Success! User has been created successfully.`,
                data: regUser
            })
        }).catch((err) => {
            return res.send({
                success: false,
                message: `Error: ${err.message}. Seems this username is already exist. Try again with different username!`
            })
        })
    } else {
        return res.send({
            success: false,
            message: `Oops! Something went wrong. Please fill the required fields.`
        })
    }
}
// Update System User
const updateSystemUser = async (req, res) => {
    const { id, name, username, email, mobile_no, role_id } = req.body;
    let inputs = {};
    inputs.name = name;
    inputs.username = username;
    inputs.email = email;
    inputs.mobile_no = mobile_no;
    inputs.role_id = role_id;

    /******************************File Upload****************************************************** */
    var dir = "./public/uploads/admin/profile/";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let pImage = '';
    let thumbImage = '';
    if (req.files && req.files.profile_image != undefined) { 
        // Preview Image
        pImage = await sharpFileUpload.fileToUpload(req.files.profile_image, dir, 200, 200);
        // Creation thumbnail Image 
        thumbImage = await sharpFileUpload.fileToUpload(req.files.profile_image, dir, 100, 100);

        inputs.profile_image = pImage;
        inputs.profile_image_thumb = thumbImage;
    }
    /******************************./File Upload***************************************************** */

    User.update(
        inputs,
    {
        where: { id: id }
    }
    ).then((recordCreated) => {
        if(recordCreated){
            /**********************Activity Logs****************************************** */
            activityLogsSave(req, action = "update", detail = `${name} with ${username} has been updated.`)
            /**********************./Activity Logs**************************************** */
            res.send({success: true, message: 'User has been updated successfully.'});
        } else {
            res.send({success: false, message: 'Oops! Something went wrong.'});
        }
    }).catch((err) => {
        res.send({success: false, message: 'Oops! Something went wrong. '+err});
    })
}

module.exports = {
    menuPage,
    menuList,
    addMenu,
    updateMenu,
    typeChangeMenu,
    subMenuPage,
    subMenuList,
    addSubMenu,
    updateSubMenu,
    rolePage,
    roleList,
    addRole,
    updateRole,
    roleMenuPage,
    roleMenuList,
    roleBasedMenuList,
    grantAccessRoleMenu,
    removeAccessRoleMenu,
    systemUserPage,
    systemUserList,
    addSystemUser,
    updateSystemUser
}