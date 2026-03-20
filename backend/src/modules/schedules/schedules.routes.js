const express = require("express");
const router  = express.Router();
const controller = require("./schedules.controller");
 
// GET /api/schedules
router.get("/", controller.getSchedules);
 
module.exports = router;