const express = require("express");
const router = express.Router();
const controller = require("./holidays.controller");

router.get("/", controller.getHolidays);
router.get("/:id", controller.getHolidayById);
router.post("/", controller.createHoliday);
router.put("/:id", controller.updateHoliday);
router.delete("/:id", controller.deleteHoliday);

module.exports = router;