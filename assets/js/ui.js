import { fmtTime } from './util.js';

export class UI{
  constructor(state, bus){
    this.s = state;
    this.bus = bus;
    this.dom = {};
  }
  bind(){
    const q = (sel)=>document.querySelector(sel);
    this.dom.funds = q('#funds');
    this.dom.premium = q('#premium');
    this.dom.rp = q('#rp');
    this.dom.threat = q('#threat');
    this.dom.uptime = q('#uptime');
    this.dom.uptimeFoot = q('#uptimeFoot');
    this.dom.subjectLine = q('#subjectLine');
    this.dom.bars = {
      containment: q('#barContainment'),
      coherence: q('#barCoherence'),
      metamorph: q('#barMetamorph'),
      entropy: q('#barEntropy'),
      cognition: q('#barCognition'),
    };
    // tabs
    document.querySelectorAll('.tab').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p=>p.classList.remove('show'));
        btn.classList.add('active');
        document.querySelector('#panel-'+btn.dataset.tab).classList.add('show');
      });
    });
    // actions
    document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>this.handleAction(b.dataset.action));
    // store
    document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>this.buy(b.dataset.buy));
    document.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>this.use(b.dataset.use));
    // research
    document.querySelectorAll('[data-research]').forEach(b=>b.onclick=()=>this.research(b.dataset.research));
    // toggles
    document.getElementById('audioToggle').onchange = (e)=> this.bus.setEnabled(e.target.checked);
    document.getElementById('compactToggle').onchange = (e)=> document.body.classList.toggle('compact', e.target.checked);
    document.getElementById('resetBtn').onclick = ()=>{ if(confirm('Reset all data?')) { localStorage.removeItem('xenobio-pro-v1'); location.reload(); } };
    // settings
    document.getElementById('tickInput').onchange = (e)=> this.s.tickRate = Math.max(0.1, Number(e.target.value)/1000);
    document.getElementById('saveInput').onchange = (e)=> this.s.saveInterval = Math.max(5, Number(e.target.value));
    document.getElementById('scaleInput').oninput = (e)=> document.documentElement.style.setProperty('zoom', e.target.value);
    document.getElementById('reduceMotion').onchange = (e)=> document.documentElement.style.setProperty('--motion', e.target.checked?'0':'1');
    // db
    document.getElementById('exportLog').onclick = ()=> this.exportLog();
    document.getElementById('exportCert').onclick = ()=> this.exportCert();
    // microtx placeholder
    document.getElementById('buy50').onclick = ()=>{ this.s.premium+=50; this.log('Purchased 50 PC (placeholder).'); };
    document.getElementById('buy250').onclick = ()=>{ this.s.premium+=250; this.log('Purchased 250 PC (placeholder).'); };
    // modal close
    document.getElementById('modalClose').onclick = ()=>this.hideModal();
  }
  render(){
    const s=this.s;
    this.dom.funds.textContent = 'CR '+Math.floor(s.funds);
    this.dom.premium.textContent = 'PC '+Math.floor(s.premium);
    this.dom.rp.textContent = 'RP '+Math.floor(s.research);
    this.dom.threat.textContent = 'THREAT: '+(Math.round(s.threat*100));
    const ut = fmtTime(s.uptime);
    this.dom.uptime.textContent = 'UPTIME '+ut;
    this.dom.uptimeFoot.textContent = ut;
    this.dom.subjectLine.textContent = `Subject ${s.subject.id} · Classification: ${s.subject.class}`;
    Object.entries(this.dom.bars).forEach(([k,el])=>{
      const v = Math.max(0, Math.min(1, s.stats[k] ?? 0));
      el.style.width = (v*100).toFixed(0)+'%';
    });
  }
  handleAction(act){
    const s=this.s;
    const L=(msg)=>this.log(msg);
    switch(act){
      case 'stabilize': s.stats.containment = Math.min(1, s.stats.containment+0.05); L('Protocol S: Stabilize.'); break;
      case 'monitor': s.research+=5; s.stats.cognition=Math.min(1,s.stats.cognition+0.01); L('Protocol M: Monitor.'); break;
      case 'analyze': s.research+=8; s.stats.coherence=Math.min(1,s.stats.coherence+0.02); L('Protocol A: Analyze.'); break;
      case 'reinforce': s.stats.containment=Math.min(1,s.stats.containment+0.08); s.funds-=15; L('Protocol R: Reinforce. -15 CR'); break;
      case 'stimulate': s.stats.cognition=Math.min(1,s.stats.cognition+0.06); s.stats.entropy=Math.min(1,s.stats.entropy+0.03); L('Experimental: Stimulate.'); break;
      case 'stress': s.stats.entropy=Math.min(1,s.stats.entropy+0.08); s.research+=15; L('Experimental: Stress Test.'); break;
      case 'mutate': s.stats.mutations+=1; s.stats.coherence=Math.max(0,s.stats.coherence-0.05); L('Mutation induced.'); break;
      case 'metamorph': s.stats.metamorph=Math.min(1,s.stats.metamorph+0.15); s.stats.entropy+=0.05; L('Forced metamorphosis initiated.'); break;
      case 'deepscan': this.log('Deep Scan requires equipment.'); break;
      case 'neural': this.log('Neural link established. Latent signals detected.'); break;
      case 'extract': this.log('Samples extracted. +50 CR'); s.funds+=50; break;
      case 'emergency': s.stats.containment=Math.max(s.stats.containment,0.3); s.funds-=120; this.log('EMERGENCY trigger used.'); break;
      case 'interact': this.log('Interaction acknowledged.'); break;
    }
  }
  buy(id){
    const price = { cfg:150, naa:250, erm:400, tsp:800 }[id];
    if (this.s.funds>=price){ this.s.funds-=price; this.s.inventory[id]=(this.s.inventory[id]||0)+1; this.log(`Purchased ${id.toUpperCase()}.`); }
    else this.log('Insufficient funds.');
  }
  use(id){
    if((this.s.inventory[id]||0)<=0){ this.log('Unavailable.'); return; }
    this.s.inventory[id]--; 
    if (id==='naa') this.s.stats.cognition = Math.min(1, this.s.stats.cognition+0.3);
    if (id==='erm') this.s.flags.erm=true;
    if (id==='tsp') this.s.flags.stasis=true;
    if (id==='cfg') this.s.stats.containment = Math.max(this.s.stats.containment, 0.4);
    this.log(`Used ${id.toUpperCase()}.`);
  }
  research(key){
    const cost = { bio:75, qbt:150, cm:250 }[key];
    if (this.s.research >= cost){
      this.s.research -= cost;
      this.log('Research breakthrough: '+key.toUpperCase());
    }else{
      this.log('Not enough RP.');
    }
  }
  log(msg){
    const el = document.getElementById('log');
    const line = document.createElement('div');
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    line.textContent = `[${ts}] ${msg}`;
    el.prepend(line);
    if (el.children.length>150) el.removeChild(el.lastChild);
    // soft click
    try{ window.navigator.vibrate && window.navigator.vibrate(10) }catch{}
  }
  showModal(html){ const m=document.getElementById('modal'); document.getElementById('modalContent').innerHTML=html; m.classList.remove('hidden'); }
  hideModal(){ document.getElementById('modal').classList.add('hidden'); }
  exportLog(){
    const text = Array.from(document.getElementById('log').children).map(n=>n.textContent).reverse().join('\n');
    const blob = new Blob([text],{type:'text/plain'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='xenobio_log.txt'; a.click();
  }
  exportCert(){
    const s=this.s;
    const md = `# PERMADEATH CERTIFICATE\n\n- Subject: ${s.subject.id}\n- Build: ${s.version}\n- Uptime: ${Math.round(s.uptime)}s\n- Funds spent: ~${1500 - s.funds} CR\n- Research accumulated: ${Math.round(s.research)} RP\n- Final stats: ${JSON.stringify(s.stats)}\n\nSigned: Facility Director`;
    const blob = new Blob([md],{type:'text/markdown'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='permadeath_certificate.md'; a.click();
  }
}
