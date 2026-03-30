const express = require('express');
const router = express.Router();
const controller = require('./teams.controller');

router.post('/', controller.createTeam);
router.get('/', controller.getTeams);
router.post('/:teamId/members', controller.addTeamMember);
router.get('/:id/members', controller.getTeamMembers);
router.put("/:id/parent", controller.reassignParentTeam);
router.put("/:id/status", controller.updateTeamStatus);


module.exports = router;