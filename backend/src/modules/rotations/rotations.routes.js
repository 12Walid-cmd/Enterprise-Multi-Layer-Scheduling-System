const express = require('express');
const router = express.Router();
const controller = require('./rotations.controller');

router.post('/', controller.createRotation);
router.get('/', controller.getRotations);
router.get('/types', controller.getRotationTypes);
router.get('/:rotationId/members', controller.getRotationMembers);
router.post('/:rotationId/members', controller.addRotationMember);
router.patch('/:rotationId/members/reorder', controller.reorderRotationMembers);
router.delete('/:rotationId/members/:memberId', controller.removeRotationMember);
router.patch('/:rotationId', controller.updateRotation);

module.exports = router;