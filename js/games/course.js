/* Course — niveaux : vitesse de départ/max et densité du trafic ; objectif = score */
Bazar.reg('course',function(el,api){
  const[x,c,re]=cvs(el,300,480,'← → ou touche la moitié gauche / droite de la route.'),P=api.p;
  const[k,off]=keys();let car,en,sp,dist,sc,so,tm,tl=0,tr=0,best=S.get('car-best',0);
  const stats=()=>api.stats([['Score',sc+'/'+api.t],['Record',best]]);
  const veh=(px,py,col,hero)=>{glow(x,col,hero?18:8,()=>{x.fillStyle=col;x.beginPath();x.roundRect(px,py,30,54,9);x.fill()});x.fillStyle='rgba(255,255,255,.65)';x.fillRect(px+5,py+13,20,11);x.fillStyle='rgba(0,0,0,.28)';x.fillRect(px+5,py+36,20,8);if(hero){x.fillStyle='#fff7c2';x.fillRect(px+3,py,6,4);x.fillRect(px+21,py,6,4)}};
  function draw(m){const g=x.createLinearGradient(0,0,0,480);g.addColorStop(0,'#0c0a24');g.addColorStop(1,'#1d1750');x.fillStyle=g;x.fillRect(0,0,300,480);x.fillStyle='#211b57';x.fillRect(30,0,240,480);
    glow(x,'#ffc857',10,()=>{x.fillStyle='#ffc857';x.fillRect(28,0,4,480);x.fillRect(268,0,4,480)});
    x.fillStyle='rgba(238,240,255,.7)';for(let i=-1;i<13;i++)x.fillRect(148,i*40+so,4,22);
    en.forEach(e=>veh(e.x,e.y,e.c));veh(car.x,400,'#ff5d73',1);ov(x,300,480,m)}
  function end(m){clearInterval(tm);if(sc>best){best=sc;S.set('car-best',best)}stats();if(!m)beep(120,.5,'sawtooth');draw(m||'Crash · '+sc+' pts')}
  function step(){if(k.ArrowLeft||k.q||tl)car.x-=5;if(k.ArrowRight||k.d||tr)car.x+=5;car.x=Math.max(32,Math.min(238,car.x));
    sp=Math.min(P.sm,sp+.004);dist+=sp;sc=dist/60|0;so=(so+sp)%40;
    if(!en.length||(en[en.length-1].y>170&&Math.random()<P.d))en.push({x:34+Math.random()*200|0,y:-60,c:'hsl('+(Math.random()*360|0)+' 80% 60%)'});
    en.forEach(e=>e.y+=sp*.6);en=en.filter(e=>e.y<490);
    if(en.some(e=>Math.abs(e.x-car.x)<28&&Math.abs(e.y-400)<50)){end();return}
    stats();if(sc>=api.t){end('Arrivée !');api.win();return}draw()}
  function reset(){clearInterval(tm);car={x:135};en=[];sp=P.s0;dist=0;sc=0;so=0;stats();draw('Appuie sur Jouer')}
  re.onclick=()=>{reset();tm=setInterval(step,16)};
  c.onpointerdown=c.onpointermove=e=>{if(e.buttons){const r=c.getBoundingClientRect(),l=e.clientX-r.left<r.width/2;tl=l;tr=!l}};
  c.onpointerup=c.onpointerleave=()=>tl=tr=0;
  reset();return()=>{clearInterval(tm);off()};
});
