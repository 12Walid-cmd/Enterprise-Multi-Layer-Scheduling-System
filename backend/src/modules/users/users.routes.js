const express = require('express');
const router = express.Router();
const controller = require('./users.controller');
const userRolesController = require('./userRoles.controller');

router.get('/', controller.getUsers);
router.get('/super-admin', userRolesController.getSuperAdmin);
router.get('/role-audit', userRolesController.getRoleAuditLogs);
router.get('/:userId/app-roles', userRolesController.getUserAppRoles);
router.put('/:userId/app-roles', userRolesController.setUserAppRoles);

module.exports = router;