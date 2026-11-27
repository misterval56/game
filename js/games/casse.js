/* Casse-briques — niveaux : rangées (p.rows) et vitesse de la balle (p.sp) */
Bazar.reg('casse',function(el,api){
  const W=360,H=480,[x,c,re]=cvs(el,W,H,'Glisse le doigt ou la souris, ou utilise ← →.'),[k,off]=keys(),P=api.p;
  let p,b,br,sc,lv,tm,run,over,trail=[],best=S.get('brk-best',0);
  const stats=()=>api.stats([['Score',sc],['Vies',lv],['Briques',br.length],['Record',best]]);
  function draw(m){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b0820');g.addColorStop(1,'#16113a');x.fillStyle=g;x.fillRect(0,0,W,H);
    br.forEach(r=>{const g=x.createLinearGradient(0,r.y,0,r.y+16);g.addColorStop(0,'hsl('+(r.h+10)+' 90% 70%)');g.addColorStop(1,'hsl('+(r.h+10)+' 80% 52%)');x.fillStyle=g;x.beginPath();x.roundRect(r.x,r.y,40,16,4);x.fill()});
    trail.forEach((t,i)=>{x.fillStyle='rgba(255,200,87,'+i/trail.length*.35+')';x.beginPath();x.arc(t[0],t[1],5,0,7);x.fill()});
    glow(x,'#4de1ff',14,()=>{x.fillStyle='#eef0ff';x.beginPath();x.roundRect(p.x,H-28,p.w,10,5);x.fill()});
    glow(x,'#ffc857',16,()=>{x.fillStyle='#ffc857';x.beginPath();x.arc(b.x,b.y,6,0,7);x.fill()});ov(x,W,H,m)}
  function end(m){clearInterval(tm);over=1;run=0;if(sc>best){best=sc;S.set('brk-best',best)}stats();draw(m)}
  function step(){if(k.ArrowLeft||k.q)p.x-=7;if(k.ArrowRight||k.d)p.x+=7;p.x=Math.max(0,Math.min(W-p.w,p.x));
    trail.push([b.x,b.y]);if(trail.length>8)trail.shift();
    b.x+=b.vx;b.y+=b.vy;if(b.x<6||b.x>W-6){b.vx*=-1;b.x=Math.max(6,Math.min(W-6,b.x))}if(b.y<6)b.vy=Math.abs(b.vy);
    if(b.vy>0&&b.y>H-34&&b.y<H-16&&b.x>p.x-4&&b.x<p.x+p.w+4){const t=(b.x-p.x)/p.w-.5,s=Math.min(9,P.sp+sc/150);b.vx=s*t*1.5;b.vy=-Math.sqrt(Math.max(s*s-b.vx*b.vx,6));beep(420,.04)}
    const i=br.findIndex(r=>b.x>r.x-6&&b.x<r.x+46&&b.y>r.y-6&&b.y<r.y+22);
    if(i>=0){br.splice(i,1);b.vy*=-1;sc+=10;beep(700,.04,'square',.03);stats()}
    if(b.y>H){lv--;stats();if(lv<1){end('Perdu · '+sc);return}b.x=p.x+p.w/2;b.y=H-40;b.vx=3;b.vy=-P.sp*.8}
    if(!br.length){end('Gagné ! '+sc);api.win();return}draw()}
  function reset(){clearInterval(tm);p={x:145,w:70};b={x:180,y:420,vx:3,vy:-P.sp*.8};br=[];trail=[];for(let r=0;r<P.rows;r++)for(let i=0;i<8;i++)br.push({x:8+i*44,y:50+r*22,h:r*50});sc=0;lv=3;run=over=0;stats();draw('Appuie sur Jouer')}
  const go=()=>{if(!run){run=1;tm=setInterval(step,16)}};
  re.onclick=()=>{reset();go()};
  c.onpointermove=e=>{p.x=Math.max(0,Math.min(W-p.w,(e.clientX-c.getBoundingClientRect().left)/c.clientWidth*W-p.w/2))};
  c.onpointerdown=()=>{if(!over)go()};
  reset();return()=>{clearInterval(tm);off()};
});
