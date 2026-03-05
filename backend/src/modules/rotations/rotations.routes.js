const express = require('express');
const router = express.Router();
const controller = require('./rotations.controller');

router.post('/', controller.createRotation);
router.get('/', controller.getRotations);
router.post('/:rotationId/members', controller.addRotationMember);

module.exports = router;