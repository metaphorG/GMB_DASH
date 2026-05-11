// ================================================================
// GMB Land Policy Dashboard — v3  (Supabase Edition)
// ================================================================
// SETUP: Put your Supabase URL and anon key in the two constants
// below before deploying. Get them from:
//   Supabase Dashboard → Project Settings → API
// ================================================================
const SUPABASE_URL  = 'https://jbaxtfontbimrkzdqave.supabase.co';
const SUPABASE_ANON = 'sb_publishable_K0KlgPUZUXDkWyNr7ggEbw_wcsf9HMV';

// Lightweight Supabase REST helper — no SDK needed
const sb = {
  async get(table, query = '') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async update(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async delete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
    });
    if (!res.ok) throw new Error(await res.text());
  },
};

// Convert DB row (snake_case) → app plot object (camelCase)
function dbToPlot(row) {
  return {
    id:          row.id,
    name:        row.name,
    port:        row.port,
    portIdx:     row.port_idx,
    pgIdx:       row.pg_idx,
    landType:    row.land_type,
    area:        row.area,
    currentRent: row.current_rent,
    leaseStart:  row.lease_start,
    leaseTerm:   row.lease_term,
    acqCr:       row.acq_cr,
    indivVal:    row.indiv_val,
    acqValPsqm:  row.acq_val_psqm,
    recYear:     row.rec_year,
    notes:       row.notes || '',
  };
}

// Convert app plot object → DB row
function plotToDb(p) {
  return {
    name:         p.name,
    port:         p.port,
    port_idx:     p.portIdx,
    pg_idx:       p.pgIdx,
    land_type:    p.landType,
    area:         p.area,
    current_rent: p.currentRent,
    lease_start:  p.leaseStart,
    lease_term:   p.leaseTerm,
    acq_cr:       p.acqCr || 0,
    indiv_val:    p.indivVal || null,
    acq_val_psqm: p.acqValPsqm || null,
    rec_year:     p.recYear || null,
    notes:        p.notes || '',
  };
}

import { useState, useMemo, useCallback, useEffect, Fragment } from "react";

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const CY = 2025;
const PORT_NAMES = ['Alang','Bhavnagar','Jafrabad','Jamnagar','Magdalla','Mandvi','Mangrol','Navlakhi','Okha','Porbandar','Veraval','Dahej','Hazira','Mundra'];
const PG_IDX = {'Magdalla':0,'Dahej':0,'Hazira':0,'Bhavnagar':1,'Alang':1,'Navlakhi':1,'Jamnagar':2,'Okha':2,'Mundra':2,'Mandvi':2,'Veraval':3,'Porbandar':3,'Mangrol':3,'Jafrabad':3};
const PG_NAMES = ['South Gujarat Coast','Saurashtra East','Saurashtra West','South Saurashtra'];

const SCEN_KEYS = ['sopc_cur','sopc_rev','opt1','opt2','opt3','opt4','opt5','opt6'];
const SCEN_META = {
  sopc_cur:{label:'SoPC Current (uniform)',  short:'SoPC Cur', color:'#1e40af', bg:'#dbeafe'},
  sopc_rev:{label:'SoPC Revised (uniform)',  short:'SoPC Rev', color:'#1d4ed8', bg:'#bfdbfe'},
  opt1:    {label:'Opt 1 — Fresh Val × %',   short:'Opt 1',    color:'#6d28d9', bg:'#ede9fe'},
  opt2:    {label:'Opt 2 — ×40%× %',         short:'Opt 2',    color:'#7c3aed', bg:'#f5f3ff'},
  opt3:    {label:'Opt 3 — Continue Old',    short:'Opt 3',    color:'#065f46', bg:'#d1fae5'},
  opt4:    {label:'Opt 4 — Last + WPI',      short:'Opt 4',    color:'#0f766e', bg:'#ccfbf1'},
  opt5:    {label:'Opt 5 — 50% Hike + WPI',  short:'Opt 5',    color:'#92400e', bg:'#fef3c7'},
  opt6:    {label:'Opt 6 — Block Step-up ✓', short:'Opt 6 ✓',  color:'#14532d', bg:'#bbf7d0'},
};
const TYPE_META = {
  sopc:               {label:'SoPC',      color:'#1e40af', bg:'#dbeafe'},
  lpa:                {label:'LPA',       color:'#6d28d9', bg:'#ede9fe'},
  reclaimed_pre2018:  {label:'Rec<2018',  color:'#92400e', bg:'#fef3c7'},
  reclaimed_post2018: {label:'Rec≥2018',  color:'#065f46', bg:'#d1fae5'},
};
const STATUS_META = {
  active:   {label:'Active',   color:'#065f46', bg:'#d1fae5'},
  expiring: {label:'<5 yrs',   color:'#92400e', bg:'#fef3c7'},
  expired:  {label:'Expired',  color:'#991b1b', bg:'#fee2e2'},
};
const TYPE_LABELS = {
  sopc:'SoPC Ordinary', lpa:'LPA Firm Land',
  reclaimed_pre2018:'Reclaimed Pre-2018', reclaimed_post2018:'Reclaimed Post-2018', total:'TOTAL'
};

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════
function margF(area, bounds, pcts) {
  const br = [0, ...bounds, Infinity];
  let w = 0, a = 0;
  for (let i = 0; i < 4; i++) {
    const c = Math.max(0, Math.min(area, br[i+1]) - br[i]);
    if (!c) break;
    w += c * pcts[i]; a += c;
  }
  return a ? w / a : pcts[0];
}
function slabI(area, b) {
  return area <= b[0] ? 0 : area <= b[1] ? 1 : area <= b[2] ? 2 : 3;
}
function calcIRR(cfs) {
  if (!cfs || cfs.length < 2) return null;
  let r = 0.08;
  for (let i = 0; i < 250; i++) {
    let n = 0, d = 0;
    for (let t = 0; t < cfs.length; t++) {
      const pv = Math.pow(1 + r, t);
      n += cfs[t] / pv;
      d -= t * cfs[t] / Math.pow(1 + r, t + 1);
    }
    if (Math.abs(d) < 1e-12) break;
    const r1 = r - n / d;
    if (Math.abs(r1 - r) < 1e-8) { r = r1; break; }
    r = Math.max(-0.99, Math.min(9, r1));
  }
  return isNaN(r) || !isFinite(r) ? null : r;
}
function getAnnGrowth(c) {
  if (c.escType === 'wpi') return c.wpiRate / 100;
  if (c.escType === '10pct3yr') return Math.pow(1.1, 1/3) - 1;
  if (c.escType === '20pct3yr') return Math.pow(1.2, 1/3) - 1;
  return Math.pow(1 + c.escPct / 100, 1 / Math.max(1, c.escPeriod)) - 1;
}
function buildCFs(inv, yr1, g, horizon, residual, expiry, curRent) {
  if (inv <= 0) return null;
  const cfs = [-inv];
  const yToExp = Math.max(0, expiry - CY);
  let cR = curRent;
  for (let y = 1; y <= horizon; y++) {
    if (y <= yToExp) { cfs.push(cR); cR *= (1 + g); }
    else { const ppe = y - yToExp; cfs.push(yr1 * Math.pow(1 + g, ppe - 1)); }
  }
  cfs[cfs.length - 1] += residual;
  return cfs;
}
function fmtCr(v) {
  const c = v / 1e7;
  if (c >= 100) return '₹' + c.toFixed(0) + ' Cr';
  if (c >= 1)   return '₹' + c.toFixed(2) + ' Cr';
  return '₹' + (v / 1e5).toFixed(1) + ' L';
}
function fmtPct(v) { return v === null ? '—' : (v * 100).toFixed(1) + '%'; }
function fmtChg(v, base) {
  if (!base || base === 0) return '—';
  const p = ((v - base) / Math.abs(base)) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(0) + '%';
}
function fmtMx(v, base) {
  if (!base || base === 0) return '—';
  return (v / base).toFixed(2) + '×';
}
function fmtA(a) {
  return a >= 10000
    ? (a / 10000).toFixed(2) + ' Ha'
    : a.toLocaleString('en-IN', {maximumFractionDigits:0}) + ' sqm';
}

