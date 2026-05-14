const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
let s = fs.readFileSync(appPath, 'utf8');

function replaceOnce(needle, replacement) {
  if (s.includes(replacement)) return;
  if (!s.includes(needle)) throw new Error('Policy logic patch target not found');
  s = s.replace(needle, replacement);
}

function regexOnce(pattern, replacement, marker) {
  if (marker && s.includes(marker)) return;
  if (!pattern.test(s)) throw new Error('Policy logic patch target not found');
  s = s.replace(pattern, replacement);
}

regexOnce(
/(function getLpaEscSpec\(p\) \{[\s\S]*?function buildCFs\(inv, yr1, g, horizon, residual, expiry, curRent, p, ctrl\) \{[\s\S]*?\n\}\nfunction fmtCr)/,
`function getLpaEscSpec(p) {
  const nm = ((p && p.name) || '').toLowerCase();
  const port = ((p && p.port) || '').toLowerCase();
  if (nm.includes('gujarat adani') || nm.includes('apsezl') || port === 'mundra') return { pct: 20, period: 3, firstRevisionYear: 2003 };
  if (nm.includes('swan lng') && (p.currentRent || 0) > 0) return { pct: 10, period: 3, firstRevisionYear: 2020 };
  if (nm.includes('bhavnagar port infrastructure') && (p.currentRent || 0) > 0) return { pct: 10, period: 3, firstRevisionYear: 2027 };
  if (nm.includes('nauyaan shipyard')) return {
    components: [
      { base: 268215 * 48.72, pct: 10, period: 3, firstRevisionYear: 2027 },
      { base: 20286 * 55, pct: 10, period: 3, firstRevisionYear: 2025 },
    ],
    pct: 10,
    period: 3,
  };
  return { pct: 10, period: 3, firstRevisionYear: (p.leaseStart || CY) + 3 };
}
function escalatedRent(base, targetYear, spec) {
  if (!base) return 0;
  if (spec.firstRevisionYear && targetYear < spec.firstRevisionYear) return base;
  const firstYear = spec.firstRevisionYear || ((spec.startYear || CY) + (spec.period || 3));
  const blocks = targetYear >= firstYear ? 1 + Math.floor((targetYear - firstYear) / Math.max(1, spec.period || 3)) : 0;
  return (base || 0) * Math.pow(1 + (spec.pct || 0) / 100, blocks);
}
function projectedExistingRent(p, year) {
  if (!p || p.landType !== 'lpa') return p ? (p.currentRent || 0) : 0;
  const spec = getLpaEscSpec(p);
  if (spec.components) return spec.components.reduce(function(sum, part){ return sum + escalatedRent(part.base, year, part); }, 0);
  return escalatedRent(p.currentRent || 0, year, spec);
}
function projectedContractRent(p, year, ctrl) {
  if (!p) return 0;
  if (p.landType === 'lpa') return projectedExistingRent(p, year);
  if (p.landType === 'sopc') {
    const yrs = Math.max(0, (year || CY) - CY);
    const rate = ((ctrl && ctrl.sopcWpiRate) || 0) / 100;
    return (p.currentRent || 0) * Math.pow(1 + rate, yrs);
  }
  return p.currentRent || 0;
}
function getPolicyEscSpec(c) {
  if (!c || c.escType === 'wpi') return { mode: 'annual', rate: ((c && c.wpiRate) || 0) / 100 };
  if (c.escType === '10pct3yr') return { mode: 'step', pct: 10, period: 3 };
  if (c.escType === '20pct3yr') return { mode: 'step', pct: 20, period: 3 };
  return { mode: 'step', pct: c.escPct || 0, period: Math.max(1, c.escPeriod || 1) };
}
function projectedPolicyRent(base, yearsAfterStart, c) {
  const spec = getPolicyEscSpec(c);
  const yrs = Math.max(0, yearsAfterStart || 0);
  if (spec.mode === 'annual') return (base || 0) * Math.pow(1 + spec.rate, yrs);
  const blocks = Math.floor(yrs / Math.max(1, spec.period || 1));
  return (base || 0) * Math.pow(1 + (spec.pct || 0) / 100, blocks);
}
function projectedSopcRent(base, yearsAfterStart, ctrl) {
  const yrs = Math.max(0, yearsAfterStart || 0);
  const rate = ((ctrl && ctrl.sopcWpiRate) || 0) / 100;
  return (base || 0) * Math.pow(1 + rate, yrs);
}
function projectedOption3Rent(p, lastRent, yearsAfterExpiry, ctrl) {
  const yrs = Math.max(0, yearsAfterExpiry || 0);
  if (p && p.landType === 'sopc') {
    const rate = ((ctrl && ctrl.sopcWpiRate) || 0) / 100;
    return (lastRent || 0) * Math.pow(1 + rate, yrs + 1);
  }
  if (p && p.landType === 'lpa') {
    const spec = getLpaEscSpec(p);
    const pct = spec.pct || 0;
    const period = Math.max(1, spec.period || 3);
    return (lastRent || 0) * Math.pow(1 + pct / 100, 1 + Math.floor(yrs / period));
  }
  return lastRent || 0;
}
function projectedBlockRent(base, yearsAfterExpiry, ctrl) {
  const yrs = Math.max(0, yearsAfterExpiry || 0);
  const period = Math.max(1, (ctrl && ctrl.blockYrs) || 1);
  const pct = ((ctrl && ctrl.blockPct) || 0) / 100;
  return (base || 0) * Math.pow(1 + pct, 1 + Math.floor(yrs / period));
}
function projectScenarioRent(k, p, firstRent, yearsAfterExpiry, ctrl, lastLeaseRent) {
  if (k === 'sopc_cur' || k === 'sopc_rev') return projectedSopcRent(firstRent, yearsAfterExpiry, ctrl);
  if (k === 'opt3') return projectedOption3Rent(p, lastLeaseRent, yearsAfterExpiry, ctrl);
  if (k === 'opt4') return (lastLeaseRent || 0) * Math.pow(1 + (((ctrl && ctrl.wpiRate) || 0) / 100), Math.max(0, yearsAfterExpiry || 0) + 1);
  if (k === 'opt6') return projectedBlockRent(lastLeaseRent, yearsAfterExpiry, ctrl);
  return projectedPolicyRent(firstRent, yearsAfterExpiry, ctrl);
}
function buildCFs(inv, yr1, g, horizon, residual, expiry, curRent, p, ctrl, k, lastLeaseRent) {
  if (inv <= 0) return null;
  const cfs = [-inv];
  const yToExp = Math.max(0, expiry - CY);
  for (let y = 1; y <= horizon; y++) {
    const yr = CY + y;
    if (y <= yToExp) cfs.push(projectedContractRent(p, yr, ctrl));
    else cfs.push(projectScenarioRent(k, p, yr1, y - yToExp - 1, ctrl, lastLeaseRent));
  }
  cfs[cfs.length - 1] += residual;
  return cfs;
}
function fmtCr`,
'function projectedContractRent');

replaceOnce(
`  const g = ctrl ? getAnnGrowth(ctrl) : 0.063;
  const sopcG = ctrl ? (ctrl.sopcWpiRate || 0) / 100 : 0;
  const expiry = (p.leaseStart||CY)+(p.leaseTerm||30);
  const projYears = 30;`,
`  const g = ctrl ? getAnnGrowth(ctrl) : 0.063;
  const expiry = (p.leaseStart||CY)+(p.leaseTerm||30);
  const projYears = 30;`
);

replaceOnce(
`      const yr = CY + y;
      if (p.landType === 'sopc' && (k === 'sopc_cur' || k === 'sopc_rev')) return yr1 * Math.pow(1 + sopcG, y - 1);
      if (y <= yToExp) return p.landType === 'lpa' ? projectedExistingRent(p, yr) : ex;
      return projectedPolicyRent(yr1, y - yToExp - 1, ctrl);`,
`      const yr = CY + y;
      const lastLeaseRent = row.lastLeaseRent || projectedContractRent(p, expiry, ctrl);
      if (y <= yToExp) return projectedContractRent(p, yr, ctrl);
      return projectScenarioRent(k, p, yr1, y - yToExp - 1, ctrl, lastLeaseRent);`
);

replaceOnce(
`  const g = getAnnGrowth(ctrl);
  const sopcG = (ctrl.sopcWpiRate || 0) / 100;
  const projYears = 30;
  function projRow(k) {
    return Array.from({length: projYears}, function(_,i){
      const y = i + 1;
      const yr = CY + y;
      return computed.reduce(function(sum,row){
        const p = row.p;
        const expiry = (p.leaseStart || CY) + (p.leaseTerm || 30);
        const yToExp = Math.max(0, expiry - CY);
        const yr1 = row.postExpiryRents && row.postExpiryRents[k] !== undefined ? row.postExpiryRents[k] : row.rents[k];
        if (p.landType === 'sopc' && (k === 'sopc_cur' || k === 'sopc_rev')) return sum + yr1 * Math.pow(1 + sopcG, i);
        if (p.landType === 'lpa' && y <= yToExp) return sum + projectedExistingRent(p, yr);
        if (y <= yToExp) return sum + row.existing;
        return sum + projectedPolicyRent(yr1, y - yToExp - 1, ctrl);
      }, 0);
    });
  }
  const projData = {};
  SCEN_KEYS.forEach(function(k){ projData[k] = projRow(k); });
  const projExisting = Array.from({length: projYears}, function(_,i){
    const yr = CY + i + 1;
    return computed.reduce(function(sum,row){
      if (row.p.landType === 'lpa') return sum + projectedExistingRent(row.p, yr);
      if (row.p.landType === 'sopc') return sum + (row.rents.sopc_cur || row.existing) * Math.pow(1 + sopcG, i);
      return sum + row.existing;
    }, 0);
  });`,
`  const [showTo2077, setShowTo2077] = useState(false);
  const projYears = showTo2077 ? Math.max(30, 2077 - CY) : 30;
  function projRow(k) {
    return Array.from({length: projYears}, function(_,i){
      const y = i + 1;
      const yr = CY + y;
      return computed.reduce(function(sum,row){
        const p = row.p;
        const expiry = (p.leaseStart || CY) + (p.leaseTerm || 30);
        const yToExp = Math.max(0, expiry - CY);
        const yr1 = row.postExpiryRents && row.postExpiryRents[k] !== undefined ? row.postExpiryRents[k] : row.rents[k];
        const lastLeaseRent = row.lastLeaseRent || projectedContractRent(p, expiry, ctrl);
        if (y <= yToExp) return sum + projectedContractRent(p, yr, ctrl);
        return sum + projectScenarioRent(k, p, yr1, y - yToExp - 1, ctrl, lastLeaseRent);
      }, 0);
    });
  }
  const projData = {};
  SCEN_KEYS.forEach(function(k){ projData[k] = projRow(k); });
  const projExisting = Array.from({length: projYears}, function(_,i){
    const yr = CY + i + 1;
    return computed.reduce(function(sum,row){ return sum + projectedContractRent(row.p, yr, ctrl); }, 0);
  });`
);

replaceOnce(
`        <p style={{fontSize:11,fontWeight:700,color:'#374151',margin:'0 0 2px'}}>30-Year Revenue Projection — All 8 Scenarios</p>
        <p style={{fontSize:9,color:'#9ca3af',margin:'0 0 10px'}}>Annual revenue escalated at {(g*100).toFixed(2)}% p.a. · Values in ₹ Crore · Existing = flat baseline</p>`,
`        <p style={{fontSize:11,fontWeight:700,color:'#374151',margin:'0 0 2px'}}>{showTo2077 ? 'Revenue Projection to 2077 — All 8 Scenarios' : '30-Year Revenue Projection — All 8 Scenarios'}</p>
        <p style={{fontSize:9,color:'#9ca3af',margin:'0 0 10px'}}>Contract rent is honoured until lease expiry. WPI is yearly; % / X year escalation steps only once every X years. Values in ₹ Crore.</p>`
);

s = s.replace(/30-Yr<br\/>Cum\./g, `{showTo2077 ? 'To 2077' : '30-Yr'}<br/>Cum.`);
s = s.replace(/cumSum\(projExisting\)\[29\]/g, 'cumSum(projExisting)[projYears-1]');
s = s.replace(/cumSum\(projData\[k\]\)\[29\]/g, 'cumSum(projData[k])[projYears-1]');

replaceOnce(
`        <p style={{fontSize:8,color:'#9ca3af',margin:'6px 0 0'}}>Note: Projection applies uniform escalation to Year-1 aggregate totals. Actual revenue will vary with individual lease renewals, new allotments, and policy implementation timing.</p>`,
`        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:8}}>
          <p style={{fontSize:8,color:'#9ca3af',margin:0}}>Note: Before lease expiry, every scenario follows Existing contract rent. Policy alternatives begin only after expiry.</p>
          <button onClick={function(){setShowTo2077(function(v){return !v;});}} style={Object.assign({},btnS(showTo2077,'#1e40af'),{fontSize:10,whiteSpace:'nowrap'})}>{showTo2077 ? 'Show 30 years only' : 'Expand to 2077'}</button>
        </div>`
);

replaceOnce(
`      const isLpa   = p.landType === 'lpa';
      const baseEx  = isLpa ? projectedExistingRent(p, CY) : p.currentRent;
      const existing= (ctrl.holdoverOn&&status==='expired') ? baseEx*ctrl.penaltyMult : baseEx;
      const postExpiryBase = isLpa ? projectedExistingRent(p, expiry) : baseEx;
      const isActiveLpa = isLpa && yearsLeft > 0;`,
`      const baseEx  = projectedContractRent(p, CY, ctrl);
      const existing= (ctrl.holdoverOn&&status==='expired') ? baseEx*ctrl.penaltyMult : baseEx;
      const lastLeaseRent = projectedContractRent(p, expiry, ctrl);
      const isUnderLease = yearsLeft > 0;`
);

replaceOnce(
`        if(k==='opt3')     return postExpiryBase;
        if(k==='opt4')     return postExpiryBase*(1+ctrl.wpiRate/100);
        if(k==='opt5')     return postExpiryBase*1.5;
        if(k==='opt6')     return postExpiryBase*(1+ctrl.blockPct/100);`,
`        if(k==='opt3')     return projectedOption3Rent(p, lastLeaseRent, 0, ctrl);
        if(k==='opt4')     return lastLeaseRent*(1+ctrl.wpiRate/100);
        if(k==='opt5')     return lastLeaseRent*1.5;
        if(k==='opt6')     return projectedBlockRent(lastLeaseRent, 0, ctrl);`
);

replaceOnce(
`        rents[k] = (isActiveLpa && k.indexOf('opt') === 0) ? existing : raw;`,
`        rents[k] = isUnderLease ? existing : raw;`
);

replaceOnce(
`        const cfsA=buildCFs(invA,yr1,g,ctrl.irrHorizon,resA,expiry,baseEx,p,ctrl);
        const cfsR=buildCFs(invR,yr1,g,ctrl.irrHorizon,resR,expiry,baseEx,p,ctrl);`,
`        const cfsA=buildCFs(invA,yr1,g,ctrl.irrHorizon,resA,expiry,baseEx,p,ctrl,k,lastLeaseRent);
        const cfsR=buildCFs(invR,yr1,g,ctrl.irrHorizon,resR,expiry,baseEx,p,ctrl,k,lastLeaseRent);`
);

replaceOnce(
`return {p:Object.assign({},p,{status,expiry,yearsLeft}), pv, acqPsqm, existing, rents, postExpiryRents, irrs, isRec, effReclF, isActiveLpa};`,
`return {p:Object.assign({},p,{status,expiry,yearsLeft}), pv, acqPsqm, existing, rents, postExpiryRents, irrs, isRec, effReclF, isUnderLease, lastLeaseRent};`
);

fs.writeFileSync(appPath, s);
