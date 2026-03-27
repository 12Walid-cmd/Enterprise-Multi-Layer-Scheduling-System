const express = require('express');
const router = express.Router();
const controller = require('./groups.controller');

router.post('/', controller.createGroup);
router.get('/', controller.getGroups);

module.exports = router;