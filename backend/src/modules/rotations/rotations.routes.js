const express = require('express');
const router = express.Router();
const controller = require('./rotations.controller');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');

router.get('/', requireAuth, controller.getRotations);
router.post('/', requireAuth, requireRole('rotation_owner', 'administrator'), controller.createRotation);
router.post('/:rotationId/members', requireAuth, requireRole('rotation_owner', 'administrator'), controller.addRotationMember);

module.exports = router;