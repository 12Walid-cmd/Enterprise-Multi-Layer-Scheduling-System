const express = require('express');
const router = express.Router();
const controller = require('./notifications.controller');
const requireAuth = require('../../middleware/requireAuth');
const requireRole = require('../../middleware/requireRole');
const asyncHandler = require('../../utils/asyncHandler');

router.get('/', requireAuth, asyncHandler(controller.listNotifications));
router.post('/:notificationId/read', requireAuth, asyncHandler(controller.markAsRead));
router.post('/read-all', requireAuth, asyncHandler(controller.markAllAsRead));

// Admin can publish notifications to all users or a role segment.
router.post(
  '/broadcast',
  requireAuth,
  requireRole('administrator'),
  asyncHandler(controller.broadcastNotification)
);

module.exports = router;
