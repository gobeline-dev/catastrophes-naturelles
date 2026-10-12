import * as THREE from './vendor/three.module.js';

export const plateModes={
  subduction:{name:'Une plaque plonge',term:'Subduction',lead:'La surface de la Terre est découpée en grandes plaques de roche. Quand elles se rapprochent, une plaque peut plonger sous l’autre.',remember:'La subduction, c’est une plaque qui passe sous une autre.',label:'Subduction · une plaque plonge sous l’autre',status:['Deux plaques se rapprochent très lentement.','Au contact, les roches peuvent rester bloquées.','Elles glissent d’un coup : CRAC !','Les vibrations se propagent : c’est un séisme.'],stageLabels:['Rapprochement','Ça bloque','Ça glisse !','Le sol tremble']},
  divergence:{name:'Elles s’écartent',term:'Divergence',lead:'Deux plaques s’éloignent l’une de l’autre. Du magma peut remonter dans l’espace qui s’ouvre, puis former de nouvelles roches.',remember:'La divergence, c’est deux plaques qui s’écartent.',label:'Divergence · les plaques s’écartent',status:['Deux plaques s’écartent très lentement.','Les roches sont étirées et peuvent résister.','Des roches se cassent ou glissent brusquement.','Les vibrations se propagent : c’est un séisme.'],stageLabels:['Écartement','Les roches résistent','Ça casse !','Vibrations']},
  sliding:{name:'Elles coulissent',term:'Coulissage',lead:'Deux plaques glissent côte à côte, dans des sens différents. Parfois, elles se bloquent, puis se débloquent brusquement.',remember:'Le coulissage, c’est deux plaques qui glissent l’une le long de l’autre.',label:'Coulissage · les plaques glissent côte à côte',status:['Deux plaques coulissent dans des sens différents.','Des roches restent bloquées le long de la faille.','Elles se débloquent d’un coup : CRAC !','Les vibrations se propagent : c’est un séisme.'],stageLabels:['Coulissage','Ça bloque','Ça glisse !','Le sol tremble']},
  collision:{name:'Elles se heurtent',term:'Collision',lead:'Deux plaques portant des continents se rapprochent. Les roches se compriment et se plissent : des montagnes peuvent se former.',remember:'La collision peut former des montagnes, sur des millions d’années.',label:'Collision · les continents se rapprochent',status:['Deux continents se rapprochent très lentement.','Les roches sont comprimées et peuvent rester bloquées.','Des roches cassent ou glissent brusquement.','Les vibrations se propagent : c’est un séisme.'],stageLabels:['Rapprochement','Compression','Ça casse !','Vibrations']}
};

const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.7});
function solid(parent,geometry,color,x=0,y=0,z=0){const mesh=new THREE.Mesh(geometry,mat(color));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function box(parent,w,h,d,color,x=0,y=0,z=0){return solid(parent,new THREE.BoxGeometry(w,h,d),color,x,y,z);}
function home(parent,x,z){const g=new THREE.Group();parent.add(g);g.position.set(x,.12,z);box(g,.5,.5,.45,0xffe9b0,0,.25,0);const roof=solid(g,new THREE.ConeGeometry(.45,.3,4),0xee6461,0,.65,0);roof.rotation.y=Math.PI/4;box(g,.1,.2,.025,0x527087,0,.1,.24);return g;}
function arrow(parent,x,y,z,dx,dz){const a=new THREE.ArrowHelper(new THREE.Vector3(dx,0,dz),new THREE.Vector3(x,y,z),.9,0x26304d,.25,.2);parent.add(a);return a;}

function ribbonGeometry(){
  const segments=24,vertices=new Float32Array((segments+1)*4*3),indices=[];
  for(let i=0;i<segments;i++)for(let edge=0;edge<4;edge++){const a=i*4+edge,b=i*4+(edge+1)%4,c=(i+1)*4+edge,d=(i+1)*4+(edge+1)%4;indices.push(a,c,b,b,c,d);}
  indices.push(0,1,2,0,2,3,segments*4,segments*4+2,segments*4+1,segments*4,segments*4+3,segments*4+2);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(vertices,3));g.setIndex(indices);return g;
}

