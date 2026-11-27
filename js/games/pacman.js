/* Pac-Man — niveaux : nombre de fantômes (p.gh) et vitesse (p.ms) */
Bazar.reg('pacman',function(el,api){
  const M=["###############","#o.....#.....o#","#.###.###.###.#","#.............#","#.###.#.#.###.#","#.....#.#.....#","#####.#.#.#####","#.............#","#.###.###.###.#","#o..#.....#..o#","###.#.#.#.#.###","#.....#.#.....#","#.###.....###.#","#.............#","###############"],Z=22,W=330;
  const[x,c,re]=cvs(el,W,W,'Flèches, ZQSD ou glisse le doigt. Les gros points rendent les fantômes vulnérables.');
  const S0=[[7,3,'#ff5d73'],[1,13,'#ff9bd2'],[13,13,'#4de1ff']].slice(0,api.p.gh);
  let g,P,D,ND,G,sc,lv,fr,fear,dots,tm,run,over,best=S.get('pac-best',0);
  const stats=()=>api.stats([['Score',sc],['Vies',lv],['Record',best]]);
  const place=()=>{P={x:7,y:7};D=ND={x:0,y:0};G=S0.map(([a,b,k])=>({x:a,y:b,s:[a,b],k,d:{x:0,y:0}}))};
  function draw(m){x.fillStyle='#0b0820';x.fillRect(0,0,W,W);
    for(let j=0;j<15;j++)for(let i=0;i<15;i++){const v=g[j][i];if(v=='#'){glow(x,'#4d6bff',8,()=>{x.fillStyle='#1c2a7a';x.strokeStyle='#4d6bff';x.lineWidth=2;x.beginPath();x.roundRect(i*Z+2,j*Z+2,Z-4,Z-4,6);x.fill();x.stroke()})}else if(v!=' '){x.fillStyle=v=='o'?'#ffc857':'#eef0ff';x.beginPath();x.arc(i*Z+Z/2,j*Z+Z/2,v=='o'?6+Math.sin(fr/2):2.5,0,7);x.fill()}}
    const a=(D.x||D.y)?Math.atan2(D.y,D.x):0,m2=.15+(fr%2)*.3,px=P.x*Z+Z/2,py=P.y*Z+Z/2;
    glow(x,'#ffd23f',14,()=>{x.fillStyle='#ffd23f';x.beginPath();x.moveTo(px,py);x.arc(px,py,Z/2-2,a+m2,a+6.28-m2);x.fill()});
    G.forEach(h=>{x.fillStyle=fear?(fear<15&&fr%2?'#fff':'#4a5bff'):h.k;const gx=h.x*Z+2,gy=h.y*Z+2,s=Z-4;x.beginPath();x.arc(gx+s/2,gy+s/2,s/2,Math.PI,0);x.lineTo(gx+s,gy+s);for(let i=3;i>=0;i--)x.lineTo(gx+i*s/4+(i%2?s/8:0),gy+s-(i%2?0:3));x.fill();
      x.fillStyle='#fff';x.beginPath();x.arc(gx+6,gy+7,3.2,0,7);x.arc(gx+s-6,gy+7,3.2,0,7);x.fill();x.fillStyle='#0b0820';x.beginPath();x.arc(gx+6+h.d.x*1.5,gy+7+h.d.y*1.5,1.6,0,7);x.arc(gx+s-6+h.d.x*1.5,gy+7+h.d.y*1.5,1.6,0,7);x.fill()});
    ov(x,W,W,m)}
  function end(m){clearInterval(tm);over=1;if(sc>best){best=sc;S.set('pac-best',best)}stats();draw(m)}
  function hit(){for(const h of G)if(h.x==P.x&&h.y==P.y){if(fear){h.x=h.s[0];h.y=h.s[1];sc+=200;beep(900,.1,'square',.04);stats()}else{lv--;beep(150,.4,'sawtooth');stats();if(lv<1){end('Perdu · '+sc);return 1}place();draw();return 1}}return 0}
  function tick(){fr++;
    if(g[P.y+ND.y][P.x+ND.x]!='#')D=ND;
    if(g[P.y+D.y][P.x+D.x]!='#'){P.x+=D.x;P.y+=D.y}
    const t=g[P.y][P.x];if(t=='.'||t=='o'){g[P.y][P.x]=' ';sc+=t=='o'?50:10;dots--;if(t=='o')fear=45;beep(t=='o'?300:660,.03,'square',.025);stats()}
    if(fear)fear--;if(hit())return;
    G.forEach(h=>{if(fear?fr%2:!(fr%4))return;let o=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>g[h.y+d[1]][h.x+d[0]]!='#'&&!(d[0]==-h.d.x&&d[1]==-h.d.y));if(!o.length)o=[[-h.d.x,-h.d.y]];
      const dd=d=>(h.x+d[0]-P.x)**2+(h.y+d[1]-P.y)**2,d=Math.random()<.7?o.sort((a,b)=>fear?dd(b)-dd(a):dd(a)-dd(b))[0]:o[Math.random()*o.length|0];h.d={x:d[0],y:d[1]};h.x+=d[0];h.y+=d[1]});
    if(hit())return;if(!dots){end('Gagné ! '+sc);api.win();return}draw()}
  function reset(){clearInterval(tm);g=M.map(r=>r.split(''));dots=g.flat().filter(v=>v=='.'||v=='o').length;place();sc=0;lv=3;fr=0;fear=0;run=over=0;stats();draw('Appuie sur une direction')}
  function turn(dx,dy){if(over)return;ND={x:dx,y:dy};if(!run){run=1;tm=setInterval(tick,api.p.ms)}}
  const K={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],z:[0,-1],s:[0,1],q:[-1,0],d:[1,0]};
  const kd=e=>{const k=K[e.key];if(k){e.preventDefault();turn(...k)}};
  addEventListener('keydown',kd);swipe(c,k=>turn(...k));re.onclick=reset;reset();
  return()=>{clearInterval(tm);removeEventListener('keydown',kd)};
});
