/* Pong — niveaux : vitesse de l'IA (p.ai) ; premier à 7 points */
Bazar.reg('pong',function(el,api){
  const W=400,H=300,[x,c,re]=cvs(el,W,H,'Souris, doigt ou ↑ ↓. Premier à 7 points.'),[k,off]=keys(),A=api.p.ai;
  let py,ay,b,s1,s2,tm,tr=[],best=S.get('pong-best',0);
  const stats=()=>api.stats([['Toi',s1],['Ordi',s2],['Victoires',best]]);
  const serve=d=>{b={x:200,y:150,vx:4*d,vy:(Math.random()-.5)*5};tr=[]};
  function draw(m){x.fillStyle='#0b0820';x.fillRect(0,0,W,H);x.fillStyle='rgba(255,255,255,.15)';for(let i=0;i<H;i+=20)x.fillRect(198,i,4,10);
    x.fillStyle='rgba(255,255,255,.08)';x.font='80px Bungee,sans-serif';x.textAlign='center';x.fillText(s1,100,160);x.fillText(s2,300,160);
    tr.forEach((t,i)=>{x.fillStyle='rgba(255,200,87,'+i/tr.length*.3+')';x.beginPath();x.arc(t[0],t[1],6,0,7);x.fill()});
    glow(x,'#4de1ff',12,()=>{x.fillStyle='#eef0ff';x.fillRect(14,py,8,60);x.fillRect(W-22,ay,8,60)});
    glow(x,'#ffc857',16,()=>{x.fillStyle='#ffc857';x.beginPath();x.arc(b.x,b.y,7,0,7);x.fill()});ov(x,W,H,m)}
  function step(){if(k.ArrowUp||k.z)py-=6;if(k.ArrowDown||k.s)py+=6;py=Math.max(0,Math.min(H-60,py));
    ay+=Math.max(-A,Math.min(A,b.y-30-ay));ay=Math.max(0,Math.min(H-60,ay));
    tr.push([b.x,b.y]);if(tr.length>8)tr.shift();
    b.x+=b.vx;b.y+=b.vy;if(b.y<7||b.y>H-7)b.vy*=-1;b.vy=Math.max(-7,Math.min(7,b.vy));
    if(b.vx<0&&b.x<29&&b.x>14&&b.y>py-6&&b.y<py+66){b.vx=Math.min(9,-b.vx*1.07);b.vy+=(b.y-py-30)*.12;beep(440,.05)}
    if(b.vx>0&&b.x>W-29&&b.x<W-14&&b.y>ay-6&&b.y<ay+66){b.vx=-Math.min(9,b.vx*1.07);b.vy+=(b.y-ay-30)*.12;beep(330,.05)}
    if(b.x<0||b.x>W){const left=b.x<0;left?s2++:s1++;beep(left?150:800,.2,left?'sawtooth':'triangle');
      if(s1==7||s2==7){clearInterval(tm);if(s1==7){best++;S.set('pong-best',best)}stats();draw(s1==7?'Gagné !':'Perdu');if(s1==7)api.win();return}
      stats();serve(left?-1:1)}
    draw()}
  function reset(){clearInterval(tm);py=ay=120;s1=s2=0;serve(1);stats();draw('Appuie sur Jouer')}
  re.onclick=()=>{reset();tm=setInterval(step,16)};
  c.onpointermove=e=>{py=Math.max(0,Math.min(H-60,(e.clientY-c.getBoundingClientRect().top)/c.clientHeight*H-30))};
  reset();return()=>{clearInterval(tm);off()};
});
