// XENOBIO PRO — modular core
import { GameState } from './state.js';
import { AudioBus } from './systems/audio.js';
import { UI } from './ui.js';
import { Creature } from './systems/creature.js';
import { Economy } from './systems/economy.js';
import { Missions } from './systems/missions.js';
import { Research } from './systems/research.js';
import { Persistence } from './systems/persist.js';

const bus = new AudioBus();
const state = new GameState();
const persist = new Persistence('xenobio-pro-v1');
const ui = new UI(state, bus);
const creature = new Creature(state);
const econ = new Economy(state, ui);
const missions = new Missions(state, ui);
const research = new Research(state, ui);

let tickHandle = 0;
let startTs = performance.now();

async function init() {
  // GDPR
  const gdpr = document.getElementById('gdpr');
  const accepted = persist.get('gdprAccepted', false);
  if (!accepted) gdpr.classList.add('show');
  document.getElementById('gdprAccept').onclick = () => { persist.set('gdprAccepted', true); gdpr.classList.remove('show'); };
  document.getElementById('gdprDecline').onclick = () => { alert('Declined — no data stored.'); gdpr.classList.remove('show'); };

  // Load
  const save = persist.load();
  if (save) Object.assign(state, save);

  // Wire UI
  ui.bind();
  creature.mount(document.getElementById('bioCanvas'));
  missions.seed();
  ui.log('Simulation initialized.');

  // Start loop
  startLoop();
  // Save interval
  setInterval(() => persist.save(state), (state.saveInterval||15)*1000);
}
function startLoop(){
  if (tickHandle) cancelAnimationFrame(tickHandle);
  const step = () => {
    const now = performance.now();
    const dt = Math.min(1.0, (now - startTs) / 1000);
    startTs = now;
    tick(dt);
    tickHandle = requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function tick(dt){
  state.uptime += dt;
  creature.update(dt);
  econ.update(dt);
  research.update(dt);
  missions.update(dt);
  ui.render();
}
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  const map = { s:'stabilize', m:'monitor', a:'analyze', r:'reinforce', t:'stimulate', x:'stress', ' ':'interact' };
  if (map[k]) ui.handleAction(map[k]);
});

init();
