/* Taupe — niveaux : rythme d'apparition (p.ms/p.min) ; objectif = taupes tapées en 30 s */
Bazar.reg('taupe',function(el,api){
  const P=api.p;let sc=0,t=30,tm,mt,cur=-1,run=0,best=S.get('mole-best',0);
  el.innerHTML='<div class="board moles" id="b"></div><div class="row"><button class="btn" id="re">Jouer</button></div><p class="hint">Tape les taupes avant qu’elles ne disparaissent. 30 secondes.</p>';
  const b=el.querySelector('#b'),stats=()=>api.stats([['Score',sc+'/'+api.t],['Temps',t],['Record',best]]),clear=()=>[...b.children].forEach(h=>h.textContent='');
  for(let i=0;i<9;i++){const h=document.createElement('button');h.setAttribute('aria-label','Trou '+(i+1));h.onclick=()=>{if(run&&i==cur){sc++;cur=-1;beep(700+sc*10,.06,'triangle');h.textContent='💥';stats();api.score(sc);if(sc>=api.t)end()}};b.append(h)}
  function pop(){clear();cur=Math.random()*9|0;b.children[cur].textContent='🐹';mt=setTimeout(pop,Math.max(P.min,P.ms-sc*14))}
  function end(){run=0;clearInterval(tm);clearTimeout(mt);if(sc>best){best=sc;S.set('mole-best',best)}setTimeout(clear,250);stats()}
  el.querySelector('#re').onclick=()=>{clearInterval(tm);clearTimeout(mt);sc=0;t=30;run=1;stats();pop();tm=setInterval(()=>{t--;stats();if(t<=0)end()},1000)};
  stats();return()=>{clearInterval(tm);clearTimeout(mt)};
});
