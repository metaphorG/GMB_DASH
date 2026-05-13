const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
let s = fs.readFileSync(appPath, 'utf8');

function mustReplace(needle, replacement) {
  if (s.includes(replacement)) return;
  if (!s.includes(needle)) throw new Error('Patch target not found');
  s = s.replace(needle, replacement);
}

function mustRegex(pattern, replacement, marker) {
  if (marker && s.includes(marker)) return;
  if (!pattern.test(s)) throw new Error('Patch target not found');
  s = s.replace(pattern, replacement);
}

mustRegex(
/function buildCFs\(inv, yr1, g, horizon, residual, expiry, curRent\) \{[\s\S]*?\n\}\nfunction fmtCr/,
`function getLpaEscSpec(p) {
  const nm = ((p && p.name) || '').toLowerCase();
  const port = ((p && p.port) || '').toLowerCase();
  if (nm.includes('gujarat adani') || nm.includes('adani port') || port === 'mundra') return { pct: 20, period: 3 };
  return { pct: 10, period: 3 };
}
function escalatedRent(base, startYear, targetYear, spec) {
  const years = Math.max(0, targetYear - (startYear || CY));
  const blocks = Math.floor(years / Math.max(1, spec.period || 3));
  return (base || 0) * Math.pow(1 + (spec.pct || 0) / 100, blocks);
}
function projectedExistingRent(p, year) {
  if (p.landType !== 'lpa') return p.currentRent || 0;
  return escalatedRent(p.currentRent || 0, p.leaseStart || CY, year, getLpaEscSpec(p));
}
function buildCFs(inv, yr1, g, horizon, residual, expiry, curRent, p) {
  if (inv <= 0) return null;
  const cfs = [-inv];
  const yToExp = Math.max(0, expiry - CY);
  for (let y = 1; y <= horizon; y++) {
    if (y <= yToExp) cfs.push(p && p.landType === 'lpa' ? projectedExistingRent(p, CY + y) : curRent);
    else cfs.push(yr1 * Math.pow(1 + g, y - yToExp - 1));
  }
  cfs[cfs.length - 1] += residual;
  return cfs;
}
function fmtCr`,
'function projectedExistingRent');

mustReplace(
`const INIT_PLOTS = buildPlots();

const DEF_CTRL = {`,
`const INIT_PLOTS = buildPlots();

function sameVal(a, b) {
  return a === b || (a === null && b === undefined) || (a === undefined && b === null);
}
function computeDelta(plots) {
  const baseById = {};
  INIT_PLOTS.forEach(function(p){ baseById[p.id] = p; });
  const currentById = {};
  const edited = [], added = [];
  plots.forEach(function(p){
    currentById[p.id] = true;
    const base = baseById[p.id];
    if (!base) { added.push(p); return; }
    const patch = { id: p.id };
    Object.keys(p).forEach(function(k){ if (!sameVal(p[k], base[k])) patch[k] = p[k]; });
    if (Object.keys(patch).length > 1) edited.push(patch);
  });
  return {
    edited: edited,
    added: added,
    deleted: INIT_PLOTS.filter(function(p){ return !currentById[p.id]; }).map(function(p){ return p.id; }),
  };
}
function applyDelta(delta) {
  if (!delta) return INIT_PLOTS;
  const deleted = {};
  (delta.deleted || []).forEach(function(id){ deleted[id] = true; });
  const edits = {};
  (delta.edited || []).forEach(function(p){ edits[p.id] = p; });
  const merged = INIT_PLOTS.filter(function(p){ return !deleted[p.id]; }).map(function(p){ return edits[p.id] ? Object.assign({}, p, edits[p.id]) : p; });
  return merged.concat(delta.added || []);
}

const DEF_CTRL = {`);

mustReplace(`escType:'20pct3yr', escPct:20, escPeriod:3, wpiRate:6,`, `escType:'20pct3yr', escPct:20, escPeriod:3, wpiRate:6, sopcWpiRate:5,`);
mustRegex(
/(<input type="number" style=\{INP\} value=\{c\.sopcRevRate\} onChange=\{function\(e\)\{upd\('sopcRevRate'\)\(\+e\.target\.value\);\}\}\/>
\s*<\/CPRow>)/,
`$1
        <CPRow label="Projection WPI %">
          <input type="number" step="0.1" style={INP} value={c.sopcWpiRate} onChange={function(e){upd('sopcWpiRate')(+e.target.value);}}/>
        </CPRow>`,
'Projection WPI %');

mustReplace(
`        if (data && data.plots && data.plots.length > 0) {
          setPlots(data.plots);
        }`,
`        if (data && data.delta) {
          const loadedPlots = applyDelta(data.delta);
          loadedPlots.forEach(function(p){ if (p.id >= _id) _id = p.id + 1; });
          setPlots(loadedPlots);
        } else if (data && data.plots && data.plots.length > 0) {
          data.plots.forEach(function(p){ if (p.id >= _id) _id = p.id + 1; });
          setPlots(data.plots);
        }`);
