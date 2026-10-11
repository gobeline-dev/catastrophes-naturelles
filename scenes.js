import * as THREE from './vendor/three.module.js';

const C={grass:0x94ab79,earth:0xbd9775,deep:0x96745e,water:0x409daa,foam:0xbce7de,rock:0x8c8e7d,lava:0xf58343,cream:0xf3e7ca,roof:0xbb6852,cloud:0xa4b7b5};
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
function material(color,options={}){return new THREE.MeshStandardMaterial({color,roughness:.85,flatShading:true,...options});}
function mesh(group,geometry,color,x=0,y=0,z=0,options={}){const m=new THREE.Mesh(geometry,material(color,options));m.position.set(x,y,z);group.add(m);return m;}
function box(group,w,h,d,color,x=0,y=0,z=0){return mesh(group,new THREE.BoxGeometry(w,h,d),color,x,y,z);}
function ball(group,r,color,x,y,z,options={}){return mesh(group,new THREE.IcosahedronGeometry(r,1),color,x,y,z,options);}
function house(parent,x,y,z,s=1){const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(s);box(g,.7,.68,.62,C.cream,0,.34,0);const roof=mesh(g,new THREE.ConeGeometry(.61,.43,4),C.roof,0,.88,0);roof.rotation.y=Math.PI/4;box(g,.15,.32,.025,0x547681,0,.16,.325);for(const dx of [-.2,.2])box(g,.13,.15,.03,0x9dcfd0,dx,.46,.325);return g;}
function tree(parent,x,y,z,s=1){const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(s);mesh(g,new THREE.CylinderGeometry(.06,.08,.65,6),0x8d745c,0,.32,0);mesh(g,new THREE.ConeGeometry(.4,.94,7),0x668b64,0,.91,0);mesh(g,new THREE.ConeGeometry(.32,.74,7),0x7c9b6e,0,1.24,0);return g;}
function cloud(parent,x,y,z,s=1){const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);g.scale.setScalar(s);[[-.7,0,.35],[0,.22,.6],[.65,.02,.43],[.1,-.13,.52]].forEach(([dx,dy,r])=>ball(g,r,C.cloud,dx,dy,0));return g;}
function slab(parent,w=6,d=3.6){box(parent,w,.78,d,C.earth,0,-.55,0);box(parent,w,.12,d,C.grass,0,-.1,0);box(parent,w,.07,d+.01,C.deep,0,-.72,0);}

