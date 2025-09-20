export class GameState{
  constructor(){
    this.version = 'PRO-1.0';
    this.seed = Math.floor(Math.random()*1e9);
    this.funds = 1500;
    this.premium = 0; // Premium Cores
    this.research = 0;
    this.threat = 0.05;
    this.uptime = 0;
    this.stats = { containment: 0.95, coherence: 0.75, metamorph: 0.0, entropy: 0.12, cognition: 0.25, mutations: 1 };
    this.flags = { stasis:false, erm:false };
    this.inventory = {};
    this.activeQuests = [];
    this.tickRate = 0.5;
    this.saveInterval = 15;
    this.subject = this._newSubject();
  }
  _newSubject(){
    return {
      id: 'BF-' + (7000 + Math.floor(Math.random()*1000)),
      class: 'VOLATILE',
      age: 0,
      genotype: this.seed ^ 0x9e3779b9,
    };
  }
}