export function createPlateScene(mode='subduction'){
  const group=new THREE.Group(),left=new THREE.Group(),right=new THREE.Group();group.add(left,right);
  left.name='plate-a';right.name='plate-b';
  const blue=0x40afd8,pink=0xf09c9c;
  // The lower layer is a schematic solid mantle, not an underground ocean of lava.
  box(group,7,1.8,2.75,0xf0b576,0,-1.25,0);
  const labels=[{text:'Plaque A',point:new THREE.Vector3(-2.25,-.4,1.65)},{text:'Plaque B',point:new THREE.Vector3(2.15,-.4,1.65)},{text:'Intérieur de la Terre',point:new THREE.Vector3(0,-2.35,1.65)}];
  const buildings=[];let ribbon=null,rift=null,outline=null;
  if(mode==='subduction'){
    ribbon=ribbonGeometry();const plate=solid(left,ribbon,blue);plate.name='descending-plate';
    outline=new THREE.BufferGeometry();outline.setAttribute('position',new THREE.BufferAttribute(new Float32Array(51*3),3));
    left.add(new THREE.Line(outline,new THREE.LineBasicMaterial({color:0x26304d})));
    box(left,2.9,.07,2.85,0x21c4df,-1.8,-.04,0);
    box(right,3.35,.58,2.9,pink,1.75,-.19,0);box(right,3.35,.08,2.9,0x89cc70,1.75,.14,0);
    buildings.push(home(right,2.6,.4));
    arrow(group,-2,.6,.4,1,0);arrow(group,2.4,.95,-.45,-1,0);
    labels.push({text:'La plaque plonge',point:new THREE.Vector3(1.2,-1.55,1.65)});
  }else{
    left.position.x=-1.6;right.position.x=1.6;
    for(const [g,color] of [[left,blue],[right,pink]]){box(g,3.1,.5,2.85,color,0,-.12,0);box(g,3.1,.07,2.85,0x89cc70,0,.17,0);}
    if(mode==='sliding'){
      buildings.push(home(left,-.6,.3),home(right,.6,.3));
      arrow(left,0,.55,.55,0,-1);arrow(right,0,.55,-.55,0,1);
      labels.push({text:'Faille',point:new THREE.Vector3(0,.1,1.9)});
    }else if(mode==='divergence'){
      rift=solid(group,new THREE.CylinderGeometry(.16,.25,1.5,12),0xff7136,0,-.72,0);rift.name='rising-magma';
      arrow(left,-.2,.7,.25,-1,0);arrow(right,.2,.7,.25,1,0);
      labels.push({text:'Magma',point:new THREE.Vector3(0,-1.15,1.65)});
    }else{
      buildings.push(home(left,-.8,.5),home(right,.9,.5));
      for(const [x,z,h] of [[-.5,-.4,.95],[.1,.1,1.3],[.65,-.3,1]])solid(group,new THREE.ConeGeometry(.65,h,5),0xaa86b8,x,.2+h/2,z);
      arrow(left,-.7,1,-.4,1,0);arrow(right,.7,1,-.4,-1,0);
      labels.push({text:'Montagnes',point:new THREE.Vector3(0,1.85,0)});
    }
  }
  const focus=new THREE.Vector3(mode==='subduction'?.5:0,mode==='subduction'?-.48:-.12,1.55);
  const source=solid(group,new THREE.SphereGeometry(.1,12,8),0xff7136,...focus.toArray());
  const rings=Array.from({length:4},()=>{const m=solid(group,new THREE.TorusGeometry(1,.035,6,60),0xff7136,...focus.toArray());m.material.transparent=true;m.material.opacity=0;return m;});
  labels.push({text:'CRAC !',point:new THREE.Vector3(0,2.55,0),from:.48,to:.8});
  function update(p){
    // Geological approach is slow; the sudden slip is a separate event in this compressed timeline.
    const drift=ease(p/.2)*.12,slip=ease((p-.5)/.12)*.48,motion=drift+slip;
    if(mode==='subduction'){
      const pos=ribbon.attributes.position;
      for(let i=0;i<=24;i++){
        const x=-3.3+(4.5+motion)*i/24;
        const bend=Math.max(0,(x+.35)/(1.55+motion));
        const y=-.22-Math.pow(bend,1.25)*(1.05+motion*.8);
        for(let corner=0;corner<4;corner++)pos.setXYZ(i*4+corner,x,y+(corner<2?.12:-.12),corner===0||corner===3?1.43:-1.43);
      }
      pos.needsUpdate=true;ribbon.computeVertexNormals();ribbon.computeBoundingSphere();right.position.x=-motion*.12;
      const border=outline.attributes.position;
      for(let i=0;i<25;i++){const j=i*4;border.setXYZ(i,pos.getX(j),pos.getY(j),1.445);}
      for(let i=0;i<25;i++){const j=(24-i)*4+3;border.setXYZ(25+i,pos.getX(j),pos.getY(j),1.445);}
      border.setXYZ(50,pos.getX(0),pos.getY(0),1.445);border.needsUpdate=true;outline.computeBoundingSphere();
    }else if(mode==='divergence'){
      left.position.x=-1.6-motion;right.position.x=1.6+motion;
      rift.scale.x=1+motion*2;rift.scale.z=1+motion;rift.position.y=-.72+motion*.55;
    }else if(mode==='sliding'){
      left.position.z=-motion;right.position.z=motion;
    }else{
      left.position.x=-1.6+motion*.42;right.position.x=1.6-motion*.42;
    }
    const shake=p>.6&&p<.98?Math.sin(p*125)*.12*Math.sin((p-.6)/.38*Math.PI):0;
    buildings.forEach((b,i)=>b.rotation.z=shake*(i%2?-1:1));
    rings.forEach((ring,i)=>{const q=Math.max(0,Math.min(1,(p-.57-i*.06)/.35));ring.visible=q>0&&q<1;ring.scale.setScalar(.05+q*2.2);ring.material.opacity=(1-q)*.9;});
    source.visible=p>.49;group.userData.mode=mode;group.userData.slip=slip;
  }
  update(0);return {group,labels,update};
}
