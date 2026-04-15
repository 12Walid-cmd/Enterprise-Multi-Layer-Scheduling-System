const express = require("express");
const router  = express.Router();
const controller = require("./schedules.controller");
const { requireRoles } = require("../../middleware/authz");
 
// GET  /api/schedules               — fetch grid data
router.get("/", controller.getSchedules);
 
// GET  /api/schedules/rotations     — list rotations for generate modal
router.get("/rotations",  controller.getRotationsForGenerate);
 
// POST /api/schedules/generate      — generate schedule
router.post("/generate", requireRoles(["Administrator"]), controller.generateSchedule);
 
// DELETE /api/schedules/:id         — delete a schedule
router.delete("/:id",     controller.deleteSchedule);
 
module.exports = router;