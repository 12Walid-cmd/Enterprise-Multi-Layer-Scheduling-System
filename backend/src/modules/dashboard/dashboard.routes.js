const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");
const requireAuth = require("../../middleware/requireAuth");

router.get("/stats", requireAuth, dashboardController.getDashboardStats);

module.exports = router;