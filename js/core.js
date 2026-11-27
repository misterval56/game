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

/* Registre des jeux : un fichier par jeu, chargé à la demande */
const IMPL={};
const Bazar={reg:(id,fn)=>IMPL[id]=fn};
const GAMES=[
 {id:'morpion',t:'Morpion',e:'⭕',c:'#ff5d73',d:'Une IA en face. Facile à battre, ou imbattable.',best:()=>S.get('ttt-sc',{w:0}).w+' victoires'},
 {id:'memory',t:'Memory',e:'🧠',c:'#ffc857',d:'Retrouve les huit paires le plus vite possible.',best:()=>{const v=S.get('mem-best',null);return v?'Record '+Math.floor(v/60)+':'+String(v%60).padStart(2,'0'):'Pas encore de record'}},
 {id:'snake',t:'Snake',e:'🐍',c:'#4de1ff',d:'Mange, grandis, accélère. Ne te mords pas la queue.',best:()=>'Record '+S.get('snake-best',0)},
 {id:'2048',t:'2048',e:'🔢',c:'#9b7bff',d:'Fusionne les tuiles jusqu’à atteindre 2048.',best:()=>'Record '+S.get('2048-best',0)},
 {id:'course',t:'Course',e:'🏎️',c:'#ff9f43',d:'Slalome entre les voitures sans toucher personne.',best:()=>'Record '+S.get('car-best',0)},
 {id:'pacman',t:'Pac-Man',e:'🟡',c:'#ffd23f',d:'Mange tous les points, fuis les fantômes, croque les gros.',best:()=>'Record '+S.get('pac-best',0)},
 {id:'casse',t:'Casse-briques',e:'🧱',c:'#3ddc97',d:'Fais rebondir la balle et démolis le mur.',best:()=>'Record '+S.get('brk-best',0)},
 {id:'flappy',t:'Flappy',e:'🐤',c:'#ff7ab8',d:'Un seul bouton, des tuyaux partout.',best:()=>'Record '+S.get('flap-best',0)},
 {id:'cube',t:'Cube Dash',e:'🟨',c:'#38bdf8',d:'Saute par-dessus les pics. Trois niveaux.',best:()=>'Niveaux '+S.get('dash-p',[0,0,0]).filter(v=>v>=100).length+'/3'},
 {id:'puissance4',t:'Puissance 4',e:'🔴',c:'#f43f5e',d:'Aligne quatre jetons avant l’ordi.',best:()=>S.get('p4-sc',{w:0}).w+' victoires'},
 {id:'taupe',t:'Taupe',e:'🐹',c:'#d4a373',d:'Tape les taupes, de plus en plus vite. 30 secondes.',best:()=>'Record '+S.get('mole-best',0)},
 {id:'simon',t:'Simon',e:'🎵',c:'#c084fc',d:'Répète la mélodie qui s’allonge à chaque tour.',best:()=>'Record niveau '+S.get('simon-best',0)},
 {id:'pong',t:'Pong',e:'🏓',c:'#e2e8f0',d:'Le premier jeu vidéo, face à une IA. Premier à 7.',best:()=>S.get('pong-best',0)+' victoires'}
];
/* Jeux déjà portés dans js/games/ — ajoute l'id ici quand tu crées le fichier */
const READY=['morpion','memory','snake','flappy'];
const TIPS=['Astuce : le bouton ⛶ passe le jeu en plein écran.','Tes records sont gardés sur cet appareil.','Le son se coupe en haut à droite.','Sur mobile, glisse le doigt pour jouer.'];
const loadJS=src=>new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error(src));document.head.append(s)});

let clean=null,tok=0;
async function route(){
  const g=GAMES.find(x=>x.id==location.hash.slice(1)),my=++tok;
  if(clean)clean();clean=null;$('#home').hidden=!!g;$('#view').hidden=!g;
  if(!g){document.title='Le Bazar à jeux';$('#cards').innerHTML=GAMES.map((g,i)=>'<a class="card'+(READY.includes(g.id)?'':' todo')+'" href="#'+g.id+'" style="--ac:'+g.c+';--i:'+i+'"><div class="mq"><span>'+g.e+'</span></div><div class="cb"><h3>'+g.t+'</h3><p>'+g.d+'</p><span class="best">'+(READY.includes(g.id)?g.best():'Bientôt')+'</span></div></a>').join('');return}
  document.title=g.t+' · Le Bazar';$('#vt').textContent=g.t;$('#view').style.setProperty('--ac',g.c);
  const st=$('#stage'),ld=$('#ld');st.innerHTML='';$('#stats').innerHTML='';scrollTo(0,0);
  ld.hidden=false;ld.style.setProperty('--d',LOAD_MS+'ms');
  ld.innerHTML='<div class="ld-ico">'+g.e+'</div><h3>'+g.t+'</h3><div class="ld-bar"><i></i></div><p class="ld-tip">'+TIPS[Math.random()*TIPS.length|0]+'</p>';
  const wait=new Promise(r=>setTimeout(r,LOAD_MS));
  let err=!READY.includes(g.id);
  if(!err&&!IMPL[g.id])try{await loadJS('js/games/'+g.id+'.js')}catch(e){err=true}
  await wait;if(my!=tok)return;
  ld.hidden=true;
  if(err||!IMPL[g.id]){st.innerHTML='<p class="todo-msg">Ce jeu n’est pas encore dans <code>js/games/</code>.</p>';return}
  clean=IMPL[g.id](st,{stats:a=>{$('#stats').innerHTML=a.map(([k,v])=>'<div class="chip"><b>'+v+'</b>'+k+'</div>').join('')}})||null;
}
addEventListener('hashchange',route);

/* Plein écran */
const fr=$('#frame');
$('#fs').onclick=()=>document.fullscreenElement?document.exitFullscreen():(fr.requestFullscreen||fr.webkitRequestFullscreen||(()=>{})).call(fr);
$('#fsx').onclick=()=>document.fullscreenElement&&document.exitFullscreen();
document.addEventListener('fullscreenchange',()=>{$('#fs').textContent=document.fullscreenElement?'Quitter':'⛶ Plein écran'});
route();
