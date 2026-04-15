const express = require('express');
const router = express.Router();
const controller = require('./accountRoles.controller');

router.get('/', controller.getAccountRoles);

module.exports = router;
