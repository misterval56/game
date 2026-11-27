/* 2048 — niveaux : tuile cible (api.p.t) */
Bazar.reg('2048',function(el,api){
  let g,sc,over,best=S.get('2048-best',0);
  el.innerHTML='<div class="b2048" id="b"></div><p class="msg hint" id="m" aria-live="polite"></p><div class="row"><button class="btn" id="re">Rejouer</button></div>';
  const b=el.querySelector('#b'),m=el.querySelector('#m');
  const stuck=()=>!g.includes(0)&&!g.some((v,i)=>(i%4<3&&v==g[i+1])||(i<12&&v==g[i+4]));
  function add(){const e=[];g.forEach((v,i)=>v||e.push(i));if(e.length)g[e[Math.random()*e.length|0]]=Math.random()<.9?2:4}
  function render(){b.innerHTML=g.map(v=>{const h=200+(Math.log2(v||1)-1)*34;return'<div class="t"'+(v?' style="background:linear-gradient(145deg,hsl('+h%360+' 85% 70%),hsl('+h%360+' 75% 55%));box-shadow:0 0 '+Math.min(24,Math.log2(v)*2.4)+'px hsl('+h%360+' 85% 60%/.7);font-size:'+(v>999?'1.05':v>99?'1.45':'1.9')+'rem"':'')+'>'+(v||'')+'</div>'}).join('');api.stats([['Score',sc],['Cible',api.p.t],['Record',best]])}
  function line(a){const r=a.filter(Boolean);for(let i=0;i<r.length-1;i++)if(r[i]==r[i+1]){r[i]*=2;sc+=r[i];r.splice(i+1,1)}while(r.length<4)r.push(0);return r}
  function move(d){if(over)return;const old=g.join();
    for(let k=0;k<4;k++){const idx=[0,1,2,3].map(j=>d==0?k*4+j:d==2?k*4+3-j:d==1?j*4+k:(3-j)*4+k);const r=line(idx.map(i=>g[i]));idx.forEach((i,j)=>g[i]=r[j])}
    if(g.join()==old)return;add();beep(300+Math.min(sc,1500)/3,.05,'triangle');
    if(sc>best){best=sc;S.set('2048-best',best)}
    if(Math.max(...g)>=api.p.t){over=1;m.textContent='Tuile '+api.p.t+' atteinte !';render();api.win();return}
    if(stuck()){over=1;m.textContent='Plus aucun coup possible. Score : '+sc;beep(150,.4,'sawtooth')}
    render()}
  function init(){g=Array(16).fill(0);sc=0;over=0;add();add();m.textContent='Flèches ou glisse le doigt pour fusionner les tuiles.';render()}
  const K={ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3,q:0,z:1,d:2,s:3};
  const kd=e=>{if(e.key in K){e.preventDefault();move(K[e.key])}};
  addEventListener('keydown',kd);swipe(el,([x,y])=>move(x?(x<0?0:2):(y<0?1:3)));
  el.querySelector('#re').onclick=init;init();
  return()=>removeEventListener('keydown',kd);
});
