const express = require('express');
const router = express.Router();
const controller = require('./holidays.controller');

router.post('/', controller.createHoliday);
router.get('/', controller.getHolidays);

module.exports = router;