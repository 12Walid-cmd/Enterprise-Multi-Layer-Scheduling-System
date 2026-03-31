const express = require('express');
const router = express.Router();
const controller = require('./rotations.controller');

router.post('/', controller.createRotation);
router.get('/', controller.getRotations);
router.get('/types', controller.getRotationTypes);

// Template routes
router.get('/templates', controller.getTemplates);
router.post('/templates', controller.createTemplate);
router.patch('/templates/:id', controller.updateTemplate);
router.delete('/templates/:id', controller.deleteTemplate);

// Rotation member routes
router.get('/:rotationId/members', controller.getRotationMembers);
router.post('/:rotationId/members', controller.addRotationMember);
router.patch('/:rotationId/members/reorder', controller.reorderRotationMembers);
router.delete('/:rotationId/members/:memberId', controller.removeRotationMember);
router.patch('/:rotationId', controller.updateRotation);
router.delete('/:rotationId', controller.deleteRotation);

module.exports = router;