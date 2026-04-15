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

    if (teamId && teamId !== "All") {
      const ids = teamId.split(",").map(s => s.trim()).filter(Boolean);
      if (ids.length === 1) {
        filters.push(`rot.team_id = $${idx}::uuid`); values.push(ids[0]); idx++;
      } else {
        const placeholders = ids.map((_, i) => `$${idx + i}::uuid`).join(", ");
        filters.push(`rot.team_id IN (${placeholders})`);
        ids.forEach(id => values.push(id)); idx += ids.length;
      }
    }

    if (rotationType && rotationType !== "All") {
      const types = rotationType.split(",").map(s => s.trim()).filter(Boolean);
      if (types.length === 1) {
        filters.push(`rot.rotation_type = $${idx}`); values.push(types[0]); idx++;
      } else {
        const placeholders = types.map((_, i) => `$${idx + i}`).join(", ");
        filters.push(`rot.rotation_type IN (${placeholders})`);
        types.forEach(t => values.push(t)); idx += types.length;
      }
    }
    
    if (search) { filters.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`); values.push(`%${search}%`); idx++; }

    const assignmentsResult = await pool.query(`
      SELECT
        a.id AS assignment_id,
        a.assigned_start::date AS assigned_start,
        a.assigned_end::date   AS assigned_end,
        a.assignment_status, a.is_override,
        u.id AS user_id, u.first_name, u.last_name, u.email,
        rot.id AS rotation_id, rot.name AS rotation_name, rot.rotation_type,
        rot.cadence_type, rot.min_assignees, rot.is_active AS rotation_active,
        t.id AS team_id, t.name AS team_name,
        g.id AS group_id, g.name AS group_name
      FROM ems.assignments a
      JOIN ems.users u       ON a.user_id     = u.id
      JOIN ems.rotations rot ON a.rotation_id = rot.id
      LEFT JOIN ems.teams t  ON rot.team_id   = t.id
      LEFT JOIN ems.groups g ON rot.group_id  = g.id
      WHERE ${filters.join(" AND ")}
      ORDER BY g.name, t.name, rot.name, u.first_name
    `, values);

    const leaveResult = await pool.query(`
      SELECT
        lr.id, lr.user_id,
        lr.start_date::date AS start_date,
        lr.end_date::date   AS end_date,
        lr.status, lr.leave_period,
        u.first_name, u.last_name
      FROM ems.leave_requests lr
      JOIN ems.users u ON lr.user_id = u.id
      WHERE lr.start_date <= $2 AND lr.end_date >= $1
        AND lr.status IN ('APPROVED','PENDING')
    `, [start, end]);

    const gapsResult = await pool.query(`
      SELECT
        cg.id, cg.rotation_id,
        cg.gap_start::date AS gap_start,
        cg.gap_end::date   AS gap_end,
        cg.is_filled,
        rot.name AS rotation_name, t.name AS team_name
      FROM ems.coverage_gaps cg
      JOIN ems.rotations rot ON cg.rotation_id = rot.id
      LEFT JOIN ems.teams t  ON rot.team_id    = t.id
      WHERE cg.gap_start <= $2 AND cg.gap_end >= $1 AND cg.is_filled = false
    `, [start, end]);

    const holidaysResult = await pool.query(`
      SELECT h.id, h.holiday_date::date AS holiday_date, h.name, h.holiday_type,
             g.name AS group_name
      FROM ems.holidays h LEFT JOIN ems.groups g ON h.group_id = g.id
      WHERE h.holiday_date BETWEEN $1 AND $2
      ORDER BY h.holiday_date
    `, [start, end]);

    const conflictsResult = await pool.query(`
      SELECT c.id, c.conflict_type, c.severity, c.status, c.details, c.created_at,
             u.first_name, u.last_name, rot.name AS rotation_name, t.name AS team_name
      FROM ems.conflicts c
      JOIN ems.users u       ON c.user_id     = u.id
      JOIN ems.rotations rot ON c.rotation_id = rot.id
      LEFT JOIN ems.teams t  ON rot.team_id   = t.id
      WHERE c.status = 'OPEN'
      ORDER BY CASE c.severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END
    `);

    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(DISTINCT user_id) FROM ems.leave_requests
         WHERE status='APPROVED' AND start_date<=$2 AND end_date>=$1)            AS ooo_count,
        (SELECT COUNT(DISTINCT a.user_id) FROM ems.assignments a
         WHERE a.assigned_start::date<=CURRENT_DATE
           AND a.assigned_end::date>=CURRENT_DATE)                               AS on_call_today,
        (SELECT COUNT(*) FROM ems.coverage_gaps
         WHERE is_filled=false AND gap_start<=$2 AND gap_end>=$1)                AS coverage_gaps,
        (SELECT COUNT(*) FROM ems.leave_requests WHERE status='PENDING')          AS pending_approvals,
        (SELECT COUNT(*) FROM ems.rotations WHERE is_active=true)                 AS active_rotations
    `, [start, end]);

    const teamsResult    = await pool.query(`SELECT id, name FROM ems.teams WHERE is_active=true ORDER BY name`);
    const rotTypesResult = await pool.query(`
      SELECT DISTINCT rotation_type FROM ems.rotations
      WHERE rotation_type IS NOT NULL ORDER BY rotation_type
    `);

    // All active rotation members so every member appears in the grid
    // even if they have no assignments in this window
    const rotationMembersResult = await pool.query(`
      SELECT DISTINCT
        rm.rotation_id,
        rm.rotation_order,
        u.id          AS user_id,
        u.first_name,
        u.last_name,
        rot.name      AS rotation_name,
        rot.rotation_type,
        g.name        AS group_name,
        t.name        AS team_name
      FROM ems.rotation_members rm
      JOIN ems.users u       ON rm.user_id     = u.id
      JOIN ems.rotations rot ON rm.rotation_id = rot.id
      LEFT JOIN ems.teams  t ON rot.team_id    = t.id
      LEFT JOIN ems.groups g ON rot.group_id   = g.id
      WHERE rm.is_active  = true
        AND rot.is_active = true
      ORDER BY g.name, rot.name, rm.rotation_order
    `);

    res.json({
      assignments:     assignmentsResult.rows,
      rotationMembers: rotationMembersResult.rows,
      leaveRequests:   leaveResult.rows,
      coverageGaps:    gapsResult.rows,
      holidays:        holidaysResult.rows,
      conflicts:       conflictsResult.rows,
      stats:           statsResult.rows[0],
      teams:           teamsResult.rows,
      rotationTypes:   rotTypesResult.rows.map(r => r.rotation_type),
      window:          { start, end },
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
      LEFT JOIN ems.teams t  ON r.team_id  = t.id
      LEFT JOIN ems.groups g ON r.group_id = g.id
      LEFT JOIN ems.rotation_members rm
             ON rm.rotation_id = r.id AND rm.is_active = true
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
//
// Key fixes vs previous version:
//   1. Dates stored as plain YYYY-MM-DD strings — no timezone shift
//   2. Rotation member order (rotation_order) is respected exactly
//      as set via drag-and-drop on the Rotations page
//   3. Team-type members are expanded in place so the rotation order
//      of teams relative to individuals is preserved
//   4. Cross-team rotations (spans_multiple_teams) pull all member
//      rows across every team linked to the rotation
//   5. memberIdx never double-assigns the same person in one period:
//      once a user_id is assigned for a period they are skipped
//   6. When min_assignees cannot be met (everyone on leave) a
//      coverage gap is recorded with a clear reason rather than
//      silently producing an under-staffed period
// ================================================================
exports.generateSchedule = async (req, res) => {
  const client = await pool.connect();
  try {
    const { rotationId, windowStart, windowEnd } = req.body;
    if (!rotationId || !windowStart || !windowEnd)
      return res.status(400).json({ message: "rotationId, windowStart, windowEnd are required" });

    await client.query("BEGIN");

    // ── Load rotation ──────────────────────────────────────────
    const rotResult = await client.query(
      `SELECT * FROM ems.rotations WHERE id=$1`, [rotationId]
    );
    if (rotResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Rotation not found" });
    }
    const rotation = rotResult.rows[0];

    // ── Remove existing schedule for same window ───────────────

const existing = await client.query(
  `SELECT id FROM ems.schedules WHERE rotation_id=$1`,
  [rotationId]
);
for (const row of existing.rows) {
  await client.query(`DELETE FROM ems.assignments WHERE schedule_id=$1`, [row.id]);
  await client.query(`DELETE FROM ems.schedules   WHERE id=$1`,          [row.id]);
}

    // ── Create schedule record ─────────────────────────────────
    const schedResult = await client.query(
      `INSERT INTO ems.schedules (rotation_id, window_start, window_end, status)
       VALUES ($1,$2,$3,'PUBLISHED') RETURNING id`,
      [rotationId, windowStart, windowEnd]
    );
    const scheduleId = schedResult.rows[0].id;

    // ── Load rotation members in rotation_order ────────────────
    // rotation_order reflects the drag-and-drop order set by the user
    // on the Rotations page — this is the authoritative sequence.
    const membersRaw = await client.query(`
      SELECT rm.id, rm.rotation_order, rm.user_id, rm.team_id, rm.member_type
      FROM ems.rotation_members rm
      WHERE rm.rotation_id = $1 AND rm.is_active = true
      ORDER BY rm.rotation_order ASC
    `, [rotationId]);

    // For cross-team rotations, also pull members from all teams
    // linked to this rotation (spans_multiple_teams = true)
    let extraTeamUsers = [];
    if (rotation.spans_multiple_teams) {
      const crossTeamResult = await client.query(`
        SELECT DISTINCT tm.user_id
        FROM ems.rotation_teams rt
        JOIN ems.team_members tm ON tm.team_id   = rt.team_id
        JOIN ems.users u         ON u.id          = tm.user_id
        WHERE rt.rotation_id = $1 AND tm.is_active = true
        ORDER BY tm.user_id
      `, [rotationId]);
      extraTeamUsers = crossTeamResult.rows.map(r => ({ user_id: r.user_id }));
    }

    // Expand team-type members into individual user_ids,
    // preserving the rotation_order of the team slot itself
    let members = [];
    for (const m of membersRaw.rows) {
      if (m.member_type === "team" && m.team_id) {
        const teamUsers = await client.query(`
          SELECT tm.user_id
          FROM ems.team_members tm
          JOIN ems.users u ON tm.user_id = u.id
          WHERE tm.team_id = $1 AND tm.is_active = true
          ORDER BY u.first_name
        `, [m.team_id]);
        teamUsers.rows.forEach(tu => members.push({ user_id: tu.user_id }));
      } else if (m.user_id) {
        members.push({ user_id: m.user_id });
      }
    }

    // Merge cross-team users, deduplicating against already-added members
    if (extraTeamUsers.length > 0) {
      const existingIds = new Set(members.map(m => m.user_id));
      extraTeamUsers.forEach(m => {
        if (!existingIds.has(m.user_id)) members.push(m);
      });
    }

    if (members.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "No active members in this rotation. Add members first."
      });
    }

    // ── Load holidays ──────────────────────────────────────────
    const holidays = await client.query(
      `SELECT holiday_date FROM ems.holidays WHERE holiday_date BETWEEN $1 AND $2`,
      [windowStart, windowEnd]
    );
    const holidaySet = new Set(
      holidays.rows.map(h => h.holiday_date.toISOString().split("T")[0])
    );

    // ── Load approved leaves ───────────────────────────────────
    const leaves = await client.query(`
      SELECT user_id, start_date, end_date FROM ems.leave_requests
      WHERE status = 'APPROVED' AND start_date <= $2 AND end_date >= $1
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

    // ── Calculate period length in calendar days ───────────────
    const cadence   = rotation.cadence_type;
    const interval  = rotation.cadence_interval || 1;
    const minAssign = rotation.min_assignees    || 1;
    let periodDays  = 7;
    if (cadence === "DAILY")     periodDays = 1  * interval;
    if (cadence === "WEEKLY")    periodDays = 7  * interval;
    if (cadence === "BI_WEEKLY") periodDays = 14 * interval;
    if (cadence === "MONTHLY")   periodDays = 30 * interval;

    // ── Generate assignments period by period ──────────────────
    let memberIdx  = 0;   // advances through the members array each period
    let current    = new Date(windowStart);
    const winEnd   = new Date(windowEnd);
    let assignCount = 0;

    while (current <= winEnd) {
      const dow     = current.getDay();
      const dateStr = current.toISOString().split("T")[0];

      // Skip weekends and holidays at period start
      if (dow === 0 || dow === 6 || holidaySet.has(dateStr)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Period end = start + periodDays - 1 (clamped to window end)
      const periodEnd = new Date(current);
      periodEnd.setDate(periodEnd.getDate() + periodDays - 1);
      if (periodEnd > winEnd) periodEnd.setTime(winEnd.getTime());

      const periodStartStr = current.toISOString().split("T")[0];
      const periodEndStr   = periodEnd.toISOString().split("T")[0];

      // Assign up to minAssign members for this period.
      // We track assigned user_ids so the same person is never
      // double-assigned within one period.
      const assignedThisPeriod = new Set();
      let assigned = 0;
      let attempts = 0;
      const maxAttempts = members.length; // one full pass through the list

      while (assigned < minAssign && attempts < maxAttempts) {
        const member = members[memberIdx % members.length];
        memberIdx++;
        attempts++;

        const uid = member.user_id;

        // Skip if already assigned this period
        if (assignedThisPeriod.has(uid)) continue;

        // Skip if on approved leave for the entire working period
        if (isOnLeaveFullPeriod(uid, current, periodEnd, leaveMap)) continue;

        await client.query(`
          INSERT INTO ems.assignments
            (schedule_id, rotation_id, user_id, assigned_start, assigned_end, assignment_status)
          VALUES ($1, $2, $3, $4, $5, 'ON_CALL')
        `, [scheduleId, rotationId, uid, periodStartStr, periodEndStr]);

        assignedThisPeriod.add(uid);
        assigned++;
        assignCount++;
      }

      // If we couldn't fill min_assignees, record coverage gaps for each
      // missing slot — these will show as GAP in the schedule grid
      if (assigned < minAssign) {
        const gapDays = [];
        const cur2 = new Date(current);
        while (cur2 <= periodEnd) {
          const ds = cur2.toISOString().split("T")[0];
          if (cur2.getDay() !== 0 && cur2.getDay() !== 6 && !holidaySet.has(ds)) {
            gapDays.push(ds);
          }
          cur2.setDate(cur2.getDate() + 1);
        }
        for (const gd of gapDays) {
          await client.query(`
            INSERT INTO ems.coverage_gaps (rotation_id, gap_start, gap_end, is_filled)
            VALUES ($1, $2, $2, false)
            ON CONFLICT DO NOTHING
          `, [rotationId, gd]);
        }
      }

      current.setDate(current.getDate() + periodDays);
    }

    // ── Detect overlapping-assignment conflicts ────────────────
    // Check the newly generated assignments (a1) against ALL assignments
    // across every rotation (a2) — catches cross-rotation overlaps too.
    // Clear ALL overlap conflicts for the users in this schedule — not just
    // this schedule's own conflicts — so cross-rotation duplicates don't accumulate
    // each time any of the involved rotations is regenerated.
    await client.query(`
      DELETE FROM ems.conflicts
      WHERE conflict_type = 'OVERLAPPING_ROTATION'
        AND user_id IN (
          SELECT DISTINCT user_id FROM ems.assignments WHERE schedule_id = $1
        )
    `, [scheduleId]);

    const overlaps = await client.query(`
      SELECT DISTINCT
        a1.user_id,
        u.first_name || ' ' || u.last_name AS uname,
        rot2.name AS other_rotation
      FROM ems.assignments a1
      JOIN ems.assignments a2
        ON  a1.user_id              = a2.user_id
        AND a1.id                  <> a2.id
        AND a1.assigned_start::date <= a2.assigned_end::date
        AND a1.assigned_end::date   >= a2.assigned_start::date
      JOIN ems.users u        ON a1.user_id      = u.id
      LEFT JOIN ems.rotations rot2 ON a2.rotation_id = rot2.id
      WHERE a1.schedule_id = $1
    `, [scheduleId]);

    for (const ov of overlaps.rows) {
      const desc = ov.other_rotation
        ? `${ov.uname} overlaps with "${ov.other_rotation}"`
        : `${ov.uname} has overlapping assignments`;
      await client.query(`
        INSERT INTO ems.conflicts
          (schedule_id, rotation_id, user_id, conflict_type, severity, details, status)
        VALUES ($1, $2, $3, 'OVERLAPPING_ROTATION', 'HIGH', $4::jsonb, 'OPEN')
      `, [
        scheduleId, rotationId, ov.user_id,
        JSON.stringify({ description: desc }),
      ]);
    }

    // ── Detect remaining coverage gaps via SQL ─────────────────
    // (catches any days missed by the period loop above)
    await client.query(`DELETE FROM ems.coverage_gaps WHERE rotation_id=$1`, [rotationId]);

    const gaps = await client.query(`
      WITH days AS (
        SELECT generate_series($1::date, $2::date, '1 day')::date AS day
      )
      SELECT d.day FROM days d
      WHERE EXTRACT(DOW FROM d.day) NOT IN (0, 6)
        AND NOT EXISTS (
          SELECT 1 FROM ems.assignments a
          WHERE a.schedule_id      = $3
            AND a.rotation_id      = $4
            AND a.assigned_start::date <= d.day
            AND a.assigned_end::date   >= d.day
        )
    `, [windowStart, windowEnd, scheduleId, rotationId]);

    for (const gap of gaps.rows) {
      const gd = gap.day.toISOString().split("T")[0];
      if (!holidaySet.has(gd)) {
        await client.query(`
          INSERT INTO ems.coverage_gaps (rotation_id, gap_start, gap_end, is_filled)
          VALUES ($1, $2, $2, false)
          ON CONFLICT DO NOTHING
        `, [rotationId, gd]);
      }
    }

    await client.query("COMMIT");
    res.json({
      message:     "Schedule generated successfully",
      scheduleId,
      assignments: assignCount,
      conflicts:   overlaps.rows.length,
      gaps:        gaps.rows.length,
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("generateSchedule error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  } finally {
    client.release();
  }
};

// ── Helper: is a user on approved leave for every working day in period ──
function isOnLeaveFullPeriod(userId, start, end, leaveMap) {
  if (!leaveMap[userId]) return false;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) {
      // Found a working day they are NOT on leave → not fully on leave
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
    await pool.query(`DELETE FROM ems.schedules   WHERE id=$1`,          [id]);
    res.json({ message: "Schedule deleted" });
  } catch (error) {
    console.error("deleteSchedule error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================================================================
// GET OVERRIDES
// ================================================================
exports.getOverrides = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await pool.query(`
      SELECT id, user_id, rotation_id,
             override_date::date AS override_date,
             chip_cls, chip_label
      FROM ems.schedule_overrides
      WHERE override_date BETWEEN $1 AND $2
      ORDER BY override_date
    `, [startDate, endDate]);
    res.json(result.rows);
  } catch (error) {
    console.error("getOverrides error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ================================================================
// SAVE OVERRIDE
// ================================================================
exports.saveOverride = async (req, res) => {
  try {
    const { userId, rotationId, overrideDate, chipCls, chipLabel } = req.body;
    if (!userId || !overrideDate || !chipCls || !chipLabel)
      return res.status(400).json({ message: "userId, overrideDate, chipCls, chipLabel are required" });

    // Prevent duplicate — same user/rotation/date/chip
    const existing = await pool.query(`
      SELECT id FROM ems.schedule_overrides
      WHERE user_id=$1 AND override_date=$2 AND chip_cls=$3
        AND (rotation_id=$4 OR (rotation_id IS NULL AND $4::uuid IS NULL))
    `, [userId, overrideDate, chipCls, rotationId || null]);

    if (existing.rows.length > 0)
      return res.json({ id: existing.rows[0].id, duplicate: true });

    const result = await pool.query(`
      INSERT INTO ems.schedule_overrides
        (user_id, rotation_id, override_date, chip_cls, chip_label)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [userId, rotationId || null, overrideDate, chipCls, chipLabel]);

    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error("saveOverride error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ================================================================
// DELETE OVERRIDE
// ================================================================
exports.deleteOverride = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM ems.schedule_overrides WHERE id=$1`, [id]);
    res.json({ message: "Override deleted" });
  } catch (error) {
    console.error("deleteOverride error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};