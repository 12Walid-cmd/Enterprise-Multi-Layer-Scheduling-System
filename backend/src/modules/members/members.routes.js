const express = require("express");
const router = express.Router();
const controller = require("./members.controller");

router.get("/", controller.getMembers);
router.post("/", controller.createMember);

router.put("/:id", controller.updateMember);
router.delete("/:id", controller.deleteMember);


module.exports = router;