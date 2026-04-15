import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../api/api";
import "../styles/schedules.css";
import { useToastContext } from "../context/ToastContext";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const COL_W    = 48;
const ROW_H    = 42;
const MONTH_H  = 26;
const DAY_H    = 38;
const HEAD_H   = MONTH_H + DAY_H;
const GROUP_H  = 34;
const TOTALS_H = 34;
const CHIP_H   = 20;
const ROT_W    = 150;
const MEM_W    = 190;
const FROZEN_W = ROT_W + MEM_W;

const LEGEND_CHIPS = [
  { cls: "cv",   label: "V",  text: "Vacation" },
  { cls: "cpv",  label: "PV", text: "Pending" },
  { cls: "cit",  label: "IT", text: "On-Call" },
  { cls: "ccd",  label: "CD", text: "CDO" },
  { cls: "ces",  label: "ES", text: "Escalation" },
  { cls: "cmt",  label: "MT", text: "Mountain" },
  { cls: "cmt2", label: "mv", text: "AM leave" },
  { cls: "csd",  label: "SD", text: "Service Desk" },
];

// ── Date helpers ──────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }
function ymd(year, month1, day) { return `${year}-${pad(month1)}-${pad(day)}`; }
function parseYMD(dateStr) {
  const [y, m, d] = (dateStr || "").substring(0, 10).split("-").map(Number);
  return { y, m, d };
}
function todayStr() {
  const n = new Date();
  return ymd(n.getFullYear(), n.getMonth() + 1, n.getDate());
}
function monthStart(year, month1) { return ymd(year, month1, 1); }
function monthEnd(year, month1) {
  return ymd(year, month1, new Date(year, month1, 0).getDate());
}
function getDatesInRange(start, end) {
  if (!start || !end) return [];
  const { y: sy, m: sm, d: sd } = parseYMD(start);
  const { y: ey, m: em, d: ed } = parseYMD(end);
  const dates = [];
  const cur  = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cur <= last) {
    dates.push(ymd(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}
function isWeekend(dateStr) {
  const { y, m, d } = parseYMD(dateStr);
  return new Date(y, m - 1, d).getDay() % 6 === 0;
}
function dateInRange(dateStr, start, end) {
  const d = (dateStr || "").substring(0, 10);
  return d >= (start || "").substring(0, 10) && d <= (end || "").substring(0, 10);
}
function fmtShort(dateStr) {
  const { y, m, d } = parseYMD(dateStr);
  return new Date(y, m - 1, d).toLocaleDateString("en-US",
    { month: "short", day: "numeric", year: "numeric" });
}
function fmtFull(dateStr) {
  const { y, m, d } = parseYMD(dateStr);
  return new Date(y, m - 1, d).toLocaleDateString("en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function getWindow(year, month1, span) {
  const start = monthStart(year, month1);
  let endMonth = month1 + span - 1;
  let endYear  = year;
  while (endMonth > 12) { endMonth -= 12; endYear++; }
  return { start, end: monthEnd(endYear, endMonth) };
}
function rowHeight(row) {
  return row.type === "group" ? GROUP_H : row.type === "totals" ? TOTALS_H : ROW_H;
}

// ── MultiSelect dropdown ─────────────────────────────────────────
function MultiSelect({ label, options, selected, onChange, valueKey = "id", labelKey = "name" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val) => {
    onChange(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const clearAll = (e) => { e.stopPropagation(); onChange([]); };

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 12px", borderRadius: 8, cursor: "pointer",
          border: selected.length > 0 ? "1.5px solid #5236ab" : "1.5px solid rgba(255,255,255,0.3)",
          background: selected.length > 0 ? "#f5f3ff" : "rgba(255,255,255,0.12)",
          color: selected.length > 0 ? "#5236ab" : "#ffffff",
          fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "nowrap", minWidth: 110,
          backdropFilter: "blur(4px)",
        }}
      >
        <span>{label}{selected.length > 0 ? ` (${selected.length})` : ""}</span>
        {selected.length > 0 && (
          <span onClick={clearAll} style={{ marginLeft: 2, opacity: 0.7, fontSize: 15, lineHeight: 1 }}>×</span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.6 }}>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0,
          background: "#fff", border: "1px solid #e5e7eb",
          borderRadius: 10, boxShadow: "0 8px 28px rgba(82,54,171,0.15)",
          zIndex: 500, minWidth: 190, padding: 6,
          maxHeight: 240, overflowY: "auto",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {options.length === 0 && (
            <div style={{ padding: "10px 12px", fontSize: 13, color: "#9ca3af" }}>No options</div>
          )}
          {options.map(opt => {
            const val   = opt[valueKey];
            const lbl   = opt[labelKey];
            const isOn  = selected.includes(val);
            return (
              <label key={val} style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                background: isOn ? "#f5f3ff" : "transparent",
                color: isOn ? "#5236ab" : "#374151",
                fontSize: 13, userSelect: "none",
                transition: "background 0.12s",
              }}>
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(val)}
                  style={{ width: 15, height: 15, accentColor: "#5236ab", cursor: "pointer", flexShrink: 0 }}
                />
                {lbl}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Chip helpers ──────────────────────────────────────────────────
function getChipForAssignment(a) {
  const t = (a.rotation_type || "").toUpperCase().replace(/-/g, "_");
  if (t === "ON_CALL" || t === "TEAM_LEVEL") return { cls: "cit", label: "IT" };
  if (t.includes("MOUNTAIN"))                return { cls: "cmt", label: "MT" };
  if (t.includes("ESCALATION"))              return { cls: "ces", label: "ES" };
  if (t.includes("STEWARD") || t.includes("CDO")) return { cls: "ccd", label: "CD" };
  if (t.includes("SERVICE"))                 return { cls: "csd", label: "SD" };
  if (t.includes("BUSINESS"))                return { cls: "cmt", label: "MT" };
  return { cls: "cit", label: (a.rotation_name || "RO").substring(0, 2).toUpperCase() };
}
function getChipForLeave(lr) {
  if (lr.status === "PENDING")       return { cls: "cpv", label: "PV" };
  if (lr.leave_period === "MORNING") return { cls: "cmt2", label: "mt" };
  return { cls: "cv", label: "V" };
}
function chipLabel(cls) {
  const m = {
    cit: "On-Call / IT", ces: "Escalation", ccd: "CDO Steward",
    cmt: "Mountain Time", cmt2: "AM Leave", csd: "Service Desk",
    cv: "Vacation", cpv: "Pending Vacation",
  };
  return m[cls] || cls;
}

// ── Canvas colours ────────────────────────────────────────────────
const CC = {
  bg: "#ffffff", rowEven: "#ffffff", rowOdd: "#fafafa", rowHover: "#f5f3ff",
  todayBg: "rgba(82,54,171,0.07)", weekendBg: "#f8f9fb",
  holCA: "#fef3e2", holUS: "#eff6ff", border: "#e5e7eb",
  totBg: "#f3f4f6", totText: "#9ca3af", totHi: "#5236ab",
  paintHighlight: "rgba(82,54,171,0.13)",
  chips: {
    cit:  { bg: "#ede9fe", fg: "#5236ab" }, ces: { bg: "#fce7f3", fg: "#be185d" },
    ccd:  { bg: "#fef3c7", fg: "#b45309" }, cmt: { bg: "#dbeafe", fg: "#1d4ed8" },
    cmt2: { bg: "#f0fdf4", fg: "#166534" }, csd: { bg: "#fee2e2", fg: "#b91c1c" },
    cv:   { bg: "#dcfce7", fg: "#15803d" }, cpv: { bg: "#fef9c3", fg: "#a16207" },
  },
};
function chipColors(cls) { return CC.chips[cls] || CC.chips.cit; }

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

function cellKey(userId, rotationId, date) {
  return `${userId}__${rotationId}__${date}`;
}

// ══════════════════════════════════════════════════════════════════
// ScheduleCanvas
// ══════════════════════════════════════════════════════════════════
function ScheduleCanvas({
  allDates, rows, holidayMap, gapMap, leaveByUser,
  oooPerDate, monthSpans, onCellClick, onCellRightClick,
  activePaintChip, paintedCells, winKey, canvasH,
}) {
  const canvasRef  = useRef(null);
  const scrollX    = useRef(0);
  const hoverRow   = useRef(-1);
  const hoverCol   = useRef(-1);
  const rafRef     = useRef(null);
  const isPainting        = useRef(false);
  const wasDragging       = useRef(false);
  const dragStartCell     = useRef(null);
  const dragPaintedCells  = useRef(new Set());
  const today      = todayStr();
  const canvasW    = allDates.length * COL_W;

  // paintedCellsRef mirrors state so draw() always has latest without re-creating
  const paintedCellsRef = useRef(paintedCells);
  useEffect(() => { paintedCellsRef.current = paintedCells; }, [paintedCells]);

  const draw = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const vw  = canvas.width  / dpr;
      const vh  = canvas.height / dpr;
      const sx  = scrollX.current;
      const ctx = canvas.getContext("2d");
      const pc  = paintedCellsRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);
      ctx.fillStyle = CC.bg; ctx.fillRect(0, 0, vw, vh);

      // Column tints
      allDates.forEach((d, ci) => {
        const cx = ci * COL_W - sx;
        if (cx + COL_W < 0 || cx > vw) return;
        const hol = holidayMap[d];
        let bg = null;
        if (d === today)                           bg = CC.todayBg;
        else if (isWeekend(d))                     bg = CC.weekendBg;
        else if (hol?.holiday_type === "CANADIAN") bg = CC.holCA;
        else if (hol?.holiday_type === "US")       bg = CC.holUS;
        if (bg) { ctx.fillStyle = bg; ctx.fillRect(cx, HEAD_H, COL_W, vh - HEAD_H); }
        if (ci === hoverCol.current && !isWeekend(d)) {
          ctx.fillStyle = activePaintChip ? CC.paintHighlight : "rgba(82,54,171,0.04)";
          ctx.fillRect(cx, HEAD_H, COL_W, vh - HEAD_H);
        }
        if (d === today) {
          ctx.strokeStyle = "#5236ab"; ctx.lineWidth = 2; ctx.globalAlpha = 0.2;
          ctx.beginPath(); ctx.moveTo(cx, HEAD_H); ctx.lineTo(cx, vh); ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = CC.border;
        ctx.fillRect(cx + COL_W - 1, HEAD_H, 1, vh - HEAD_H);
      });

      // Row backgrounds
      let ry = HEAD_H;
      rows.forEach((row, ri) => {
        const rh = rowHeight(row);
        if (row.type === "group") {
          const grad = ctx.createLinearGradient(0, ry, vw, ry);
          grad.addColorStop(0, "#ede9fe"); grad.addColorStop(1, "#fdf2f8");
          ctx.fillStyle = grad; ctx.fillRect(0, ry, vw, rh);
          ctx.fillStyle = "#c4b5fd"; ctx.fillRect(0, ry + rh - 1, vw, 1);
        } else if (row.type === "totals") {
          ctx.fillStyle = CC.totBg; ctx.fillRect(0, ry, vw, rh);
          ctx.fillStyle = CC.border; ctx.fillRect(0, ry, vw, 2);
        } else {
          ctx.fillStyle = ri === hoverRow.current ? CC.rowHover
            : (ri % 2 === 0 ? CC.rowEven : CC.rowOdd);
          ctx.fillRect(0, ry, vw, rh);
          ctx.fillStyle = CC.border; ctx.fillRect(0, ry + rh - 1, vw, 1);
        }
        ry += rh;
      });

      // Header
      const hGrad = ctx.createLinearGradient(0, 0, vw, 0);
      hGrad.addColorStop(0, "#5236ab"); hGrad.addColorStop(1, "#e41937");
      ctx.fillStyle = hGrad; ctx.fillRect(0, 0, vw, HEAD_H);
      ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(0, MONTH_H, vw, 1);

      // Month labels
      ctx.font = "600 11px 'DM Sans', system-ui, sans-serif";
      ctx.textBaseline = "middle"; ctx.textAlign = "center";
      monthSpans.forEach((ms, mi) => {
        const x = ms.startX - sx, w = ms.count * COL_W;
        if (x + w < 0 || x > vw) return;
        ctx.save();
        ctx.beginPath();
        ctx.rect(Math.max(x,0), 0, Math.min(x+w,vw) - Math.max(x,0), MONTH_H);
        ctx.clip();
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fillText(ms.month, x + w / 2, MONTH_H / 2);
        ctx.restore();
        if (mi > 0) {
          ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEAD_H); ctx.stroke();
        }
      });

      // Day headers
      allDates.forEach((d, ci) => {
        const cx = ci * COL_W - sx;
        if (cx + COL_W < 0 || cx > vw) return;
        const { y, m, d: day } = parseYMD(d);
        const dt  = new Date(y, m - 1, day);
        const num = dt.getDate();
        const nam = dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
        const isT = d === today, isW = isWeekend(d);
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "600 8px 'DM Sans', system-ui, sans-serif";
        ctx.fillStyle = isT ? "#ffd0d8" : isW ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)";
        ctx.fillText(nam, cx + COL_W / 2, MONTH_H + 12);
        if (isT) {
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.beginPath(); ctx.arc(cx + COL_W/2, MONTH_H+DAY_H-14, 13, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#ffffff";
        } else {
          ctx.fillStyle = isW ? "rgba(255,255,255,0.45)" : "#ffffff";
        }
        ctx.font = `${isT?"800":"700"} 13px 'DM Sans', system-ui, sans-serif`;
        ctx.fillText(num, cx + COL_W/2, MONTH_H+DAY_H-14);
      });

      ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.fillRect(0, HEAD_H, vw, 2);

      // Row content
      ry = HEAD_H;
      rows.forEach((row) => {
        const rh = rowHeight(row);
        if (row.type === "totals") {
          ctx.font = "600 10px 'DM Sans', system-ui, sans-serif";
          ctx.textBaseline = "middle"; ctx.textAlign = "center";
          allDates.forEach((d, ci) => {
            const cx = ci * COL_W - sx;
            if (cx + COL_W < 0 || cx > vw) return;
            const val = oooPerDate[d] || 0;
            ctx.fillStyle = val >= 4 ? CC.totHi : CC.totText;
            ctx.fillText(val, cx + COL_W/2, ry + rh/2);
          });
        } else if (row.type === "member") {
          const { userRow } = row;
          allDates.forEach((d, ci) => {
            const cx = ci * COL_W - sx;
            if (cx + COL_W < 0 || cx > vw) return;
            const chips = [];
            userRow.assignments.forEach(a => {
              if (dateInRange(d, a.assigned_start, a.assigned_end))
                chips.push(getChipForAssignment(a));
            });
            (leaveByUser[userRow.userId] || []).forEach(lr => {
              if (dateInRange(d, lr.start_date, lr.end_date))
                chips.push(getChipForLeave(lr));
            });
            const key = cellKey(userRow.userId, userRow.rotationId, d);
            (pc[key] || []).forEach(p => chips.push(p));

            const isGap = userRow.rotationId
              ? (gapMap[d]?.includes(userRow.rotationId) ?? false) : false;

            if (isGap && chips.length === 0) {
              const gw = 32, gy = ry+(ROW_H-CHIP_H)/2, gx = cx+(COL_W-gw)/2;
              roundRect(ctx, gx, gy, gw, CHIP_H, 4);
              ctx.fillStyle = "#fff0f3"; ctx.fill();
              ctx.strokeStyle = "#fca5a5"; ctx.lineWidth = 1; ctx.stroke();
              ctx.font = "700 9px 'DM Sans', system-ui, sans-serif";
              ctx.fillStyle = "#e41937"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
              ctx.fillText("GAP", gx+gw/2, gy+CHIP_H/2);
            } else if (chips.length > 0) {
              const painted = pc[key] || [];
              const totalH  = chips.length > 1 ? CHIP_H*2+3 : CHIP_H;
              chips.slice(0, 2).forEach((chip, idx) => {
                const col = chipColors(chip.cls);
                ctx.font  = "700 10px 'DM Sans', system-ui, sans-serif";
                const lw  = ctx.measureText(chip.label).width;
                const cw  = lw + 14;
                const chx = cx + (COL_W - cw) / 2;
                const chy = ry + (ROW_H - totalH) / 2 + idx * (CHIP_H + 3);
                roundRect(ctx, chx, chy, cw, CHIP_H, 5);
                ctx.fillStyle = col.bg; ctx.fill();
                if (painted.find(p => p.cls === chip.cls)) {
                  ctx.strokeStyle = col.fg; ctx.lineWidth = 1.5;
                  ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
                }
                ctx.fillStyle = col.fg; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText(chip.label, chx+cw/2, chy+CHIP_H/2);
              });
            }
          });
        }
        ry += rh;
      });
    });
  }, [allDates, rows, holidayMap, gapMap, leaveByUser, oooPerDate,
      monthSpans, today, activePaintChip]);
  // Note: paintedCells intentionally NOT in deps — we use paintedCellsRef instead
  // so that drag painting doesn't recreate draw() on every cell stamp

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const ro  = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        canvas.width  = Math.round(width * dpr);
        canvas.height = Math.round(canvasH * dpr);
        draw();
      }
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw, canvasH]);

  useEffect(() => { draw(); }, [draw]);

  // Also redraw when paintedCells changes (e.g. on load or delete)
  useEffect(() => { draw(); }, [paintedCells, draw]);

  const onWheel = useCallback(e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.5) {
      e.preventDefault();
      const maxSX = Math.max(0, canvasW - (canvasRef.current?.offsetWidth || 0));
      scrollX.current = Math.max(0, Math.min(maxSX, scrollX.current + e.deltaX * 0.8));
      draw();
    }
  }, [canvasW, draw]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  useEffect(() => {
    const stop = () => { isPainting.current = false; };
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  const hitTest = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left, my = clientY - rect.top;
    if (mx < 0 || my < HEAD_H) return null;
    const ci = Math.floor((mx + scrollX.current) / COL_W);
    if (ci < 0 || ci >= allDates.length) return null;
    let ry2 = HEAD_H;
    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri], rh = rowHeight(row);
      if (my >= ry2 && my < ry2 + rh) {
        if (row.type === "member")
          return { rowIndex: ri, colIndex: ci, userRow: row.userRow, date: allDates[ci] };
        return null;
      }
      ry2 += rh;
    }
    return null;
  }, [allDates, rows]);

