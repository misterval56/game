/* Flappy — niveaux : ouverture des tuyaux (p.gap) et vitesse (p.v) ; objectif = tuyaux passés */
Bazar.reg('flappy',function(el,api){
  const[x,c,re]=cvs(el,320,480,'Espace, flèche haut ou touche l’écran pour sauter.'),G=api.p.gap,V=api.p.v;
  let y,vy,ps,f,sc,tm,run,over,best=S.get('flap-best',0);
  const stats=()=>api.stats([['Score',sc+'/'+api.t],['Record',best]]);
  const pipe=(px,py,h,cap)=>{x.fillStyle='#3ddc97';x.fillRect(px+4,py,44,h);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(px+10,py,6,h);x.fillStyle='#2bb37a';x.beginPath();x.roundRect(px,cap,52,18,6);x.fill()};
  function draw(m){const g=x.createLinearGradient(0,0,0,480);g.addColorStop(0,'#1b2a7a');g.addColorStop(.7,'#d6567a');g.addColorStop(1,'#ffb36b');x.fillStyle=g;x.fillRect(0,0,320,480);
    x.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<4;i++){const cx=((i*140-f*.4)%520+520)%520-100;x.beginPath();x.ellipse(cx,90+i*55,46,16,0,0,7);x.fill()}
    ps.forEach(p=>{pipe(p.x,-10,p.g+10,p.g-8);pipe(p.x,p.g+G,400,p.g+G)});
    x.save();x.translate(80,y);x.rotate(Math.max(-.5,Math.min(1,vy*.07)));
    glow(x,'#ffc857',14,()=>{x.fillStyle='#ffc857';x.beginPath();x.arc(0,0,13,0,7);x.fill()});
    x.fillStyle='#ff9f43';x.beginPath();x.ellipse(-4,3+Math.sin(f*.4)*3,7,4,-.4,0,7);x.fill();
    x.fillStyle='#fff';x.beginPath();x.arc(6,-4,4.5,0,7);x.fill();x.fillStyle='#0e0a1f';x.beginPath();x.arc(7.5,-4,2,0,7);x.fill();
    x.fillStyle='#ff5d73';x.beginPath();x.moveTo(11,0);x.lineTo(20,3);x.lineTo(11,6);x.fill();x.restore();
    x.fillStyle='#fff';x.font='34px Bungee,sans-serif';x.textAlign='center';x.fillText(sc,160,60);ov(x,320,480,m)}
  function end(m){clearInterval(tm);over=1;if(sc>best){best=sc;S.set('flap-best',best)}stats();draw(m||'Perdu · '+sc)}
  function step(){f++;vy+=.42;y+=vy;if(f%Math.round(220/V)==1)ps.push({x:330,g:60+Math.random()*(330-G+60)|0,s:0});
    ps.forEach(p=>{p.x-=V;if(!p.s&&p.x+52<67){p.s=1;sc++;beep(800,.06,'triangle');stats();api.score(sc)}});ps=ps.filter(p=>p.x>-60);
    if(sc>=api.t){end('Gagné !');return}
    if(y>480||y<0||ps.some(p=>91>p.x&&69<p.x+52&&(y-11<p.g||y+11>p.g+G))){beep(150,.4,'sawtooth');end();return}draw()}
  const flap=()=>{if(over)return;if(!run){run=1;tm=setInterval(step,16)}vy=-7.2;beep(500,.04)};
  function reset(){clearInterval(tm);y=240;vy=0;ps=[];f=0;sc=0;run=over=0;stats();draw('Touche pour sauter')}
  const kd=e=>{if(e.key==' '||e.key=='ArrowUp'){e.preventDefault();flap()}};
  addEventListener('keydown',kd);c.onpointerdown=flap;re.onclick=()=>{reset();flap()};reset();
  return()=>{clearInterval(tm);removeEventListener('keydown',kd)};
});
