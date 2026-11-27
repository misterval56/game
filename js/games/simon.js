/* Simon — niveaux : tempo (p.st en ms) ; objectif = longueur de séquence */
Bazar.reg('simon',function(el,api){
  const C=['#ff5d73','#ffc857','#3ddc97','#4de1ff'],F=[330,415,495,660],ST=api.p.st;let seq=[],i=0,lock=0,best=S.get('simon-best',0);
  el.innerHTML='<p class="msg" id="m" aria-live="polite">Mémorise la séquence.</p><div class="board simon" id="b"></div><div class="row"><button class="btn" id="re">Jouer</button></div>';
  const b=el.querySelector('#b'),m=el.querySelector('#m'),stats=()=>api.stats([['Séquence',seq.length+'/'+api.t],['Record',best]]);
  C.forEach((c,k)=>{const p=document.createElement('button');p.style.setProperty('--c',c);p.setAttribute('aria-label','Pad '+(k+1));p.onclick=()=>press(k);b.append(p)});
  const lit=k=>{const p=b.children[k];p.classList.add('on');beep(F[k],.25,'sine',.08);setTimeout(()=>p.classList.remove('on'),ST*.55)};
  function show(){lock=1;m.textContent='Regarde…';seq.forEach((k,n)=>setTimeout(()=>lit(k),600+n*ST));setTimeout(()=>{lock=0;i=0;m.textContent='À toi !'},600+seq.length*ST)}
  function press(k){if(lock||!seq.length)return;lit(k);
    if(k!=seq[i]){lock=1;if(seq.length-1>best){best=seq.length-1;S.set('simon-best',best)}m.textContent='Raté ! Tu as atteint la séquence '+(seq.length-1)+'.';beep(150,.4,'sawtooth');seq=[];stats();return}
    if(++i==seq.length){if(seq.length>best){best=seq.length;S.set('simon-best',best)}api.score(seq.length);if(seq.length>=api.t){lock=1;m.textContent='Parfait ! Séquence '+seq.length+' réussie.';return}seq.push(Math.random()*4|0);stats();lock=1;setTimeout(show,700)}}
  el.querySelector('#re').onclick=()=>{seq=[Math.random()*4|0];stats();show()};stats();
  return()=>{seq=[];lock=1};
});
