import * as THREE from './vendor/three.module.js';

const C={grass:0x79c855,earth:0xeab666,deep:0xb6814f,water:0x16b9d6,foam:0xe8ffff,rock:0x9374ae,lava:0xff7136,cream:0xffe9b0,roof:0xee6461,cloud:0x8d99cd};
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
function material(color,options={}){return new THREE.MeshStandardMaterial({color,roughness:.65,flatShading:false,...options});}
function mesh(group,geometry,color,x=0,y=0,z=0,options={}){const m=new THREE.Mesh(geometry,material(color,options));m.position.set(x,y,z);group.add(m);return m;}
function box(group,w,h,d,color,x=0,y=0,z=0){return mesh(group,new THREE.BoxGeometry(w,h,d),color,x,y,z);}
function ball(group,r,color,x,y,z,options={}){return mesh(group,new THREE.SphereGeometry(r,16,12),color,x,y,z,options);}
function house(parent,x,y,z,s=1){const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(s);box(g,.7,.68,.62,C.cream,0,.34,0);const roof=mesh(g,new THREE.ConeGeometry(.61,.43,4),C.roof,0,.88,0);roof.rotation.y=Math.PI/4;box(g,.15,.32,.025,0x547681,0,.16,.325);for(const dx of [-.2,.2])box(g,.13,.15,.03,0x9dcfd0,dx,.46,.325);return g;}
function tree(parent,x,y,z,s=1){const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(s);mesh(g,new THREE.CylinderGeometry(.06,.08,.65,6),0x8d745c,0,.32,0);mesh(g,new THREE.ConeGeometry(.4,.94,7),0x668b64,0,.91,0);mesh(g,new THREE.ConeGeometry(.32,.74,7),0x7c9b6e,0,1.24,0);return g;}
function cloud(parent,x,y,z,s=1){const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(s);[[-.7,0,.35],[0,.22,.6],[.65,.02,.43],[.1,-.13,.52]].forEach(([dx,dy,r])=>ball(g,r,C.cloud,dx,dy,0));return g;}
function slab(parent,w=6,d=3.6){box(parent,w,.78,d,C.earth,0,-.55,0);box(parent,w,.12,d,C.grass,0,-.1,0);box(parent,w,.07,d+.01,C.deep,0,-.72,0);}

function palm(parent,x,y,z,s=1){
  const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(s);
  const trunk=mesh(g,new THREE.CylinderGeometry(.075,.13,1.5,10),0xc08845,0,.75,0);trunk.rotation.z=-.13;
  for(let i=0;i<6;i++){const leaf=ball(g,.5,0x39b95f,Math.cos(i*Math.PI/3)*.4,1.55,Math.sin(i*Math.PI/3)*.4);leaf.scale.set(1.5,.18,.48);leaf.rotation.y=-i*Math.PI/3;leaf.rotation.z=.2;}
  return g;
}
function umbrella(parent,x,y,z){
  const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);
  mesh(g,new THREE.CylinderGeometry(.025,.025,.85,8),0xfaf3d0,0,.42,0);
  const canopy=mesh(g,new THREE.ConeGeometry(.56,.28,12,1,true),0xff648a,0,.93,0,{side:THREE.DoubleSide});
  const rim=mesh(g,new THREE.TorusGeometry(.56,.025,6,40),0xffe9b0,0,.79,0);rim.rotation.x=Math.PI/2;
  return g;
}

// One illustrated case: the trough arrives first. This is not true of every tsunami.
export function tsunamiState(p){
  p=clamp(p);
  let shore=-.25;
  if(p>.16&&p<.43)shore-=2.15*ease((p-.16)/.25);
  else if(p>=.43&&p<.76)shore=-2.4+3.65*ease((p-.43)/.33);
  else if(p>=.76)shore=1.25+1.85*ease((p-.76)/.2);
  const crest=-3.35+6.0*ease((p-.43)/.51);
  const waveHeight=1.65*ease((p-.43)/.16)*(1-.65*ease((p-.78)/.2));
  return {shore,crest,waveHeight,withdrawal:clamp((p-.16)/.25),flood:clamp((p-.76)/.2)};
}

