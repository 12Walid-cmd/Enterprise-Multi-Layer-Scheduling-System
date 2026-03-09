const express = require('express');
const router = express.Router();
const controller = require('./rotations.controller');

router.post('/', controller.createRotation);
router.get('/', controller.getRotations);
router.get('/:rotationId/members', controller.getRotationMembers);
router.post('/:rotationId/members', controller.addRotationMember);
router.delete('/:rotationId/members/:memberId', controller.removeRotationMember);

module.exports = router;