import React, { useState, useEffect, useCallback } from "react";
import api from "../api/api";
import "../styles/schedules.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDatesInRange(startStr, endStr) {
  const dates = [];
  const cur = new Date(startStr);
  const end = new Date(endStr);
  while (cur <= end) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function isWeekend(dateStr) {
  const d = new Date(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}

function dayLabel(dateStr)      { return new Date(dateStr).getDate(); }
function monthYearLabel(dateStr){ const d = new Date(dateStr); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
function todayStr()             { return new Date().toISOString().split("T")[0]; }
function getInitials(f, l)      { return `${f?.[0]||""}${l?.[0]||""}`.toUpperCase(); }
function dateInRange(d, s, e)   { return d >= s.split("T")[0] && d <= e.split("T")[0]; }

function getChipForAssignment(a) {
  const type = (a.rotation_type || "").toUpperCase().replace(/-/g,"_");
  if (type === "ON_CALL")                      return { cls:"cit",  label:"IT" };
  if (type === "MOUNTAIN" || type === "MOUNTAIN_SHIFT") return { cls:"cmt",  label:"MT" };
  if (type === "ESCALATION")                   return { cls:"ces",  label:"ES" };
  if (type === "STEWARDS" || type === "CDO_STEWARDS")  return { cls:"ccd",  label:"CD" };
  if (type === "SERVICE_DESK")                 return { cls:"csd",  label:"SD" };
  const name = a.rotation_name || "RO";
  return { cls:"cit", label: name.substring(0,2).toUpperCase() };
}

function getChipForLeave(lr) {
  if (lr.status === "PENDING")         return { cls:"cpv", label:"PV" };
  if (lr.leave_period === "MORNING")   return { cls:"cmt2",label:"mt" };
  return { cls:"cv", label:"V" };
}

function Chip({ cls, label, title }) {
  return <div className={`sch-chip ${cls}`} title={title}>{label}</div>;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Schedules() {

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [currentDate, setCurrentDate] = useState({
    month: new Date().getMonth(),
    year:  new Date().getFullYear()
  });
  const [view, setView]             = useState("Month");
  const [search, setSearch]         = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showFilter, setShowFilter] = useState("All assignments");

  // Helper — get Monday of a given date
const getMondayOf = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day; // go back to Monday
  d.setDate(d.getDate() + diff);
  return d;
};

const getWindow = useCallback(() => {
  const monday = getMondayOf(new Date(currentDate.year, currentDate.month, new Date().getDate()));

  if (view === "Week") {
    const start = new Date(monday);
    const end   = new Date(monday);
    end.setDate(end.getDate() + 6); // Mon–Sun
    return {
      start: start.toISOString().split("T")[0],
      end:   end.toISOString().split("T")[0]
    };
  }

  if (view === "2-Week") {
    const start = new Date(monday);
    const end   = new Date(monday);
    end.setDate(end.getDate() + 13); // 2 full weeks Mon–Sun
    return {
      start: start.toISOString().split("T")[0],
      end:   end.toISOString().split("T")[0]
    };
  }

  // Month — start from Monday of first week of month
  const firstOfMonth = new Date(currentDate.year, currentDate.month, 1);
  const start = getMondayOf(firstOfMonth);
  const end   = new Date(currentDate.year, currentDate.month + 1, 0); // last day of month
  return {
    start: start.toISOString().split("T")[0],
    end:   end.toISOString().split("T")[0]
  };

}, [currentDate, view]);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = getWindow();
      const res = await api.get("/schedules", {
        params: {
          startDate:    start,
          endDate:      end,
          search:       search    || undefined,
          teamId:       teamFilter !== "All" ? teamFilter : undefined,
          rotationType: typeFilter !== "All" ? typeFilter : undefined,
        }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load schedule data.");
    } finally {
      setLoading(false);
    }
  }, [getWindow, search, teamFilter, typeFilter]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const prevPeriod = () => {
    if (view === "Month") {
      setCurrentDate(p =>
        p.month === 0 ? { month: 11, year: p.year - 1 } : { month: p.month - 1, year: p.year }
      );
    } else {
      // Go back 1 week (7 days) from current monday
      const monday = getMondayOf(new Date(currentDate.year, currentDate.month, new Date().getDate()));
      monday.setDate(monday.getDate() - 7);
      setCurrentDate({ month: monday.getMonth(), year: monday.getFullYear() });
    }
  };

  const nextPeriod = () => {
    if (view === "Month") {
      setCurrentDate(p =>
        p.month === 11 ? { month: 0, year: p.year + 1 } : { month: p.month + 1, year: p.year }
      );
    } else {
      const monday = getMondayOf(new Date(currentDate.year, currentDate.month, new Date().getDate()));
      monday.setDate(monday.getDate() + 7);
      setCurrentDate({ month: monday.getMonth(), year: monday.getFullYear() });
    }
  };

  // ── Date columns ──────────────────────────────────────────────────────────
  const { start: winStart, end: winEnd } = getWindow();
  const allDates  = getDatesInRange(winStart, winEnd);
  const today     = todayStr();

  // Maps
  const holidayMap = {};
  (data?.holidays || []).forEach(h => { holidayMap[h.holiday_date] = h; });

  const gapMap = {};
  (data?.coverageGaps || []).forEach(g => {
    getDatesInRange(g.gap_start, g.gap_end).forEach(d => {
      if (!gapMap[d]) gapMap[d] = [];
      gapMap[d].push(g.rotation_id);
    });
  });

  const leaveByUser = {};
  (data?.leaveRequests || []).forEach(lr => {
    if (!leaveByUser[lr.user_id]) leaveByUser[lr.user_id] = [];
    leaveByUser[lr.user_id].push(lr);
  });

  // OOO totals per date
  const oooPerDate = {};
  allDates.forEach(d => { oooPerDate[d] = 0; });
  (data?.leaveRequests || []).filter(lr => lr.status === "APPROVED").forEach(lr => {
    getDatesInRange(lr.start_date, lr.end_date).forEach(d => {
      if (oooPerDate[d] !== undefined) oooPerDate[d]++;
    });
  });

  // ── Group assignments: group -> rotation -> user ──────────────────────────
  const grouped = {};
  (data?.assignments || []).forEach(a => {
    const grp  = a.group_name || "Ungrouped";
    const rot  = a.rotation_name || "Unknown Rotation";
    const uid  = a.user_id;
    if (!grouped[grp])           grouped[grp] = {};
    if (!grouped[grp][rot])      grouped[grp][rot] = {};
    if (!grouped[grp][rot][uid]) {
      grouped[grp][rot][uid] = {
        userId:       uid,
        firstName:    a.first_name,
        lastName:     a.last_name,
        rotationType: a.rotation_type,
        assignments:  []
      };
    }
    grouped[grp][rot][uid].assignments.push(a);
  });

  // Month spans
  const monthSpans = allDates.reduce((acc, d) => {
    const lbl  = monthYearLabel(d);
    const last = acc[acc.length - 1];
    if (last && last.month === lbl) { last.count++; }
    else acc.push({ month: lbl, count: 1, border: acc.length > 0 });
    return acc;
  }, []);

  // Row filter
  const filterRow = (userRow) => {
    if (showFilter === "Vacations only")
      return (leaveByUser[userRow.userId] || []).length > 0;
    if (showFilter === "On-call only") {
      const t = (userRow.rotationType || "").toUpperCase().replace(/-/g,"_");
      return t === "ON_CALL";
    }
    return true;
  };

  const renderCell = (userRow, dateStr) => {
    const chips = [];
    userRow.assignments.forEach(a => {
      if (dateInRange(dateStr, a.assigned_start, a.assigned_end)) {
        const { cls, label } = getChipForAssignment(a);
        chips.push(<Chip key={a.assignment_id} cls={cls} label={label} title={a.rotation_name} />);
      }
    });
    (leaveByUser[userRow.userId] || []).forEach(lr => {
      if (dateStr >= lr.start_date && dateStr <= lr.end_date) {
        const { cls, label } = getChipForLeave(lr);
        chips.push(<Chip key={lr.id} cls={cls} label={label} title={lr.status === "PENDING" ? "Pending vacation" : "Vacation"} />);
      }
    });
    return chips;
  };

  const stats = data?.stats || {};

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="schedules-container">
      <div className="sch-loading">
        <div className="sch-spinner" />
        <span>Loading schedules...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="schedules-container">
      <div className="sch-error">
        {error}
        <button onClick={fetchSchedules}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="schedules-container">

      {/* ── Header ── */}
      <div className="sch-page-header">
        <div>
          <div className="sch-page-title">Schedules</div>
          <div className="sch-page-sub">Enterprise rotation schedule — live view</div>
        </div>
        <div className="sch-header-btns">
          <button className="sch-btn-outline">↓ Export CSV</button>
          <button className="sch-btn-white" onClick={fetchSchedules}>↻ Refresh</button>
          <button className="sch-btn-white">+ Add Assignment</button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="sch-stats-row">
        <div className="sch-stat-card">
          <div className="sch-stat-lbl">Out of office ({MONTHS[currentDate.month].substring(0,3)})</div>
          <div className="sch-stat-val">{stats.ooo_count || 0}</div>
          <div className="sch-stat-sub">Approved leaves</div>
        </div>
        <div className="sch-stat-card">
          <div className="sch-stat-lbl">On call today</div>
          <div className="sch-stat-val">{stats.on_call_today || 0}</div>
          <div className="sch-stat-sub">Active assignments</div>
        </div>
        <div className="sch-stat-card">
          <div className="sch-stat-lbl">Coverage gaps</div>
          <div className={`sch-stat-val${parseInt(stats.coverage_gaps) > 0 ? " danger" : ""}`}>
            {stats.coverage_gaps || 0}
          </div>
          <div className={`sch-stat-sub${parseInt(stats.coverage_gaps) > 0 ? " warn" : ""}`}>
            {parseInt(stats.coverage_gaps) > 0 ? "Needs attention" : "All covered"}
          </div>
        </div>
        <div className="sch-stat-card">
          <div className="sch-stat-lbl">Pending approvals</div>
          <div className="sch-stat-val">{stats.pending_approvals || 0}</div>
          <div className="sch-stat-sub">Vacation requests</div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="sch-controls-card">
        <div className="sch-ctrl" style={{ flex: 2 }}>
          <label>Search member</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="sch-ctrl">
          <label>Team</label>
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
            <option value="All">All Teams</option>
            {(data?.teams || []).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="sch-ctrl">
          <label>Rotation type</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            {(data?.rotationTypes || []).map(rt => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>
        </div>
        <div className="sch-ctrl">
          <label>Show</label>
          <select value={showFilter} onChange={e => setShowFilter(e.target.value)}>
            <option>All assignments</option>
            <option>Vacations only</option>
            <option>On-call only</option>
          </select>
        </div>
        <div className="sch-nav-grp">
          <button className="sch-nav-b" onClick={prevPeriod}>←</button>
          <span className="sch-month-lbl">{MONTHS[currentDate.month]} {currentDate.year}</span>
          <button className="sch-nav-b" onClick={nextPeriod}>→</button>
        </div>
        <div className="sch-view-tog">
          {["Month","2-Week","Week"].map(v => (
            <button key={v} className={`sch-vt${view === v ? " on" : ""}`} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="sch-body-row">

        {/* Grid */}
        <div className="sch-grid-card">
          <div className="sch-grid-scroll">
            <table className="sch-table">
              <thead>
                <tr>
                  <th className="sch-th-rot" rowSpan={2}>Team / Rotation</th>
                  <th className="sch-th-nm"  rowSpan={2}>Member</th>
                  {monthSpans.map((ms, i) => (
                    <th key={i} className={`sch-th-mo${ms.border?" b":""}`} colSpan={ms.count}>{ms.month}</th>
                  ))}
                </tr>
                <tr>
                  {allDates.map((d, i) => {
                    const hol = holidayMap[d];
                    return (
                      <th key={i} title={hol ? hol.name : ""}
                        className={["sch-th-d",
                          isWeekend(d)?"wk":"",
                          d===today?"td":"",
                          hol?.holiday_type==="CANADIAN"?"hca":"",
                          hol?.holiday_type==="US"?"hus":"",
                        ].filter(Boolean).join(" ")}
                      >{dayLabel(d)}</th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {Object.keys(grouped).length === 0
                  ? <tr><td colSpan={allDates.length+2} className="sch-empty">No schedule data found for this period.</td></tr>
                  : Object.entries(grouped).map(([groupName, rotations]) => (
                    <React.Fragment key={groupName}>
                      <tr className="sch-gr"><td colSpan={allDates.length+2}>{groupName}</td></tr>
                      {Object.entries(rotations).map(([rotName, users]) =>
                        Object.values(users).filter(filterRow).map((userRow, ri) => (
                          <tr key={`${userRow.userId}-${rotName}`} className="sch-data-row">
                            <td className="sch-rc">{ri === 0 ? rotName : ""}</td>
                            <td className="sch-nc">
                              <div className="sch-nw">
                                <div className="sch-av">{getInitials(userRow.firstName, userRow.lastName)}</div>
                                <span className="sch-nt">{userRow.firstName} {userRow.lastName}</span>
                              </div>
                            </td>
                            {allDates.map((d, ci) => {
                              const hol    = holidayMap[d];
                              const isGap  = gapMap[d]?.includes(userRow.assignments[0]?.rotation_id);
                              const chips  = renderCell(userRow, d);
                              return (
                                <td key={ci} className={["sch-dc",
                                  isWeekend(d)?"wk":"",
                                  hol?.holiday_type==="CANADIAN"?"hca":"",
                                  hol?.holiday_type==="US"?"hus":"",
                                  isGap?"gap-cell":"",
                                ].filter(Boolean).join(" ")}>
                                  {isGap && chips.length === 0
                                    ? <span className="sch-badge-gap">GAP</span>
                                    : chips
                                  }
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </React.Fragment>
                  ))
                }

                {/* Totals row */}
                <tr className="sch-tot">
                  <td className="sch-tl" colSpan={2}>Total out of office / day</td>
                  {allDates.map((d, i) => (
                    <td key={i} className={oooPerDate[d] >= 4 ? "hi" : ""}>{oooPerDate[d] || 0}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sch-side">

          <div className="sch-sc">
            <div className="sch-sc-title">Legend</div>
            {[
              {cls:"cv",   l:"V",  text:"Vacation"},
              {cls:"cpv",  l:"PV", text:"Pending vacation"},
              {cls:"cit",  l:"IT", text:"On-Call / SPOC"},
              {cls:"ccd",  l:"CD", text:"CDO Stewards"},
              {cls:"ces",  l:"ES", text:"Escalation"},
              {cls:"cmt",  l:"MT", text:"Mountain time"},
              {cls:"cmt2", l:"mt", text:"Morning vacation"},
              {cls:"csd",  l:"SD", text:"Service Desk"},
            ].map((l,i) => (
              <div key={i} className="sch-li">
                <div className={`sch-lc ${l.cls}`}>{l.l}</div>{l.text}
              </div>
            ))}
            <div className="sch-leg-divider" />
            <div className="sch-li"><div className="sch-ls" style={{background:"#fef3e2"}}/>Canadian holiday</div>
            <div className="sch-li"><div className="sch-ls" style={{background:"#eff6ff"}}/>US holiday</div>
            <div className="sch-li"><div className="sch-ls" style={{background:"#f9f9f9"}}/>Weekend</div>
            <div className="sch-li"><div className="sch-ls" style={{background:"#fef2f2",outline:"1px solid #fca5a5"}}/>Coverage gap</div>
          </div>

          <div className="sch-sc">
            <div className="sch-sc-title">Summary</div>
            {[
              {l:"OOO this month",   v:stats.ooo_count        ||0},
              {l:"On call today",    v:stats.on_call_today     ||0},
              {l:"Coverage gaps",    v:stats.coverage_gaps     ||0, cls: parseInt(stats.coverage_gaps)    >0?"danger":""},
              {l:"Pending PV",       v:stats.pending_approvals ||0, cls: parseInt(stats.pending_approvals)>0?"warn":""},
              {l:"Active rotations", v:stats.active_rotations  ||0},
            ].map((s,i) => (
              <div key={i} className="sch-si">
                <span className="sch-sl">{s.l}</span>
                <span className={`sch-sv${s.cls?" "+s.cls:""}`}>{s.v}</span>
              </div>
            ))}
          </div>

          <div className="sch-cc">
            <div className="sch-ct">⚠ Conflicts ({data?.conflicts?.length || 0})</div>
            {(data?.conflicts||[]).length === 0
              ? <div className="sch-ci" style={{color:"#6b7280"}}>No open conflicts</div>
              : (data?.conflicts||[]).map(c => (
                <div key={c.id} className="sch-ci">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"2px"}}>
                    <span className="sch-cn">{c.first_name} {c.last_name}</span>
                    <span className={`sch-sev-badge sch-sev-${(c.severity||"").toLowerCase()}`}>{c.severity}</span>
                  </div>
                  <span style={{fontSize:"11px",color:"#9ca3af"}}>{c.conflict_type}</span><br/>
                  <span style={{fontSize:"12px"}}>{c.rotation_name}</span>
                </div>
              ))
            }
          </div>

        </div>
      </div>
    </div>
  );
}
