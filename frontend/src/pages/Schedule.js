import React, { useState } from "react";
import "../styles/schedules.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const HEADER_DATES = [
  { d:15, month:"March 2026",  wk:true },
  { d:16, month:"March 2026",  wk:true },
  { d:17, month:"March 2026",  today:true },
  { d:18, month:"March 2026" },
  { d:19, month:"March 2026" },
  { d:20, month:"March 2026" },
  { d:21, month:"March 2026" },
  { d:30, month:"March 2026",  hca:true },
  { d:31, month:"March 2026" },
  { d:1,  month:"April 2026" },
  { d:2,  month:"April 2026" },
  { d:3,  month:"April 2026" },
  { d:4,  month:"April 2026",  wk:true },
  { d:5,  month:"April 2026",  wk:true },
];

const GROUPS = [
  {
    label: "CDO FDN Subsurface and Land",
    rows: [
      { rotation:"CDO FDN Subsurface", initials:"DS", name:"Dan Saulnier",
        cells:[null,null,{t:"cmt",l:"MT"},{t:"cmt",l:"MT"},{t:"cmt",l:"MT"},null,null,null,null,null,null,null,null,null] },
      { rotation:"CDO FDN Subsurface", initials:"AH", name:"Alan Howatt",
        cells:[null,null,null,{t:"cv",l:"V"},null,{t:"cmt",l:"MT"},{t:"cmt",l:"MT"},null,null,null,null,null,null,null] },
      { rotation:"CDO FDN Subsurface", initials:"TV", name:"Travis Torraville",
        cells:[null,null,null,null,{t:"ces",l:"ES"},{t:"ces",l:"ES"},{t:"cv",l:"V"},null,{t:"cmt",l:"MT"},null,null,null,null,null] },
    ]
  },
  {
    label: "CDO FDN Business Services",
    rows: [
      { rotation:"CDO FDN Business", initials:"RD", name:"Ricky Dalton",
        cells:[null,null,{t:"cv",l:"V"},{t:"cv",l:"V"},{t:"cv",l:"V"},{t:"ccd",l:"CD"},{t:"ccd",l:"CD"},null,null,null,null,null,null,null] },
      { rotation:"CDO FDN Business", initials:"DJ", name:"David Judson",
        cells:[null,null,{t:"ccd",l:"CD"},{t:"ccd",l:"CD"},null,{t:"cmt",l:"MT"},{t:"cmt",l:"MT"},null,null,null,null,null,null,null] },
    ]
  },
  {
    label: "ServiceNow",
    rows: [
      { rotation:"ServiceNow", initials:"KR", name:"Karthik R.",
        cells:[null,null,{t:"cv",l:"V"},{t:"cv",l:"V"},{t:"gap",l:"GAP"},{t:"cit",l:"IT"},{t:"cit",l:"IT"},null,{t:"cit",l:"IT"},null,null,null,null,null] },
      { rotation:"ServiceNow", initials:"TD", name:"Tim Darrach",
        cells:[null,null,{t:"cmt2",l:"mt"},{t:"cmt2",l:"mt"},{t:"cit",l:"IT"},{t:"cit",l:"IT"},null,null,null,null,null,null,null,null] },
    ]
  },
  {
    label: "IT Apps",
    rows: [
      { rotation:"IT Apps", initials:"RA", name:"Rishi Akella",
        cells:[null,null,{t:"cv",l:"V"},{t:"cv",l:"V"},{t:"cv",l:"V"},null,{t:"cpv",l:"PV"},null,null,null,null,null,null,null] },
    ]
  },
];

const TOTALS = [0,0,4,4,3,2,2,"—",1,0,0,0,0,0];