export const concepts={
  cartoon:{name:'Dessin animé',description:'Couleurs vives, formes rondes et mouvements très visibles.'},
  comic:{name:'Bande dessinée',description:'Contours noirs, couleurs franches et bruitages écrits.'},
  toys:{name:'Mini-jouets',description:'Une maquette en plastique coloré, vue un peu plus de haut.'}
};
function applyConcept(group,concept){
  const meshes=[];group.traverse(o=>{if(o.isMesh)meshes.push(o);});
  for(const o of meshes){
    const old=o.material;
    if(concept!=='toys'){
      o.material=new THREE.MeshToonMaterial({color:old.color,side:old.side,transparent:old.transparent,opacity:old.opacity,depthWrite:old.depthWrite,emissive:old.emissive||0x000000,emissiveIntensity:old.emissiveIntensity??1});
      old.dispose();
    }else{o.material.roughness=.28;o.material.metalness=.02;}
    if(concept==='comic'&&o.geometry.type!=='PlaneGeometry'&&!o.material.transparent&&o.geometry.type!=='TubeGeometry'){
      const edge=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,32),new THREE.LineBasicMaterial({color:0x283148}));edge.userData.outline=true;o.add(edge);
      if(['SphereGeometry','CylinderGeometry','ConeGeometry','TorusGeometry'].includes(o.geometry.type)){
        const silhouette=new THREE.Mesh(o.geometry.clone(),new THREE.MeshBasicMaterial({color:0x283148,side:THREE.BackSide}));silhouette.scale.setScalar(1.025);silhouette.userData.outline=true;o.add(silhouette);
      }
    }
  }
}