mustReplace(`body: JSON.stringify({ ctrl: ctrl, plots: plots }),`, `body: JSON.stringify({ ctrl: ctrl, delta: computeDelta(plots), savedAt: new Date().toISOString(), version: 'delta-v1' }),`);

mustReplace(`  const g = ctrl ? getAnnGrowth(ctrl) : 0.063;
  const expiry`, `  const g = ctrl ? getAnnGrowth(ctrl) : 0.063;
  const sopcG = ctrl ? (ctrl.sopcWpiRate || 0) / 100 : 0;
  const expiry`);
mustReplace(`    const yr1 = rents[k];`, `    const yr1 = row.postExpiryRents && row.postExpiryRents[k] !== undefined ? row.postExpiryRents[k] : rents[k];`);
mustRegex(
/      if \(y <= yToExp\) return ex;[^\n]*/,
`      const yr = CY + y;
      if (p.landType === 'sopc' && (k === 'sopc_cur' || k === 'sopc_rev')) return yr1 * Math.pow(1 + sopcG, y - 1);
      if (y <= yToExp) return p.landType === 'lpa' ? projectedExistingRent(p, yr) : ex;`,
'projectedExistingRent(p, yr)');
mustReplace(`style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:999,display:'flex',alignItems:'flex-start',justifyContent:'flex-end'}}`, `style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.58)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:18}}`);
mustReplace(`style={{background:'#fff',width:580,height:'100%',overflowY:'auto',padding:'1.25rem',boxShadow:'-10px 0 40px rgba(0,0,0,0.15)'}}`, `style={{background:'#fff',width:'min(1180px,96vw)',maxHeight:'92vh',overflowY:'auto',padding:'1.25rem',borderRadius:10,boxShadow:'0 24px 80px rgba(0,0,0,0.28)'}}`);

mustReplace(
`  const g = getAnnGrowth(ctrl);
  const projYears = 30;
  function projRow(k) {
    const y1 = bifurc.total ? bifurc.total[k] : 0;
    return Array.from({length: projYears}, function(_,i){ return y1 * Math.pow(1+g, i); });
  }
  const projData = {};
  SCEN_KEYS.forEach(function(k){ projData[k] = projRow(k); });
  const projExisting = Array.from({length: projYears}, function(){ return existingTotal; });`,
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
        if (p.landType === 'lpa' && y <= yToExp && k.indexOf('opt') === 0) return sum + projectedExistingRent(p, yr);
        if (y <= yToExp) return sum + row.existing;
        return sum + yr1 * Math.pow(1 + g, y - yToExp - 1);
      }, 0);
    });
  }
  const projData = {};
  SCEN_KEYS.forEach(function(k){ projData[k] = projRow(k); });
  const projExisting = Array.from({length: projYears}, function(_,i){
    const yr = CY + i + 1;
    return computed.reduce(function(sum,row){ return sum + (row.p.landType === 'lpa' ? projectedExistingRent(row.p, yr) : row.existing); }, 0);
  });`);

mustReplace(
`      const baseEx  = p.currentRent;
      const existing= (ctrl.holdoverOn&&status==='expired') ? baseEx*ctrl.penaltyMult : baseEx;`,
`      const isLpa   = p.landType === 'lpa';
      const baseEx  = isLpa ? projectedExistingRent(p, CY) : p.currentRent;
      const existing= (ctrl.holdoverOn&&status==='expired') ? baseEx*ctrl.penaltyMult : baseEx;
      const isActiveLpa = isLpa && yearsLeft > 0;`);
mustReplace(
`      const rents={};
      SCEN_KEYS.forEach(function(k){rents[k]=firm(k)*effReclF;});`,
`      const rents={};
      const postExpiryRents={};
      SCEN_KEYS.forEach(function(k){
        const raw = firm(k)*effReclF;
        postExpiryRents[k] = raw;
        rents[k] = (isActiveLpa && k.indexOf('opt') === 0) ? existing : raw;
      });`);
mustReplace(`        const yr1=rents[k];`, `        const yr1=postExpiryRents[k];`);
mustReplace(`        const cfsA=buildCFs(invA,yr1,g,ctrl.irrHorizon,resA,expiry,baseEx);`, `        const cfsA=buildCFs(invA,yr1,g,ctrl.irrHorizon,resA,expiry,baseEx,p);`);
mustReplace(`        const cfsR=buildCFs(invR,yr1,g,ctrl.irrHorizon,resR,expiry,baseEx);`, `        const cfsR=buildCFs(invR,yr1,g,ctrl.irrHorizon,resR,expiry,baseEx,p);`);
mustReplace(`return {p:Object.assign({},p,{status,expiry,yearsLeft}), pv, acqPsqm, existing, rents, irrs, isRec, effReclF};`, `return {p:Object.assign({},p,{status,expiry,yearsLeft}), pv, acqPsqm, existing, rents, postExpiryRents, irrs, isRec, effReclF, isActiveLpa};`);

fs.writeFileSync(appPath, s);
