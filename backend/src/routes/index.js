const express = require('express');
const router = express.Router();

// Register all module routes here
router.use('/groups', require('../modules/groups/groups.routes'));
router.use('/teams', require('../modules/teams/teams.routes'));
router.use('/rotations', require('../modules/rotations/rotations.routes'));
router.use('/holidays', require('../modules/holidays/holidays.routes'));
router.use('/users', require('../modules/users/users.routes'));
router.use('/dashboard', require('../modules/dashboard/dashboard.routes'));

module.exports = router;