export function createModel(index,concept='cartoon'){
  const group=new THREE.Group();
  const labels=[];
  const label=(text,x,y,z)=>labels.push({text,point:new THREE.Vector3(x,y,z)});
  let update=()=>{};
  if(index===0||index===5){
    const globe=mesh(group,new THREE.IcosahedronGeometry(1.72,3),C.water,0,1.22,0);
    // Abstract land patches: a decorative globe, not a geographic map.
    const randomPatches=[[-.7,2.5,.6,.38],[-1.3,1.9,.55,.42],[-.95,1.42,1.1,.34],[.7,.5,1.18,.4],[1.2,1.05,.6,.33],[.35,2.75,.57,.26]];
    randomPatches.forEach(([x,y,z,r])=>{const b=ball(group,r,C.grass,x,y,z);b.scale.set(1.4,1,.35);});
    const orbit=mesh(group,new THREE.TorusGeometry(2.32,.014,5,90),0xabbcab,0,1.22,0);orbit.rotation.x=1.22;orbit.rotation.z=.2;
    label('La Terre',0,3.35,0);label('Le sol',-2.55,1.3,0);label('La mer',2.4,1.3,0);label('Le ciel',0,-.9,0);
    update=()=>{globe.rotation.y=.15;};
  }
  if(index===1){
    const left=new THREE.Group(),right=new THREE.Group();group.add(left,right);left.position.x=-1.55;right.position.x=1.55;
    for(const g of [left,right]){slab(g,3,3.4);}
    const homes=[house(left,-.3,0,.4,.9),house(right,.3,0,.25,1),house(left,.5,0,-.8,.6)];tree(right,1,0,-.7,.8);
    const source=ball(group,.1,C.lava,0,-.55,1.78,{emissive:C.lava,emissiveIntensity:.3});
    const rings=Array.from({length:4},()=>mesh(group,new THREE.TorusGeometry(1,.045,8,70),C.lava,0,-.55,1.82,{transparent:true,opacity:0}));
    label('Les roches',-1.9,-1.08,1.7);label('La faille',.15,-1.05,1.75);label('Le sol',2.1,.16,1.75);
    update=p=>{const slip=ease((p-.18)/.12)*.58;const shaking=p>.27&&p<.92?Math.sin(p*125)*.12*Math.sin((p-.27)/.65*Math.PI):0;right.position.x=1.55+slip+shaking;right.position.y=-slip*.35;left.position.x=-1.55-slip*.35-shaking;homes.forEach((h,i)=>{h.rotation.z=p>.27&&p<.92?Math.sin(p*100+i)*.18*Math.sin((p-.27)/.65*Math.PI):0;});rings.forEach((r,i)=>{const q=clamp((p-.3-i*.085)/.55);r.visible=q>0&&q<1;r.scale.setScalar(.05+q*3.3);r.material.opacity=(1-q)*.95;});source.scale.setScalar(1+Math.sin(p*35)*.35);};
  }
  if(index===2){
    // A beach diorama: the moving water edge reveals sand, then floods the beach.
    box(group,7.4,.7,4.5,C.deep,0,-.75,0);
    box(group,7.4,.12,4.5,0xf8d67c,0,-.34,0);
    box(group,1.15,.13,4.5,C.grass,3.12,-.25,0);
    const palms=[palm(group,2.83,-.17,-1.48,.85),palm(group,3.13,-.17,1.25,.72)];
    house(group,3.05,-.17,-.3,.68);
    const parasol=umbrella(group,1.12,-.28,-.72);
    const towel=box(group,.65,.025,.85,0xff927a,1.1,-.255,.6);
    const beachball=ball(group,.18,0xffc13c,1.98,-.09,.95);
    const stripe=mesh(beachball,new THREE.TorusGeometry(.177,.035,7,30),0xff687c);stripe.rotation.x=Math.PI/3;
    for(let i=0;i<11;i++){const shell=ball(group,.045,0xfff2cb,-1.8+i*.36,-.24,1.65-(i%3)*.45);shell.scale.y=.35;}
    const geo=new THREE.PlaneGeometry(1,4.45,110,18);geo.rotateX(-Math.PI/2);
    const water=mesh(group,geo,C.water,0,0,0,{side:THREE.DoubleSide});water.name='tsunami-water';
    const positions=geo.attributes.position,original=new Float32Array(positions.array);
    const skirts=[-2.225,2.225].map(z=>{
      const geometry=new THREE.PlaneGeometry(1,1,110,1);
      const side=mesh(group,geometry,z>0?0x0e96be:0x159fc5,0,0,0,{side:THREE.DoubleSide});
      return {geometry,z,position:geometry.attributes.position,original:new Float32Array(geometry.attributes.position.array)};
    });
    const foam=Array.from({length:27},(_,i)=>{const b=ball(group,.065,C.foam,0,0,-2.15+i*.165);b.scale.set(1.5,.4,1.3);return b;});
    const crestFoam=Array.from({length:23},(_,i)=>ball(group,.055,C.foam,0,0,-2+i*.18));
    const arrows=new THREE.Group();group.add(arrows);
    for(const z of [-1,0,1]){const arrow=new THREE.ArrowHelper(new THREE.Vector3(-1,0,0),new THREE.Vector3(-.6,.2,z),.85,0xfef5da,.2,.15);arrows.add(arrow);}
    label('La mer',-2.35,-.86,2.2);label('La plage',1.2,-.86,2.2);
    label(concept==='comic'?'FCHHH !':'Le tsunami',-.2,2.9,-.2);
    update=p=>{
      const state=tsunamiState(p),{shore,crest,waveHeight}=state;
      const width=shore+3.7;
      const floodDepth=.42*ease((p-.74)/.2);
      function heightAt(x,z){const wave=waveHeight*Math.exp(-Math.pow((x-crest)/.48,2));const sea=-.17+floodDepth;return sea+wave+.016*Math.sin(z*5+x*3+p*28);}
      for(let i=0;i<positions.count;i++){const x=-3.7+(original[i*3]+.5)*width;const z=original[i*3+2];positions.setXYZ(i,x,heightAt(x,z),z);}
      positions.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();
      for(const side of skirts){for(let i=0;i<side.position.count;i++){const x=-3.7+(side.original[i*3]+.5)*width;side.position.setXYZ(i,x,side.original[i*3+1]>.0?heightAt(x,side.z):-.285,side.z);}side.position.needsUpdate=true;side.geometry.computeVertexNormals();side.geometry.computeBoundingSphere();}
      foam.forEach((b,i)=>{const z=-2.15+i*.165;b.position.x=shore+.02*Math.sin(z*6+p*25);b.position.y=heightAt(shore,z)+.035;});
      crestFoam.forEach((b,i)=>{b.visible=p>.46&&p<.93&&crest<shore;b.position.set(crest,heightAt(crest,-2+i*.18)+.03,-2+i*.18);b.scale.setScalar(1+Math.sin(p*36+i)*.2);});
      arrows.visible=p>.2&&p<.43;arrows.position.x=-state.withdrawal*.6;
      const floating=ease((p-.79)/.17);beachball.position.set(1.98+floating*.8,-.09+floating*.45,.95+Math.sin(p*18)*floating*.15);
      parasol.rotation.z=-floating*.5;parasol.position.y=-.28+floating*.18;
      towel.position.y=-.255+floating*.41;towel.rotation.z=floating*.18;
      palms.forEach((g,i)=>{g.rotation.z=-floating*.1+Math.sin(p*35+i)*floating*.015;});
      group.userData.shore=shore;group.userData.waveHeight=waveHeight;
    };
  }
  if(index===3){
    slab(group,6,3.6);
    // Open front wedge reveals the magma conduit inside the volcano.
    const mountain=mesh(group,new THREE.CylinderGeometry(.35,1.85,2.35,30,1,false,Math.PI*.28,Math.PI*1.5),C.rock,0,1.1,0);
    mountain.rotation.y=-.15;
    const chamber=ball(group,.51,C.lava,0,-.49,.48,{emissive:C.lava,emissiveIntensity:.5});chamber.scale.set(1.35,.65,1);
    const conduit=mesh(group,new THREE.CylinderGeometry(.12,.17,2.8,12),C.lava,0,.8,.22,{emissive:C.lava,emissiveIntensity:.45});
    const crater=mesh(group,new THREE.TorusGeometry(.34,.065,8,28),0x696f63,0,2.28,0);crater.rotation.x=Math.PI/2;
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.25,2.27,-.07),new THREE.Vector3(.57,1.83,.4),new THREE.Vector3(1.08,1.07,.75),new THREE.Vector3(1.65,.1,1.07),new THREE.Vector3(2.3,.03,1.18)]);
    const lavaGeo=new THREE.TubeGeometry(curve,60,.19,8,false);
    mesh(group,lavaGeo,C.lava,0,0,0,{emissive:C.lava,emissiveIntensity:.35});
    const ashes=Array.from({length:16},(_,i)=>ball(group,.18+(i%4)*.055,0x8d8dbe,0,2.4,0));
    const sparks=Array.from({length:11},()=>ball(group,.11,C.lava,0,2.4,0,{emissive:C.lava,emissiveIntensity:.5}));
    tree(group,-2.2,0,-.9,.75);
    label('Magma',-.7,-.65,1.65);label('Lave',2.35,.55,1.3);label(concept==='comic'?'POUF !':'Gaz et cendres',-.9,3.45,0);
    update=p=>{const rise=ease((p-.12)/.3);conduit.scale.y=Math.max(.01,rise);conduit.position.y=-.58+1.4*rise;const eruption=ease((p-.42)/.16);ashes.forEach((a,i)=>{a.visible=eruption>0;const phase=i*2.4;a.position.set(Math.cos(phase)*eruption*(.23+i*.07),2.4+eruption*(.35+i*.065),Math.sin(phase)*eruption*.4);a.scale.setScalar(.5+eruption*1.2);});sparks.forEach((s,i)=>{s.visible=eruption>0;const t=(p*2.4+i*.13)%1;s.position.set(Math.cos(i*2)*eruption*t*1.35,2.4+Math.sin(t*Math.PI)*eruption*1.1,Math.sin(i*2)*eruption*t*.8);});lavaGeo.setDrawRange(0,Math.floor(lavaGeo.index.count*ease((p-.6)/.33)/3)*3);};
  }
  if(index===4){
    slab(group,6.3,3.4);house(group,-2,0,.7,.75);tree(group,2.2,0,-.3,.7);
    const storm=cloud(group,0,3.05,0,1.35);
    const funnel=new THREE.Group();group.add(funnel);
    const cone=mesh(funnel,new THREE.CylinderGeometry(.85,.10,2.8,32,20,true),C.cloud,0,1.4,0,{transparent:true,opacity:.78,side:THREE.DoubleSide,depthWrite:false});
    const rings=Array.from({length:12},(_,i)=>{const q=i/11;const g=new THREE.Group();funnel.add(g);g.position.y=q*2.75;const radius=.1+q*.74;const ring=mesh(g,new THREE.TorusGeometry(radius,.045,8,44,Math.PI*1.55),0xece8ff);ring.rotation.x=Math.PI/2;ball(g,.065,0x6870ab,radius,0,0);return g;});
    const dust=Array.from({length:18},(_,i)=>box(group,.14,.08,.06,i%2?0xf6c370:0x8fa547));
    label('Nuage d’orage',-.8,3.8,0);label(concept==='comic'?'WHOOOSH !':'Air qui tourne',1.8,1.5,0);label('Le sol',-1.8,-.8,1.7);
    update=p=>{const grow=ease((p-.2)/.43),move=-.6+ease((p-.63)/.37)*1.9;funnel.visible=grow>0;funnel.scale.y=Math.max(.01,grow);funnel.position.set(move,2.85*(1-grow),0);cone.rotation.y=p*65;cone.rotation.z=Math.sin(p*28)*.05;rings.forEach((r,i)=>r.rotation.y=p*85+i*.7);dust.forEach((d,i)=>{d.visible=p>.62;const a=p*45+i*2;d.position.set(move+Math.cos(a)*(.4+i*.035),.15+(i%6)*.17+Math.sin(a)*.1,Math.sin(a)*(.4+i*.035));d.rotation.set(a,a,0);});storm.position.x=move*.35;};
  }
  applyConcept(group,concept);
  update(0);
  return {group,labels,update,dispose(){group.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}};
}

