const pool = require("../../config/db");

// ================================================================
// GET SCHEDULES
// ================================================================
exports.getSchedules = async (req, res) => {
  try {
    const { startDate, endDate, teamId, rotationType, search } = req.query;
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
    const end   = endDate   || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0];

    let filters = [`a.assigned_start::date <= $2`, `a.assigned_end::date >= $1`];
    let values  = [start, end];
    let idx     = 3;

    if (teamId && teamId !== "All") { filters.push(`rot.team_id = $${idx}::uuid`); values.push(teamId); idx++; }
    if (rotationType && rotationType !== "All") { filters.push(`rot.rotation_type = $${idx}`); values.push(rotationType); idx++; }
    if (search) { filters.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`); values.push(`%${search}%`); idx++; }

    const assignmentsResult = await pool.query(`
      SELECT a.id AS assignment_id, a.assigned_start, a.assigned_end, a.assignment_status, a.is_override,
             u.id AS user_id, u.first_name, u.last_name, u.email,
             rot.id AS rotation_id, rot.name AS rotation_name, rot.rotation_type,
             rot.cadence_type, rot.min_assignees, rot.is_active AS rotation_active,
             t.id AS team_id, t.name AS team_name,
             g.id AS group_id, g.name AS group_name
      FROM ems.assignments a
      JOIN ems.users u ON a.user_id = u.id
      JOIN ems.rotations rot ON a.rotation_id = rot.id
      LEFT JOIN ems.teams t ON rot.team_id = t.id
      LEFT JOIN ems.groups g ON rot.group_id = g.id
      WHERE ${filters.join(" AND ")}
      ORDER BY g.name, t.name, rot.name, u.first_name
    `, values);

    const leaveResult = await pool.query(`
      SELECT lr.id, lr.user_id, lr.start_date, lr.end_date, lr.status, lr.leave_period,
             u.first_name, u.last_name
      FROM ems.leave_requests lr
      JOIN ems.users u ON lr.user_id = u.id
      WHERE lr.start_date <= $2 AND lr.end_date >= $1 AND lr.status IN ('APPROVED','PENDING')
    `, [start, end]);

    const gapsResult = await pool.query(`
      SELECT cg.id, cg.rotation_id, cg.gap_start, cg.gap_end, cg.is_filled,
             rot.name AS rotation_name, t.name AS team_name
      FROM ems.coverage_gaps cg
      JOIN ems.rotations rot ON cg.rotation_id = rot.id
      LEFT JOIN ems.teams t ON rot.team_id = t.id
      WHERE cg.gap_start <= $2 AND cg.gap_end >= $1 AND cg.is_filled = false
    `, [start, end]);

    const holidaysResult = await pool.query(`
      SELECT h.id, h.holiday_date, h.name, h.holiday_type, g.name AS group_name
      FROM ems.holidays h LEFT JOIN ems.groups g ON h.group_id = g.id
      WHERE h.holiday_date BETWEEN $1 AND $2 ORDER BY h.holiday_date
    `, [start, end]);

    const conflictsResult = await pool.query(`
      SELECT c.id, c.conflict_type, c.severity, c.status, c.details, c.created_at,
             u.first_name, u.last_name, rot.name AS rotation_name, t.name AS team_name
      FROM ems.conflicts c
      JOIN ems.users u ON c.user_id = u.id
      JOIN ems.rotations rot ON c.rotation_id = rot.id
      LEFT JOIN ems.teams t ON rot.team_id = t.id
      WHERE c.status = 'OPEN'
      ORDER BY CASE c.severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END
    `);

    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(DISTINCT user_id) FROM ems.leave_requests
         WHERE status='APPROVED' AND start_date<=$2 AND end_date>=$1) AS ooo_count,
        (SELECT COUNT(DISTINCT a.user_id) FROM ems.assignments a
         WHERE a.assigned_start::date<=CURRENT_DATE AND a.assigned_end::date>=CURRENT_DATE) AS on_call_today,
        (SELECT COUNT(*) FROM ems.coverage_gaps
         WHERE is_filled=false AND gap_start<=$2 AND gap_end>=$1) AS coverage_gaps,
        (SELECT COUNT(*) FROM ems.leave_requests WHERE status='PENDING') AS pending_approvals,
        (SELECT COUNT(*) FROM ems.rotations WHERE is_active=true) AS active_rotations
    `, [start, end]);

    const teamsResult    = await pool.query(`SELECT id, name FROM ems.teams WHERE is_active=true ORDER BY name`);
    const rotTypesResult = await pool.query(`SELECT DISTINCT rotation_type FROM ems.rotations WHERE rotation_type IS NOT NULL ORDER BY rotation_type`);

    res.json({
      assignments:   assignmentsResult.rows,
      leaveRequests: leaveResult.rows,
      coverageGaps:  gapsResult.rows,
      holidays:      holidaysResult.rows,
      conflicts:     conflictsResult.rows,
      stats:         statsResult.rows[0],
      teams:         teamsResult.rows,
      rotationTypes: rotTypesResult.rows.map(r => r.rotation_type),
      window:        { start, end }
    });
  } catch (error) {
    console.error("getSchedules error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ================================================================
// GET ROTATIONS FOR GENERATE MODAL
// ================================================================
exports.getRotationsForGenerate = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.name, r.rotation_type, r.cadence_type, r.cadence_interval,
             r.min_assignees, r.is_active, r.spans_multiple_teams,
             t.name AS team_name, g.name AS group_name,
             COUNT(DISTINCT rm.id) AS member_count
      FROM ems.rotations r
      LEFT JOIN ems.teams t ON r.team_id = t.id
      LEFT JOIN ems.groups g ON r.group_id = g.id
      LEFT JOIN ems.rotation_members rm ON rm.rotation_id = r.id AND rm.is_active = true
      WHERE r.is_active = true
      GROUP BY r.id, t.name, g.name
      ORDER BY g.name, t.name, r.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("getRotationsForGenerate error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================================================================
// GENERATE SCHEDULE
// ================================================================
exports.generateSchedule = async (req, res) => {
  const client = await pool.connect();
  try {
    const { rotationId, windowStart, windowEnd } = req.body;
    if (!rotationId || !windowStart || !windowEnd)
      return res.status(400).json({ message: "rotationId, windowStart, windowEnd are required" });

    await client.query("BEGIN");

    // Load rotation
    const rotResult = await client.query(`SELECT * FROM ems.rotations WHERE id=$1`, [rotationId]);
    if (rotResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Rotation not found" });
    }
    const rotation = rotResult.rows[0];

    // Remove existing schedule for same window
    const existing = await client.query(
      `SELECT id FROM ems.schedules WHERE rotation_id=$1 AND window_start=$2 AND window_end=$3`,
      [rotationId, windowStart, windowEnd]
    );
    if (existing.rows.length > 0) {
      await client.query(`DELETE FROM ems.assignments WHERE schedule_id=$1`, [existing.rows[0].id]);
      await client.query(`DELETE FROM ems.schedules WHERE id=$1`,           [existing.rows[0].id]);
    }

    // Create schedule
    const schedResult = await client.query(
      `INSERT INTO ems.schedules (rotation_id, window_start, window_end, status)
       VALUES ($1,$2,$3,'PUBLISHED') RETURNING id`,
      [rotationId, windowStart, windowEnd]
    );
    const scheduleId = schedResult.rows[0].id;

    // Load rotation members — expand teams into individuals
    const membersRaw = await client.query(`
      SELECT rm.rotation_order, rm.user_id, rm.team_id, rm.member_type
      FROM ems.rotation_members rm
      WHERE rm.rotation_id=$1 AND rm.is_active=true
      ORDER BY rm.rotation_order
    `, [rotationId]);

    let members = [];
    for (const m of membersRaw.rows) {
      if (m.member_type === "team" && m.team_id) {
        const teamUsers = await client.query(`
          SELECT tm.user_id FROM ems.team_members tm
          JOIN ems.users u ON tm.user_id = u.id
          WHERE tm.team_id=$1 AND tm.is_active=true ORDER BY u.first_name
        `, [m.team_id]);
        teamUsers.rows.forEach(tu => members.push({ user_id: tu.user_id }));
      } else if (m.user_id) {
        members.push({ user_id: m.user_id });
      }
    }

    if (members.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "No active members in this rotation. Add members first." });
    }

    // Load holidays
    const holidays = await client.query(
      `SELECT holiday_date FROM ems.holidays WHERE holiday_date BETWEEN $1 AND $2`,
      [windowStart, windowEnd]
    );
    const holidaySet = new Set(holidays.rows.map(h => h.holiday_date.toISOString().split("T")[0]));

    // Load approved leaves
    const leaves = await client.query(`
      SELECT user_id, start_date, end_date FROM ems.leave_requests
      WHERE status='APPROVED' AND start_date<=$2 AND end_date>=$1
    `, [windowStart, windowEnd]);
    const leaveMap = {};
    leaves.rows.forEach(lr => {
      if (!leaveMap[lr.user_id]) leaveMap[lr.user_id] = new Set();
      const cur = new Date(lr.start_date);
      while (cur <= new Date(lr.end_date)) {
        leaveMap[lr.user_id].add(cur.toISOString().split("T")[0]);
        cur.setDate(cur.getDate() + 1);
      }
    });

    // Calculate period length
    const cadence   = rotation.cadence_type;
    const interval  = rotation.cadence_interval || 1;
    const minAssign = rotation.min_assignees || 1;
    let periodDays  = 7;
    if (cadence === "DAILY")     periodDays = 1  * interval;
    if (cadence === "WEEKLY")    periodDays = 7  * interval;
    if (cadence === "BI_WEEKLY") periodDays = 14 * interval;
    if (cadence === "MONTHLY")   periodDays = 30 * interval;

    // Generate assignments
    let memberIdx = 0;
    let current   = new Date(windowStart);
    const winEnd  = new Date(windowEnd);
    let assignCount = 0;

    while (current <= winEnd) {
      const dow     = current.getDay();
      const dateStr = current.toISOString().split("T")[0];

      if (dow === 0 || dow === 6 || holidaySet.has(dateStr)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Period end
      const periodEnd = new Date(current);
      periodEnd.setDate(periodEnd.getDate() + periodDays - 1);
      if (periodEnd > winEnd) periodEnd.setTime(winEnd.getTime());

      // Assign members for this period
      let assigned = 0;
      let attempts = 0;
      while (assigned < minAssign && attempts < members.length * 3) {
        const member = members[memberIdx % members.length];
        memberIdx++;
        attempts++;
        const uid = member.user_id;
        if (!isOnLeaveFullPeriod(uid, current, periodEnd, leaveMap)) {
          await client.query(`
            INSERT INTO ems.assignments
              (schedule_id, rotation_id, user_id, assigned_start, assigned_end, assignment_status)
            VALUES ($1,$2,$3,$4,$5,'ON_CALL')
          `, [scheduleId, rotationId, uid,
              new Date(current).toISOString(),
              new Date(periodEnd).toISOString()]);
          assigned++;
          assignCount++;
        }
      }

      current.setDate(current.getDate() + periodDays);
    }

    // Detect conflicts: overlapping assignments for same user
    await client.query(`DELETE FROM ems.conflicts WHERE schedule_id=$1`, [scheduleId]);
    const overlaps = await client.query(`
      SELECT DISTINCT a1.user_id, u.first_name||' '||u.last_name AS uname
      FROM ems.assignments a1
      JOIN ems.assignments a2 ON a1.user_id=a2.user_id AND a1.id<>a2.id
        AND a1.assigned_start < a2.assigned_end AND a1.assigned_end > a2.assigned_start
      JOIN ems.users u ON a1.user_id=u.id
      WHERE a1.schedule_id=$1
    `, [scheduleId]);

    for (const ov of overlaps.rows) {
      await client.query(`
        INSERT INTO ems.conflicts (schedule_id, rotation_id, user_id, conflict_type, severity, details, status)
        VALUES ($1,$2,$3,'OVERLAPPING_ROTATION','HIGH',$4::jsonb,'OPEN')
      `, [scheduleId, rotationId, ov.user_id,
          JSON.stringify({ description: `${ov.uname} has overlapping assignments` })]);
    }

    // Detect coverage gaps
    await client.query(`DELETE FROM ems.coverage_gaps WHERE rotation_id=$1`, [rotationId]);
    const gaps = await client.query(`
      WITH days AS (
        SELECT generate_series($1::date, $2::date, '1 day')::date AS day
      )
      SELECT d.day FROM days d
      WHERE EXTRACT(DOW FROM d.day) NOT IN (0,6)
        AND NOT EXISTS (
          SELECT 1 FROM ems.assignments a
          WHERE a.schedule_id=$3
            AND a.rotation_id=$4
            AND a.assigned_start::date<=d.day
            AND a.assigned_end::date>=d.day
        )
    `, [windowStart, windowEnd, scheduleId, rotationId]);

    for (const gap of gaps.rows) {
      const gd = gap.day.toISOString().split("T")[0];
      if (!holidaySet.has(gd)) {
        await client.query(
          `INSERT INTO ems.coverage_gaps (rotation_id, gap_start, gap_end, is_filled)
           VALUES ($1,$2,$2,false) ON CONFLICT DO NOTHING`,
          [rotationId, gd]
        );
      }
    }

    await client.query("COMMIT");
    res.json({
      message:     "Schedule generated successfully",
      scheduleId,
      assignments: assignCount,
      conflicts:   overlaps.rows.length,
      gaps:        gaps.rows.length
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("generateSchedule error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  } finally {
    client.release();
  }
};

// Helper
function isOnLeaveFullPeriod(userId, start, end, leaveMap) {
  if (!leaveMap[userId]) return false;
  const cur = new Date(start);
  while (cur <= end) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) {
      if (!leaveMap[userId].has(cur.toISOString().split("T")[0])) return false;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return true;
}

// ================================================================
// DELETE SCHEDULE
// ================================================================
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM ems.assignments WHERE schedule_id=$1`, [id]);
    await pool.query(`DELETE FROM ems.schedules WHERE id=$1`, [id]);
    res.json({ message: "Schedule deleted" });
  } catch (error) {
    console.error("deleteSchedule error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};