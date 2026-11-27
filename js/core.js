/* Le Bazar à jeux — noyau commun : sons, stockage, outils, menu, chargement, plein écran.
   Chaque jeu vit dans js/games/<id>.js et s'enregistre avec Bazar.reg('<id>', function(el, api){ ... return nettoyage }) */
const $=s=>document.querySelector(s);
const LOAD_MS=5000;
const _si=window.setInterval.bind(window),_ci=window.clearInterval.bind(window),RA={};let rid=0;
window.setInterval=(f,t,...a)=>{if(t!=16)return _si(f,t,...a);const id='r'+(++rid);let last=performance.now(),acc=0;RA[id]=1;(function l(n){if(!RA[id])return;acc+=Math.min(100,n-last);last=n;while(acc>=16.67&&RA[id]){f();acc-=16.67}requestAnimationFrame(l)})(last);return id};
window.clearInterval=id=>{if(typeof id=='string')delete RA[id];else _ci(id)};
const S={get(k,d){try{const v=localStorage.getItem('bz-'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('bz-'+k,JSON.stringify(v))}catch(e){}}};

/* Son */
let AC,snd=S.get('snd',true);
function beep(f=440,d=.08,type='sine',v=.05){if(!snd)return;try{AC=AC||new(window.AudioContext||webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type;if(AC.state=='suspended')AC.resume();o.frequency.setValueAtTime(f,AC.currentTime);o.frequency.exponentialRampToValueAtTime(f*(type=='sawtooth'?.5:type=='triangle'?1.3:1),AC.currentTime+d);g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g).connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function sndUI(){const b=$('#snd');b.textContent='Son : '+(snd?'oui':'non');b.setAttribute('aria-pressed',snd)}
$('#snd').onclick=()=>{snd=!snd;S.set('snd',snd);sndUI();beep(600)};sndUI();
let music=S.get('mus',false),mi=0,mt;
const PAT=[0,3,7,10,12,10,7,3,0,5,8,12,15,12,8,5];
function musUI(){const b=$('#mus');b.textContent='Musique : '+(music?'oui':'non');b.setAttribute('aria-pressed',music)}
function musLoop(){clearInterval(mt);if(music)mt=setInterval(()=>{if(snd)beep(196*2**(PAT[mi++%16]/12),.2,'triangle',.014)},240)}
$('#mus').onclick=()=>{music=!music;S.set('mus',music);musUI();musLoop()};musUI();musLoop();

/* Confettis */
const fx=$('#fx'),fc=fx.getContext('2d');let ps=[];
function confetti(){fx.width=innerWidth;fx.height=innerHeight;const run=ps.length>0;for(let i=0;i<130;i++)ps.push({x:fx.width/2,y:fx.height*.4,vx:(Math.random()-.5)*15,vy:-Math.random()*15-3,c:['#ff5d73','#ffc857','#4de1ff','#9b7bff'][i%4],r:Math.random()*7+4,l:100});if(!run)cloop()}
function cloop(){fc.clearRect(0,0,fx.width,fx.height);ps=ps.filter(p=>p.l-->0);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.35;fc.globalAlpha=Math.min(1,p.l/30);fc.fillStyle=p.c;fc.fillRect(p.x,p.y,p.r,p.r*.6)});if(ps.length)requestAnimationFrame(cloop);else fc.clearRect(0,0,fx.width,fx.height)}

/* Outils partagés par les jeux */
function swipe(el,fn){let sx,sy;el.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});el.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;fn(Math.abs(dx)>Math.abs(dy)?[dx>0?1:-1,0]:[0,dy>0?1:-1])},{passive:true})}
function cvs(el,w,h,hint){el.innerHTML='<canvas id="cv" width="'+w+'" height="'+h+'" style="aspect-ratio:'+w+'/'+h+'"></canvas><div class="row"><button class="btn" id="re">Jouer</button></div><p class="hint">'+hint+'</p>';const c=el.querySelector('#cv');return[c.getContext('2d'),c,el.querySelector('#re')]}
function ov(x,w,h,m){if(!m)return;x.fillStyle='rgba(14,10,31,.78)';x.fillRect(0,0,w,h);x.fillStyle='#f4f0ff';x.textAlign='center';x.font='22px Bungee,sans-serif';x.fillText(m,w/2,h/2)}
function keys(){const k={},d=e=>{k[e.key]=1;if(e.key.startsWith('Arrow')||e.key==' ')e.preventDefault()},u=e=>k[e.key]=0;addEventListener('keydown',d);addEventListener('keyup',u);return[k,()=>{removeEventListener('keydown',d);removeEventListener('keyup',u)}]}
/* Joli rendu : halo lumineux autour d'une forme */
function glow(x,col,b,fn){x.save();x.shadowColor=col;x.shadowBlur=b;fn();x.restore()}

