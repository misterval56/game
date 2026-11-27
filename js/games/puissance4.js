/* Puissance 4 — niveaux : profondeur de réflexion de l'IA (p.d : 0 = hasard) */
Bazar.reg('puissance4',function(el,api){
  let B,over,wait,sc=S.get('p4-sc',{w:0,l:0,d:0});
  el.innerHTML='<p class="msg" id="m" aria-live="polite"></p><div class="board p4" id="b"></div><div class="row"><button class="btn" id="re">Rejouer</button></div>';
  const b=el.querySelector('#b'),m=el.querySelector('#m');
  const stats=()=>api.stats([['Victoires',sc.w],['Nuls',sc.d],['Défaites',sc.l]]);
  const WIN=[];for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const[dr,dc]of[[0,1],[1,0],[1,1],[1,-1]]){const w=[];for(let k=0;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>5||cc<0||cc>6)break;w.push(rr*7+cc)}if(w.length==4)WIN.push(w)}
  const dr=(B,c)=>{for(let r=5;r>=0;r--)if(!B[r*7+c])return r*7+c;return -1};
  const ev=B=>{let s=0;for(const w of WIN){let y=0,r=0;for(const i of w){if(B[i]=='Y')y++;else if(B[i]=='R')r++}if(!r)s+=[0,1,4,20,1e4][y];if(!y)s-=[0,1,4,20,1e4][r]}return s};
  const win=(i,p)=>WIN.some(w=>w.includes(i)&&w.every(j=>B[j]==p));
  function mx(B,d,a,bb,max){const v=ev(B);if(!d||Math.abs(v)>=1e4)return v*(d+1);let best=max?-1e9:1e9,any=0;for(const c of[3,2,4,1,5,0,6]){const q=dr(B,c);if(q<0)continue;any=1;B[q]=max?'Y':'R';const s=mx(B,d-1,a,bb,!max);B[q]='';if(max){best=Math.max(best,s);a=Math.max(a,s)}else{best=Math.min(best,s);bb=Math.min(bb,s)}if(bb<=a)break}return any?best:0}
  function pick(){const cs=[0,1,2,3,4,5,6].filter(c=>dr(B,c)>=0),d=api.p.d;
    const t=(p,c)=>{const q=dr(B,c);B[q]=p;const w=win(q,p);B[q]='';return w};
    let k=cs.find(c=>t('Y',c));if(k!=null)return k;
    if(!d)return cs[Math.random()*cs.length|0];
    let bs=-1e9,mv=[];for(const c of cs){const q=dr(B,c);B[q]='Y';const s=mx(B,d,-1e9,1e9,false);B[q]='';if(s>bs){bs=s;mv=[c]}else if(s==bs)mv.push(c)}return mv[Math.random()*mv.length|0]}
  function draw(){b.innerHTML='';B.forEach((v,i)=>{const e=document.createElement('button');e.className=v;e.setAttribute('aria-label','Colonne '+(i%7+1));e.onclick=()=>play(i%7);b.append(e)})}
  function done(i,p){if(win(i,p)){over=1;if(p=='R'){sc.w++;m.textContent='Tu gagnes !';beep(880,.3,'triangle');api.win()}else{sc.l++;m.textContent="L'ordi gagne.";beep(180,.3,'sawtooth')}}else if(!B.includes('')){over=1;sc.d++;m.textContent='Égalité.'}else return 0;S.set('p4-sc',sc);stats();return 1}
  function play(c){if(over||wait)return;const q=dr(B,c);if(q<0)return;B[q]='R';beep(500,.06);draw();if(done(q,'R'))return;wait=1;
    setTimeout(()=>{wait=0;const k=pick(),z=dr(B,k);B[z]='Y';beep(380,.06);draw();done(z,'Y')},400)}
  function reset(){B=Array(42).fill('');over=0;wait=0;m.textContent='À toi, tu joues les rouges.';draw();stats()}
  el.querySelector('#re').onclick=reset;reset();
});
