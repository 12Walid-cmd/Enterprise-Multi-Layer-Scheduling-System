const express = require("express");
const router = express.Router();
const controller = require("./holidays.controller");
const { requireRoles } = require("../../middleware/authz");

router.get("/", controller.getHolidays);
router.get("/:id", controller.getHolidayById);
router.post("/", requireRoles(["Administrator"]), controller.createHoliday);
router.put("/:id", requireRoles(["Administrator"]), controller.updateHoliday);
router.delete("/:id", requireRoles(["Administrator"]), controller.deleteHoliday);

module.exports = router;