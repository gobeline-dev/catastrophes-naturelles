import { slides } from './content.js';
import { NatureRenderer } from './scenes.js';

const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const length=11000;
let current=0,animation=null,startTime=0,elapsed=0,paused=false,stage=-1,viewer=null;
try { viewer=new NatureRenderer($('scene'),$('scene-labels')); }
catch(error) { $('webgl-error').hidden=false;$('scene').hidden=true;console.error('Initialisation WebGL impossible',error); }
function draw(p=0){viewer?.draw(p);const s=slides[current];const nextStage=Math.min(s.status.length-1,Math.floor(p*4));if(stage!==nextStage){stage=nextStage;$('scene-status').textContent=s.status[stage];}}
function stop(){if(animation!==null)cancelAnimationFrame(animation);animation=null;paused=false;elapsed=0;stage=-1;$('pause').hidden=true;$('animate').disabled=!viewer||viewer.lost;}
function render(index){
  stop();current=clamp(index,0,slides.length-1);const s=slides[current];
  $('slide-title').textContent=s.title;$('eyebrow').textContent=s.eyebrow;$('lead').textContent=s.lead;
  $('keywords').replaceChildren(...s.words.map(word=>{const el=document.createElement('span');el.className='keyword';el.textContent=word;return el;}));
  $('concept').innerHTML='<strong>À retenir</strong>';$('concept').append(document.createTextNode(s.remember));
  $('scene-label').textContent=s.label;$('scene').setAttribute('aria-label',s.lead);
  $('script').textContent=s.script;$('gesture').textContent=s.gesture;
  $('step-count').textContent=`Étape ${current+1} / 6`;$('duration').textContent=s.duration;
  $('previous').disabled=current===0;$('next').disabled=current===5;$('next').textContent=current===4?'Pour finir →':'Suivant →';
  $('animate').hidden=current===0||current===5;$('animate').textContent=reducedMotion.matches?'Voir les étapes →':'▶ Lancer l’animation';
  document.querySelectorAll('.chapter').forEach((el,i)=>{el.classList.toggle('active',i===current);if(i===current)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  viewer?.select(current);draw();
}
function tick(now){elapsed=now-startTime;draw(clamp(elapsed/length));if(elapsed<length){animation=requestAnimationFrame(tick);}else{animation=null;$('pause').hidden=true;$('animate').disabled=!viewer||viewer.lost;$('animate').textContent='↻ Revoir l’animation';}}
document.querySelector('.chapters').replaceChildren(...slides.map((s,i)=>{const b=document.createElement('button');b.type='button';b.className='chapter';b.innerHTML=`<span class="chapter-number">${String(i+1).padStart(2,'0')}</span>${s.nav}`;b.addEventListener('click',()=>render(i));return b;}));
$('animate').addEventListener('click',()=>{if(reducedMotion.matches){const p=stage>=3?0:(stage+1)/4+.03;draw(p);return;}stop();$('animate').disabled=true;$('pause').hidden=false;$('pause').textContent='Pause';startTime=performance.now();animation=requestAnimationFrame(tick);});
$('pause').addEventListener('click',()=>{if(paused){paused=false;startTime=performance.now()-elapsed;animation=requestAnimationFrame(tick);$('pause').textContent='Pause';}else{paused=true;cancelAnimationFrame(animation);animation=null;$('pause').textContent='Reprendre';}});
$('previous').addEventListener('click',()=>render(current-1));$('next').addEventListener('click',()=>render(current+1));
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();render(0);});
document.addEventListener('keydown',e=>{if(e.target.closest('button,summary,a,input,textarea,select'))return;if(e.key==='ArrowRight'){e.preventDefault();render(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();render(current-1);}});
$('scene').addEventListener('renderer-unavailable',()=>{stop();$('webgl-error').hidden=false;});
$('scene').addEventListener('renderer-available',()=>{$('webgl-error').hidden=true;$('animate').disabled=false;});
render(0);