export class NatureRenderer {
  constructor(canvas,labelRoot){
    this.canvas=canvas;this.labelRoot=labelRoot;this.model=null;this.progress=0;
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    this.renderer.setClearColor(0x000000,0);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.scene=new THREE.Scene();
    this.scene.add(new THREE.HemisphereLight(0xffffff,0xadb8d8,.85));
    const light=new THREE.DirectionalLight(0xffffff,1.3);light.position.set(-4,8,7);this.scene.add(light);
    this.camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,100);
    this.camera.position.set(6,5.2,9);this.camera.lookAt(0,1.1,0);
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.lost=true;canvas.dispatchEvent(new CustomEvent('renderer-unavailable'));});
    canvas.addEventListener('webglcontextrestored',()=>{this.lost=false;canvas.dispatchEvent(new CustomEvent('renderer-available'));this.draw(this.progress);});
    this.resize();
  }
  resize(){const w=this.canvas.parentElement.clientWidth;if(!w)return;const h=w*470/700;this.renderer.setSize(w,h,false);const aspect=w/h;const height=6.3;this.camera.left=-height*aspect/2;this.camera.right=height*aspect/2;this.camera.top=height/2;this.camera.bottom=-height/2;this.camera.updateProjectionMatrix();this.paint();}
  select(index,concept='cartoon'){if(this.model){this.scene.remove(this.model.group);this.model.dispose();}this.model=createModel(index,concept);this.camera.position.set(concept==='comic'?2:5,concept==='toys'?7.5:4.3,11);this.camera.lookAt(0,index===2?.6:1.05,0);this.scene.add(this.model.group);this.labelRoot.replaceChildren(...this.model.labels.map(l=>{const el=document.createElement('span');el.className='scene-tag';el.textContent=l.text;l.el=el;return el;}));this.draw(0);}
  draw(progress){this.progress=progress;this.model?.update(progress);this.paint();}
  paint(){if(this.lost)return;this.scene.updateMatrixWorld(true);this.renderer.render(this.scene,this.camera);for(const label of this.model?.labels||[]){const pos=label.point.clone().project(this.camera);label.el.style.left=`${(pos.x*.5+.5)*100}%`;label.el.style.top=`${(-pos.y*.5+.5)*100}%`;}}
}
