const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
let s = fs.readFileSync(appPath, 'utf8');

function replaceOnce(needle, replacement) {
  if (s.includes(replacement)) return;
  if (!s.includes(needle)) throw new Error('Option 5/6 block patch target not found');
  s = s.replace(needle, replacement);
}

replaceOnce(
`function projectedBlockRent(base, yearsAfterExpiry, ctrl) {
  const yrs = Math.max(0, yearsAfterExpiry || 0);
  const period = Math.max(1, (ctrl && ctrl.blockYrs) || 1);
  const pct = ((ctrl && ctrl.blockPct) || 0) / 100;
  return (base || 0) * Math.pow(1 + pct, 1 + Math.floor(yrs / period));
}`,
`function projectedBlockRent(base, yearsAfterExpiry, ctrl) {
  const yrs = Math.max(0, yearsAfterExpiry || 0);
  const period = Math.max(1, (ctrl && ctrl.blockYrs) || 1);
  const pct = ((ctrl && ctrl.blockPct) || 0) / 100;
  return (base || 0) * Math.pow(1 + pct, 1 + Math.floor(yrs / period));
}
function projectedOption5Rent(lastLeaseRent, yearsAfterExpiry, ctrl) {
  const yrs = Math.max(0, yearsAfterExpiry || 0);
  const block = Math.floor(yrs / 15);
  const wpi = ((ctrl && ctrl.wpiRate) || 0) / 100;
  return (lastLeaseRent || 0) * Math.pow(1.5, block + 1) * Math.pow(1 + wpi, yrs - block);
}
function projectedOption6Rent(lastLeaseRent, yearsAfterExpiry) {
  const yrs = Math.max(0, yearsAfterExpiry || 0);
  const block = Math.floor(yrs / 15);
  const yearInBlock = yrs % 15;
  return (lastLeaseRent || 0) * Math.pow(1.5, block + 1) * Math.pow(1.2, block * 4 + Math.floor(yearInBlock / 3));
}`
);

replaceOnce(
`  if (k === 'opt4') return (lastLeaseRent || 0) * Math.pow(1 + (((ctrl && ctrl.wpiRate) || 0) / 100), Math.max(0, yearsAfterExpiry || 0) + 1);
  if (k === 'opt6') return projectedBlockRent(lastLeaseRent, yearsAfterExpiry, ctrl);
  return projectedPolicyRent(firstRent, yearsAfterExpiry, ctrl);`,
`  if (k === 'opt4') return (lastLeaseRent || 0) * Math.pow(1 + (((ctrl && ctrl.wpiRate) || 0) / 100), Math.max(0, yearsAfterExpiry || 0) + 1);
  if (k === 'opt5') return projectedOption5Rent(lastLeaseRent, yearsAfterExpiry, ctrl);
  if (k === 'opt6') return projectedOption6Rent(lastLeaseRent, yearsAfterExpiry);
  return projectedPolicyRent(firstRent, yearsAfterExpiry, ctrl);`
);

replaceOnce(
`        if(k==='opt6')     return projectedBlockRent(lastLeaseRent, 0, ctrl);`,
`        if(k==='opt6')     return projectedOption6Rent(lastLeaseRent, 0);`
);

fs.writeFileSync(appPath, s);
