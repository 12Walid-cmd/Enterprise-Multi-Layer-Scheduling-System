const express = require('express');
const router = express.Router();
const controller = require('./teams.controller');

router.post('/', controller.createTeam);
router.get('/', controller.getTeams);
router.post('/:teamId/members', controller.addTeamMember);

module.exports = router;