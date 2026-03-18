const pool = require('../../config/db');
const { auditLog } = require('../../utils/audit');

const VALID_LEVELS = ['info', 'success', 'warning', 'error'];

exports.listNotifications = async (req, res) => {
  const userId = req.user.sub;
  const userRole = req.user.role || null;
  const { limit = 20, offset = 0, unreadOnly = 'false' } = req.query;

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);
  const onlyUnread = String(unreadOnly).toLowerCase() === 'true';

  const rowsResult = await pool.query(
    `
    SELECT
      n.id,
      n.title,
      n.message,
      n.level,
      n.target_role,
      n.created_at,
      n.expires_at,
      n.created_by,
      creator.username AS created_by_username,
      creator.first_name AS created_by_first_name,
      creator.last_name AS created_by_last_name,
      r.read_at,
      (r.read_at IS NOT NULL) AS is_read
    FROM ems.notifications n
    LEFT JOIN ems.user_notification_reads r
      ON r.notification_id = n.id AND r.user_id = $1
    LEFT JOIN ems.users creator
      ON creator.id = n.created_by
    WHERE (n.expires_at IS NULL OR n.expires_at > now())
      AND (n.target_role IS NULL OR n.target_role = $2)
      AND ($3::boolean = false OR r.read_at IS NULL)
    ORDER BY n.created_at DESC
    LIMIT $4
    OFFSET $5
    `,
    [userId, userRole, onlyUnread, parsedLimit, parsedOffset]
  );

  const countResult = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM ems.notifications n
    LEFT JOIN ems.user_notification_reads r
      ON r.notification_id = n.id AND r.user_id = $1
    WHERE (n.expires_at IS NULL OR n.expires_at > now())
      AND (n.target_role IS NULL OR n.target_role = $2)
      AND ($3::boolean = false OR r.read_at IS NULL)
    `,
    [userId, userRole, onlyUnread]
  );

  const unreadCountResult = await pool.query(
    `
    SELECT COUNT(*)::int AS unread_count
    FROM ems.notifications n
    LEFT JOIN ems.user_notification_reads r
      ON r.notification_id = n.id AND r.user_id = $1
    WHERE (n.expires_at IS NULL OR n.expires_at > now())
      AND (n.target_role IS NULL OR n.target_role = $2)
      AND r.read_at IS NULL
    `,
    [userId, userRole]
  );

  res.json({
    notifications: rowsResult.rows,
    total: countResult.rows[0].total,
    unreadCount: unreadCountResult.rows[0].unread_count,
    limit: parsedLimit,
    offset: parsedOffset,
  });
};

exports.markAsRead = async (req, res) => {
  const userId = req.user.sub;
  const { notificationId } = req.params;

  const exists = await pool.query(
    `
    SELECT n.id
    FROM ems.notifications n
    WHERE n.id = $1
      AND (n.expires_at IS NULL OR n.expires_at > now())
      AND (n.target_role IS NULL OR n.target_role = $2)
    `,
    [notificationId, req.user.role || null]
  );

  if (exists.rows.length === 0) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  await pool.query(
    `
    INSERT INTO ems.user_notification_reads (user_id, notification_id, read_at)
    VALUES ($1, $2, now())
    ON CONFLICT (user_id, notification_id)
    DO UPDATE SET read_at = EXCLUDED.read_at
    `,
    [userId, notificationId]
  );

  return res.json({ message: 'Notification marked as read' });
};

exports.markAllAsRead = async (req, res) => {
  const userId = req.user.sub;
  const userRole = req.user.role || null;

  const result = await pool.query(
    `
    INSERT INTO ems.user_notification_reads (user_id, notification_id, read_at)
    SELECT $1, n.id, now()
    FROM ems.notifications n
    LEFT JOIN ems.user_notification_reads r
      ON r.notification_id = n.id AND r.user_id = $1
    WHERE (n.expires_at IS NULL OR n.expires_at > now())
      AND (n.target_role IS NULL OR n.target_role = $2)
      AND r.read_at IS NULL
    ON CONFLICT (user_id, notification_id)
    DO UPDATE SET read_at = EXCLUDED.read_at
    RETURNING notification_id
    `,
    [userId, userRole]
  );

  return res.json({
    message: 'Notifications marked as read',
    markedCount: result.rows.length,
  });
};

exports.broadcastNotification = async (req, res) => {
  const { title, message, level = 'info', targetRole = null, expiresAt = null } = req.body;

  if (!title || !String(title).trim() || !message || !String(message).trim()) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({
      message: `Invalid level. Must be one of: ${VALID_LEVELS.join(', ')}`,
    });
  }

  const result = await pool.query(
    `
    INSERT INTO ems.notifications (title, message, level, target_role, created_by, expires_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, title, message, level, target_role, created_by, created_at, expires_at
    `,
    [
      String(title).trim(),
      String(message).trim(),
      level,
      targetRole || null,
      req.user.sub,
      expiresAt || null,
    ]
  );

  await auditLog({
    actorId: req.user.sub,
    action: 'NOTIFICATION_BROADCAST_CREATED',
    entityType: 'notification',
    entityId: result.rows[0].id,
    afterState: {
      title: result.rows[0].title,
      level: result.rows[0].level,
      targetRole: result.rows[0].target_role,
      expiresAt: result.rows[0].expires_at,
    },
  });

  return res.status(201).json({
    message: 'Notification created',
    notification: result.rows[0],
  });
};
