const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");

router.get("/stats", dashboardController.getDashboardStats);
router.get("/conflicts", dashboardController.getDashboardConflicts);
router.get("/activity", dashboardController.getDashboardActivity);

module.exports = router;