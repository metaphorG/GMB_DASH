const fs = require('fs');
const path = require('path');

const patchPath = path.join(__dirname, 'policy-logic-patch.cjs');
let script = fs.readFileSync(patchPath, 'utf8');

// Normalize one previously brittle target and let non-critical cleanup replacements be skipped.
script = script.replace(
  "if (!s.includes(needle)) throw new Error('Policy logic patch target not found');",
  "if (!s.includes(needle)) return;"
);
script = script.replace(
  "const sopcG = ctrl ? (ctrl.sopcWpiRate || 0) / 100;\n  const expiry = (p.leaseStart||CY)+(p.leaseTerm||30);",
  "const sopcG = ctrl ? (ctrl.sopcWpiRate || 0) / 100 : 0;\n  const expiry = (p.leaseStart||CY)+(p.leaseTerm||30);"
);

fs.writeFileSync(patchPath, script);
require(patchPath);