const DEF_CTRL = {
  sopcCurRate:1018, sopcRevRate:1200,
  pgVals:[6000,4000,4000,3000],
  pgAcqPsqm:[400,300,250,200],
  slabBounds:[1000,10000,100000],
  slabPcts:[100,90,70,50],
  slabUF:[90,85,70,35],
  freshPct:6,
  escType:'20pct3yr', escPct:20, escPeriod:3, wpiRate:6,
  blockPct:50, blockYrs:15, numBlocks:3,
  reclPct:20, rebateYrs:10, rebateDiscount:50,
  holdoverOn:false, penaltyMult:3,
  irrHorizon:30, residualPct:100,
};

// ═══════════════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════════════
const INP  = {border:'0.5px solid #d1d5db',borderRadius:4,padding:'3px 7px',fontSize:11,background:'#fff',color:'#111',width:80};
const SEL  = {border:'0.5px solid #d1d5db',borderRadius:4,padding:'3px 6px',fontSize:11,background:'#fff',color:'#111'};
const TH   = {fontSize:10,fontWeight:600,color:'#6b7280',padding:'5px 6px',textAlign:'left',background:'#f9fafb',borderBottom:'0.5px solid #e5e7eb',whiteSpace:'nowrap'};
const TD   = {fontSize:11,padding:'4px 6px',borderBottom:'0.5px solid #f3f4f6',verticalAlign:'middle'};
function btnStyle(active, col) {
  return {fontSize:11,padding:'4px 12px',borderRadius:4,cursor:'pointer',border:'none',
    background: active ? (col || '#1e40af') : '#f3f4f6',
    color: active ? '#fff' : '#374151',
    fontWeight: active ? 600 : 400};
}
function badgeStyle(color, bg) {
  return {fontSize:9,padding:'2px 6px',borderRadius:10,background:bg,color,fontWeight:600,display:'inline-block'};
}

// ═══════════════════════════════════════════════════════════════════
// PLOT EDITOR MODAL
// ═══════════════════════════════════════════════════════════════════
function PlotEditor({ plot, onSave, onDelete, onClose, isNew, saving }) {
  const [f, setF] = useState(Object.assign({}, plot));

  function updStr(k) {
    return function(e) { setF(function(p) { return Object.assign({}, p, {[k]: e.target.value}); }); };
  }
  function updNum(k) {
    return function(e) {
      const v = e.target.value === '' ? null : +e.target.value;
      setF(function(p) { return Object.assign({}, p, {[k]: v}); });
    };
  }
  function updPort(e) {
    const port = e.target.value;
    const portIdx = PORT_NAMES.indexOf(port);
    const pgIdx = PG_IDX[port] !== undefined ? PG_IDX[port] : 0;
    setF(function(p) { return Object.assign({}, p, {port, portIdx, pgIdx}); });
  }

  return (
    <div
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}
    >
      <div style={{background:'#fff',borderRadius:12,padding:'1.25rem',width:430,maxHeight:'88vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontWeight:700,fontSize:13,color:'#111'}}>{isNew ? '+ Add New Plot' : 'Edit Plot'}</span>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#9ca3af'}}>×</button>
        </div>

        {[
          ['Lessee / Plot Name', <input key="name" style={Object.assign({},INP,{width:220})} type="text" value={f.name} onChange={updStr('name')}/>],
          ['Port', <select key="port" style={SEL} value={f.port} onChange={updPort}>{PORT_NAMES.map(function(p){return <option key={p}>{p}</option>;})}</select>],
          ['Land Type', <select key="lt" style={SEL} value={f.landType} onChange={updStr('landType')}>
            <option value="sopc">SoPC (Ordinary)</option>
            <option value="lpa">LPA (Firm / Greenfield)</option>
            <option value="reclaimed_pre2018">Reclaimed Land Pre-2018</option>
            <option value="reclaimed_post2018">Reclaimed Land Post-2018</option>
          </select>],
          ['Area (sqm)', <input key="area" style={INP} type="number" value={f.area} onChange={updNum('area')}/>],
          ['Current Rent (₹/yr)', <input key="cr" style={Object.assign({},INP,{width:130})} type="number" value={f.currentRent} onChange={updNum('currentRent')}/>],
          ['Lease Start Year', <input key="ls" style={INP} type="number" value={f.leaseStart} onChange={updNum('leaseStart')}/>],
          ['Lease Term (yrs)', <input key="lt2" style={INP} type="number" value={f.leaseTerm} onChange={updNum('leaseTerm')}/>],
          ['Acquisition Cost (₹ Cr)', <input key="ac" style={INP} type="number" value={f.acqCr || ''} onChange={updNum('acqCr')}/>],
          ['Indiv. Jantri Val (₹/sqm)', <input key="iv" style={INP} type="number" placeholder="group default" value={f.indivVal || ''} onChange={updNum('indivVal')}/>],
          ['Hist. Acq. Cost (₹/sqm)', <input key="av" style={INP} type="number" placeholder="group default" value={f.acqValPsqm || ''} onChange={updNum('acqValPsqm')}/>],
          ['Notes', <input key="no" style={Object.assign({},INP,{width:220})} type="text" value={f.notes} onChange={updStr('notes')}/>],
        ].map(function(pair) {
          return (
            <div key={pair[0]} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{fontSize:11,color:'#6b7280',minWidth:135,flexShrink:0}}>{pair[0]}</span>
              {pair[1]}
            </div>
          );
        })}
        {(f.landType === 'reclaimed_pre2018' || f.landType === 'reclaimed_post2018') && (
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <span style={{fontSize:11,color:'#6b7280',minWidth:135}}>Reclamation Year</span>
            <input style={INP} type="number" value={f.recYear || ''} onChange={updNum('recYear')}/>
          </div>
        )}

        <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:14,paddingTop:10,borderTop:'0.5px solid #e5e7eb'}}>
          {!isNew && (
            <button onClick={function() { if (window.confirm('Delete this plot?')) onDelete(plot.id); }} style={Object.assign({},btnStyle(false),{color:'#dc2626'})} disabled={saving}>Delete</button>
          )}
          <button onClick={onClose} style={btnStyle(false)} disabled={saving}>Cancel</button>
          <button onClick={function() { onSave(Object.assign({}, f, {id: plot.id})); }} style={btnStyle(true,'#1e40af')} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROW DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════
