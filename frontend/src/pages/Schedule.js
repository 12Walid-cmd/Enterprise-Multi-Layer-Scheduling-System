import React, { useState, useEffect, useCallback } from "react";
import api from "../api/api";
import "../styles/schedules.css";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

// ── Helpers ───────────────────────────────────────────────────────
function getDatesInRange(s, e) {
  const dates = [], cur = new Date(s), end = new Date(e);
  while (cur <= end) { dates.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate()+1); }
  return dates;
}
function isWeekend(d)      { const day=new Date(d).getDay(); return day===0||day===6; }
function dayLabel(d)       { return new Date(d).getDate(); }
function monthYearLabel(d) { const x=new Date(d); return `${MONTHS[x.getMonth()]} ${x.getFullYear()}`; }
function todayStr()        { return new Date().toISOString().split("T")[0]; }
function getInitials(f,l)  { return `${f?.[0]||""}${l?.[0]||""}`.toUpperCase(); }
function dateInRange(d,s,e){ return d>=s.split("T")[0] && d<=e.split("T")[0]; }
function getMondayOf(date) {
  const d=new Date(date), day=d.getDay(), diff=day===0?-6:1-day;
  d.setDate(d.getDate()+diff); return d;
}

function getChipForAssignment(a) {
  const t=(a.rotation_type||"").toUpperCase().replace(/-/g,"_");
  if (t==="ON_CALL"||t==="TEAM_LEVEL") return {cls:"cit", label:"IT"};
  if (t.includes("MOUNTAIN"))          return {cls:"cmt", label:"MT"};
  if (t.includes("ESCALATION"))        return {cls:"ces", label:"ES"};
  if (t.includes("STEWARD")||t.includes("CDO")) return {cls:"ccd", label:"CD"};
  if (t.includes("SERVICE"))           return {cls:"csd", label:"SD"};
  if (t.includes("BUSINESS"))         return {cls:"cmt", label:"MT"};
  const name=a.rotation_name||"RO";
  return {cls:"cit", label:name.substring(0,2).toUpperCase()};
}
function getChipForLeave(lr) {
  if (lr.status==="PENDING")       return {cls:"cpv", label:"PV"};
  if (lr.leave_period==="MORNING") return {cls:"cmt2",label:"mt"};
  return {cls:"cv", label:"V"};
}
function Chip({cls,label,title}) {
  return <div className={`sch-chip ${cls}`} title={title}>{label}</div>;
}

