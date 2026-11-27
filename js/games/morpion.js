/* Morpion — joueur (X) contre IA (O) */
const WL=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function wn(b){for(const l of WL)if(b[l[0]]&&b[l[0]]==b[l[1]]&&b[l[0]]==b[l[2]])return{p:b[l[0]],l};return b.includes('')?null:{p:'=',l:[]}}
function mm(b,p){const r=wn(b);if(r)return r.p=='O'?1:r.p=='X'?-1:0;let best=p=='O'?-2:2;for(let i=0;i<9;i++)if(!b[i]){b[i]=p;const s=mm(b,p=='O'?'X':'O');b[i]='';best=p=='O'?Math.max(best,s):Math.min(best,s)}return best}
function aiMove(b,mode){const f=[...b.keys()].filter(i=>!b[i]);if(mode=='easy'&&Math.random()<.6)return f[Math.random()*f.length|0];let bs=-2,mv=[];for(const i of f){b[i]='O';const s=mm(b,'X');b[i]='';if(s>bs){bs=s;mv=[i]}else if(s==bs)mv.push(i)}return mv[Math.random()*mv.length|0]}
Bazar.reg('morpion',function(el,api){
  let B,over,mode=S.get('ttt-mode','hard'),sc=S.get('ttt-sc',{w:0,d:0,l:0});
  el.innerHTML='<div class="seg"><button data-m="easy">Facile</button><button data-m="hard">Imbattable</button></div><p class="msg" id="m" aria-live="polite"></p><div class="board ttt" id="b"></div><div class="row"><button class="btn" id="re">Rejouer</button></div>';
  const b=el.querySelector('#b'),m=el.querySelector('#m'),sg=el.querySelectorAll('.seg button');
  const stats=()=>api.stats([['Victoires',sc.w],['Nuls',sc.d],['Défaites',sc.l]]);
  function draw(r){b.innerHTML='';B.forEach((v,i)=>{const c=document.createElement('button');c.textContent=v;c.className=v.toLowerCase()+(r&&r.l.includes(i)?' win':'');c.setAttribute('aria-label','Case '+(i+1)+(v?', '+v:''));c.onclick=()=>play(i);b.append(c)})}
  function fin(){const r=wn(B);if(!r)return 0;over=1;if(r.p=='X'){sc.w++;m.textContent='Bien joué, tu as gagné !';confetti();beep(880,.3,'triangle')}else if(r.p=='O'){sc.l++;m.textContent="L'ordi gagne cette manche.";beep(180,.3,'sawtooth')}else{sc.d++;m.textContent='Égalité.'}S.set('ttt-sc',sc);stats();draw(r);return 1}
  function play(i){if(over||B[i])return;B[i]='X';beep(520,.06);if(!fin()){B[aiMove(B,mode)]='O';beep(380,.06);if(!fin())draw()}}
  function reset(){B=Array(9).fill('');over=0;m.textContent='À toi, tu joues les X.';sg.forEach(s=>s.setAttribute('aria-pressed',s.dataset.m==mode));draw();stats()}
  sg.forEach(s=>s.onclick=()=>{mode=s.dataset.m;S.set('ttt-mode',mode);reset()});
  el.querySelector('#re').onclick=reset;reset();
});
