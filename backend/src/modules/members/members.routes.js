const express = require("express");
const router = express.Router();
const controller = require("./members.controller");

router.get("/", controller.getEmployees);

module.exports = router;