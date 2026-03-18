const express = require("express");
const router = express.Router();
const controller = require("./roles.controller");

router.get("/", controller.getRoles);

module.exports = router;