/* Memory — 8 paires, chrono et record */
Bazar.reg('memory',function(el,api){
  const E=['🐙','🍕','🚀','🎸','🦊','🌵','🍩','👾'];let first,lock,mv,fd,t,tm,best=S.get('mem-best',null);
  const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  el.innerHTML='<div class="board mem" id="b"></div><div class="row"><button class="btn" id="re">Rejouer</button></div>';
  const b=el.querySelector('#b'),st=()=>api.stats([['Coups',mv],['Temps',fmt(t)],['Record',best?fmt(best):'–']]);
  function init(){clearInterval(tm);tm=null;first=null;lock=0;mv=0;fd=0;t=0;b.innerHTML='';[...E,...E].sort(()=>Math.random()-.5).forEach(v=>{const c=document.createElement('button');c.className='mc';c.setAttribute('aria-label','Carte');c.innerHTML='<span class="in"><span class="fr"></span><span class="bk">'+v+'</span></span>';c.onclick=()=>flip(c,v);b.append(c)});st()}
  function flip(c,v){if(lock||c.classList.contains('up'))return;if(!tm)tm=setInterval(()=>{t++;st()},1000);c.classList.add('up');beep(520,.06);if(!first){first=[c,v];return}mv++;const[a,av]=first;first=null;
    if(av==v){fd++;beep(780,.12,'triangle');if(fd==8){clearInterval(tm);if(!best||t<best){best=t;S.set('mem-best',t)}confetti();beep(988,.3,'triangle')}}
    else{lock=1;setTimeout(()=>{a.classList.remove('up');c.classList.remove('up');lock=0},750)}st()}
  el.querySelector('#re').onclick=init;init();
  return()=>clearInterval(tm);
});