const onMouseMove = useCallback(e => {
  const hit    = hitTest(e.clientX, e.clientY);
  const newRow = hit ? hit.rowIndex : -1;
  const newCol = hit ? hit.colIndex : -1;
  if (newRow !== hoverRow.current || newCol !== hoverCol.current) {
    hoverRow.current = newRow; hoverCol.current = newCol; draw();
  }
  if (isPainting.current && hit && activePaintChip) {
    const cellId = `${hit.rowIndex}-${hit.colIndex}`;
    if (!dragPaintedCells.current.has(cellId)) {
      dragPaintedCells.current.add(cellId);
      wasDragging.current = true;
      onCellClick(hit);
    }
  }
}, [hitTest, draw, activePaintChip, onCellClick]);

const onMouseDown = useCallback(e => {
  if (e.button !== 0) return;
  isPainting.current = true;
  wasDragging.current = false;
  dragStartCell.current = null;
  dragPaintedCells.current = new Set();
}, []);

  const onMouseUp = useCallback(() => { isPainting.current = false; }, []);

  const onMouseLeave = useCallback(() => {
    hoverRow.current = -1; hoverCol.current = -1; draw();
  }, [draw]);

const onClick = useCallback(e => {
  const hit = hitTest(e.clientX, e.clientY);
  if (!hit) return;
  if (activePaintChip) {
    if (!wasDragging.current) onCellClick(hit);
    wasDragging.current = false;
    dragStartCell.current = null;
    dragPaintedCells.current = new Set();
  } else {
    onCellClick({ ...hit, showPopup: true, screenX: e.clientX, screenY: e.clientY });
  }
}, [hitTest, onCellClick, activePaintChip]);

  const onContextMenu = useCallback(e => {
    e.preventDefault();
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit) return;
    onCellRightClick(hit);
  }, [hitTest, onCellRightClick]);

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{ width:"100%", height:canvasH+"px", display:"block",
        cursor: activePaintChip ? "crosshair" : "pointer", flexShrink:0 }}
    />
  );
}