export function createModel(index){
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
    const rings=Array.from({length:4},()=>mesh(group,new THREE.TorusGeometry(1,.018,6,70),C.lava,0,-.55,1.82,{transparent:true,opacity:0}));
    label('Les roches',-1.9,-1.08,1.7);label('La faille',.15,-1.05,1.75);label('Le sol',2.1,.16,1.75);
    update=p=>{const slip=ease((p-.18)/.15)*.2;right.position.x=1.55+slip;right.position.y=-slip*.3;left.position.x=-1.55-slip*.3;homes.forEach((h,i)=>{h.rotation.z=p>.27&&p<.94?Math.sin(p*150+i)*.045*Math.sin((p-.27)/.67*Math.PI):0;});rings.forEach((r,i)=>{const q=clamp((p-.3-i*.085)/.55);r.visible=q>0&&q<1;r.scale.setScalar(.05+q*3.3);r.material.opacity=(1-q)*.75;});source.scale.setScalar(1+Math.sin(p*35)*.1);};
  }
  if(index===2){
    // A transparent ocean exposes the seafloor; three long waves approach a shallow coast.
    box(group,6.5,.65,3.3,C.deep,0,-1.07,0);
    const floor=box(group,3,.22,3.25,C.earth,-1.7,-.65,0);
    const slope=box(group,2.3,.26,3.25,C.earth,1.0,-.42,0);slope.rotation.z=.25;
    box(group,1.25,.8,3.3,C.earth,2.55,-.32,0);box(group,1.25,.12,3.3,C.grass,2.55,.13,0);
    house(group,2.64,.2,-.35,.72);tree(group,2.9,.2,.8,.5);
    box(group,5.05,.76,3.25,C.water,-.73,-.32,0).material=material(C.water,{transparent:true,opacity:.48,depthWrite:false});
    const geo=new THREE.PlaneGeometry(5.05,3.25,110,22);geo.rotateX(-Math.PI/2);geo.translate(-.73,0,0);
    const water=mesh(group,geo,C.water,0,.08,0,{side:THREE.DoubleSide});
    const positions=geo.attributes.position;
    const original=new Float32Array(positions.array);
    label('Fond de la mer',-1.6,-1.19,1.7);label('La côte',2.57,.6,1.55);label('Les vagues',-.6,.9,0);
    update=p=>{const uplift=ease((p-.12)/.15)*.16;floor.position.y=-.65+uplift;const travel=ease((p-.27)/.67);const strength=ease((p-.22)/.12);for(let i=0;i<positions.count;i++){const x=original[i*3];let height=Math.sin(x*3)*.012;for(let k=0;k<3;k++){const center=-2.1+travel*4-k*.95;const near=clamp((center+.6)/2.5);height+=(.1+near*.43)*(1-k*.15)*strength*Math.exp(-Math.pow((x-center)/.25,2));}positions.setY(i,height);}positions.needsUpdate=true;geo.computeVertexNormals();};
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
    const lavaGeo=new THREE.TubeGeometry(curve,60,.09,8,false);
    mesh(group,lavaGeo,C.lava,0,0,0,{emissive:C.lava,emissiveIntensity:.35});
    const ashes=Array.from({length:16},(_,i)=>ball(group,.12+(i%4)*.035,0x8a9591,0,2.4,0));
    const sparks=Array.from({length:7},()=>ball(group,.065,C.lava,0,2.4,0,{emissive:C.lava,emissiveIntensity:.5}));
    tree(group,-2.2,0,-.9,.75);
    label('Magma',-.7,-.65,1.65);label('Lave',2.35,.55,1.3);label('Gaz et cendres',-.9,3.25,0);
    update=p=>{const rise=ease((p-.12)/.37);conduit.scale.y=Math.max(.01,rise);conduit.position.y=-.58+1.4*rise;const eruption=ease((p-.44)/.2);ashes.forEach((a,i)=>{a.visible=eruption>0;const phase=i*2.4;a.position.set(Math.cos(phase)*eruption*(.18+i*.044),2.4+eruption*(.3+i*.047),Math.sin(phase)*eruption*.4);a.scale.setScalar(.5+eruption*.9);});sparks.forEach((s,i)=>{s.visible=eruption>0;s.position.set(Math.cos(i*2)*eruption*.55,2.4+Math.sin(i+1)*eruption*.4,Math.sin(i*2)*eruption*.45);});lavaGeo.setDrawRange(0,Math.floor(lavaGeo.index.count*ease((p-.63)/.31)/3)*3);};
  }
  if(index===4){
    slab(group,6.3,3.4);house(group,-2,0,.7,.75);tree(group,2.2,0,-.3,.7);
    const storm=cloud(group,0,3.05,0,1.35);
    const funnel=new THREE.Group();group.add(funnel);
    const cone=mesh(funnel,new THREE.CylinderGeometry(.72,.065,2.8,32,20,true),C.cloud,0,1.4,0,{transparent:true,opacity:.68,side:THREE.DoubleSide,depthWrite:false});
    const rings=Array.from({length:12},(_,i)=>{const q=i/11;const g=new THREE.Group();funnel.add(g);g.position.y=q*2.75;const radius=.075+q*.64;const ring=mesh(g,new THREE.TorusGeometry(radius,.015,5,44,Math.PI*1.55),0xd5e2d9);ring.rotation.x=Math.PI/2;ball(g,.035,0x76908c,radius,0,0);return g;});
    const dust=Array.from({length:12},()=>box(group,.085,.04,.04,0x887957));
    label('Nuage d’orage',-.8,3.8,0);label('Air qui tourne',1.8,1.5,0);label('Le sol',-1.8,-.8,1.7);
    update=p=>{const grow=ease((p-.2)/.46),move=ease((p-.66)/.34)*.65;funnel.visible=grow>0;funnel.scale.y=Math.max(.01,grow);funnel.position.set(move,2.85*(1-grow),0);cone.rotation.y=p*25;rings.forEach((r,i)=>r.rotation.y=p*55+i*.7);dust.forEach((d,i)=>{d.visible=p>.65;const a=p*35+i*2;d.position.set(move+Math.cos(a)*(.25+i*.035),.12+(i%3)*.07+Math.sin(a)*.06,Math.sin(a)*(.25+i*.035));d.rotation.set(a,a,0);});storm.position.x=move*.18;};
  }
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
    this.scene.add(new THREE.HemisphereLight(0xfff5df,0x829a91,2.5));
    const light=new THREE.DirectionalLight(0xfff4df,3);light.position.set(-4,8,7);this.scene.add(light);
    this.camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,100);
    this.camera.position.set(6,5.2,9);this.camera.lookAt(0,1.1,0);
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.lost=true;canvas.dispatchEvent(new CustomEvent('renderer-unavailable'));});
    canvas.addEventListener('webglcontextrestored',()=>{this.lost=false;canvas.dispatchEvent(new CustomEvent('renderer-available'));this.draw(this.progress);});
    this.resize();
  }
  resize(){const w=this.canvas.parentElement.clientWidth;if(!w)return;const h=w*430/700;this.renderer.setSize(w,h,false);const aspect=w/h;const height=5.9;this.camera.left=-height*aspect/2;this.camera.right=height*aspect/2;this.camera.top=height/2;this.camera.bottom=-height/2;this.camera.updateProjectionMatrix();this.paint();}
  select(index){if(this.model){this.scene.remove(this.model.group);this.model.dispose();}this.model=createModel(index);this.scene.add(this.model.group);this.labelRoot.replaceChildren(...this.model.labels.map(l=>{const el=document.createElement('span');el.className='scene-tag';el.textContent=l.text;l.el=el;return el;}));this.draw(0);}
  draw(progress){this.progress=progress;this.model?.update(progress);this.paint();}
  paint(){if(this.lost)return;this.scene.updateMatrixWorld(true);this.renderer.render(this.scene,this.camera);for(const label of this.model?.labels||[]){const pos=label.point.clone().project(this.camera);label.el.style.left=`${(pos.x*.5+.5)*100}%`;label.el.style.top=`${(-pos.y*.5+.5)*100}%`;}}
}
