const express = require('express');
const router = express.Router();
const controller = require('./rotations.controller');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');

router.get('/', requireAuth, controller.getRotations);
router.post('/', requireAuth, requireRole('rotation_owner', 'administrator'), controller.createRotation);
router.get('/types', requireAuth, controller.getRotationTypes);

// Template routes
router.get('/templates', requireAuth, controller.getTemplates);
router.post('/templates', requireAuth, requireRole('rotation_owner', 'administrator'), controller.createTemplate);
router.patch('/templates/:id', requireAuth, requireRole('rotation_owner', 'administrator'), controller.updateTemplate);
router.delete('/templates/:id', requireAuth, requireRole('rotation_owner', 'administrator'), controller.deleteTemplate);

// Rotation member routes
router.get('/:rotationId/members', requireAuth, controller.getRotationMembers);
router.post('/:rotationId/members', requireAuth, requireRole('rotation_owner', 'administrator'), controller.addRotationMember);
router.patch('/:rotationId/members/reorder', requireAuth, requireRole('rotation_owner', 'administrator'), controller.reorderRotationMembers);
router.delete('/:rotationId/members/:memberId', requireAuth, requireRole('rotation_owner', 'administrator'), controller.removeRotationMember);
router.patch('/:rotationId', requireAuth, requireRole('rotation_owner', 'administrator'), controller.updateRotation);

module.exports = router;