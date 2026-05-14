const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
let s = fs.readFileSync(appPath, 'utf8');

function replaceOnce(needle, replacement) {
  if (s.includes(replacement)) return;
  if (!s.includes(needle)) throw new Error('Reclaim patch target not found');
  s = s.replace(needle, replacement);
}

function regexOnce(pattern, replacement, marker) {
  if (marker && s.includes(marker)) return;
  if (!pattern.test(s)) throw new Error('Reclaim patch target not found');
  s = s.replace(pattern, replacement);
}

const modalCode = String.raw`
const RECLAIM_DEFAULT = {
  id: null,
  name: 'Hypothetical Reclamation',
  port: 'Dahej',
  reclaimType: 'private',
  area: 100000,
  regRate: 1200,
  reclCostCr: 50,
  startYear: 2025,
  projectionYears: 30,
  escalationPct: 6,
  special: false,
  specialPct: 50,
  specialYears: 10,
};

function newReclaimCase() {
  return Object.assign({}, RECLAIM_DEFAULT, { id: Date.now() });
}

function calcReclaimCase(c) {
  const area = +c.area || 0;
  const regRate = +c.regRate || 0;
  const cost = (+c.reclCostCr || 0) * 1e7;
  const years = Math.max(1, +c.projectionYears || 30);
  const startYear = +c.startYear || CY;
  const g = (+c.escalationPct || 0) / 100;
  const isPrivate = c.reclaimType === 'private';
  const isSpecial = !!c.special;
  const rebatePct = isSpecial ? ((+c.specialPct || 0) / 100) : (isPrivate ? 0.5 : 1);
  const maxRebateYears = isSpecial ? Math.max(0, +c.specialYears || 0) : (isPrivate ? 10 : 0);
  let cumulativeBenefit = 0;
  let recoveryYear = null;
  const rows = [];

  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    const fullRent = area * regRate * Math.pow(1 + g, i);
    const eligibleByYears = (isPrivate || isSpecial) ? i < maxRebateYears : false;
    const eligibleByCost = cost > 0 ? cumulativeBenefit < cost : eligibleByYears;
    const inRebate = eligibleByYears && eligibleByCost;
    const policyRent = inRebate ? fullRent * rebatePct : fullRent;
    const benefit = fullRent - policyRent;
    cumulativeBenefit += benefit;
    if (!recoveryYear && cost > 0 && cumulativeBenefit >= cost) recoveryYear = year;
    rows.push({ year, fullRent, policyRent, benefit, cumulativeBenefit, status: inRebate ? 'Rebate' : 'Full rent' });
  }

  const rebateRows = rows.filter(function(r){ return r.status === 'Rebate'; });
  const endReason = !isPrivate && !isSpecial ? 'No rebate applicable'
    : recoveryYear && rebateRows.length < maxRebateYears ? 'Cost recovery reached'
    : rebateRows.length >= maxRebateYears ? 'Maximum rebate period reached'
    : 'Projection ended before rebate closure';

  return {
    rows,
    policyTotal: rows.reduce(function(sum,r){ return sum + r.policyRent; }, 0),
    benefitTotal: rows.reduce(function(sum,r){ return sum + r.benefit; }, 0),
    recoveryYear,
    rebateEndYear: rebateRows.length ? rebateRows[rebateRows.length - 1].year : null,
    endReason,
    rule: isSpecial ? 'Special / exceptional project' : isPrivate ? 'Private developer reclamation' : c.reclaimType === 'gmb' ? 'GMB reclaimed land' : 'Natural reclaimed land',
    rateText: isSpecial ? ((rebatePct * 100).toFixed(0) + '% special rate') : isPrivate ? '50% of Regulation rent during rebate' : '100% of Regulation rent',
  };
}

function ReclaimNewModal({ cases, setCases, onClose }) {
  const first = cases && cases.length ? cases[0] : newReclaimCase();
  const [selectedId, setSelectedId] = useState(first.id);
  const [draft, setDraft] = useState(Object.assign({}, first));
  const result = calcReclaimCase(draft);
  const caseList = cases.some(function(c){ return c.id === draft.id; }) ? cases : cases.concat([draft]);

  function setField(k, v) { setDraft(function(p){ return Object.assign({}, p, { [k]: v }); }); }
  function selectCase(id) {
    const found = caseList.find(function(c){ return c.id === id; });
    if (found) { setSelectedId(id); setDraft(Object.assign({}, found)); }
  }
  function addCase() {
    const c = newReclaimCase();
    setSelectedId(c.id);
    setDraft(c);
  }
  function saveCase() {
    const clean = Object.assign({}, draft, {
      id: draft.id || Date.now(),
      area: +draft.area || 0,
      regRate: +draft.regRate || 0,
      reclCostCr: +draft.reclCostCr || 0,
      startYear: +draft.startYear || CY,
      projectionYears: +draft.projectionYears || 30,
      escalationPct: +draft.escalationPct || 0,
      specialPct: +draft.specialPct || 0,
      specialYears: +draft.specialYears || 0,
    });
    setCases(function(list){
      const exists = list.some(function(c){ return c.id === clean.id; });
      return exists ? list.map(function(c){ return c.id === clean.id ? clean : c; }) : list.concat([clean]);
    });
    setSelectedId(clean.id);
    setDraft(clean);
  }
  function deleteCase() {
    if (!draft.id || !window.confirm('Delete this hypothetical case?')) return;
    const remaining = cases.filter(function(c){ return c.id !== draft.id; });
    setCases(remaining);
    const next = remaining[0] || newReclaimCase();
    setSelectedId(next.id);
    setDraft(next);
  }
  function input(label, key, type, width) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
        <span style={{fontSize:11,color:'#6b7280',width:145,flexShrink:0}}>{label}</span>
        <input type={type || 'number'} style={Object.assign({},INP,{width:width || 110})}
          value={draft[key] === null || draft[key] === undefined ? '' : draft[key]}
          onChange={function(e){ setField(key, type === 'text' ? e.target.value : +e.target.value); }}/>
      </div>
    );
  }

  return (
    <div onClick={function(e){ if (e.target === e.currentTarget) onClose(); }}
      style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.55)',zIndex:1200,display:'flex',alignItems:'center',justifyContent:'center',padding:18}}>
      <div style={{background:'#fff',borderRadius:10,width:980,maxWidth:'96vw',maxHeight:'92vh',overflow:'hidden',boxShadow:'0 24px 70px rgba(15,23,42,0.32)',display:'flex',flexDirection:'column'}}>
        <div style={{background:'#1e3a8a',color:'#fff',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <p style={{fontSize:14,fontWeight:800,margin:0}}>Reclaim_new - Policy 2025 Hypothetical Calculator</p>
            <p style={{fontSize:10,color:'#bfdbfe',margin:'2px 0 0'}}>Saved separately from main dashboard revenue</p>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',color:'#fff',borderRadius:5,fontSize:18,cursor:'pointer',width:30,height:30}}>x</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'250px 1fr',minHeight:0,overflow:'hidden'}}>
          <div style={{borderRight:'1px solid #e5e7eb',padding:12,overflowY:'auto',background:'#f8fafc'}}>
            <button onClick={addCase} style={Object.assign({},btnS(true,'#0f766e'),{width:'100%',marginBottom:9})}>+ New hypothetical plot</button>
            {caseList.map(function(c){
              const active = c.id === selectedId;
              return (
                <button key={c.id} onClick={function(){selectCase(c.id);}}
                  style={{display:'block',width:'100%',textAlign:'left',background:active?'#dbeafe':'#fff',border:'1px solid '+(active?'#93c5fd':'#e5e7eb'),borderRadius:6,padding:'8px 9px',marginBottom:6,cursor:'pointer'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                  <div style={{fontSize:9,color:'#6b7280',marginTop:2}}>{c.port} - {fmtA(+c.area || 0)}</div>
                </button>
              );
            })}
            <div style={{fontSize:9,color:'#64748b',lineHeight:1.5,marginTop:8}}>Saved hypothetical cases do not enter the main plot list or dashboard revenue totals.</div>
          </div>

          <div style={{padding:14,overflowY:'auto'}}>
            <div style={{display:'grid',gridTemplateColumns:'330px 1fr',gap:14}}>
              <div>
                <p style={{fontSize:12,fontWeight:800,color:'#111',margin:'0 0 8px'}}>Inputs</p>
                {input('Project / developer name','name','text',170)}
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
                  <span style={{fontSize:11,color:'#6b7280',width:145,flexShrink:0}}>Port</span>
                  <select style={Object.assign({},SEL,{width:120})} value={draft.port} onChange={function(e){setField('port', e.target.value);}}>{PORT_NAMES.map(function(p){ return <option key={p}>{p}</option>; })}</select>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
                  <span style={{fontSize:11,color:'#6b7280',width:145,flexShrink:0}}>Reclamation type</span>
                  <select style={Object.assign({},SEL,{width:170})} value={draft.reclaimType} onChange={function(e){setField('reclaimType', e.target.value);}}>
                    <option value="private">Private developer</option>
                    <option value="gmb">GMB reclaimed</option>
                    <option value="natural">Natural reclamation</option>
                  </select>
                </div>
                {input('Area (sqm)','area','number')}
                {input('Regulation rent (Rs./sqm/yr)','regRate','number')}
                {input('Reclamation cost (Rs. Cr)','reclCostCr','number')}
                {input('Start year','startYear','number')}
                {input('Projection years','projectionYears','number')}
                {input('Escalation (% p.a.)','escalationPct','number')}
                <label style={{display:'flex',alignItems:'center',gap:7,fontSize:11,color:'#374151',margin:'8px 0',cursor:'pointer'}}>
                  <input type="checkbox" checked={!!draft.special} onChange={function(e){setField('special', e.target.checked);}}/>
                  Special / exceptional GoG-approved case
                </label>
                {draft.special && <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:6,padding:8,marginBottom:8}}>{input('Special rent %','specialPct','number')}{input('Special years','specialYears','number')}</div>}
                <div style={{display:'flex',justifyContent:'flex-end',gap:6,marginTop:10,paddingTop:10,borderTop:'1px solid #e5e7eb'}}>
                  <button onClick={deleteCase} style={Object.assign({},btnS(false),{color:'#dc2626'})}>Delete</button>
                  <button onClick={saveCase} style={btnS(true,'#1e40af')}>Save hypothetical</button>
                </div>
              </div>

              <div>
                <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,padding:10,marginBottom:10}}>
                  <p style={{fontSize:11,fontWeight:800,color:'#1e3a8a',margin:'0 0 5px'}}>Policy decision</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                    {[['Applicable rule',result.rule],['Rent rule',result.rateText],['Rebate end',result.rebateEndYear || 'Not applicable'],['Reason',result.endReason]].map(function(x){ return <div key={x[0]}><div style={{fontSize:9,color:'#64748b'}}>{x[0]}</div><div style={{fontSize:11,fontWeight:700,color:'#111'}}>{x[1]}</div></div>; })}
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:10}}>
                  {[['Year 1 full rent',fmtCr(result.rows[0] ? result.rows[0].fullRent : 0)],['Year 1 policy rent',fmtCr(result.rows[0] ? result.rows[0].policyRent : 0)],['Total rebate benefit',fmtCr(result.benefitTotal)],['Total GMB revenue',fmtCr(result.policyTotal)]].map(function(x){ return <div key={x[0]} style={{background:'#f8fafc',border:'1px solid #e5e7eb',borderRadius:7,padding:'8px 9px'}}><div style={{fontSize:9,color:'#64748b'}}>{x[0]}</div><div style={{fontSize:12,fontWeight:800,color:'#111',marginTop:2}}>{x[1]}</div></div>; })}
                </div>
                <div style={{border:'1px solid #e5e7eb',borderRadius:8,overflow:'hidden'}}>
                  <div style={{background:'#f8fafc',padding:'7px 9px',fontSize:11,fontWeight:800,color:'#374151'}}>Year-wise policy impact</div>
                  <div style={{overflowX:'auto',maxHeight:310,overflowY:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:10,minWidth:620}}>
                      <thead><tr>{['Year','Full Regulation','Policy Rent','Rebate Benefit','Cumulative','Status'].map(function(h){ return <th key={h} style={Object.assign({},TH,{textAlign:h==='Year'||h==='Status'?'left':'right',position:'sticky',top:0})}>{h}</th>; })}</tr></thead>
                      <tbody>{result.rows.map(function(r){ return <tr key={r.year} style={{background:r.status==='Rebate'?'#fffbeb':'#fff'}}><td style={TD}>{r.year}</td><td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{fmtCr(r.fullRent)}</td><td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',fontWeight:700,color:'#1e40af'})}>{fmtCr(r.policyRent)}</td><td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:r.benefit>0?'#92400e':'#9ca3af'})}>{fmtCr(r.benefit)}</td><td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{fmtCr(r.cumulativeBenefit)}</td><td style={TD}><span style={badge(r.status==='Rebate'?'#92400e':'#065f46',r.status==='Rebate'?'#fef3c7':'#d1fae5')}>{r.status}</span></td></tr>; })}</tbody>
                    </table>
                  </div>
                </div>
                <div style={{fontSize:9,color:'#64748b',lineHeight:1.55,marginTop:8}}>Recovery is estimated from rent rebate benefit only. If project cash flows or other recoveries should count toward cost recovery, those can be added as a second recovery input later.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

if (!s.includes('function ReclaimNewModal')) {
  replaceOnce('// MAIN APP', modalCode + '\n// MAIN APP');
}

replaceOnce(
  "  const [mainTab,setMainTab] = useState(0);",
  "  const [mainTab,setMainTab] = useState(0);\n  const [reclaimCases, setReclaimCases] = useState([]);\n  const [reclaimOpen, setReclaimOpen] = useState(false);"
);

regexOnce(
  /\n        setSyncStatus\('saved'\);/,
  "\n        if (data && Array.isArray(data.reclaimCases)) {\n          setReclaimCases(data.reclaimCases);\n        }\n        setSyncStatus('saved');",
  'setReclaimCases(data.reclaimCases)'
);

s = s.replace(
  "body: JSON.stringify({ ctrl: ctrl, delta: computeDelta(plots), savedAt: new Date().toISOString(), version: 'delta-v1' }),",
  "body: JSON.stringify({ ctrl: ctrl, delta: computeDelta(plots), reclaimCases: reclaimCases, savedAt: new Date().toISOString(), version: 'delta-v1' }),"
);
s = s.replace(
  "body: JSON.stringify({ ctrl: ctrl, plots: plots }),",
  "body: JSON.stringify({ ctrl: ctrl, plots: plots, reclaimCases: reclaimCases }),"
);
s = s.replace('  }, [ctrl, plots]);', '  }, [ctrl, plots, reclaimCases]);');

replaceOnce(
  "          <button onClick={openAdd} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'#22c55e',color:'#fff',border:'none',fontWeight:700}}>+ Add Plot</button>",
  "          <button onClick={function(){setReclaimOpen(true);}} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'#0f766e',color:'#fff',border:'none',fontWeight:700}}>Reclaim_new</button>\n          <button onClick={openAdd} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'#22c55e',color:'#fff',border:'none',fontWeight:700}}>+ Add Plot</button>"
);

replaceOnce(
  "      {detail && (\n        <RowDetail row={detail}\n          onClose={function(){setDetail(null);}}\n          onEdit={function(){setEditP(detail.p);setDetail(null);}}\n          ctrl={ctrl}/>\n      )}",
  "      {detail && (\n        <RowDetail row={detail}\n          onClose={function(){setDetail(null);}}\n          onEdit={function(){setEditP(detail.p);setDetail(null);}}\n          ctrl={ctrl}/>\n      )}\n      {reclaimOpen && (\n        <ReclaimNewModal cases={reclaimCases} setCases={setReclaimCases} onClose={function(){setReclaimOpen(false);}}/>\n      )}"
);

fs.writeFileSync(appPath, s);