/* Menu de jeu : choix du niveau (cfg: t titre, d texte, L noms des niveaux, best(i), lock(i)) */
function lvlMenu(el,api,cfg,start){
  el.innerHTML='<div class="gm"><h3>'+cfg.t+'</h3><p class="hint">'+cfg.d+'</p><div class="lv">'+cfg.L.map((n,i)=>{const lk=cfg.lock&&cfg.lock(i);return'<button class="lvb" data-i="'+i+'"'+(lk?' disabled':'')+'><b>'+(lk?'🔒':i+1)+'</b><span>'+n+'</span><small>'+(lk?'Termine le niveau '+i:cfg.best?cfg.best(i):'')+'</small></button>'}).join('')+'</div></div>';
  api.stats([]);el.querySelectorAll('.lvb').forEach(b=>b.onclick=()=>start(+b.dataset.i));
}
function backBtn(el,fn){el.querySelector('.row').insertAdjacentHTML('beforeend','<button class="back" id="mn" style="margin-left:10px">☰ Niveaux</button>');el.querySelector('#mn').onclick=fn}

/* Registre : un fichier par jeu (js/games/<id>.js), chargé à la demande.
   Chaque niveau : [nom, objectif affiché, paramètres passés au jeu (api.p), score cible]. */
const IMPL={};
const Bazar={reg:(id,fn)=>IMPL[id]=fn};
const L=a=>a.map(([n,g,p,t])=>({n,g,p,t}));
const GAMES=[
 {id:'morpion',t:'Morpion',e:'⭕',c:'#ff5d73',d:'Aligne trois symboles avant l’IA.',best:()=>S.get('ttt-sc',{w:0}).w+' victoires',
  lv:L([['Facile','Bats une IA distraite',{e:.7}],['Moyen','L’IA se trompe parfois',{e:.25}],['Imbattable','Tiens au moins le match nul',{e:0,dw:1}]])},
 {id:'memory',t:'Memory',e:'🧠',c:'#ffc857',d:'Retrouve toutes les paires le plus vite possible.',best:()=>{const v=S.get('mem-best',null);return v?'Record '+Math.floor(v/60)+':'+String(v%60).padStart(2,'0'):'Pas encore de record'},
  lv:L([['Petit','6 paires',{n:6,c:4}],['Classique','8 paires',{n:8,c:4}],['Géant','12 paires',{n:12,c:6}]])},
 {id:'snake',t:'Snake',e:'🐍',c:'#4de1ff',d:'Mange, grandis, accélère.',best:()=>'Record '+S.get('snake-best',0),
  lv:L([['Prairie','Mange 8 pommes · les murs se traversent',{sp:140,obs:0,wrap:1},8],['Rochers','Mange 12 pommes · attention aux rochers',{sp:120,obs:8,wrap:0},12],['Turbo','Mange 15 pommes · très rapide',{sp:95,obs:14,wrap:0},15]])},
 {id:'2048',t:'2048',e:'🔢',c:'#9b7bff',d:'Fusionne les tuiles pour atteindre la cible.',best:()=>'Record '+S.get('2048-best',0),
  lv:L([['Échauffement','Atteins la tuile 256',{t:256}],['Défi','Atteins la tuile 1024',{t:1024}],['Légende','Atteins la tuile 2048',{t:2048}]])},
 {id:'course',t:'Course',e:'🏎️',c:'#ff9f43',d:'Slalome entre les voitures.',best:()=>'Record '+S.get('car-best',0),
  lv:L([['Ville','Atteins 20 points',{s0:4,sm:8,d:.04},20],['Autoroute','Atteins 40 points',{s0:5,sm:10,d:.055},40],['Nuit','Atteins 60 points · trafic dense',{s0:6,sm:12,d:.075},60]])},
 {id:'pacman',t:'Pac-Man',e:'🟡',c:'#ffd23f',d:'Mange tous les points, fuis les fantômes.',best:()=>'Record '+S.get('pac-best',0),
  lv:L([['Un fantôme','Nettoie le labyrinthe',{gh:1,ms:140}],['Deux fantômes','Nettoie le labyrinthe',{gh:2,ms:125}],['Trois fantômes','Nettoie le labyrinthe',{gh:3,ms:110}]])},
 {id:'casse',t:'Casse-briques',e:'🧱',c:'#3ddc97',d:'Démolis le mur de briques.',best:()=>'Record '+S.get('brk-best',0),
  lv:L([['Mur bas','3 rangées',{rows:3,sp:5}],['Mur moyen','5 rangées',{rows:5,sp:6}],['Forteresse','7 rangées · balle rapide',{rows:7,sp:7.2}]])},
 {id:'flappy',t:'Flappy',e:'🐤',c:'#ff7ab8',d:'Un seul bouton, des tuyaux partout.',best:()=>'Record '+S.get('flap-best',0),
  lv:L([['Large','Passe 10 tuyaux',{gap:165,v:2.4},10],['Normal','Passe 20 tuyaux',{gap:145,v:2.8},20],['Étroit','Passe 30 tuyaux',{gap:125,v:3.2},30]])},
 {id:'cube',t:'Cube Dash',e:'🟨',c:'#38bdf8',d:'Saute par-dessus les pics jusqu’à l’arrivée.',best:()=>'Niveaux '+S.get('dash-p',[0,0,0]).filter(v=>v>=100).length+'/3',
  lv:L([['Néon','Arrive à 100 %',{}],['Lave','Arrive à 100 %',{}],['Espace','Arrive à 100 %',{}]])},
 {id:'puissance4',t:'Puissance 4',e:'🔴',c:'#f43f5e',d:'Aligne quatre jetons avant l’ordi.',best:()=>S.get('p4-sc',{w:0}).w+' victoires',
  lv:L([['Débutant','L’ordi joue au hasard',{d:0}],['Malin','L’ordi anticipe 2 coups',{d:2}],['Expert','L’ordi anticipe 5 coups',{d:5}]])},
 {id:'taupe',t:'Taupe',e:'🐹',c:'#d4a373',d:'Tape les taupes en 30 secondes.',best:()=>'Record '+S.get('mole-best',0),
  lv:L([['Lente','12 taupes en 30 s',{ms:900,min:520},12],['Vive','20 taupes en 30 s',{ms:750,min:420},20],['Éclair','28 taupes en 30 s',{ms:600,min:340},28]])},
 {id:'simon',t:'Simon',e:'🎵',c:'#c084fc',d:'Répète la mélodie qui s’allonge.',best:()=>'Record niveau '+S.get('simon-best',0),
  lv:L([['Tempo lent','Atteins la séquence 5',{st:560},5],['Tempo moyen','Atteins la séquence 8',{st:440},8],['Tempo rapide','Atteins la séquence 12',{st:340},12]])},
 {id:'pong',t:'Pong',e:'🏓',c:'#e2e8f0',d:'Premier à 7 points contre l’IA.',best:()=>S.get('pong-best',0)+' victoires',
  lv:L([['Recrue','IA lente',{ai:2.6}],['Pro','IA rapide',{ai:3.6}],['Champion','IA très rapide',{ai:4.6}]])}
];
const TIPS=['Astuce : le bouton ⛶ passe le jeu en plein écran.','Tes records sont gardés sur cet appareil.','Réussis un niveau pour débloquer le suivant.','Sur mobile, glisse le doigt pour jouer.'];
const loadJS=src=>new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error(src));document.head.append(s)});
const toast=document.createElement('div');toast.id='toast';toast.hidden=true;$('#frame').append(toast);
let clean=null,tok=0,cur=null;
const stop=()=>{if(clean)clean();clean=null};

