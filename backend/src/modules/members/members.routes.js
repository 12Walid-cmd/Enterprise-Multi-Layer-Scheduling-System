const express = require("express");
const router = express.Router();
const controller = require("./members.controller");
const requireAuth = require("../../middleware/requireAuth");

router.get("/", requireAuth, controller.getEmployees);

module.exports = router;