// ── Generate Modal ────────────────────────────────────────────────
function GenerateModal({ onClose, onGenerated }) {
  const [rotations, setRotations]     = useState([]);
  const [selectedRot, setSelectedRot] = useState("");
  const [windowStart, setWindowStart] = useState(() => {
    const d=new Date(); return new Date(d.getFullYear(),d.getMonth(),1).toISOString().split("T")[0];
  });
  const [windowEnd, setWindowEnd] = useState(() => {
    const d=new Date(); return new Date(d.getFullYear(),d.getMonth()+1,0).toISOString().split("T")[0];
  });
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState(null);
  const [error,   setError]     = useState(null);
  const [loadingRots, setLoadingRots] = useState(true);

  useEffect(() => {
    api.get("/schedules/rotations")
      .then(r => { setRotations(r.data); setLoadingRots(false); })
      .catch(() => setLoadingRots(false));
  }, []);

  const selectedRotData = rotations.find(r => r.id === selectedRot);

  const handleGenerate = async () => {
    if (!selectedRot) { setError("Please select a rotation"); return; }
    if (!windowStart || !windowEnd) { setError("Please set start and end dates"); return; }
    if (windowStart > windowEnd) { setError("Start date must be before end date"); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await api.post("/schedules/generate", {
        rotationId: selectedRot, windowStart, windowEnd
      });
      setResult(res.data);
      onGenerated();
    } catch (err) {
      setError(err.response?.data?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sch-modal-overlay" onClick={onClose}>
      <div className="sch-modal" onClick={e => e.stopPropagation()}>
        <div className="sch-modal-header">
          <div>
            <h2>⚡ Generate Schedule</h2>
            <p>Auto-assign members to rotation periods</p>
          </div>
          <button className="sch-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="sch-modal-body">
          {result ? (
            /* ── Success State ── */
            <div className="sch-gen-result">
              <div className="sch-gen-success-icon">✓</div>
              <h3>Schedule Generated!</h3>
              <div className="sch-gen-stats">
                <div className="sch-gen-stat">
                  <span className="sch-gen-stat-val">{result.assignments}</span>
                  <span className="sch-gen-stat-lbl">Assignments</span>
                </div>
                <div className="sch-gen-stat">
                  <span className={`sch-gen-stat-val ${result.conflicts>0?"warn":""}`}>{result.conflicts}</span>
                  <span className="sch-gen-stat-lbl">Conflicts</span>
                </div>
                <div className="sch-gen-stat">
                  <span className={`sch-gen-stat-val ${result.gaps>0?"warn":""}`}>{result.gaps}</span>
                  <span className="sch-gen-stat-lbl">Coverage Gaps</span>
                </div>
              </div>
              {result.conflicts > 0 && (
                <div className="sch-gen-warning">⚠ {result.conflicts} conflict(s) detected — check the Conflicts panel</div>
              )}
              {result.gaps > 0 && (
                <div className="sch-gen-warning">⚠ {result.gaps} coverage gap(s) found</div>
              )}
              <div className="sch-modal-footer">
                <button className="sch-btn-primary" onClick={onClose}>View Schedule</button>
              </div>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              {/* Rotation selector */}
              <div className="sch-form-group">
                <label>Select Rotation <span className="req">*</span></label>
                {loadingRots ? (
                  <div className="sch-gen-loading">Loading rotations...</div>
                ) : (
                  <div className="sch-rot-list">
                    {rotations.map(rot => (
                      <div
                        key={rot.id}
                        className={`sch-rot-item${selectedRot===rot.id?" selected":""}`}
                        onClick={() => setSelectedRot(rot.id)}
                      >
                        <div className="sch-rot-item-top">
                          <span className="sch-rot-name">{rot.name}</span>
                          <span className={`sch-rot-badge rot-${(rot.rotation_type||"").toLowerCase().replace(/[^a-z]/g,"-")}`}>
                            {rot.rotation_type}
                          </span>
                        </div>
                        <div className="sch-rot-item-meta">
                          <span>👥 {rot.team_name || rot.group_name || "No team"}</span>
                          <span>🔄 {rot.cadence_type} · {rot.cadence_interval}x</span>
                          <span>👤 {rot.member_count} member(s)</span>
                        </div>
                      </div>
                    ))}
                    {rotations.length === 0 && (
                      <div className="sch-gen-empty">No active rotations found. Create rotations first.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected rotation info */}
              {selectedRotData && (
                <div className="sch-rot-info-box">
                  <div className="sch-rot-info-title">📋 {selectedRotData.name}</div>
                  <div className="sch-rot-info-grid">
                    <div><span>Type</span><strong>{selectedRotData.rotation_type}</strong></div>
                    <div><span>Cadence</span><strong>{selectedRotData.cadence_type} × {selectedRotData.cadence_interval}</strong></div>
                    <div><span>Min Assignees</span><strong>{selectedRotData.min_assignees}</strong></div>
                    <div><span>Members</span><strong>{selectedRotData.member_count}</strong></div>
                  </div>
                  {parseInt(selectedRotData.member_count) === 0 && (
                    <div className="sch-gen-warning">⚠ This rotation has no members. Add members in the Rotations page first.</div>
                  )}
                </div>
              )}

              {/* Date window */}
              <div className="sch-form-row">
                <div className="sch-form-group">
                  <label>Window Start <span className="req">*</span></label>
                  <input type="date" value={windowStart} onChange={e => setWindowStart(e.target.value)} />
                </div>
                <div className="sch-form-group">
                  <label>Window End <span className="req">*</span></label>
                  <input type="date" value={windowEnd} onChange={e => setWindowEnd(e.target.value)} />
                </div>
              </div>

              {/* Info box */}
              {/* <div className="sch-gen-info">
                <strong>ℹ How generation works:</strong>
                <ul>
                  <li>Members are assigned in rotation order based on cadence ({selectedRotData?.cadence_type || "WEEKLY"})</li>
                  <li>Weekends and holidays are automatically skipped</li>
                  <li>Members on approved leave are skipped for that period</li>
                  <li>Existing schedule for this window will be replaced</li>
                  <li>Conflicts and coverage gaps are auto-detected</li>
                </ul>
              </div> */}

              {error && <div className="sch-gen-error">❌ {error}</div>}

              <div className="sch-modal-footer">
                <button className="sch-btn-secondary" onClick={onClose}>Cancel</button>
                <button
                  className="sch-btn-primary"
                  onClick={handleGenerate}
                  disabled={loading || !selectedRot}
                >
                  {loading ? "⏳ Generating..." : "⚡ Generate Schedule"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function Schedules() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showGenModal, setShowGenModal] = useState(false);

  const [currentDate, setCurrentDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
  const [view, setView]             = useState("Month");
  const [search, setSearch]         = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showFilter, setShowFilter] = useState("All assignments");

  const getWindow = useCallback(() => {
    const { month, year } = currentDate;
    if (view === "Month") {
      const monday = getMondayOf(new Date(year, month, 1));
      return {
        start: monday.toISOString().split("T")[0],
        end:   new Date(year, month+1, 0).toISOString().split("T")[0]
      };
    }
    const monday = getMondayOf(new Date(year, month, new Date().getDate()));
    const end = new Date(monday);
    end.setDate(end.getDate() + (view==="2-Week"?13:6));
    return { start: monday.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
  }, [currentDate, view]);

  const fetchSchedules = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { start, end } = getWindow();
      const res = await api.get("/schedules", {
        params: { startDate:start, endDate:end,
          search: search||undefined,
          teamId: teamFilter!=="All"?teamFilter:undefined,
          rotationType: typeFilter!=="All"?typeFilter:undefined }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load schedule data.");
    } finally { setLoading(false); }
  }, [getWindow, search, teamFilter, typeFilter]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const prevPeriod = () => {
    if (view==="Month") setCurrentDate(p=>p.month===0?{month:11,year:p.year-1}:{month:p.month-1,year:p.year});
    else { const m=getMondayOf(new Date(currentDate.year,currentDate.month,1)); m.setDate(m.getDate()-7); setCurrentDate({month:m.getMonth(),year:m.getFullYear()}); }
  };
  const nextPeriod = () => {
    if (view==="Month") setCurrentDate(p=>p.month===11?{month:0,year:p.year+1}:{month:p.month+1,year:p.year});
    else { const m=getMondayOf(new Date(currentDate.year,currentDate.month,1)); m.setDate(m.getDate()+7); setCurrentDate({month:m.getMonth(),year:m.getFullYear()}); }
  };

  const { start: winStart, end: winEnd } = getWindow();
  const allDates = getDatesInRange(winStart, winEnd);
  const today    = todayStr();

  const holidayMap = {};
  (data?.holidays||[]).forEach(h=>{ holidayMap[h.holiday_date]=h; });

  const gapMap = {};
  (data?.coverageGaps||[]).forEach(g=>{
    getDatesInRange(g.gap_start,g.gap_end).forEach(d=>{ if(!gapMap[d])gapMap[d]=[]; gapMap[d].push(g.rotation_id); });
  });

  const leaveByUser = {};
  (data?.leaveRequests||[]).forEach(lr=>{ if(!leaveByUser[lr.user_id])leaveByUser[lr.user_id]=[]; leaveByUser[lr.user_id].push(lr); });

  const oooPerDate = {};
  allDates.forEach(d=>{ oooPerDate[d]=0; });
  (data?.leaveRequests||[]).filter(lr=>lr.status==="APPROVED").forEach(lr=>{
    getDatesInRange(lr.start_date,lr.end_date).forEach(d=>{ if(oooPerDate[d]!==undefined)oooPerDate[d]++; });
  });

  // Group: group_name -> rotation_name -> user_id -> {assignments}
  const grouped = {};
  (data?.assignments||[]).forEach(a=>{
    const grp=a.group_name||"Corporate IT";
    const rot=a.rotation_name||"Unknown";
    const uid=a.user_id;
    if(!grouped[grp])grouped[grp]={};
    if(!grouped[grp][rot])grouped[grp][rot]={};
    if(!grouped[grp][rot][uid]) grouped[grp][rot][uid]={userId:uid,firstName:a.first_name,lastName:a.last_name,rotationType:a.rotation_type,assignments:[]};
    grouped[grp][rot][uid].assignments.push(a);
  });

  const monthSpans = allDates.reduce((acc,d)=>{
    const lbl=monthYearLabel(d); const last=acc[acc.length-1];
    if(last&&last.month===lbl){last.count++;}else acc.push({month:lbl,count:1,border:acc.length>0});
    return acc;
  },[]);

  const filterRow = (r) => {
    if (showFilter==="Vacations only") return (leaveByUser[r.userId]||[]).length>0;
    if (showFilter==="On-call only") { const t=(r.rotationType||"").toUpperCase().replace(/-/g,"_"); return t==="ON_CALL"||t==="TEAM_LEVEL"; }
    return true;
  };

  const renderCell = (userRow, dateStr) => {
    const chips=[];
    userRow.assignments.forEach(a=>{
      if(dateInRange(dateStr,a.assigned_start,a.assigned_end)){
        const {cls,label}=getChipForAssignment(a);
        chips.push(<Chip key={a.assignment_id} cls={cls} label={label} title={a.rotation_name}/>);
      }
    });
    (leaveByUser[userRow.userId]||[]).forEach(lr=>{
      if(dateStr>=lr.start_date&&dateStr<=lr.end_date){
        const {cls,label}=getChipForLeave(lr);
        chips.push(<Chip key={lr.id} cls={cls} label={label} title={lr.status==="PENDING"?"Pending vacation":"Vacation"}/>);
      }
    });
    return chips;
  };

  const stats = data?.stats||{};

  const periodLabel = view==="Month"
    ? `${MONTHS[currentDate.month]} ${currentDate.year}`
    : (() => {
        const s=new Date(winStart), e=new Date(winEnd);
        return `${s.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${e.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;
      })();

  if (loading) return (
    <div className="schedules-container">
      <div className="sch-loading"><div className="sch-spinner"/><span>Loading schedules...</span></div>
    </div>
  );
  if (error) return (
    <div className="schedules-container">
      <div className="sch-error">{error}<button onClick={fetchSchedules}>Retry</button></div>
    </div>
  );

  return (
    <div className="schedules-container">

      {/* Header */}
      <div className="sch-page-header">
        <div>
          <div className="sch-page-title">Schedules</div>
          <div className="sch-page-sub">Enterprise rotation schedule — live view</div>
        </div>
        <div className="sch-header-btns">
          <button className="sch-btn-outline">↓ Export CSV</button>
          <button className="sch-btn-white" onClick={fetchSchedules}>↻ Refresh</button>
          <button className="sch-btn-primary-hdr" onClick={() => setShowGenModal(true)}>⚡ Generate Schedule</button>
          <button className="sch-btn-white">+ Add Assignment</button>
        </div>
      </div>

      {/* Stats */}
      <div className="sch-stats-row">
        {[
          { lbl:`Out of office (${MONTHS[currentDate.month].substring(0,3)})`, val:stats.ooo_count||0, sub:"Approved leaves" },
          { lbl:"On call today",     val:stats.on_call_today||0,     sub:"Active assignments" },
          { lbl:"Coverage gaps",     val:stats.coverage_gaps||0,     sub:parseInt(stats.coverage_gaps)>0?"Needs attention":"All covered", danger:parseInt(stats.coverage_gaps)>0 },
          { lbl:"Pending approvals", val:stats.pending_approvals||0, sub:"Vacation requests" },
        ].map((s,i) => (
          <div key={i} className="sch-stat-card">
            <div className="sch-stat-lbl">{s.lbl}</div>
            <div className={`sch-stat-val${s.danger?" danger":""}`}>{s.val}</div>
            <div className={`sch-stat-sub${s.danger?" warn":""}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="sch-controls-card">
        <div className="sch-ctrl" style={{flex:2}}>
          <label>Search member</label>
          <input type="text" placeholder="Search by name..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="sch-ctrl">
          <label>Team</label>
          <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)}>
            <option value="All">All Teams</option>
            {(data?.teams||[]).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="sch-ctrl">
          <label>Rotation type</label>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            {(data?.rotationTypes||[]).map(rt=><option key={rt} value={rt}>{rt}</option>)}
          </select>
        </div>
        <div className="sch-ctrl">
          <label>Show</label>
          <select value={showFilter} onChange={e=>setShowFilter(e.target.value)}>
            <option>All assignments</option>
            <option>Vacations only</option>
            <option>On-call only</option>
          </select>
        </div>
        <div className="sch-nav-grp">
          <button className="sch-nav-b" onClick={prevPeriod}>←</button>
          <span className="sch-month-lbl">{periodLabel}</span>
          <button className="sch-nav-b" onClick={nextPeriod}>→</button>
        </div>
        <div className="sch-view-tog">
          {["Month","2-Week","Week"].map(v=>(
            <button key={v} className={`sch-vt${view===v?" on":""}`} onClick={()=>setView(v)}>{v}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="sch-body-row">

        {/* Grid */}
        <div className="sch-grid-card">
          <div className="sch-grid-scroll">
            <table className="sch-table">
              <thead>
                <tr>
                  <th className="sch-th-rot" rowSpan={2}>Team / Rotation</th>
                  <th className="sch-th-nm"  rowSpan={2}>Member</th>
                  {monthSpans.map((ms,i)=>(
                    <th key={i} className={`sch-th-mo${ms.border?" b":""}`} colSpan={ms.count}>{ms.month}</th>
                  ))}
                </tr>
                <tr>
                  {allDates.map((d,i)=>{
                    const hol=holidayMap[d];
                    return <th key={i} title={hol?hol.name:""}
                      className={["sch-th-d",isWeekend(d)?"wk":"",d===today?"td":"",
                        hol?.holiday_type==="CANADIAN"?"hca":"",hol?.holiday_type==="US"?"hus":""].filter(Boolean).join(" ")}>
                      {dayLabel(d)}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {Object.keys(grouped).length === 0 ? (
                  <tr><td colSpan={allDates.length+2} className="sch-empty">
                    <div className="sch-empty-inner">
                      <div className="sch-empty-icon">📅</div>
                      <div className="sch-empty-title">No schedule data for this period</div>
                      <div className="sch-empty-sub">Click <strong>⚡ Generate Schedule</strong> to create assignments for your rotations</div>
                      <button className="sch-btn-primary-sm" onClick={()=>setShowGenModal(true)}>⚡ Generate Schedule</button>
                    </div>
                  </td></tr>
                ) : (
                  Object.entries(grouped).map(([groupName,rotations])=>(
                    <React.Fragment key={groupName}>
                      <tr className="sch-gr"><td colSpan={allDates.length+2}>{groupName}</td></tr>
                      {Object.entries(rotations).map(([rotName,users])=>
                        Object.values(users).filter(filterRow).map((userRow,ri)=>(
                          <tr key={`${userRow.userId}-${rotName}`} className="sch-data-row">
                            <td className="sch-rc">{ri===0?rotName:""}</td>
                            <td className="sch-nc">
                              <div className="sch-nw">
                                <div className="sch-av">{getInitials(userRow.firstName,userRow.lastName)}</div>
                                <span className="sch-nt">{userRow.firstName} {userRow.lastName}</span>
                              </div>
                            </td>
                            {allDates.map((d,ci)=>{
                              const hol=holidayMap[d];
                              const isGap=gapMap[d]?.includes(userRow.assignments[0]?.rotation_id);
                              const chips=renderCell(userRow,d);
                              return <td key={ci} className={["sch-dc",isWeekend(d)?"wk":"",
                                hol?.holiday_type==="CANADIAN"?"hca":"",hol?.holiday_type==="US"?"hus":"",
                                isGap?"gap-cell":""].filter(Boolean).join(" ")}>
                                {isGap&&chips.length===0?<span className="sch-badge-gap">GAP</span>:chips}
                              </td>;
                            })}
                          </tr>
                        ))
                      )}
                    </React.Fragment>
                  ))
                )}
                <tr className="sch-tot">
                  <td className="sch-tl" colSpan={2}>Total out of office / day</td>
                  {allDates.map((d,i)=>(
                    <td key={i} className={oooPerDate[d]>=4?"hi":""}>{oooPerDate[d]||0}</td>
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
              {cls:"cv",  l:"V",  text:"Vacation"},
              {cls:"cpv", l:"PV", text:"Pending vacation"},
              {cls:"cit", l:"IT", text:"On-Call / SPOC"},
              {cls:"ccd", l:"CD", text:"CDO Stewards"},
              {cls:"ces", l:"ES", text:"Escalation"},
              {cls:"cmt", l:"MT", text:"Mountain time"},
              {cls:"cmt2",l:"mt", text:"Morning vacation"},
              {cls:"csd", l:"SD", text:"Service Desk"},
            ].map((l,i)=>(
              <div key={i} className="sch-li">
                <div className={`sch-lc ${l.cls}`}>{l.l}</div>{l.text}
              </div>
            ))}
            <div className="sch-leg-divider"/>
            <div className="sch-li"><div className="sch-ls" style={{background:"#fef3e2"}}/>Canadian holiday</div>
            <div className="sch-li"><div className="sch-ls" style={{background:"#eff6ff"}}/>US holiday</div>
            <div className="sch-li"><div className="sch-ls" style={{background:"#f9f9f9"}}/>Weekend</div>
            <div className="sch-li"><div className="sch-ls" style={{background:"#fef2f2",outline:"1px solid #fca5a5"}}/>Coverage gap</div>
          </div>

          <div className="sch-sc">
            <div className="sch-sc-title">Summary</div>
            {[
              {l:"OOO this month",   v:stats.ooo_count||0},
              {l:"On call today",    v:stats.on_call_today||0},
              {l:"Coverage gaps",    v:stats.coverage_gaps||0,    cls:parseInt(stats.coverage_gaps)>0?"danger":""},
              {l:"Pending PV",       v:stats.pending_approvals||0,cls:parseInt(stats.pending_approvals)>0?"warn":""},
              {l:"Active rotations", v:stats.active_rotations||0},
            ].map((s,i)=>(
              <div key={i} className="sch-si">
                <span className="sch-sl">{s.l}</span>
                <span className={`sch-sv${s.cls?" "+s.cls:""}`}>{s.v}</span>
              </div>
            ))}
          </div>

          <div className="sch-cc">
            <div className="sch-ct">⚠ Conflicts ({data?.conflicts?.length||0})</div>
            {(data?.conflicts||[]).length===0
              ? <div className="sch-ci" style={{color:"#6b7280"}}>No open conflicts</div>
              : (data?.conflicts||[]).map(c=>(
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

      {/* Generate Modal */}
      {showGenModal && (
        <GenerateModal
          onClose={() => setShowGenModal(false)}
          onGenerated={fetchSchedules}
        />
      )}
    </div>
  );
}
