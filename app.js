import { slides } from './content.js';
import { NatureRenderer } from './scenes.js';
import { plateModes } from './tectonics.js';

const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const length=16000;
let current=0,animation=null,startTime=0,elapsed=0,paused=false,stage=-1,viewer=null,plateMode='subduction',progress=0;
const activeSlide=()=>current===1?{...slides[1],...plateModes[plateMode]}:slides[current];
try { viewer=new NatureRenderer($('scene'),$('scene-labels')); }
catch(error) { $('webgl-error').hidden=false;$('scene').hidden=true;console.error('Initialisation WebGL impossible',error); }
function draw(p=0){progress=clamp(p);viewer?.draw(progress);const s=activeSlide();const thresholds=s.stageTimes||[0,.25,.5,.75];const nextStage=Math.min(s.status.length-1,thresholds.filter(t=>progress>=t).length-1);$('scrub').value=Math.round(progress*1000);$('time-value').textContent=`${Math.round(progress*100)} %`;if(stage!==nextStage){stage=nextStage;$('scene-status').textContent=s.status[stage];document.querySelectorAll('.stage-button').forEach((button,i)=>button.setAttribute('aria-pressed',i===stage));}}
function stop(){if(animation!==null)cancelAnimationFrame(animation);animation=null;paused=false;elapsed=0;stage=-1;$('pause').hidden=true;$('animate').disabled=!viewer||viewer.lost;}
function render(index){
  stop();current=clamp(index,0,slides.length-1);const s=activeSlide();
  $('slide-title').textContent=s.title;$('eyebrow').textContent=s.eyebrow;$('lead').textContent=s.lead;
  $('keywords').replaceChildren(...s.words.map(word=>{const el=document.createElement('span');el.className='keyword';el.textContent=word;return el;}));
  $('concept').innerHTML='<strong>À retenir</strong>';$('concept').append(document.createTextNode(s.remember));
  $('scene-label').textContent=s.label;$('scene').setAttribute('aria-label',s.lead);
  $('script').textContent=s.script;$('gesture').textContent=s.gesture;
  $('step-count').textContent=`Étape ${current+1} / 6`;$('duration').textContent=s.duration;
  $('previous').disabled=current===0;$('next').disabled=current===5;$('next').textContent=current===4?'Pour finir →':'Suivant →';
  $('animate').hidden=current===0||current===5;$('animate').textContent=reducedMotion.matches?'Voir les étapes →':'▶ Lancer l’animation';
  document.querySelectorAll('.chapter').forEach((el,i)=>{el.classList.toggle('active',i===current);if(i===current)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $('timeline').hidden=current===0||current===5;
  const shortLabels=s.stageLabels||['Au début','Ça bouge','Le phénomène','À la fin'];
  $('stage-buttons').replaceChildren(...shortLabels.map((text,i)=>{const b=document.createElement('button');b.type='button';b.className='stage-button';b.textContent=text;b.setAttribute('aria-label',s.status[i]||text);b.addEventListener('click',()=>{stop();draw((s.snapshots||[0,.38,.66,1])[i]);});return b;}));
  $('plate-picker').hidden=current!==1;
  document.querySelectorAll('.plate-button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===plateMode));
  viewer?.select(current,plateMode);draw();
}
function tick(now){elapsed=now-startTime;draw(clamp(elapsed/length));if(elapsed<length){animation=requestAnimationFrame(tick);}else{animation=null;$('pause').hidden=true;$('animate').disabled=!viewer||viewer.lost;$('animate').textContent='↻ Revoir l’animation';}}
document.querySelector('.chapters').replaceChildren(...slides.map((s,i)=>{const b=document.createElement('button');b.type='button';b.className='chapter';b.innerHTML=`<span class="chapter-number">${String(i+1).padStart(2,'0')}</span>${s.nav}`;b.addEventListener('click',()=>render(i));return b;}));
$('animate').addEventListener('click',()=>{if(reducedMotion.matches){const next=stage>=3?0:stage+1;draw((activeSlide().snapshots||[0,.38,.66,1])[next]);return;}stop();$('animate').disabled=true;$('pause').hidden=false;$('pause').textContent='Pause';startTime=performance.now();animation=requestAnimationFrame(tick);});
$('scrub').addEventListener('input',()=>{stop();draw(Number($('scrub').value)/1000);});
$('plate-options').replaceChildren(...Object.entries(plateModes).map(([key,value])=>{const button=document.createElement('button');button.type='button';button.className='concept-button plate-button';button.textContent=`${value.name} · ${value.term}`;button.dataset.mode=key;button.setAttribute('aria-pressed',key===plateMode);button.addEventListener('click',()=>{plateMode=key;render(1);});return button;}));
$('pause').addEventListener('click',()=>{if(paused){paused=false;startTime=performance.now()-elapsed;animation=requestAnimationFrame(tick);$('pause').textContent='Pause';}else{paused=true;cancelAnimationFrame(animation);animation=null;$('pause').textContent='Reprendre';}});
$('previous').addEventListener('click',()=>render(current-1));$('next').addEventListener('click',()=>render(current+1));
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();render(0);});
document.addEventListener('keydown',e=>{if(e.target.closest('button,summary,a,input,textarea,select'))return;if(e.key==='ArrowRight'){e.preventDefault();render(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();render(current-1);}});
$('scene').addEventListener('renderer-unavailable',()=>{stop();$('webgl-error').hidden=false;});
$('scene').addEventListener('renderer-available',()=>{$('webgl-error').hidden=true;$('animate').disabled=false;});
render(0);
