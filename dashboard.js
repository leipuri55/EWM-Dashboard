const API = 'http://localhost:3000/deliveries'; // json-server endpoint

async function loadData(){
  try{
    const res = await fetch(API);
    const data = await res.json();
    document.getElementById('rawData').textContent = JSON.stringify(data.slice(0,20), null, 2);
    computeAndRenderKPIs(data);
  }catch(err){
    console.error(err);
    alert('Failed to fetch mock data. Is json-server running on port 3000?');
  }
}

function computeAndRenderKPIs(data){
  const now = new Date();
  const itemsForPickPlan = data.filter(d => d.pickStatus === 'PLANNED').length;
  const pickingStatuses = ['READY','INPROG','CONF_INPROG','PICKING','ASSIGNED','CONFIRMED','CONFIRMED'];
  const itemsForPicking = data.filter(d => pickingStatuses.includes((d.taskStatus||'').toUpperCase())).length;
  const itemsForGI = data.filter(d => d.stagingArea && !d.actualGI).length;
  const numberOpenItems = data.filter(d => !d.actualGI).length;
  const itemsOverdue = data.filter(d => d.plannedGI && new Date(d.plannedGI) < now && !d.actualGI).length;

  // average delay (minutes) for items whose plannedGI < now: use actualGI if present otherwise now
  const delays = data
    .filter(d => d.plannedGI && new Date(d.plannedGI) < now)
    .map(d => {
      const planned = new Date(d.plannedGI);
      const actual = d.actualGI ? new Date(d.actualGI) : now;
      return (actual - planned) / 60000; // minutes
    });
  const avgDelay = delays.length ? Math.round((delays.reduce((a,b)=>a+b,0) / delays.length)) : 0;

  const netWeight = data.reduce((s,d)=> s + (parseFloat(d.netWeight)||0), 0).toFixed(2);
  const volume = data.reduce((s,d)=> s + (parseFloat(d.volume)||0), 0).toFixed(3);

  setTileValue('tilePickPlan', itemsForPickPlan, [50,150]);
  setTileValue('tilePicking', itemsForPicking, [100,300]);
  setTileValue('tileGI', itemsForGI, [75,200]);
  setTileValue('tileOpen', numberOpenItems, [200,500]);
  setTileValue('tileOverdue', itemsOverdue, [10,50]);
  setTileValue('tileAvgDelay', avgDelay, [15,60]);
  setTileValue('tileWeight', netWeight, [500,1000]);
  setTileValue('tileVolume', volume, [10,50]);
}
function setTileValue(id, value) {
  const el = document.getElementById(id);
  if (el) {
    const valueDiv = el.querySelector('.value');
    if (valueDiv) valueDiv.textContent = value;
  }
}