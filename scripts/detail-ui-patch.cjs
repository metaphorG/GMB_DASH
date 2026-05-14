const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'App.jsx');
let s = fs.readFileSync(appPath, 'utf8');

function replaceOnce(needle, replacement) {
  if (s.includes(replacement)) return;
  if (!s.includes(needle)) throw new Error('Detail/UI patch target not found');
  s = s.replace(needle, replacement);
}

replaceOnce(
`  const [showProj, setShowProj] = useState(false);

  const g = ctrl ? getAnnGrowth(ctrl) : 0.063;
  const expiry = (p.leaseStart||CY)+(p.leaseTerm||30);
  const projYears = 30;`,
`  const [showProj, setShowProj] = useState(false);
  const [showPlotTo2077, setShowPlotTo2077] = useState(false);

  const g = ctrl ? getAnnGrowth(ctrl) : 0.063;
  const expiry = (p.leaseStart||CY)+(p.leaseTerm||30);
  const projYears = showPlotTo2077 ? Math.max(30, 2077 - CY) : 30;`
);

replaceOnce(
`            {showProj ? '▲ Hide' : '▼ Show'} 30-Year Revenue Projection (Year-by-Year)`,
`            {showProj ? '▲ Hide' : '▼ Show'} {showPlotTo2077 ? 'Projection to 2077' : '30-Year Revenue Projection'} (Year-by-Year)`
);

replaceOnce(
`            <p style={{fontSize:10,fontWeight:700,color:'#374151',margin:'0 0 4px'}}>30-Year Revenue Projection — Year-by-Year Breakdown</p>
            <p style={{fontSize:9,color:'#9ca3af',margin:'0 0 8px'}}>
              During existing lease (until {expiry}): existing rent ₹{(ex/1e5).toFixed(1)} L p.a. (fixed). Post-expiry: each scenario's proposed rent escalated at {(g*100).toFixed(2)}% p.a.
            </p>`,
`            <p style={{fontSize:10,fontWeight:700,color:'#374151',margin:'0 0 4px'}}>{showPlotTo2077 ? 'Projection to 2077 — Year-by-Year Breakdown' : '30-Year Revenue Projection — Year-by-Year Breakdown'}</p>
            <p style={{fontSize:9,color:'#9ca3af',margin:'0 0 8px'}}>
              Until lease expiry ({expiry}), every scenario follows Existing contract rent. After expiry, each scenario follows its own policy rule.
            </p>`
);

replaceOnce(
`                        <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:'#1e40af',background:'#eff6ff'})}>{fmtCr(p.landType === 'lpa' ? projectedExistingRent(p, yr) : (p.landType === 'sopc' ? projByScen.sopc_cur[i] : ex))}</td>`,
`                        <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:'#1e40af',background:'#eff6ff'})}>{fmtCr(projectedContractRent(p, yr, ctrl))}</td>`
);

replaceOnce(
`                    <td colSpan={2} style={Object.assign({},TD,{color:'#93c5fd',fontSize:9})}>30-Yr Cumulative</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:'#fff'})}>{fmtCr(ex*projYears)}</td>
                    {SCEN_KEYS.map(function(k){
                      const cum=projByScen[k].reduce(function(s,v){return s+v;},0);
                      return <td key={k} style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:cum>=(ex*projYears)?'#bbf7d0':'#fca5a5'})}>{fmtCr(cum)}</td>;
                    })}`,
`                    <td colSpan={2} style={Object.assign({},TD,{color:'#93c5fd',fontSize:9})}>{showPlotTo2077 ? 'To 2077' : '30-Yr'} Cumulative</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:'#fff'})}>{fmtCr(Array.from({length:projYears},function(_,i){return projectedContractRent(p, CY+1+i, ctrl);}).reduce(function(s,v){return s+v;},0))}</td>
                    {SCEN_KEYS.map(function(k){
                      const cum=projByScen[k].reduce(function(s,v){return s+v;},0);
                      const base=Array.from({length:projYears},function(_,i){return projectedContractRent(p, CY+1+i, ctrl);}).reduce(function(s,v){return s+v;},0);
                      return <td key={k} style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:cum>=base?'#bbf7d0':'#fca5a5'})}>{fmtCr(cum)}</td>;
                    })}`
);

replaceOnce(
`              </table>
            </div>
          </div>`,
`              </table>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',marginTop:8}}>
              <button onClick={function(){setShowPlotTo2077(function(v){return !v;});}} style={Object.assign({},btnS(showPlotTo2077,'#1e40af'),{fontSize:10,whiteSpace:'nowrap'})}>{showPlotTo2077 ? 'Show 30 years only' : 'Expand to 2077'}</button>
            </div>
          </div>`
);

replaceOnce(
`      <div style={{background:'#fff',borderRadius:10,width:980,maxWidth:'96vw',maxHeight:'92vh',overflow:'hidden',boxShadow:'0 24px 70px rgba(15,23,42,0.32)',display:'flex',flexDirection:'column'}}>`,
`      <div style={{background:'#fff',borderRadius:10,width:'min(1220px,98vw)',maxWidth:'98vw',height:'94vh',maxHeight:'94vh',overflow:'hidden',boxShadow:'0 24px 70px rgba(15,23,42,0.32)',display:'flex',flexDirection:'column'}}>`
);

replaceOnce(
`        <div style={{display:'grid',gridTemplateColumns:'250px 1fr',minHeight:0,overflow:'hidden'}}>`,
`        <div style={{display:'grid',gridTemplateColumns:'220px minmax(0,1fr)',minHeight:0,overflow:'hidden',flex:1}}>`);

replaceOnce(
`          <div style={{padding:14,overflowY:'auto'}}>
            <div style={{display:'grid',gridTemplateColumns:'330px 1fr',gap:14}}>`,
`          <div style={{padding:14,overflowY:'auto',minWidth:0}}>
            <div style={{display:'grid',gridTemplateColumns:'minmax(300px,360px) minmax(520px,1fr)',gap:14,alignItems:'start'}}>`);

replaceOnce(
`                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:10}}>`,
`                <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7,marginBottom:10}}>`);

replaceOnce(
`                  <div style={{overflowX:'auto',maxHeight:310,overflowY:'auto'}}>`,
`                  <div style={{overflowX:'auto',maxHeight:410,overflowY:'auto'}}>`);

fs.writeFileSync(appPath, s);