const LEGEND = [
  { t:"cv",   l:"V",  text:"Vacation" },
  { t:"abs",  l:"A",  text:"Absence" },
  { t:"cit",  l:"IT", text:"24/7 SPOC IT" },
  { t:"ccd",  l:"CD", text:"CDO Stewards" },
  { t:"ces",  l:"ES", text:"CDO Escalation" },
  { t:"cmt",  l:"MT", text:"Mountain time" },
  { t:"cmt2", l:"mt", text:"Morning vacation" },
  { t:"cpv",  l:"PV", text:"Pending vacation" },
  { t:"csd",  l:"SD", text:"Service Desk" },
];

function Chip({ t, l }) {
  if (t === "gap") return <span className="sch-badge-gap">GAP</span>;
  return <div className={`sch-chip ${t}`}>{l}</div>;
}

export default function Schedules() {
  const [currentDate, setCurrentDate] = useState({ month: 2, year: 2026 });
  const [view, setView]               = useState("Month");
  const [search, setSearch]           = useState("");
  const [teamFilter, setTeamFilter]   = useState("All Teams");
  const [typeFilter, setTypeFilter]   = useState("All Types");
  const [showFilter, setShowFilter]   = useState("All assignments");

  const prevMonth = () =>
    setCurrentDate(p => p.month === 0 ? { month:11, year:p.year-1 } : { month:p.month-1, year:p.year });
  const nextMonth = () =>
    setCurrentDate(p => p.month === 11 ? { month:0, year:p.year+1 } : { month:p.month+1, year:p.year });

  const monthLabel = `${MONTHS[currentDate.month]} ${currentDate.year}`;

  // Build colspan spans for top header
  const monthSpans = HEADER_DATES.reduce((acc, d) => {
    const last = acc[acc.length - 1];
    if (last && last.month === d.month) { last.count++; }
    else acc.push({ month: d.month, count: 1, border: acc.length > 0 });
    return acc;
  }, []);

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
          <button className="sch-btn-white">⚡ Generate Schedule</button>
          <button className="sch-btn-white">+ Add Assignment</button>
        </div>
      </div>

      {/* Stats */}
      <div className="sch-stats-row">
        <div className="sch-stat-card">
          <div className="sch-stat-lbl">Out of office (Mar)</div>
          <div className="sch-stat-val">56</div>
          <div className="sch-stat-sub">↑ 4 more than Feb</div>
        </div>
        <div className="sch-stat-card">
          <div className="sch-stat-lbl">On call today</div>
          <div className="sch-stat-val">3</div>
          <div className="sch-stat-sub">IT · CD · ES active</div>
        </div>
        <div className="sch-stat-card">
          <div className="sch-stat-lbl">Coverage gaps</div>
          <div className="sch-stat-val danger">2</div>
          <div className="sch-stat-sub warn">Needs attention</div>
        </div>
        <div className="sch-stat-card">
          <div className="sch-stat-lbl">Pending approvals</div>
          <div className="sch-stat-val">5</div>
          <div className="sch-stat-sub">Vacation requests</div>
        </div>
      </div>

      {/* Controls */}
      <div className="sch-controls-card">
        <div className="sch-ctrl" style={{ flex: 2 }}>
          <label>Search member</label>
          <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="sch-ctrl">
          <label>Team</label>
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
            <option>All Teams</option>
            <option>CDO FDN Subsurface</option>
            <option>CDO FDN Business</option>
            <option>ServiceNow</option>
            <option>IT Apps</option>
          </select>
        </div>
        <div className="sch-ctrl">
          <label>Rotation type</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option>All Types</option>
            <option>On-Call</option>
            <option>Mountain Shift</option>
            <option>Analyst</option>
          </select>
        </div>
        <div className="sch-ctrl">
          <label>Show</label>
          <select value={showFilter} onChange={e => setShowFilter(e.target.value)}>
            <option>All assignments</option>
            <option>Vacations only</option>
            <option>On-call only</option>
            <option>Conflicts only</option>
          </select>
        </div>
        <div className="sch-nav-grp">
          <button className="sch-nav-b" onClick={prevMonth}>←</button>
          <span className="sch-month-lbl">{monthLabel}</span>
          <button className="sch-nav-b" onClick={nextMonth}>→</button>
        </div>
        <div className="sch-view-tog">
          {["Month","2-Week","Week"].map(v => (
            <button key={v} className={`sch-vt${view === v ? " on" : ""}`} onClick={() => setView(v)}>{v}</button>
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
                  {monthSpans.map((ms, i) => (
                    <th key={i} className={`sch-th-mo${ms.border ? " b" : ""}`} colSpan={ms.count}>{ms.month}</th>
                  ))}
                </tr>
                <tr>
                  {HEADER_DATES.map((d, i) => (
                    <th key={i} className={["sch-th-d", d.wk?"wk":"", d.today?"td":"", d.hca?"hca":""].filter(Boolean).join(" ")}>{d.d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((grp, gi) => {
                  const rows = grp.rows.filter(r =>
                    !search || r.name.toLowerCase().includes(search.toLowerCase())
                  );
                  if (!rows.length) return null;
                  return (
                    <React.Fragment key={gi}>
                      <tr className="sch-gr"><td colSpan={16}>{grp.label}</td></tr>
                      {rows.map((row, ri) => (
                        <tr key={ri} className="sch-data-row">
                          <td className="sch-rc">{row.rotation}</td>
                          <td className="sch-nc">
                            <div className="sch-nw">
                              <div className="sch-av">{row.initials}</div>
                              <span className="sch-nt">{row.name}</span>
                            </div>
                          </td>
                          {HEADER_DATES.map((hd, ci) => (
                            <td key={ci} className={["sch-dc", hd.wk?"wk":"", hd.hca?"hca":"", row.cells[ci]?.t==="gap"?"gap-cell":""].filter(Boolean).join(" ")}>
                              {row.cells[ci] && <Chip t={row.cells[ci].t} l={row.cells[ci].l} />}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
                <tr className="sch-tot">
                  <td className="sch-tl" colSpan={2}>Total out of office / day</td>
                  {TOTALS.map((t, i) => (
                    <td key={i} className={typeof t === "number" && t >= 4 ? "hi" : ""}>{t}</td>
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
            {LEGEND.map((l, i) => (
              <div key={i} className="sch-li">
                <div className={`sch-lc ${l.t}`}>{l.l}</div>
                {l.text}
              </div>
            ))}
            <div className="sch-leg-divider" />
            <div className="sch-li"><div className="sch-ls" style={{ background:"#fef3e2" }} />Canadian holiday</div>
            <div className="sch-li"><div className="sch-ls" style={{ background:"#eff6ff" }} />US holiday</div>
            <div className="sch-li"><div className="sch-ls" style={{ background:"#f9f9f9" }} />Weekend</div>
            <div className="sch-li"><div className="sch-ls" style={{ background:"#fef2f2", outline:"1px solid #fca5a5" }} />Coverage gap</div>
          </div>

          <div className="sch-sc">
            <div className="sch-sc-title">Summary</div>
            {[
              { l:"OOO this month",   v:"56" },
              { l:"On call today",    v:"3" },
              { l:"Coverage gaps",    v:"2", cls:"danger" },
              { l:"Pending PV",       v:"5", cls:"warn" },
              { l:"Active rotations", v:"6" },
            ].map((s, i) => (
              <div key={i} className="sch-si">
                <span className="sch-sl">{s.l}</span>
                <span className={`sch-sv${s.cls ? " "+s.cls : ""}`}>{s.v}</span>
              </div>
            ))}
          </div>

          <div className="sch-cc">
            <div className="sch-ct">⚠ Conflicts</div>
            <div className="sch-ci"><span className="sch-cn">Karthik R.</span><br />Coverage gap Mar 19</div>
            <div className="sch-ci"><span className="sch-cn">Platforms</span><br />Understaffed Mar 30</div>
          </div>

        </div>
      </div>
    </div>
  );
}
