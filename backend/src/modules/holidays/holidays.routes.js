const express = require('express');
const router = express.Router();
const controller = require('./holidays.controller');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');

router.get('/', requireAuth, controller.getHolidays);
router.post('/', requireAuth, requireRole('administrator'), controller.createHoliday);
router.patch('/:id', requireAuth, requireRole('administrator'), controller.updateHoliday);
router.delete('/:id', requireAuth, requireRole('administrator'), controller.deleteHoliday);

module.exports = router;