function RowDetail({ row, onClose, onEdit }) {
  const p = row.p;
  const existing = row.existing;
  const rents = row.rents;
  const irrs = row.irrs;
  const tm = TYPE_META[p.landType] || TYPE_META.sopc;
  const sm = STATUS_META[p.status] || STATUS_META.active;

  return (
    <div
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:999,display:'flex',alignItems:'flex-start',justifyContent:'flex-end'}}
    >
      <div style={{background:'#fff',width:500,height:'100%',overflowY:'auto',padding:'1.25rem',boxShadow:'-10px 0 40px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
          <div>
            <p style={{fontWeight:700,fontSize:13,margin:0,color:'#111'}}>{p.name}</p>
            <p style={{fontSize:11,color:'#6b7280',margin:'3px 0 0'}}>{p.port} &nbsp;·&nbsp; {fmtA(p.area)} &nbsp;·&nbsp;
              <span style={badgeStyle(tm.color, tm.bg)}>{tm.label}</span>
              &nbsp;<span style={badgeStyle(sm.color, sm.bg)}>{sm.label}</span>
            </p>
          </div>
          <div style={{display:'flex',gap:5}}>
            <button onClick={onEdit} style={btnStyle(true,'#6d28d9')}>Edit</button>
            <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#9ca3af'}}>×</button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:12}}>
          {[
            ['Lease Start',   p.leaseStart],
            ['Lease Expiry',  p.expiry],
            ['Years Left',    p.yearsLeft > 0 ? p.yearsLeft : 'Expired'],
            ['Acq. Cost',     p.acqCr ? '₹' + p.acqCr + ' Cr' : '—'],
            ['Jantri Val',    row.pv ? '₹' + row.pv.toLocaleString('en-IN') + '/sqm' : '—'],
            ['Existing Rent', fmtCr(existing)],
          ].map(function(item) {
            return (
              <div key={item[0]} style={{background:'#f9fafb',borderRadius:6,padding:'6px 8px'}}>
                <p style={{fontSize:9,color:'#9ca3af',margin:0}}>{item[0]}</p>
                <p style={{fontSize:11,fontWeight:500,margin:'2px 0 0',color:'#111'}}>{item[1]}</p>
              </div>
            );
          })}
        </div>

        <p style={{fontSize:11,fontWeight:700,color:'#374151',marginBottom:6}}>Impact across all 8 scenarios</p>
        <p style={{fontSize:10,color:'#6b7280',marginBottom:8}}>
          IRR(Actual) = return on GMB's real acquisition spend &nbsp;|&nbsp;
          IRR(Revalued) = return on today's Jantri value
        </p>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
            <thead>
              <tr>
                {['Scenario','Proposed Rent','₹ Change','% Change','Times','IRR (Actual)','IRR (Revalued)'].map(function(h) {
                  return <th key={h} style={Object.assign({},TH,{textAlign: h==='Scenario'?'left':'right'})}>{h}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {SCEN_KEYS.map(function(k) {
                const sm2 = SCEN_META[k];
                const r   = rents[k];
                const ir  = irrs[k];
                const diff = r - existing;
                const isPos = diff >= 0;
                return (
                  <tr key={k} style={{background:'#fff'}}>
                    <td style={TD}><span style={badgeStyle(sm2.color, sm2.bg)}>{sm2.short}</span></td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{fmtCr(r)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',color:isPos?'#065f46':'#991b1b',fontWeight:600})}>
                      {diff >= 0 ? '+' : ''}{fmtCr(Math.abs(diff))}
                    </td>
                    <td style={Object.assign({},TD,{textAlign:'right',color:isPos?'#065f46':'#991b1b',fontWeight:700})}>{fmtChg(r,existing)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',color:'#374151'})}>{fmtMx(r,existing)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:ir&&ir.actual>0.08?'#065f46':'#92400e'})}>{fmtPct(ir ? ir.actual : null)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:ir&&ir.rev>0.04?'#065f46':'#6b7280'})}>{fmtPct(ir ? ir.rev : null)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {p.acqCr === 0 && (
          <p style={{fontSize:10,color:'#9ca3af',marginTop:8}}>
            IRR(Actual) uses port-group historical cost (₹{row.acqPsqm}/sqm). Enter individual Acquisition Cost in Edit for precise IRR.
          </p>
        )}
        {p.notes && <p style={{fontSize:10,color:'#6b7280',marginTop:8}}>Note: {p.notes}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTROL PANEL
// ═══════════════════════════════════════════════════════════════════
function CPSection({ label, open, onToggle, children }) {
  return (
    <div style={{borderBottom:'0.5px solid #f3f4f6'}}>
      <button
        onClick={onToggle}
        style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',
          padding:'7px 10px',background:open?'#eff6ff':'transparent',border:'none',
          cursor:'pointer',fontSize:11,fontWeight:600,color:'#1e40af',textAlign:'left'}}
      >
        <span>{label}</span>
        <span style={{fontSize:9,color:'#9ca3af'}}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{padding:'8px 10px 12px'}}>{children}</div>}
    </div>
  );
}

function CPRow({ label, children }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
      <span style={{fontSize:10,color:'#6b7280',flex:1}}>{label}</span>
      <div style={{flexShrink:0}}>{children}</div>
    </div>
  );
}

function SliderNum({ val, min, max, step, color, onChange }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:4}}>
      <input type="range" min={min} max={max} step={step||1} value={val}
        onChange={function(e){onChange(+e.target.value);}}
        style={{width:80, accentColor: color||'#1e40af'}}/>
      <span style={{fontSize:10,fontWeight:700,minWidth:36,textAlign:'right'}}>{val}</span>
    </div>
  );
}

function ControlPanel({ c, setC }) {
  const [open, setOpen] = useState({rates:true,pvals:false,slab:false,fresh:true,esc:true,opt6:true,recl:true,hold:false,irr:false});
  function tog(k) { setOpen(function(o) { return Object.assign({},o,{[k]:!o[k]}); }); }
  function upd(k) { return function(v) { setC(function(p) { return Object.assign({},p,{[k]:v}); }); }; }
  function updArr(k, i) {
    return function(v) {
      setC(function(p) {
        const a = p[k].slice();
        a[i] = +v;
        return Object.assign({},p,{[k]:a});
      });
    };
  }

  const annG = getAnnGrowth(c);

  return (
    <div style={{background:'#fff',border:'0.5px solid #e5e7eb',borderRadius:8,overflow:'hidden',fontSize:11}}>
      <div style={{background:'#1e3a8a',padding:'8px 10px'}}>
        <p style={{color:'#fff',fontSize:12,fontWeight:700,margin:0}}>⚙️ Control Panel</p>
        <p style={{color:'#93c5fd',fontSize:9,margin:'2px 0 0'}}>All changes update live</p>
      </div>

      <CPSection label="A — SoPC Rates" open={open.rates} onToggle={function(){tog('rates');}}>
        <CPRow label="SoPC Current (₹/10sqm)">
          <input type="number" style={INP} value={c.sopcCurRate} onChange={function(e){upd('sopcCurRate')(+e.target.value);}}/>
        </CPRow>
        <CPRow label="SoPC Revised (₹/10sqm)">
          <input type="number" style={INP} value={c.sopcRevRate} onChange={function(e){upd('sopcRevRate')(+e.target.value);}}/>
        </CPRow>
        <p style={{fontSize:9,color:'#9ca3af',margin:'4px 0 0'}}>Current: ₹{(c.sopcCurRate/10).toFixed(1)}/sqm/yr &nbsp;|&nbsp; Revised: ₹{(c.sopcRevRate/10).toFixed(1)}/sqm/yr</p>
      </CPSection>

      <CPSection label="B — Port Valuations (₹/sqm)" open={open.pvals} onToggle={function(){tog('pvals');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>Group Jantri (Opt 1,2) — individual plot override via Edit</p>
        {PG_NAMES.map(function(g,i) {
          return <CPRow key={g} label={g}><input type="number" style={INP} value={c.pgVals[i]} onChange={function(e){updArr('pgVals',i)(+e.target.value);}}/></CPRow>;
        })}
        <p style={{fontSize:9,color:'#6b7280',margin:'8px 0 4px'}}>Historical Acq. Cost ₹/sqm (for IRR-Actual):</p>
        {PG_NAMES.map(function(g,i) {
          return <CPRow key={g+'a'} label={g}><input type="number" style={INP} value={c.pgAcqPsqm[i]} onChange={function(e){updArr('pgAcqPsqm',i)(+e.target.value);}}/></CPRow>;
        })}
      </CPSection>

      <CPSection label="C — Slab Configuration" open={open.slab} onToggle={function(){tog('slab');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>Applies to Opt 1 and Opt 2 for all land types</p>
        {[0,1,2].map(function(i){
          return (
            <CPRow key={i} label={'Slab ' + ['I→II','II→III','III→IV'][i] + ' boundary (sqm)'}>
              <input type="number" style={INP} value={c.slabBounds[i]} onChange={function(e){updArr('slabBounds',i)(+e.target.value);}}/>
            </CPRow>
          );
        })}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}>
          {['I','II','III','IV'].map(function(l,i){
            const bg = ['#dbeafe','#d1fae5','#fef3c7','#fee2e2'][i];
            const ac = ['#1e40af','#065f46','#92400e','#991b1b'][i];
            return (
              <div key={l} style={{background:bg,borderRadius:6,padding:'6px 8px'}}>
                <p style={{fontSize:9,color:'#374151',margin:'0 0 4px',fontWeight:700}}>Slab {l}</p>
                <div style={{marginBottom:3}}>
                  <span style={{fontSize:9,color:'#6b7280'}}>Rent %</span>
                  <SliderNum val={c.slabPcts[i]} min={0} max={150} step={5} color={ac} onChange={updArr('slabPcts',i)}/>
                </div>
                <div>
                  <span style={{fontSize:9,color:'#6b7280'}}>Util %</span>
                  <SliderNum val={c.slabUF[i]} min={10} max={100} step={5} color="#888" onChange={updArr('slabUF',i)}/>
                </div>
              </div>
            );
          })}
        </div>
      </CPSection>

      <CPSection label="D — Fresh Valuation % (Opt 1 & 2)" open={open.fresh} onToggle={function(){tog('fresh');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>One selection drives both columns simultaneously</p>
        <div style={{display:'flex',gap:6,marginBottom:6}}>
          {[1.5,6,10].map(function(v){
            return <button key={v} onClick={function(){upd('freshPct')(v);}} style={Object.assign({},btnStyle(c.freshPct===v,'#6d28d9'),{flex:1})}>{v}%</button>;
          })}
        </div>
        <p style={{fontSize:9,color:'#9ca3af'}}>Opt 1 = Val × {c.freshPct}% × slab × util &nbsp;|&nbsp; Opt 2 = Val × 40% × {c.freshPct}% × slab × util</p>
      </CPSection>

      <CPSection label="E — Escalation (Opt 3–6)" open={open.esc} onToggle={function(){tog('esc');}}>
        <div style={{display:'flex',gap:4,marginBottom:8,flexWrap:'wrap'}}>
          {[['10pct3yr','10%/3yr'],['20pct3yr','20%/3yr'],['wpi','WPI%'],['custom','Custom']].map(function(pair){
            return <button key={pair[0]} onClick={function(){upd('escType')(pair[0]);}} style={Object.assign({},btnStyle(c.escType===pair[0],'#065f46'),{fontSize:10,padding:'3px 8px'})}>{pair[1]}</button>;
          })}
        </div>
        {c.escType === 'wpi' && (
          <CPRow label="WPI Rate (%)">
            <input type="number" style={INP} value={c.wpiRate} step={0.5} onChange={function(e){upd('wpiRate')(+e.target.value);}}/>
          </CPRow>
        )}
        {c.escType === 'custom' && (
          <div>
            <CPRow label="Escalation (%)">
              <input type="number" style={INP} value={c.escPct} onChange={function(e){upd('escPct')(+e.target.value);}}/>
            </CPRow>
            <CPRow label="Every N years">
              <input type="number" style={INP} value={c.escPeriod} min={1} max={10} onChange={function(e){upd('escPeriod')(+e.target.value);}}/>
            </CPRow>
          </div>
        )}
        <p style={{fontSize:9,color:'#9ca3af',marginTop:4}}>Annual equivalent: {(annG * 100).toFixed(2)}% p.a.</p>
      </CPSection>

      <CPSection label="F — Option 6 Block Settings" open={open.opt6} onToggle={function(){tog('opt6');}}>
        <CPRow label="Block step-up %">
          <SliderNum val={c.blockPct} min={10} max={150} step={5} color="#14532d" onChange={upd('blockPct')}/>
        </CPRow>
        <CPRow label="Block duration (yrs)">
          <input type="number" style={INP} value={c.blockYrs} min={5} max={30} onChange={function(e){upd('blockYrs')(+e.target.value);}}/>
        </CPRow>
        <CPRow label="Number of blocks">
          <input type="number" style={INP} value={c.numBlocks} min={1} max={5} onChange={function(e){upd('numBlocks')(+e.target.value);}}/>
        </CPRow>
        <p style={{fontSize:9,color:'#9ca3af',marginTop:4}}>Post-term coverage: {c.blockYrs * c.numBlocks} yrs &nbsp;|&nbsp; Total tenure: {30 + c.blockYrs * c.numBlocks} yrs</p>
      </CPSection>

      <CPSection label="G — Reclaimed Land" open={open.recl} onToggle={function(){tog('recl');}}>
        <CPRow label="% of firm land rent">
          <SliderNum val={c.reclPct} min={0} max={100} step={5} color="#92400e" onChange={upd('reclPct')}/>
        </CPRow>
        <CPRow label="Rebate period (yrs)">
          <SliderNum val={c.rebateYrs} min={0} max={20} step={1} color="#888" onChange={upd('rebateYrs')}/>
        </CPRow>
        <CPRow label="Rebate sub-discount %">
          <SliderNum val={c.rebateDiscount} min={0} max={100} step={10} color="#888" onChange={upd('rebateDiscount')}/>
        </CPRow>
        <p style={{fontSize:9,color:'#9ca3af',marginTop:4}}>
          Pre-2018 base: ₹1/Ha &nbsp;|&nbsp; Post-2018: ₹1,000/Ha<br/>
          After rebate: {c.reclPct}% of firm land rent<br/>
          During rebate: {(c.reclPct * c.rebateDiscount / 100).toFixed(1)}% of firm land rent
        </p>
      </CPSection>

      <CPSection label="H — Holdover / Penalty" open={open.hold} onToggle={function(){tog('hold');}}>
        <label style={{fontSize:11,color:'#374151',display:'flex',alignItems:'center',gap:6,cursor:'pointer',marginBottom:6}}>
          <input type="checkbox" checked={c.holdoverOn} onChange={function(e){upd('holdoverOn')(e.target.checked);}}/>
          Apply holdover penalty to expired leases
        </label>
        {c.holdoverOn && (
          <div>
            <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>As per LMR — expired leases show penalised rent in Existing column</p>
            <CPRow label="Penalty multiplier">
              <SliderNum val={c.penaltyMult} min={1} max={6} step={0.5} color="#991b1b" onChange={upd('penaltyMult')}/>
            </CPRow>
          </div>
        )}
      </CPSection>

      <CPSection label="I — IRR Settings" open={open.irr} onToggle={function(){tog('irr');}}>
        <CPRow label="Horizon (years)">
          <input type="number" style={INP} value={c.irrHorizon} min={5} max={75} onChange={function(e){upd('irrHorizon')(+e.target.value);}}/>
        </CPRow>
        <CPRow label="Residual val at horizon">
          <SliderNum val={c.residualPct} min={0} max={300} step={10} color="#1e40af" onChange={upd('residualPct')}/>
        </CPRow>
        <p style={{fontSize:9,color:'#9ca3af',marginTop:4}}>
          IRR(Actual) = GMB's return on actual land purchase cost<br/>
          IRR(Revalued) = return if acquired at today's Jantri value
        </p>
      </CPSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [ctrl,   setCtrl]  = useState(DEF_CTRL);
  const [plots,  setPlots] = useState([]);
  const [loading,setLoading]= useState(true);
  const [dbError,setDbError]= useState(null);
  const [saving, setSaving] = useState(false);
  const [editP,  setEditP] = useState(null);
  const [detail, setDetail]= useState(null);
  const [isNew,  setIsNew] = useState(false);
  const [search, setSearch]= useState('');
  const [filt,   setFilt]  = useState({land:'All',port:'All',status:'All',impact:'All'});
  const [sortK,  setSortK] = useState('impact');
  const [pg,     setPg]    = useState(0);
  const [cpOpen, setCpOpen]= useState(true);
  const PGS = 25;

  // ── LOAD FROM SUPABASE ON MOUNT ──────────────────────────────────
  useEffect(function() {
    sb.get('plots', 'order=id.asc')
      .then(function(rows) {
        setPlots(rows.map(dbToPlot));
        setLoading(false);
      })
      .catch(function(err) {
        setDbError(err.message);
        setLoading(false);
      });
  }, []);

  // ── COMPUTE ENGINE ──────────────────────────────────────────────
  const computed = useMemo(function() {
    const g = getAnnGrowth(ctrl);
    return plots.map(function(p) {
      const pv       = p.indivVal || ctrl.pgVals[p.pgIdx] || 3000;
      const acqPsqm  = p.acqValPsqm || ctrl.pgAcqPsqm[p.pgIdx] || 300;
      const invA     = p.acqCr > 0 ? p.acqCr * 1e7 : p.area * acqPsqm;
      const invR     = p.area * pv;
      const slFact   = margF(p.area, ctrl.slabBounds, ctrl.slabPcts) / 100;
      const uf       = ctrl.slabUF[slabI(p.area, ctrl.slabBounds)] / 100;
      const expiry   = (p.leaseStart || CY) + (p.leaseTerm || 30);
      const yearsLeft= expiry - CY;
      const status   = yearsLeft > 5 ? 'active' : yearsLeft > 0 ? 'expiring' : 'expired';
      const isRec    = p.landType === 'reclaimed_pre2018' || p.landType === 'reclaimed_post2018';
      const reclF    = isRec ? ctrl.reclPct / 100 : 1;
      const rebateOn = isRec && p.recYear && (CY - p.recYear) < ctrl.rebateYrs;
      const effReclF = rebateOn ? reclF * (ctrl.rebateDiscount / 100) : reclF;

      const baseExist= p.currentRent;
      const existing = (ctrl.holdoverOn && status === 'expired') ? baseExist * ctrl.penaltyMult : baseExist;

      function firmRent(k) {
        if (k === 'sopc_cur') return (p.area / 10) * ctrl.sopcCurRate;
        if (k === 'sopc_rev') return (p.area / 10) * ctrl.sopcRevRate;
        if (k === 'opt1')     return p.area * pv * (ctrl.freshPct / 100) * slFact * uf;
        if (k === 'opt2')     return p.area * pv * 0.40 * (ctrl.freshPct / 100) * slFact * uf;
        if (k === 'opt3')     return baseExist;
        if (k === 'opt4')     return baseExist * (1 + ctrl.wpiRate / 100);
        if (k === 'opt5')     return baseExist * 1.5;
        if (k === 'opt6')     return baseExist * (1 + ctrl.blockPct / 100);
        return baseExist;
      }

      const rents = {};
      SCEN_KEYS.forEach(function(k) { rents[k] = firmRent(k) * effReclF; });

      const resA = invA * (ctrl.residualPct / 100);
      const resR = invR * (ctrl.residualPct / 100);
      const irrs = {};
      SCEN_KEYS.forEach(function(k) {
        const yr1  = rents[k];
        const cfsA = buildCFs(invA, yr1, g, ctrl.irrHorizon, resA, expiry, baseExist);
        const cfsR = buildCFs(invR, yr1, g, ctrl.irrHorizon, resR, expiry, baseExist);
        irrs[k] = { actual: cfsA ? calcIRR(cfsA) : null, rev: cfsR ? calcIRR(cfsR) : null };
      });

      return { p: Object.assign({}, p, {status, expiry, yearsLeft}), pv, acqPsqm, existing, rents, irrs, isRec, effReclF };
    });
  }, [plots, ctrl]);

  // ── REVENUE BIFURCATION ──────────────────────────────────────────
  const bifurc = useMemo(function() {
    const types = ['sopc','lpa','reclaimed_pre2018','reclaimed_post2018'];
    const result = {};
    types.forEach(function(t) {
      const rows = computed.filter(function(r) { return r.p.landType === t; });
      const totE = rows.reduce(function(s,r) { return s + r.existing; }, 0);
      const entry = { existing: totE, count: rows.length };
      SCEN_KEYS.forEach(function(k) { entry[k] = rows.reduce(function(s,r) { return s + r.rents[k]; }, 0); });
      result[t] = entry;
    });
    const totE2 = computed.reduce(function(s,r) { return s + r.existing; }, 0);
    const tot = { existing: totE2, count: computed.length };
    SCEN_KEYS.forEach(function(k) { tot[k] = computed.reduce(function(s,r) { return s + r.rents[k]; }, 0); });
    result.total = tot;
    return result;
  }, [computed]);

  // ── FILTER + SORT ────────────────────────────────────────────────
  const filtered = useMemo(function() {
    let arr = computed;
    if (filt.land !== 'All')    arr = arr.filter(function(r) { return r.p.landType === filt.land; });
    if (filt.port !== 'All')    arr = arr.filter(function(r) { return r.p.port === filt.port; });
    if (filt.status !== 'All')  arr = arr.filter(function(r) { return r.p.status === filt.status; });
    if (filt.impact === 'Higher') arr = arr.filter(function(r) { return r.rents.opt6 > r.existing + 1; });
    if (filt.impact === 'Lower')  arr = arr.filter(function(r) { return r.rents.opt6 < r.existing - 1; });
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(function(r) { return r.p.name.toLowerCase().includes(q) || r.p.port.toLowerCase().includes(q); });
    }
    if (sortK === 'impact')        arr = arr.slice().sort(function(a,b) { return Math.abs(b.rents.opt6-b.existing) - Math.abs(a.rents.opt6-a.existing); });
    else if (sortK === 'area')     arr = arr.slice().sort(function(a,b) { return b.p.area - a.p.area; });
    else if (sortK === 'existing') arr = arr.slice().sort(function(a,b) { return b.existing - a.existing; });
    else if (sortK === 'expiry')   arr = arr.slice().sort(function(a,b) { return a.p.yearsLeft - b.p.yearsLeft; });
    return arr;
  }, [computed, filt, search, sortK]);

  const paged   = filtered.slice(pg * PGS, (pg + 1) * PGS);
  const totalPg = Math.ceil(filtered.length / PGS);

  // ── CRUD — now persisted to Supabase ────────────────────────────
  const savePlot = useCallback(async function(p) {
    setSaving(true);
    try {
      if (isNew) {
        // Generate next id (max existing + 1)
        const nextId = plots.reduce(function(m, x) { return Math.max(m, x.id); }, 0) + 1;
        const dbRow = Object.assign({ id: nextId }, plotToDb(p));
        const [inserted] = await sb.insert('plots', dbRow);
        setPlots(function(ps) { return ps.concat([dbToPlot(inserted)]); });
      } else {
        const [updated] = await sb.update('plots', p.id, plotToDb(p));
        setPlots(function(ps) { return ps.map(function(x) { return x.id === p.id ? dbToPlot(updated) : x; }); });
      }
      setEditP(null); setIsNew(false);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [isNew, plots]);

  const delPlot = useCallback(async function(id) {
    setSaving(true);
    try {
      await sb.delete('plots', id);
      setPlots(function(ps) { return ps.filter(function(x) { return x.id !== id; }); });
      setEditP(null); setIsNew(false);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, []);

  function openAdd() {
    setIsNew(true);
    setEditP({id:-1,name:'',port:'Veraval',portIdx:10,pgIdx:3,landType:'sopc',area:500,currentRent:5090,leaseStart:2022,leaseTerm:5,acqCr:0,indivVal:null,acqValPsqm:null,recYear:null,notes:''});
  }

  // ── LOADING / ERROR STATES ───────────────────────────────────────
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:12,background:'#f8fafc'}}>
      <div style={{width:36,height:36,border:'3px solid #dbeafe',borderTop:'3px solid #1e40af',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <p style={{color:'#1e40af',fontWeight:600,fontSize:13}}>Loading plots from database…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (dbError) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:12,background:'#fff5f5',padding:24}}>
      <p style={{fontSize:24}}>⚠️</p>
      <p style={{color:'#991b1b',fontWeight:700,fontSize:14}}>Database connection failed</p>
      <p style={{color:'#6b7280',fontSize:12,maxWidth:480,textAlign:'center'}}>
        Check that <strong>SUPABASE_URL</strong> and <strong>SUPABASE_ANON</strong> are set correctly at the top of the file.
      </p>
      <pre style={{background:'#fee2e2',padding:'8px 14px',borderRadius:6,fontSize:11,color:'#991b1b',maxWidth:600,overflowX:'auto'}}>{dbError}</pre>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div style={{background:'#f8fafc',minHeight:'100vh',fontFamily:'system-ui,sans-serif'}}>

      {/* HEADER */}
      <div style={{background:'#1e3a8a',padding:'8px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <p style={{color:'#fff',fontSize:13,fontWeight:700,margin:0}}>GMB Land Policy — Revenue Impact Dashboard</p>
          <p style={{color:'#93c5fd',fontSize:10,margin:'2px 0 0'}}>{plots.length} plots · 4 land categories · 8 scenarios · Live IRR · ☁️ Supabase</p>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={function(){setCpOpen(function(o){return !o;});}} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'rgba(255,255,255,0.15)',color:'#fff',border:'1px solid rgba(255,255,255,0.3)',fontWeight:400}}>
            {cpOpen ? 'Hide Panel' : 'Show Panel'}
          </button>
          <button onClick={openAdd} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'#22c55e',color:'#fff',border:'none',fontWeight:600}}>
            + Add Plot
          </button>
        </div>
      </div>

      <div style={{display:'flex',gap:10,padding:'10px 12px',alignItems:'flex-start'}}>

        {/* CONTROL PANEL */}
        {cpOpen && (
          <div style={{width:260,flexShrink:0}}>
            <ControlPanel c={ctrl} setC={setCtrl}/>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{flex:1,minWidth:0}}>

          {/* REVENUE BIFURCATION */}
          <div style={{background:'#fff',border:'0.5px solid #e5e7eb',borderRadius:8,padding:'0.75rem',marginBottom:8}}>
            <p style={{fontSize:11,fontWeight:700,margin:'0 0 8px',color:'#374151'}}>📊 Annual Revenue — All Land Types × All Scenarios (₹ Crore)</p>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
                <thead>
                  <tr>
                    <th style={Object.assign({},TH,{minWidth:110})}>Land Type</th>
                    <th style={Object.assign({},TH,{minWidth:36,textAlign:'right'})}>Plots</th>
                    <th style={Object.assign({},TH,{minWidth:70,textAlign:'right',background:'#dbeafe',color:'#1e40af'})}>Existing ₹</th>
                    {SCEN_KEYS.map(function(k) {
                      return <th key={k} style={Object.assign({},TH,{minWidth:60,textAlign:'right',background:SCEN_META[k].bg,color:SCEN_META[k].color})}>{SCEN_META[k].short}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {['sopc','lpa','reclaimed_pre2018','reclaimed_post2018','total'].map(function(t,ti) {
                    const d = bifurc[t];
                    if (!d) return null;
                    const isTotal = t === 'total';
                    const rowBg = isTotal ? '#f0f9ff' : ti % 2 === 0 ? '#fafafa' : '#fff';
                    const tm = TYPE_META[t];
                    return (
                      <tr key={t} style={{background:rowBg,fontWeight:isTotal?700:400}}>
                        <td style={Object.assign({},TD,{fontWeight:isTotal?700:500})}>
                          {tm ? <span style={badgeStyle(tm.color,tm.bg)}>{TYPE_LABELS[t]}</span> : <strong>{TYPE_LABELS[t]}</strong>}
                        </td>
                        <td style={Object.assign({},TD,{textAlign:'right',color:'#9ca3af'})}>{d.count}</td>
                        <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',background:'#eff6ff',fontWeight:isTotal?700:500})}>{fmtCr(d.existing)}</td>
                        {SCEN_KEYS.map(function(k) {
                          const diff = d[k] - d.existing;
                          const isPos = diff >= 0;
                          return (
                            <td key={k} style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',background:SCEN_META[k].bg+'44'})}>
                              <div>{fmtCr(d[k])}</div>
                              {!isTotal && <div style={{fontSize:8,color:isPos?'#065f46':'#991b1b'}}>{fmtChg(d[k],d.existing)}</div>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* FILTER BAR */}
          <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap',alignItems:'center',background:'#fff',border:'0.5px solid #e5e7eb',borderRadius:8,padding:'6px 10px'}}>
            <input type="text" placeholder="🔍 Search lessee or port…" value={search}
              onChange={function(e){setSearch(e.target.value);setPg(0);}}
              style={Object.assign({},INP,{width:170})}/>
            <select style={SEL} value={filt.land} onChange={function(e){setFilt(function(f){return Object.assign({},f,{land:e.target.value});});setPg(0);}}>
              <option value="All">All types</option>
              <option value="sopc">SoPC</option><option value="lpa">LPA</option>
              <option value="reclaimed_pre2018">Rec&lt;2018</option><option value="reclaimed_post2018">Rec≥2018</option>
            </select>
            <select style={SEL} value={filt.port} onChange={function(e){setFilt(function(f){return Object.assign({},f,{port:e.target.value});});setPg(0);}}>
              <option value="All">All ports</option>
              {PORT_NAMES.map(function(p){return <option key={p}>{p}</option>;})}
            </select>
            <select style={SEL} value={filt.status} onChange={function(e){setFilt(function(f){return Object.assign({},f,{status:e.target.value});});setPg(0);}}>
              <option value="All">All status</option><option value="active">Active</option>
              <option value="expiring">Expiring</option><option value="expired">Expired</option>
            </select>
            <select style={SEL} value={filt.impact} onChange={function(e){setFilt(function(f){return Object.assign({},f,{impact:e.target.value});});setPg(0);}}>
              <option value="All">All impacts</option><option value="Higher">↑ Higher rent</option><option value="Lower">↓ Lower rent</option>
            </select>
            <select style={SEL} value={sortK} onChange={function(e){setSortK(e.target.value);}}>
              <option value="impact">Sort: Impact</option><option value="area">Sort: Area</option>
              <option value="existing">Sort: Existing Rent</option><option value="expiry">Sort: Expiry</option>
            </select>
            <span style={{fontSize:10,color:'#9ca3af',marginLeft:'auto'}}>{filtered.length} plots &nbsp;·&nbsp; Click row for full detail</span>
          </div>

          {/* COMPARISON MATRIX */}
          <div style={{background:'#fff',border:'0.5px solid #e5e7eb',borderRadius:8,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
                <thead>
                  <tr style={{background:'#f1f5f9'}}>
                    <th style={Object.assign({},TH,{minWidth:28,position:'sticky',left:0,zIndex:2})}>#</th>
                    <th style={Object.assign({},TH,{minWidth:145,position:'sticky',left:28,zIndex:2})}>Lessee / Plot</th>
                    <th style={Object.assign({},TH,{minWidth:60,position:'sticky',left:173,zIndex:2})}>Port</th>
                    <th style={Object.assign({},TH,{minWidth:56})}>Type</th>
                    <th style={Object.assign({},TH,{minWidth:72,textAlign:'right'})}>Area</th>
                    <th style={Object.assign({},TH,{minWidth:50,textAlign:'right'})}>Expiry</th>
                    <th style={Object.assign({},TH,{minWidth:52})}>Status</th>
                    <th style={Object.assign({},TH,{minWidth:72,textAlign:'right',background:'#dbeafe',color:'#1e40af',borderLeft:'2px solid #93c5fd'})}>Existing ₹</th>
                    {SCEN_KEYS.map(function(k) {
                      return (
                        <th key={k} colSpan={2} style={Object.assign({},TH,{minWidth:120,textAlign:'center',background:SCEN_META[k].bg,color:SCEN_META[k].color,borderLeft:'0.5px solid #e5e7eb'})}>
                          {SCEN_META[k].short}
                        </th>
                      );
                    })}
                  </tr>
                  <tr style={{background:'#f8fafc'}}>
                    <th style={Object.assign({},TH,{position:'sticky',left:0,zIndex:2})}/>
                    <th style={Object.assign({},TH,{position:'sticky',left:28,zIndex:2})}/>
                    <th style={Object.assign({},TH,{position:'sticky',left:173,zIndex:2})}/>
                    <th style={TH}/><th style={TH}/><th style={TH}/><th style={TH}/>
                    <th style={Object.assign({},TH,{background:'#eff6ff',borderLeft:'2px solid #93c5fd'})}/>
                    {SCEN_KEYS.map(function(k) {
                      return (
                        <Fragment key={k}>
                          <th style={Object.assign({},TH,{textAlign:'right',background:SCEN_META[k].bg+'55',borderLeft:'0.5px solid #e5e7eb',fontSize:9,minWidth:60})}>Rent</th>
                          <th style={Object.assign({},TH,{textAlign:'right',background:SCEN_META[k].bg+'55',fontSize:9,minWidth:54})}>% Chg</th>
                        </Fragment>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(function(row, ri) {
                    const p       = row.p;
                    const existing= row.existing;
                    const rents   = row.rents;
                    const tm      = TYPE_META[p.landType] || TYPE_META.sopc;
                    const sm      = STATUS_META[p.status] || STATUS_META.active;
                    const rowBg   = ri % 2 === 0 ? '#fff' : '#fafafa';
                    return (
                      <tr key={p.id}
                        style={{background:rowBg, cursor:'pointer'}}
                        onClick={function(){setDetail(row);}}
                        onMouseEnter={function(e){e.currentTarget.style.background='#f0f9ff';}}
                        onMouseLeave={function(e){e.currentTarget.style.background=rowBg;}}
                      >
                        <td style={Object.assign({},TD,{textAlign:'right',color:'#9ca3af',position:'sticky',left:0,background:rowBg})}>{pg*PGS+ri+1}</td>
                        <td style={Object.assign({},TD,{maxWidth:145,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',position:'sticky',left:28,background:rowBg,fontWeight:p.landType!=='sopc'?600:400})} title={p.name}>
                          <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                          {p.acqCr > 0 && <div style={{fontSize:8,color:'#9ca3af'}}>Acq ₹{p.acqCr}Cr</div>}
                        </td>
                        <td style={Object.assign({},TD,{color:'#6b7280',position:'sticky',left:173,background:rowBg})}>{p.port}</td>
                        <td style={TD}><span style={badgeStyle(tm.color,tm.bg)}>{tm.label}</span></td>
                        <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{fmtA(p.area)}</td>
                        <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{p.expiry}</td>
                        <td style={TD}><span style={badgeStyle(sm.color,sm.bg)}>{sm.label}</span></td>
                        <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',fontWeight:700,background:'#eff6ff',borderLeft:'2px solid #93c5fd',color:'#1e40af'})}>{fmtCr(existing)}</td>
                        {SCEN_KEYS.map(function(k) {
                          const r    = rents[k];
                          const diff = r - existing;
                          const isPos= diff >= 0;
                          return (
                            <Fragment key={k}>
                              <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',borderLeft:'0.5px solid #f0f0f0',background:SCEN_META[k].bg+'22'})}>{fmtCr(r)}</td>
                              <td style={Object.assign({},TD,{textAlign:'right',fontWeight:700,background:SCEN_META[k].bg+'22',color:isPos?'#065f46':'#991b1b'})}>{fmtChg(r,existing)}</td>
                            </Fragment>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,padding:'0 2px'}}>
            <span style={{fontSize:10,color:'#6b7280'}}>Page {pg+1} of {totalPg} &nbsp;·&nbsp; {filtered.length} plots</span>
            <div style={{display:'flex',gap:3}}>
              <button disabled={pg===0} onClick={function(){setPg(function(p){return p-1;});}} style={Object.assign({},btnStyle(false),{opacity:pg===0?0.3:1})}>← Prev</button>
              {Array.from({length:Math.min(totalPg,7)},function(_,i){return i + Math.max(0,pg-3);}).filter(function(i){return i<totalPg;}).map(function(i){
                return <button key={i} onClick={function(){setPg(i);}} style={btnStyle(i===pg,'#1e40af')}>{i+1}</button>;
              })}
              <button disabled={pg>=totalPg-1} onClick={function(){setPg(function(p){return p+1;});}} style={Object.assign({},btnStyle(false),{opacity:pg>=totalPg-1?0.3:1})}>Next →</button>
            </div>
            <span style={{fontSize:10,color:'#9ca3af'}}>Click any row → full IRR detail</span>
          </div>

          {/* LEGEND */}
          <div style={{background:'#f0f9ff',border:'0.5px solid #bfdbfe',borderRadius:6,padding:'8px 12px',marginTop:8,fontSize:10,color:'#1e40af',lineHeight:1.7}}>
            <strong>How to read:</strong> Blue column = current contractual rent (Existing). Each scenario shows proposed rent + % change. <span style={{color:'#065f46',fontWeight:600}}>Green</span> = rent goes up (GMB earns more). <span style={{color:'#991b1b',fontWeight:600}}>Red</span> = rent goes down or lessee gets relief. Click any row to see ₹ absolute change, times multiplier, IRR(Actual) and IRR(Revalued) for all 8 scenarios. Opt 6 ✓ = recommended policy.
          </div>
        </div>
      </div>

      {/* MODALS */}
      {editP && (
        <PlotEditor
          plot={editP}
          onSave={savePlot}
          onDelete={delPlot}
          onClose={function(){setEditP(null);setIsNew(false);}}
          isNew={isNew}
          saving={saving}
        />
      )}
      {detail && (
        <RowDetail
          row={detail}
          onClose={function(){setDetail(null);}}
          onEdit={function(){setEditP(detail.p);setDetail(null);}}
        />
      )}
    </div>
  );
}