// ── Frozen left columns ───────────────────────────────────────────
function FrozenCols({ rows, canvasH }) {
  return (
    <div style={{
      position:"absolute", top:0, left:0, width:FROZEN_W, height:canvasH+"px",
      pointerEvents:"none", zIndex:10, display:"flex", flexDirection:"column",
      fontFamily:"'DM Sans', system-ui, sans-serif",
      boxShadow:"6px 0 20px rgba(82,54,171,0.12)", overflow:"hidden",
    }}>
      <div style={{ height:HEAD_H, flexShrink:0, display:"flex" }}>
        {[["Rotation",ROT_W],["Member",MEM_W]].map(([lbl,w]) => (
          <div key={lbl} style={{
            width:w, flexShrink:0,
            background:"linear-gradient(135deg,#5236ab,#e41937)",
            display:"flex", alignItems:"flex-end", padding:"0 14px 10px",
            fontSize:9, fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.8px", color:"rgba(255,255,255,0.7)",
            borderRight:"1px solid rgba(255,255,255,0.12)",
          }}>{lbl}</div>
        ))}
      </div>
      {rows.map((row, ri) => {
        if (row.type === "group") return (
          <div key={ri} style={{
            height:GROUP_H, flexShrink:0, width:FROZEN_W,
            background:"linear-gradient(90deg,#ede9fe,#fdf2f8)",
            borderBottom:"1px solid #c4b5fd",
            display:"flex", alignItems:"center", padding:"0 14px", gap:8,
          }}>
            <div style={{ width:6,height:6,borderRadius:"50%",
              background:"linear-gradient(135deg,#5236ab,#e41937)",flexShrink:0 }} />
            <span style={{ fontSize:11,fontWeight:700,color:"#5236ab",
              textTransform:"uppercase",letterSpacing:"0.7px" }}>{row.label}</span>
          </div>
        );
        if (row.type === "totals") return (
          <div key={ri} style={{
            height:TOTALS_H, flexShrink:0, width:FROZEN_W,
            background:"#f3f4f6", borderTop:"2px solid #e5e7eb",
            display:"flex", alignItems:"center", padding:"0 14px",
          }}>
            <span style={{ fontSize:10,fontWeight:600,color:"#9ca3af",
              textTransform:"uppercase",letterSpacing:"0.5px" }}>OOO / day</span>
          </div>
        );
        return (
          <div key={ri} style={{
            height:ROW_H, flexShrink:0, display:"flex", alignItems:"center",
            background: ri%2===0 ? "#ffffff" : "#fafafa",
            borderBottom:"1px solid #e5e7eb", borderRight:"1px solid #e5e7eb",
          }}>
            <div style={{ width:ROT_W,flexShrink:0,padding:"0 12px",
              fontSize:11,fontWeight:500,color:"#6b7280",
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
              borderRight:"1px solid #f0f0f0" }}>{row.rotName}</div>
            <div style={{ width:MEM_W,padding:"0 10px",
              display:"flex",alignItems:"center",gap:8,overflow:"hidden" }}>
              <div style={{ width:30,height:30,borderRadius:"50%",flexShrink:0,
                background:"linear-gradient(135deg,#5236ab,#e41937)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:700,color:"#fff",
                boxShadow:"0 2px 8px rgba(82,54,171,0.35)" }}>
                {`${row.userRow.firstName?.[0]||""}${row.userRow.lastName?.[0]||""}`.toUpperCase()}
              </div>
              <div style={{ overflow:"hidden" }}>
                <div style={{ fontSize:12,fontWeight:600,color:"#111827",
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                  {row.userRow.firstName} {row.userRow.lastName}
                </div>
                <div style={{ fontSize:10,color:"#9ca3af",marginTop:1 }}>
                  {row.userRow.rotationType || ""}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Cell Detail Popup ─────────────────────────────────────────────
function CellPopup({ info, leaveByUser, paintedCells, onClose }) {
  if (!info) return null;
  const { userRow, date, screenX, screenY } = info;
  const assignments = userRow.assignments.filter(a =>
    dateInRange(date, a.assigned_start, a.assigned_end));
  const leaves = (leaveByUser[userRow.userId] || []).filter(lr =>
    dateInRange(date, lr.start_date, lr.end_date));
  const key     = cellKey(userRow.userId, userRow.rotationId, date);
  const painted = paintedCells[key] || [];
  const popW = 280, popH = 240;
  let left = screenX + 12, top = screenY - 20;
  if (left + popW > window.innerWidth  - 16) left = screenX - popW - 12;
  if (top  + popH > window.innerHeight - 16) top  = screenY - popH + 20;

  return (
    <>
      <div style={{ position:"fixed",inset:0,zIndex:999 }} onClick={onClose} />
      <div className="sch-popup" style={{ left, top }}>
        <div className="sch-popup-header">
          <div className="sch-popup-avatar">
            {`${userRow.firstName?.[0]||""}${userRow.lastName?.[0]||""}`.toUpperCase()}
          </div>
          <div>
            <div className="sch-popup-name">{userRow.firstName} {userRow.lastName}</div>
            <div className="sch-popup-date">{fmtFull(date)}</div>
          </div>
          <button className="sch-popup-close" onClick={onClose}>×</button>
        </div>
        <div className="sch-popup-body">
          {assignments.length===0 && leaves.length===0 && painted.length===0 ? (
            <div className="sch-popup-empty">No assignments or leave on this day</div>
          ) : (
            <>
              {assignments.map((a,i) => {
                const chip=getChipForAssignment(a), col=chipColors(chip.cls);
                return (
                  <div key={i} className="sch-popup-item">
                    <div className="sch-popup-chip" style={{background:col.bg,color:col.fg}}>{chip.label}</div>
                    <div className="sch-popup-item-detail">
                      <div className="sch-popup-item-title">{a.rotation_name}</div>
                      <div className="sch-popup-item-sub">{fmtShort(a.assigned_start)} → {fmtShort(a.assigned_end)}</div>
                      <div className="sch-popup-item-sub">{chipLabel(chip.cls)}</div>
                    </div>
                  </div>
                );
              })}
              {leaves.map((lr,i) => {
                const chip=getChipForLeave(lr), col=chipColors(chip.cls);
                return (
                  <div key={i} className="sch-popup-item">
                    <div className="sch-popup-chip" style={{background:col.bg,color:col.fg}}>{chip.label}</div>
                    <div className="sch-popup-item-detail">
                      <div className="sch-popup-item-title">{lr.status==="PENDING"?"Pending Vacation":"Vacation"}</div>
                      <div className="sch-popup-item-sub">{fmtShort(lr.start_date)} → {fmtShort(lr.end_date)}</div>
                      {lr.leave_period && <div className="sch-popup-item-sub">{lr.leave_period}</div>}
                    </div>
                  </div>
                );
              })}
              {painted.map((p,i) => {
                const col=chipColors(p.cls);
                return (
                  <div key={`p${i}`} className="sch-popup-item" style={{borderColor:"#c4b5fd"}}>
                    <div className="sch-popup-chip" style={{background:col.bg,color:col.fg}}>{p.label}</div>
                    <div className="sch-popup-item-detail">
                      <div className="sch-popup-item-title">{chipLabel(p.cls)}</div>
                      <div className="sch-popup-item-sub" style={{color:"#a78bfa"}}>Manually added</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Generate Modal ────────────────────────────────────────────────
function GenerateModal({ onClose, onGenerated, windowStart }) {
  const { showToast } = useToastContext();
  const [rotations,   setRotations]   = useState([]);
  const [selectedRot, setSelectedRot] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);
  const [loadingRots, setLoadingRots] = useState(true);

  // Default to a 12-month window starting from the current view start
  const defaultEnd = (() => {
    const { y, m } = parseYMD(windowStart);
    let endM = m + 11;
    let endY  = y;
    while (endM > 12) { endM -= 12; endY++; }
    return monthEnd(endY, endM);
  })();
  const [genStart, setGenStart] = useState(windowStart);
  const [genEnd,   setGenEnd]   = useState(defaultEnd);

  useEffect(() => {
    api.get("/schedules/rotations")
      .then(r => { setRotations(r.data); setLoadingRots(false); })
      .catch(() => setLoadingRots(false));
  }, []);

  const selectedRotData = rotations.find(r => r.id === selectedRot);

  const handleGenerate = async () => {
    if (!selectedRot) { setError("Please select a rotation"); return; }
    if (!genStart || !genEnd) { setError("Please set a start and end date"); return; }
    if (genStart > genEnd)    { setError("Start date must be before end date"); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await api.post("/schedules/generate",
        { rotationId: selectedRot, windowStart: genStart, windowEnd: genEnd });
      setResult(res.data); onGenerated();
      showToast("Schedule generated!", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Generation failed";
      setError(msg);
      showToast(msg, "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="sch-modal-overlay" onClick={onClose}>
      <div className="sch-modal" onClick={e => e.stopPropagation()}>
        <div className="sch-modal-header">
          <div>
            <h2>⚡ Generate Schedule</h2>
            <p>Generating for {genStart} → {genEnd}</p>
          </div>
          <button className="sch-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="sch-modal-body">
          {result ? (
            <div className="sch-gen-result">
              <div className="sch-gen-success-icon">✓</div>
              <h3>Schedule Generated!</h3>
              <div className="sch-gen-stats">
                {[
                  { val:result.assignments, lbl:"Assignments" },
                  { val:result.conflicts,   lbl:"Conflicts", warn:result.conflicts>0 },
                  { val:result.gaps,        lbl:"Gaps",      warn:result.gaps>0 },
                ].map((s,i) => (
                  <div key={i} className="sch-gen-stat">
                    <span className={`sch-gen-stat-val${s.warn?" warn":""}`}>{s.val}</span>
                    <span className="sch-gen-stat-lbl">{s.lbl}</span>
                  </div>
                ))}
              </div>
              {result.conflicts>0 && <div className="sch-gen-warning">⚠ {result.conflicts} conflict(s)</div>}
              {result.gaps>0      && <div className="sch-gen-warning">⚠ {result.gaps} gap(s)</div>}
              <div className="sch-modal-footer">
                <button className="sch-btn-primary" onClick={onClose}>View Schedule</button>
              </div>
            </div>
          ) : (
            <>
              <div className="sch-form-group">
                <label>Generation Window</label>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
                    <span style={{ fontSize:11, color:"#6b7280", fontWeight:600 }}>Start</span>
                    <input
                      type="date"
                      value={genStart}
                      onChange={e => setGenStart(e.target.value)}
                      style={{ padding:"7px 10px", borderRadius:8, border:"1.5px solid #e5e7eb",
                        fontSize:13, fontFamily:"'DM Sans', sans-serif", color:"#374151" }}
                    />
                  </div>
                  <span style={{ marginTop:18, color:"#9ca3af" }}>→</span>
                  <div style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
                    <span style={{ fontSize:11, color:"#6b7280", fontWeight:600 }}>End</span>
                    <input
                      type="date"
                      value={genEnd}
                      onChange={e => setGenEnd(e.target.value)}
                      style={{ padding:"7px 10px", borderRadius:8, border:"1.5px solid #e5e7eb",
                        fontSize:13, fontFamily:"'DM Sans', sans-serif", color:"#374151" }}
                    />
                  </div>
                </div>
              </div>
              <div className="sch-form-group">
                <label>Select Rotation <span className="req">*</span></label>
                {loadingRots ? <div className="sch-gen-loading">Loading rotations...</div> : (
                  <div className="sch-rot-list">
                    {rotations.map(rot => (
                      <div key={rot.id}
                        className={`sch-rot-item${selectedRot===rot.id?" selected":""}`}
                        onClick={() => setSelectedRot(rot.id)}>
                        <div className="sch-rot-item-top">
                          <span className="sch-rot-name">{rot.name}</span>
                          <span className="sch-rot-badge">{rot.rotation_type}</span>
                        </div>
                        <div className="sch-rot-item-meta">
                          <span>👥 {rot.team_name||rot.group_name||"No team"}</span>
                          <span>🔄 {rot.cadence_type} · {rot.cadence_interval}x</span>
                          <span>👤 {rot.member_count} member(s)</span>
                        </div>
                      </div>
                    ))}
                    {rotations.length===0 && <div className="sch-gen-empty">No active rotations found.</div>}
                  </div>
                )}
              </div>
              {selectedRotData && (
                <div className="sch-rot-info-box">
                  <div className="sch-rot-info-title">📋 {selectedRotData.name}</div>
                  <div className="sch-rot-info-grid">
                    <div><span>Type</span><strong>{selectedRotData.rotation_type}</strong></div>
                    <div><span>Cadence</span><strong>{selectedRotData.cadence_type} × {selectedRotData.cadence_interval}</strong></div>
                    <div><span>Min Assignees</span><strong>{selectedRotData.min_assignees}</strong></div>
                    <div><span>Members</span><strong>{selectedRotData.member_count}</strong></div>
                  </div>
                  {parseInt(selectedRotData.member_count)===0 && (
                    <div className="sch-gen-warning">⚠ This rotation has no members.</div>
                  )}
                </div>
              )}
              {error && <div className="sch-gen-error">❌ {error}</div>}
              <div className="sch-modal-footer">
                <button className="sch-btn-secondary" onClick={onClose}>Cancel</button>
                <button className="sch-btn-primary" onClick={handleGenerate} disabled={loading||!selectedRot}>
                  {loading?"⏳ Generating...":"⚡ Generate Schedule"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Main Schedule page
// ══════════════════════════════════════════════════════════════════
export default function Schedule() {
  const now = new Date();
  const role = localStorage.getItem("role") || "Individual";
  const isAdmin = role === "Administrator";
  const currentUserId = localStorage.getItem("userId");

  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [span,  setSpan]  = useState(1);

  const [data,            setData]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [showGenModal,    setShowGenModal]     = useState(false);
  const [search,          setSearch]          = useState("");
  const [teamFilter,      setTeamFilter]      = useState([]);
  const [typeFilter,      setTypeFilter]      = useState([]);
  const [panelOpen,       setPanelOpen]       = useState(false);
  const [popup,           setPopup]           = useState(null);
  const [activePaintChip, setActivePaintChip] = useState(null);
  const [paintedCells,    setPaintedCells]    = useState({});

  const fetchTimerRef = useRef(null);

  // paintedCellsRef — lets handleCellClick read latest state without being in its deps
  const paintedCellsRef = useRef(paintedCells);
  useEffect(() => { paintedCellsRef.current = paintedCells; }, [paintedCells]);

  const { start: winStart, end: winEnd } = useMemo(
    () => getWindow(year, month, span), [year, month, span]
  );
  const winKey = `${winStart}-${winEnd}`;

  const goPrev = useCallback(() => {
    setMonth(m => { if (m===1) { setYear(y=>y-1); return 12; } return m-1; });
  }, []);
  const goNext = useCallback(() => {
    setMonth(m => { if (m===12) { setYear(y=>y+1); return 1; } return m+1; });
  }, []);

  useEffect(() => {
    const onKey = e => { if (e.key==="Escape") setActivePaintChip(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLegendChipClick = useCallback((chip) => {
    setActivePaintChip(prev => prev?.cls===chip.cls ? null : chip);
    setPopup(null);
  }, []);

  // Paint a cell — update state immediately for smooth rendering, save to DB async
  const handleCellClick = useCallback((hit) => {
    if (activePaintChip) {
      const key = cellKey(hit.userRow.userId, hit.userRow.rotationId, hit.date);
      // Check ref to avoid stale closure without re-creating callback
      const existing = paintedCellsRef.current[key] || [];
      if (existing.find(p => p.cls === activePaintChip.cls)) return;

      // Immediately update state for smooth canvas rendering
      const newChip = { ...activePaintChip };
      setPaintedCells(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), newChip],
      }));

      // Save to DB in background — no await so it doesn't block paint
      api.post("/schedules/overrides", {
        userId:       hit.userRow.userId,
        rotationId:   hit.userRow.rotationId,
        overrideDate: hit.date,
        chipCls:      activePaintChip.cls,
        chipLabel:    activePaintChip.label,
      }).then(res => {
        // Store DB id on the chip for future deletion
        setPaintedCells(prev => {
          const chips = (prev[key] || []).map(p =>
            p.cls === activePaintChip.cls && !p.id
              ? { ...p, id: res.data.id } : p
          );
          return { ...prev, [key]: chips };
        });
      }).catch(err => console.error("Failed to save override:", err));

    } else if (hit.showPopup) {
      setPopup(hit);
    }
  }, [activePaintChip]);

  const handleCellRightClick = useCallback(async (hit) => {
    const key = cellKey(hit.userRow.userId, hit.userRow.rotationId, hit.date);
    const chips = paintedCellsRef.current[key] || [];
    if (chips.length === 0) return;
    for (const chip of chips) {
      if (chip.id) {
        try { await api.delete(`/schedules/overrides/${chip.id}`); }
        catch (err) { console.error("Failed to delete override:", err); }
      }
    }
    setPaintedCells(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  const fetchSchedules = useCallback(async (searchVal) => {
    setLoading(true); setError(null);
    try {
      const params = {
        startDate:    winStart,
        endDate:      winEnd,
        search:       searchVal || undefined,
        teamId:       teamFilter.length > 0 ? teamFilter.join(",") : undefined,
        rotationType: typeFilter.length > 0 ? typeFilter.join(",") : undefined,
      };
      // Scope schedule data by role
      if (currentUserId && (role === "Individual" || role === "Team Leader")) {
        params.userId = currentUserId;
        params.role   = role;
      }
      const res = await api.get("/schedules", { params });
      setData(res.data);
    } catch (err) {
      console.error(err); setError("Failed to load schedule data.");
    } finally { setLoading(false); }
  }, [winStart, winEnd, teamFilter, typeFilter, currentUserId, role]);

  // Single debounced fetch effect — no duplicate
  useEffect(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => { fetchSchedules(search); }, 400);
    return () => clearTimeout(fetchTimerRef.current);
  }, [fetchSchedules, search]);

  // Load saved overrides from DB when window changes
  useEffect(() => {
    api.get("/schedules/overrides", {
      params: { startDate: winStart, endDate: winEnd }
    }).then(res => {
      const cells = {};
      res.data.forEach(o => {
        const dateStr = (o.override_date || "").substring(0, 10);
        const key = cellKey(o.user_id, o.rotation_id, dateStr);
        if (!cells[key]) cells[key] = [];
        cells[key].push({ cls: o.chip_cls, label: o.chip_label, id: o.id });
      });
      setPaintedCells(cells);
    }).catch(err => console.error("Failed to load overrides:", err));
  }, [winStart, winEnd]);

  const periodLabel = useMemo(() => {
    if (span===1) return `${MONTHS[month-1]} ${year}`;
    let endMonth = month+span-1, endYear = year;
    if (endMonth>12) { endMonth-=12; endYear++; }
    if (endYear===year) return `${MONTHS[month-1]} – ${MONTHS[endMonth-1]} ${year}`;
    return `${MONTHS[month-1]} ${year} – ${MONTHS[endMonth-1]} ${endYear}`;
  }, [year, month, span]);

  const allDates = useMemo(() => getDatesInRange(winStart, winEnd), [winStart, winEnd]);

  const holidayMap = useMemo(() => {
    const m = {};
    (data?.holidays||[]).forEach(h => {
      const k=(h.holiday_date||"").substring(0,10); if(k) m[k]=h;
    });
    return m;
  }, [data]);

  const gapMap = useMemo(() => {
    const m = {};
    (data?.coverageGaps||[]).forEach(g => {
      getDatesInRange((g.gap_start||"").substring(0,10),(g.gap_end||"").substring(0,10))
        .forEach(d => { if(!m[d]) m[d]=[]; m[d].push(g.rotation_id); });
    });
    return m;
  }, [data]);

  const leaveByUser = useMemo(() => {
    const m = {};
    (data?.leaveRequests||[]).forEach(lr => {
      if(!m[lr.user_id]) m[lr.user_id]=[];
      m[lr.user_id].push(lr);
    });
    return m;
  }, [data]);

  const oooPerDate = useMemo(() => {
    const m = {};
    allDates.forEach(d => { m[d]=0; });
    (data?.leaveRequests||[]).filter(lr=>lr.status==="APPROVED").forEach(lr => {
      getDatesInRange((lr.start_date||"").substring(0,10),(lr.end_date||"").substring(0,10))
        .forEach(d => { if(m[d]!==undefined) m[d]++; });
    });
    return m;
  }, [data, allDates]);

  const grouped = useMemo(() => {

  const g = {};
  const hasFilter = search.trim() || teamFilter.length > 0 || typeFilter.length > 0;

  // When filters are active, only show users who appear in filtered assignments
  const matchedUserIds = new Set(
    (data?.assignments || []).map(a => a.user_id)
  );

  // Build rows from rotationMembers (gives us members with no assignments too)
  (data?.rotationMembers || []).forEach(m => {
    // Skip if filter active and this user has no matching assignments
    if (hasFilter && !matchedUserIds.has(m.user_id)) return;

    // Skip if type filter active and this member's rotation type doesn't match
    if (typeFilter.length > 0 && !typeFilter.includes(m.rotation_type)) return;

    const grp = m.group_name    || "Corporate IT";
    const rot = m.rotation_name || "Unknown";
    const uid = m.user_id;
    if (!g[grp])           g[grp]           = {};
    if (!g[grp][rot])      g[grp][rot]      = {};
    if (!g[grp][rot][uid]) g[grp][rot][uid] = {
      userId: uid, firstName: m.first_name, lastName: m.last_name,
      rotationType: m.rotation_type, rotationId: m.rotation_id, assignments: [],
    };
  });

  // Merge assignments into existing rows (or create row if not from rotationMembers)
  (data?.assignments || []).forEach(a => {
    const grp = a.group_name    || "Corporate IT";
    const rot = a.rotation_name || "Unknown";
    const uid = a.user_id;
    if (!g[grp])           g[grp]           = {};
    if (!g[grp][rot])      g[grp][rot]      = {};
    if (!g[grp][rot][uid]) g[grp][rot][uid] = {
      userId: uid, firstName: a.first_name, lastName: a.last_name,
      rotationType: a.rotation_type, rotationId: a.rotation_id, assignments: [],
    };
    g[grp][rot][uid].assignments.push(a);
  });

  // Clean up empty rotation/group buckets
  Object.keys(g).forEach(grp => {
    Object.keys(g[grp]).forEach(rot => {
      if (Object.keys(g[grp][rot]).length === 0) delete g[grp][rot];
    });
    if (Object.keys(g[grp]).length === 0) delete g[grp];
  });

  return g;
}, [data, search, teamFilter, typeFilter]);

  const rows = useMemo(() => {
    const r = [];
    Object.entries(grouped).forEach(([groupName, rotations]) => {
      r.push({ type:"group", label:groupName });
      Object.entries(rotations).forEach(([rotName, users]) => {
        Object.values(users).forEach((userRow, ri) => {
          r.push({ type:"member", rotName:ri===0?rotName:"", userRow });
        });
      });
    });
    r.push({ type:"totals" });
    return r;
  }, [grouped]);

  const canvasH = useMemo(() =>
    HEAD_H + rows.reduce((sum,row) => sum+rowHeight(row), 0), [rows]);

  const monthSpans = useMemo(() => allDates.reduce((acc, d) => {
    const { y, m } = parseYMD(d);
    const lbl = `${MONTHS[m-1]} ${y}`;
    const last = acc[acc.length-1];
    if (last && last.month===lbl) last.count++;
    else acc.push({ month:lbl, count:1, startX:acc.reduce((s,ms)=>s+ms.count*COL_W,0) });
    return acc;
  }, []), [allDates]);

  const stats   = data?.stats || {};
  const hasData = Object.keys(grouped).length > 0;

  if (loading) return (
    <div className="schedules-container">
      <div className="sch-loading"><div className="sch-spinner"/><span>Loading schedules...</span></div>
    </div>
  );
  if (error) return (
    <div className="schedules-container">
      <div className="sch-error">{error}<button onClick={()=>fetchSchedules(search)}>Retry</button></div>
    </div>
  );

  return (
    <div className="schedules-container">

      {activePaintChip && (
        <div className="sch-paint-banner">
          <span>🖌 Paint mode: <strong>{activePaintChip.text||chipLabel(activePaintChip.cls)}</strong> — click or drag to stamp · right-click to erase · Esc to cancel</span>
          <button onClick={() => setActivePaintChip(null)}>✕ Cancel</button>
        </div>
      )}

      <div className="sch-topbar">
        <div className="sch-topbar-left">
          <div className="sch-topbar-title">Schedules</div>
          <div className="sch-period-nav">
            <button className="sch-nav-btn" onClick={goPrev}>‹</button>
            <span className="sch-period-label">{periodLabel}</span>
            <button className="sch-nav-btn" onClick={goNext}>›</button>
          </div>
        </div>
        <div className="sch-topbar-center">
          <div className="sch-view-toggle">
            {[{s:1,label:"Month"},{s:12,label:"Year"}].map(({s,label}) => (
              <button key={s} className={`sch-view-btn${span===s?" active":""}`}
                onClick={() => setSpan(s)}>{label}</button>
            ))}
          </div>
        </div>
        <div className="sch-topbar-right">
          <input
            className="sch-filter-input"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <MultiSelect
            label="Team"
            options={data?.teams || []}
            selected={teamFilter}
            onChange={setTeamFilter}
            valueKey="id"
            labelKey="name"
          />
          <MultiSelect
            label="Type"
            options={(data?.rotationTypes || []).map(rt => ({ id: rt, name: rt }))}
            selected={typeFilter}
            onChange={setTypeFilter}
            valueKey="id"
            labelKey="name"
          />

          <button className="sch-btn-ghost" onClick={() => fetchSchedules(search)} title="Refresh">↻</button>
          <button className={`sch-btn-ghost${panelOpen ? " active" : ""}`}
            onClick={() => setPanelOpen(o => !o)}>≡</button>
          {isAdmin && (
            <button className="sch-btn-generate" onClick={() => setShowGenModal(true)}>⚡ Generate</button>
          )}
        </div>
      </div>

      <div className="sch-stats-strip">
        {[
          {lbl:"OOO",       val:stats.ooo_count        ||0, sub:"this period"},
          {lbl:"On Call",   val:stats.on_call_today     ||0, sub:"today"},
          {lbl:"Gaps",      val:stats.coverage_gaps     ||0, sub:"coverage", danger:parseInt(stats.coverage_gaps)>0},
          {lbl:"Pending",   val:stats.pending_approvals ||0, sub:"requests"},
          {lbl:"Rotations", val:stats.active_rotations  ||0, sub:"active"},
        ].map((s,i) => (
          <div key={i} className="sch-stat-pill">
            <span className={`sch-stat-pill-val${s.danger?" danger":""}`}>{s.val}</span>
            <span className="sch-stat-pill-label">{s.lbl}</span>
            <span className="sch-stat-pill-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="sch-main">
        <div className="sch-grid-wrap">
          {!hasData ? (
            <div className="sch-empty">
              <div className="sch-empty-inner">
                <div className="sch-empty-icon">📅</div>
                <div className="sch-empty-title">No schedule data for {MONTHS[month - 1]} {year}</div>
                <div className="sch-empty-sub">
                  {isAdmin ? "Click Generate to create assignments" : "No generated assignments available for this period"}
                </div>
                {isAdmin && (
                  <button className="sch-btn-generate" style={{ marginTop: 12 }}
                    onClick={() => setShowGenModal(true)}>⚡ Generate Schedule</button>
                )}
              </div>
            </div>
          ) : (
            <div style={{position:"relative",width:"100%",height:canvasH+"px"}}>
              <div style={{marginLeft:FROZEN_W,height:canvasH+"px"}}>
                <ScheduleCanvas
                  allDates={allDates}
                  rows={rows}
                  holidayMap={holidayMap}
                  gapMap={gapMap}
                  leaveByUser={leaveByUser}
                  oooPerDate={oooPerDate}
                  monthSpans={monthSpans}
                  onCellClick={handleCellClick}
                  onCellRightClick={handleCellRightClick}
                  activePaintChip={activePaintChip}
                  paintedCells={paintedCells}
                  winKey={winKey}
                  canvasH={canvasH}
                />
              </div>
              <FrozenCols rows={rows} canvasH={canvasH} />
            </div>
          )}
        </div>

        {panelOpen && (
          <div className="sch-panel">
            <div className="sch-panel-section">
              <div className="sch-panel-title">Legend</div>
              {activePaintChip && (
                <div className="sch-paint-hint">Click or drag cells to stamp · right-click to erase</div>
              )}
              <div className="sch-legend-grid">
                {LEGEND_CHIPS.map((l,i) => {
                  const isActive = activePaintChip?.cls===l.cls;
                  return (
                    <div key={i}
                      className={`sch-li sch-li-clickable${isActive?" sch-li-active":""}`}
                      onClick={() => handleLegendChipClick(l)}
                      title={isActive?"Click again or Esc to deactivate":`Click to paint ${l.text}`}>
                      <div className={`sch-lc ${l.cls}${isActive?" sch-lc-active":""}`}>{l.label}</div>
                      <span>{l.text}</span>
                      {isActive && <span className="sch-li-active-dot">●</span>}
                    </div>
                  );
                })}
              </div>
              <div className="sch-leg-divider"/>
              <div className="sch-legend-grid">
                <div className="sch-li"><div className="sch-ls" style={{background:"#fef3e2"}}/><span>CA holiday</span></div>
                <div className="sch-li"><div className="sch-ls" style={{background:"#eff6ff"}}/><span>US holiday</span></div>
                <div className="sch-li"><div className="sch-ls" style={{background:"#f8f9fb",border:"1px solid #e5e7eb"}}/><span>Weekend</span></div>
                <div className="sch-li"><div className="sch-ls" style={{background:"#fff0f3",border:"1px solid #fca5a5"}}/><span>Gap</span></div>
              </div>
            </div>

            <div className="sch-panel-section">
              <div className="sch-panel-title">Summary</div>
              {[
                {l:"OOO this period",  v:stats.ooo_count        ||0},
                {l:"On call today",    v:stats.on_call_today     ||0},
                {l:"Coverage gaps",    v:stats.coverage_gaps     ||0, cls:parseInt(stats.coverage_gaps)    >0?"danger":""},
                {l:"Pending PV",       v:stats.pending_approvals ||0, cls:parseInt(stats.pending_approvals)>0?"warn":""},
                {l:"Active rotations", v:stats.active_rotations  ||0},
              ].map((s,i) => (
                <div key={i} className="sch-si">
                  <span className="sch-sl">{s.l}</span>
                  <span className={`sch-sv${s.cls?" "+s.cls:""}`}>{s.v}</span>
                </div>
              ))}
            </div>

            <div className="sch-panel-section">
              <div className="sch-panel-title" style={{color:"#e41937"}}>
                ⚠ Conflicts ({data?.conflicts?.length||0})
              </div>
              {(data?.conflicts||[]).length===0 ? (
                <div style={{fontSize:12,color:"#6b7280"}}>No open conflicts</div>
              ) : (
                (data?.conflicts||[]).map(c => (
                  <div key={c.id} className="sch-ci">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                      <span className="sch-cn">{c.first_name} {c.last_name}</span>
                      <span className={`sch-sev-badge sch-sev-${(c.severity||"").toLowerCase()}`}>{c.severity}</span>
                    </div>
                    <span style={{fontSize:11,color:"#9ca3af"}}>{c.conflict_type}</span><br/>
                    <span style={{fontSize:12}}>{c.rotation_name}</span>
                    {c.details?.description && (
                      <div style={{fontSize:11,color:"#e41937",marginTop:2}}>{c.details.description}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <CellPopup
        info={popup}
        leaveByUser={leaveByUser}
        paintedCells={paintedCells}
        onClose={()=>setPopup(null)}
      />

      {isAdmin && showGenModal && (
        <GenerateModal
          onClose={() => setShowGenModal(false)}
          onGenerated={() => fetchSchedules(search)}
          windowStart={winStart}
        />
      )}
    </div>
  );
}