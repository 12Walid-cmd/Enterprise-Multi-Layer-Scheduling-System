const express = require("express");
const router = express.Router();
const controller = require("./location.controller");

router.get("/countries", controller.getCountries);
router.get("/provinces/:countryId", controller.getProvinces);
router.get("/cities/:provinceId", controller.getCities);

module.exports = router; 