/* Menu d'un jeu : choix du niveau */
function menu(g){stop();cur=g;toast.hidden=true;$('#mb').hidden=true;$('#stats').innerHTML='';
  const u=Math.min(g.lv.length,S.get('lv-'+g.id,1));
  $('#stage').innerHTML='<div class="gm"><div class="gm-ico">'+g.e+'</div><p>'+g.d+'</p><h3>Choisis ton niveau</h3><div class="lvs">'+g.lv.map((l,i)=>'<button class="lvb" data-i="'+i+'"'+(i>=u?' disabled':'')+'><b>'+(i<u?i+1:'🔒')+'</b><span>'+l.n+'</span><small>'+l.g+'</small></button>').join('')+'</div><p class="best">'+g.best()+'</p></div>';
  document.querySelectorAll('.lvb').forEach(b=>b.onclick=()=>start(g,+b.dataset.i))}

/* Lance un niveau */
function start(g,i){stop();toast.hidden=true;const l=g.lv[i];let done=0;$('#stage').innerHTML='';$('#mb').hidden=false;
  const api={p:l.p,i,t:l.t,stats:a=>{$('#stats').innerHTML=[['Niveau',l.n],...a].map(([k,v])=>'<div class="chip"><b>'+v+'</b>'+k+'</div>').join('')},
    score:v=>{if(l.t&&v>=l.t)api.win()},
    win:()=>{if(done)return;done=1;const nx=i+1<g.lv.length;if(i+2>S.get('lv-'+g.id,1))S.set('lv-'+g.id,Math.min(g.lv.length,i+2));confetti();
      toast.innerHTML='<b>Niveau réussi !</b><span>'+(nx?'Niveau suivant débloqué : '+g.lv[i+1].n:'Tous les niveaux sont terminés')+'</span><button class="btn" id="tm">☰ Niveaux</button>';toast.hidden=false;$('#tm').onclick=()=>menu(g)}};
  clean=IMPL[g.id]($('#stage'),api)||null}

