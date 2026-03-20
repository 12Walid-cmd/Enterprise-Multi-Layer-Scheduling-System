const pool = require("../../config/db");

// ===============================
// GET SCHEDULE DATA
// ===============================
exports.getSchedules = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      teamId,
      rotationType,
      search
    } = req.query;

    // Default: current month window
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
    const end   = endDate   || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0];

    // ── 1. Assignments in date window ──────────────────────────────────
    let assignmentFilters = [
      `a.assigned_start::date <= $2`,
      `a.assigned_end::date   >= $1`
    ];
    let values = [start, end];
    let idx = 3;

    if (teamId && teamId !== "All") {
      assignmentFilters.push(`rot.team_id = $${idx}::uuid`);
      values.push(teamId);
      idx++;
    }

    if (rotationType && rotationType !== "All") {
      assignmentFilters.push(`rot.rotation_type = $${idx}`);
      values.push(rotationType);
      idx++;
    }

    if (search) {
      assignmentFilters.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const assignmentsQuery = `
      SELECT
        a.id                                          AS assignment_id,
        a.assigned_start,
        a.assigned_end,
        a.assignment_status,
        a.is_override,

        u.id                                          AS user_id,
        u.first_name,
        u.last_name,
        u.email,

        rot.id                                        AS rotation_id,
        rot.name                                      AS rotation_name,
        rot.rotation_type,
        rot.cadence_type,
        rot.cadence_interval,
        rot.min_assignees,
        rot.is_active                                 AS rotation_active,

        t.id                                          AS team_id,
        t.name                                        AS team_name,

        g.id                                          AS group_id,
        g.name                                        AS group_name

      FROM ems.assignments a
      JOIN ems.users      u   ON a.user_id      = u.id
      JOIN ems.rotations  rot ON a.rotation_id  = rot.id
      LEFT JOIN ems.teams t   ON rot.team_id    = t.id
      LEFT JOIN ems.groups g  ON rot.group_id   = g.id
      WHERE ${assignmentFilters.join(" AND ")}
      ORDER BY g.name, t.name, rot.name, u.first_name
    `;

    const assignmentsResult = await pool.query(assignmentsQuery, values);

    // ── 2. Leave requests in window ────────────────────────────────────
    const leaveQuery = `
      SELECT
        lr.id,
        lr.user_id,
        lr.start_date,
        lr.end_date,
        lr.status,
        lr.leave_period,
        u.first_name,
        u.last_name
      FROM ems.leave_requests lr
      JOIN ems.users u ON lr.user_id = u.id
      WHERE lr.start_date <= $2
        AND lr.end_date   >= $1
        AND lr.status IN ('APPROVED', 'PENDING')
      ORDER BY lr.start_date
    `;
    const leaveResult = await pool.query(leaveQuery, [start, end]);

    // ── 3. Coverage gaps in window ─────────────────────────────────────
    const gapsQuery = `
      SELECT
        cg.id,
        cg.rotation_id,
        cg.gap_start,
        cg.gap_end,
        cg.is_filled,
        rot.name AS rotation_name,
        t.name   AS team_name
      FROM ems.coverage_gaps cg
      JOIN ems.rotations rot ON cg.rotation_id = rot.id
      LEFT JOIN ems.teams t  ON rot.team_id    = t.id
      WHERE cg.gap_start <= $2
        AND cg.gap_end   >= $1
        AND cg.is_filled = false
    `;
    const gapsResult = await pool.query(gapsQuery, [start, end]);

    // ── 4. Holidays in window ──────────────────────────────────────────
    const holidaysQuery = `
      SELECT
        h.id,
        h.holiday_date,
        h.name,
        h.holiday_type,
        g.name AS group_name
      FROM ems.holidays h
      LEFT JOIN ems.groups g ON h.group_id = g.id
      WHERE h.holiday_date BETWEEN $1 AND $2
      ORDER BY h.holiday_date
    `;
    const holidaysResult = await pool.query(holidaysQuery, [start, end]);

    // ── 5. Active conflicts ────────────────────────────────────────────
    const conflictsQuery = `
      SELECT
        c.id,
        c.conflict_type,
        c.severity,
        c.status,
        c.details,
        c.created_at,
        u.first_name,
        u.last_name,
        rot.name AS rotation_name,
        t.name   AS team_name
      FROM ems.conflicts c
      JOIN ems.users     u   ON c.user_id      = u.id
      JOIN ems.rotations rot ON c.rotation_id  = rot.id
      LEFT JOIN ems.teams t  ON rot.team_id    = t.id
      WHERE c.status = 'OPEN'
      ORDER BY
        CASE c.severity
          WHEN 'HIGH'   THEN 1
          WHEN 'MEDIUM' THEN 2
          WHEN 'LOW'    THEN 3
          ELSE 4
        END
    `;
    const conflictsResult = await pool.query(conflictsQuery);

    // ── 6. Stats ───────────────────────────────────────────────────────
    const statsQuery = `
      SELECT
        -- OOO this month (approved leaves)
        (
          SELECT COUNT(DISTINCT user_id)
          FROM ems.leave_requests
          WHERE status = 'APPROVED'
            AND start_date <= $2
            AND end_date   >= $1
        ) AS ooo_count,

        -- On call today (assignments covering today)
        (
          SELECT COUNT(DISTINCT a.user_id)
          FROM ems.assignments a
          WHERE a.assigned_start::date <= CURRENT_DATE
            AND a.assigned_end::date   >= CURRENT_DATE
            AND a.assignment_status = 'CONFIRMED'
        ) AS on_call_today,

        -- Coverage gaps (unfilled)
        (
          SELECT COUNT(*)
          FROM ems.coverage_gaps
          WHERE is_filled = false
            AND gap_start <= $2
            AND gap_end   >= $1
        ) AS coverage_gaps,

        -- Pending approvals
        (
          SELECT COUNT(*)
          FROM ems.leave_requests
          WHERE status = 'PENDING'
        ) AS pending_approvals,

        -- Active rotations
        (
          SELECT COUNT(*)
          FROM ems.rotations
          WHERE is_active = true
        ) AS active_rotations
    `;
    const statsResult = await pool.query(statsQuery, [start, end]);

    // ── 7. Teams for filter dropdown ───────────────────────────────────
    const teamsQuery = `
      SELECT DISTINCT t.id, t.name
      FROM ems.teams t
      JOIN ems.rotations rot ON rot.team_id = t.id
      JOIN ems.assignments a  ON a.rotation_id = rot.id
      WHERE t.is_active = true
      ORDER BY t.name
    `;
    const teamsResult = await pool.query(teamsQuery);

    // ── 8. Rotation types for filter dropdown ──────────────────────────
    const rotTypesQuery = `
      SELECT DISTINCT rotation_type
      FROM ems.rotations
      WHERE rotation_type IS NOT NULL
      ORDER BY rotation_type
    `;
    const rotTypesResult = await pool.query(rotTypesQuery);

    res.json({
      assignments:    assignmentsResult.rows,
      leaveRequests:  leaveResult.rows,
      coverageGaps:   gapsResult.rows,
      holidays:       holidaysResult.rows,
      conflicts:      conflictsResult.rows,
      stats:          statsResult.rows[0],
      teams:          teamsResult.rows,
      rotationTypes:  rotTypesResult.rows.map(r => r.rotation_type),
      window:         { start, end }
    });

  } catch (error) {
    console.error("Schedule error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};