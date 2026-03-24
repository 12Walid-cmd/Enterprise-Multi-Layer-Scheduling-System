const express = require("express");
const router = express.Router();
const controller = require("./members.controller");
const requireAuth = require("../../middleware/requireAuth");
const requireRole = require("../../middleware/requireRole");

const MEMBERS_ALLOWED_ROLES = ["administrator", "rotation_owner", "team_lead"];

router.get("/", requireAuth, requireRole(...MEMBERS_ALLOWED_ROLES), controller.getMembers);
router.post("/", requireAuth, requireRole("administrator"), controller.createMember);
router.put("/:id", requireAuth, requireRole("administrator"), controller.updateMember);
router.delete("/:id", requireAuth, requireRole("administrator"), controller.deleteMember);

module.exports = router;