async function route(){
  const g=GAMES.find(x=>x.id==location.hash.slice(1)),my=++tok;
  stop();$('#home').hidden=!!g;$('#view').hidden=!g;toast.hidden=true;
  if(!g){document.title='Le Bazar à jeux';$('#cards').innerHTML=GAMES.map((g,i)=>'<a class="card" href="#'+g.id+'" style="--ac:'+g.c+';--i:'+i+'"><div class="mq"><span>'+g.e+'</span></div><div class="cb"><h3>'+g.t+'</h3><p>'+g.d+'</p><span class="best">'+g.best()+'</span></div></a>').join('');return}
  document.title=g.t+' · Le Bazar';$('#vt').textContent=g.t;$('#view').style.setProperty('--ac',g.c);
  $('#stage').innerHTML='';$('#stats').innerHTML='';$('#mb').hidden=true;scrollTo(0,0);
  const ld=$('#ld');ld.hidden=false;
  ld.innerHTML='<div class="ld-ico">'+g.e+'</div><h3>'+g.t+'</h3><div class="ld-bar"><i></i></div><p class="ld-pct">0 %</p><p class="ld-step"></p><p class="ld-tip">'+TIPS[Math.random()*TIPS.length|0]+'</p>';
  const bar=ld.querySelector('i'),pc=ld.querySelector('.ld-pct'),sp=ld.querySelector('.ld-step'),M=['Préparation du terrain…','Chargement des graphismes…','Réglage de la difficulté…','Prêt !'];
  let err=0;const job=IMPL[g.id]?Promise.resolve():loadJS('js/games/'+g.id+'.js').catch(()=>err=1);
  await new Promise(r=>{const t0=performance.now();(function f(n){if(my!=tok)return r();const p=Math.min(1,(n-t0)/LOAD_MS);bar.style.width=p*100+'%';pc.textContent=Math.round(p*100)+' %';sp.textContent=M[Math.min(3,p*4|0)];p<1?requestAnimationFrame(f):r()})(t0)});
  await job;if(my!=tok)return;ld.hidden=true;
  if(err||!IMPL[g.id]){$('#stage').innerHTML='<p class="todo-msg">Impossible de charger <code>js/games/'+g.id+'.js</code>. Vérifie que le fichier existe.</p>';return}
  menu(g)}
addEventListener('hashchange',route);
$('#mb').onclick=()=>cur&&menu(cur);

/* Plein écran */
const fr=$('#frame');
$('#fs').onclick=()=>document.fullscreenElement?document.exitFullscreen():(fr.requestFullscreen||fr.webkitRequestFullscreen||(()=>{})).call(fr);
$('#fsx').onclick=()=>document.fullscreenElement&&document.exitFullscreen();
document.addEventListener('fullscreenchange',()=>{$('#fs').textContent=document.fullscreenElement?'Quitter':'⛶ Plein écran'});
route();
