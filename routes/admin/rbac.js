const   express         = require('express'),
        router          = express.Router();
        
const { RbacController } = require('../../controllers');

/***********************MENU********************** */
// Menu Page
router.get('/menus', async(req, res)=>{
  return RbacController.menuPage(req,res);
})
// Menus List
router.post('/menus/list',async(req, res)=>{
  return RbacController.menuList(req, res);
});
// Add Menus
router.post('/menus/add',async(req, res)=>{
    return RbacController.addMenu(req, res);
});
// Update Menus
router.post('/menus/update',async(req, res)=>{
    return RbacController.updateMenu(req, res);
});
// #Menu type change 
router.post('/menus/type/change', async(req, res)=>{
    return RbacController.typeChangeMenu(req, res);
})
/***********************./MENU********************* */

/***********************SUB MENU********************* */
// Sub Menu Page
router.get('/menus/:menu_id/sub-menus', async(req, res)=>{
    return RbacController.subMenuPage(req,res);
  })
  // Sub Menus List
  router.post('/menus/:menu_id/sub-menus/list',async(req, res)=>{
    return RbacController.subMenuList(req, res);
  });
  // Add Sub Menus
  router.post('/menus/:menu_id/sub-menus/add',async(req, res)=>{
      return RbacController.addSubMenu(req, res);
  });
  // Update Sub Menus
  router.post('/menus/:menu_id/sub-menus/update',async(req, res)=>{
      return RbacController.updateSubMenu(req, res);
  });
/***********************./SUB MENU********************* */

/***********************ROLE********************* */
// Role page
router.get('/roles', async(req, res) => {
    return RbacController.rolePage(req,res);
  })
  // Role List
  router.post('/roles/list',async(req, res) => {
    return RbacController.roleList(req, res);
  });
  // Add Role
  router.post('/roles/add',async(req, res) => {
      return RbacController.addRole(req, res);
  });
  // Update Role
  router.post('/roles/update',async(req, res) => {
      return RbacController.updateRole(req, res);
  });
/***********************./ROLE********************* */

/***********************ROLE MENUS********************* */
// Role menus page
router.get('/roles/:id/rolemenus/manage', async(req, res) => {
    return RbacController.roleMenuPage(req,res);
})
// menus List
router.post('/roles/:id/rolemenus/menus/list',async(req, res) => {
    return RbacController.roleMenuList(req, res);
});
// Role based menus List
router.post('/roles/:id/rolemenus/list',async(req, res) => {
    return RbacController.roleBasedMenuList(req, res);
});
// Grant menu access to a Role
router.post('/roles/:id/rolemenus/grant/access',async(req, res) => {
    return RbacController.grantAccessRoleMenu(req, res);
});
// Remove menu access from a Role
router.post('/roles/:id/rolemenus/remove/access',async(req, res) => {
    return RbacController.removeAccessRoleMenu(req, res);
});
/***********************./ROLE MENUS********************* */

/***********************SYSTEM USERS********************* */
// System User page
router.get('/system-users', async(req, res) => {
    return RbacController.systemUserPage(req,res);
})
// System User List
router.post('/system-users/list',async(req, res) => {
    return RbacController.systemUserList(req, res);
});
// Add System User
router.post('/system-users/add',async(req, res) => {
    return RbacController.addSystemUser(req, res);
});
// Update System User
router.post('/system-users/update',async(req, res) => {
    return RbacController.updateSystemUser(req, res);
});
/***********************./SYSTEM USERS********************* */


module.exports = router;