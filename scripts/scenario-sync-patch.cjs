const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
let s = fs.readFileSync(appPath, 'utf8');

function replaceOnce(needle, replacement) {
  if (s.includes(replacement)) return;
  if (!s.includes(needle)) throw new Error('Scenario sync patch target not found');
  s = s.replace(needle, replacement);
}

replaceOnce(
`function projectScenarioRent(k, p, firstRent, yearsAfterExpiry, ctrl, lastLeaseRent) {
  if (k === 'sopc_cur' || k === 'sopc_rev') return projectedSopcRent(firstRent, yearsAfterExpiry, ctrl);
  if (k === 'opt3') return projectedOption3Rent(p, lastLeaseRent, yearsAfterExpiry, ctrl);`,
`function projectScenarioRent(k, p, firstRent, yearsAfterExpiry, ctrl, lastLeaseRent) {
  if (k === 'sopc_cur' || k === 'sopc_rev' || k === 'opt1' || k === 'opt2') return projectedSopcRent(firstRent, yearsAfterExpiry, ctrl);
  if (k === 'opt3') return projectedOption3Rent(p, lastLeaseRent, yearsAfterExpiry, ctrl);`
);

replaceOnce(
`                    {SCEN_KEYS.map(function(k){
                      const r=rents[k], diff=r-ex, isPos=diff>=0;
                      return (`,
`                    {SCEN_KEYS.map(function(k){
                      const r=(row.postExpiryRents && row.postExpiryRents[k] !== undefined ? row.postExpiryRents[k] : rents[k]), diff=r-ex, isPos=diff>=0;
                      return (`
);

fs.writeFileSync(appPath, s);
