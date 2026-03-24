const express = require('express');
const router = express.Router();
const controller = require('./users.controller');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');

router.get('/', requireAuth, requireRole('administrator'), controller.getUsers);

module.exports = router;