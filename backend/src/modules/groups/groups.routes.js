const express = require('express');
const router = express.Router();
const controller = require('./groups.controller');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');

router.get('/', requireAuth, controller.getGroups);
router.post('/', requireAuth, requireRole('rotation_owner', 'administrator'), controller.createGroup);

module.exports = router;