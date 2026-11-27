/* Snake — niveaux : vitesse, rochers, murs traversables (api.p) ; objectif = score cible */
Bazar.reg('snake',function(el,api){
  const N=20,Z=24,W=N*Z,P=api.p;let sn,dir={x:1,y:0},nd=dir,food,rocks=[],sc=0,best=S.get('snake-best',0),st='idle',to,pulse=0;
  const[x,c,re]=cvs(el,W,W,'Flèches, ZQSD ou glisse le doigt sur la grille.');
  const stats=()=>api.stats([['Score',sc+'/'+api.t],['Record',best]]);
  const free=(a,b)=>!sn.some(p=>p.x==a&&p.y==b)&&!rocks.some(p=>p.x==a&&p.y==b);
  function put(){let a,b;do{a=Math.random()*N|0;b=Math.random()*N|0}while(!free(a,b));food={x:a,y:b}}
  function mkRocks(){rocks=[];while(rocks.length<P.obs){const a=Math.random()*N|0,b=Math.random()*N|0;if(Math.abs(b-10)>1&&free(a,b)&&!rocks.some(r=>r.x==a&&r.y==b))rocks.push({x:a,y:b})}}
  function draw(msg){pulse+=.15;x.fillStyle='#120d2b';x.fillRect(0,0,W,W);
    x.strokeStyle='rgba(255,255,255,.05)';for(let i=1;i<N;i++){x.beginPath();x.moveTo(i*Z,0);x.lineTo(i*Z,W);x.moveTo(0,i*Z);x.lineTo(W,i*Z);x.stroke()}
    if(!P.wrap){x.strokeStyle='#ff5d73';x.lineWidth=4;x.strokeRect(2,2,W-4,W-4);x.lineWidth=1}
    rocks.forEach(r=>{x.fillStyle='#4a4470';x.beginPath();x.roundRect(r.x*Z+2,r.y*Z+2,Z-4,Z-4,7);x.fill();x.fillStyle='#6a639a';x.fillRect(r.x*Z+6,r.y*Z+6,6,4)});
    glow(x,'#ff5d73',16+Math.sin(pulse)*6,()=>{x.fillStyle='#ff5d73';x.beginPath();x.arc(food.x*Z+Z/2,food.y*Z+Z/2,Z/2-4+Math.sin(pulse)*1.2,0,7);x.fill()});
    glow(x,'#4de1ff',10,()=>sn.forEach((p,i)=>{x.fillStyle='hsl('+(190+i*4)%360+' 90% '+(64-Math.min(i,20)*.8)+'%)';x.beginPath();x.roundRect(p.x*Z+1.5,p.y*Z+1.5,Z-3,Z-3,i?7:11);x.fill()}));
    const h=sn[0],ex=dir.y?5:0,ey=dir.x?5:0;x.fillStyle='#120d2b';[-1,1].forEach(s=>{x.beginPath();x.arc(h.x*Z+Z/2+dir.x*4+s*ex,h.y*Z+Z/2+dir.y*4+s*ey,2.6,0,7);x.fill()});ov(x,W,W,msg)}
  function reset(){clearTimeout(to);sn=[{x:9,y:10},{x:8,y:10},{x:7,y:10}];dir=nd={x:1,y:0};sc=0;st='idle';mkRocks();put();stats();draw('Appuie sur une direction')}
  function tick(){dir=nd;let h={x:sn[0].x+dir.x,y:sn[0].y+dir.y};
    if(P.wrap){h.x=(h.x+N)%N;h.y=(h.y+N)%N}
    if(h.x<0||h.y<0||h.x>=N||h.y>=N||!free(h.x,h.y)){st='over';if(sc>best){best=sc;S.set('snake-best',best)}stats();beep(150,.4,'sawtooth');draw('Perdu · '+sc+' pts');return}
    sn.unshift(h);if(h.x==food.x&&h.y==food.y){sc++;put();beep(700+sc*15,.07,'triangle');stats();api.score(sc)}else sn.pop();
    draw();if(sc<api.t)to=setTimeout(tick,Math.max(60,P.sp-sc*2));else{st='over';draw('Gagné !')}}
  function turn(dx,dy){if(st=='over'||(dx==-dir.x&&dy==-dir.y))return;nd={x:dx,y:dy};if(st=='idle'){st='run';tick()}}
  const K={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],z:[0,-1],s:[0,1],q:[-1,0],d:[1,0]};
  const kd=e=>{const k=K[e.key];if(k){e.preventDefault();turn(...k)}};
  addEventListener('keydown',kd);swipe(c,k=>turn(...k));
  re.onclick=()=>{reset();turn(1,0)};reset();
  return()=>{clearTimeout(to);removeEventListener('keydown',kd)};
});
