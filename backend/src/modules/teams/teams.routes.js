const express = require('express');
const router = express.Router();
const controller = require('./teams.controller');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');

router.get('/', requireAuth, controller.getTeams);
router.post('/', requireAuth, requireRole('team_lead', 'rotation_owner', 'administrator'), controller.createTeam);
router.post('/:teamId/members', requireAuth, requireRole('team_lead', 'rotation_owner', 'administrator'), controller.addTeamMember);

module.exports = router;