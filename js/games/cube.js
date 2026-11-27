/* Cube Dash — 3 niveaux (Néon, Lave, Espace) ; le niveau choisi vient du menu (api.i) */
Bazar.reg('cube',function(el,api){
  const W=480,H=270,G=220,LV=[
    {n:'Néon',sp:5,c:['#2b1a6b','#0f6a8a'],a:'#4de1ff',s:'^ ^ ^^ # ^ ^^^ ## ^ # ^^ ^ ### ^^^ ^ #'},
    {n:'Lave',sp:6,c:['#5a1030','#b8421a'],a:'#ffc857',s:'^^ ^ # ^^^ ## ^ ^^ ### ^ # ^^^ ^^ ## ^ ^^^ #'},
    {n:'Espace',sp:7,c:['#050a30','#3b1a7a'],a:'#c084fc',s:'^^^ ^ ## ^^ ### ^ ^^^ # ^^ ^^^ ## ^ ### ^^^ ^^ # ^^^ ^ ##'}];
  const[x,c,re]=cvs(el,W,H,'Espace, flèche haut ou touche l’écran pour sauter. Atterris sur les blocs !'),L=api.i,l=LV[L];
  let y,vy,ob,d,end0,rot,tm,run,over,gnd,att=0,pr=0,pt=[],f=0,dying=0,P=S.get('dash-p',[0,0,0]);
  const stats=()=>api.stats([['Essais',att],['Progrès',pr+'%'],['Meilleur',P[L]+'%']]);
  function build(){ob=[];let wx=500;const gap=Math.ceil((l.sp*32+40)/30);l.s.split(' ').forEach(t=>{[...t].forEach((ch,i)=>ob.push({x:wx+i*30,t:ch=='#'}));wx+=t.length*30+gap*30});end0=wx+200}
  function draw(m){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,l.c[0]);g.addColorStop(1,l.c[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='rgba(255,255,255,'+Math.max(0,1-(f%36)/36)*.1+')';x.fillRect(0,0,W,H);
    x.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<7;i++){const bx=((i*110-d*.25)%770+770)%770-140;x.beginPath();x.moveTo(bx,G);x.lineTo(bx+70,G-60-(i%3)*30);x.lineTo(bx+140,G);x.fill()}
    x.fillStyle='#0a0e24';x.fillRect(0,G,W,H-G);x.fillStyle=l.a;x.fillRect(0,G,W,3);x.globalAlpha=.25;for(let i=0;i<14;i++)x.fillRect(((i*40-d)%560+560)%560-40,G+14,24,2);x.globalAlpha=1;
    x.shadowBlur=12;x.shadowColor=l.a;
    ob.forEach(o=>{const sx=o.x-d;if(sx<-40||sx>W+10)return;if(o.t){x.fillStyle='#10163a';x.strokeStyle=l.a;x.lineWidth=2;x.fillRect(sx,G-30,30,30);x.strokeRect(sx+1,G-29,28,28)}else{x.fillStyle='#ff5d73';x.beginPath();x.moveTo(sx,G);x.lineTo(sx+15,G-30);x.lineTo(sx+30,G);x.fill()}});
    x.shadowBlur=0;pt.forEach(p=>{x.globalAlpha=Math.min(1,p.l/18);x.fillStyle=p.c;x.fillRect(p.x,p.y,4,4)});x.globalAlpha=1;
    if(!dying&&!over||m&&m[0]=='N'){x.save();x.translate(85,y+15);x.rotate(rot);x.fillStyle='#ffd23f';x.fillRect(-15,-15,30,30);x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(-14,-14,28,28);x.fillStyle='#0a0e24';x.fillRect(-8,-7,6,7);x.fillRect(3,-7,6,7);x.fillRect(-8,5,17,3);x.restore()}
    x.fillStyle='rgba(255,255,255,.2)';x.fillRect(20,12,W-40,6);x.fillStyle=l.a;x.fillRect(20,12,(W-40)*pr/100,6);x.fillStyle='#eef0ff';x.font='600 13px Outfit,sans-serif';x.textAlign='left';x.fillText(pr+'%',20,34);ov(x,W,H,m)}
  function save(){if(pr>P[L]){P[L]=pr;S.set('dash-p',P)}stats()}
  function die(){att++;save();dying=30;beep(140,.5,'sawtooth');for(let i=0;i<34;i++)pt.push({x:85,y:y+15,vx:(Math.random()-.5)*9,vy:(Math.random()-.5)*9,l:30,c:i%2?'#ffd23f':l.a})}
  function win(){clearInterval(tm);over=1;pr=100;P[L]=100;S.set('dash-p',P);stats();beep(660,.15,'triangle');setTimeout(()=>beep(880,.3,'triangle'),160);draw('Niveau réussi !');api.win()}
  function step(){f++;pt.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.l--});pt=pt.filter(p=>p.l>0);
    if(dying){dying--;if(dying)draw();else{clearInterval(tm);over=1;draw('Crash · '+pr+'% — touche pour rejouer')}return}
    const py=y;vy+=.85;y+=vy;gnd=0;if(y>=G-30){y=G-30;vy=0;gnd=1}d+=l.sp;let dead=0;
    for(const o of ob){const sx=o.x-d;if(sx>110||sx<40)continue;
      if(o.t){const top=G-30;if(100>sx+2&&70<sx+28){if(py+30<=top+2&&y+30>=top&&vy>=0){y=top-30;vy=0;gnd=1}else if(y+30>top+3)dead=1}}
      else if(96>sx+7&&74<sx+23&&y+26>G-22)dead=1}
    if(gnd)rot=Math.round(rot/1.5708)*1.5708;else rot+=.12;
    pr=Math.min(100,d/end0*100|0);if(f%2==0)pt.push({x:85,y:y+28,vx:-l.sp*.5,vy:(Math.random()-.5)*1.5,l:18,c:l.a});
    if(dead){die();return}if(d>=end0){win();return}draw()}
  function reset(){build();y=G-30;vy=0;d=0;rot=0;pt=[];run=over=dying=0;gnd=1;pr=0;stats();draw('Touche pour sauter')}
  const jump=()=>{if(dying)return;if(over&&pr<100)reset();if(!run){run=1;tm=setInterval(step,16)}if(gnd){vy=-13.5;gnd=0;beep(520,.07,'square',.03)}};
  const kd=e=>{if(e.key==' '||e.key=='ArrowUp'){e.preventDefault();jump()}};
  addEventListener('keydown',kd);c.onpointerdown=jump;re.onclick=()=>{clearInterval(tm);reset();jump()};reset();
  return()=>{clearInterval(tm);removeEventListener('keydown',kd)};
});
