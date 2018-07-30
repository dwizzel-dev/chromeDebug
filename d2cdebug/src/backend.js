
// injected dans la content page que l'on inspect

console.log('[backend.js] loaded');

let Const = {
  LOAD: 0x301,
  ANALYSED: 0x401,
  CONTENTNAME: 'd2cmedia-devtool-content'
};

const PageAnalyser = {
  getH1(){
    let arr = [];
    let nodes = document.querySelectorAll('h1');
    if(nodes !== null){
      for(let i=0; i<nodes.length;i++){
        arr.push(nodes[i].innerText); 
      }
    }
    return arr;
  },
  getH2(){
    let arr = [];
    let nodes = document.querySelectorAll('h2');
    if(nodes !== null){
      for(let i=0; i<nodes.length;i++){
        arr.push(nodes[i].innerText); 
      }
    }
    return arr;
  },
  getH3(){
    let arr = [];
    let nodes = document.querySelectorAll('h3');
    if(nodes !== null){
      for(let i=0; i<nodes.length;i++){
        arr.push(nodes[i].innerText); 
      }
    }
    return arr;
  },
  getTitle(){
    let nodes = document.getElementsByTagName('title') 
    let title = '';
    if(nodes !== null){
      for(let i=0; i<nodes.length;i++){
        //suppose en avoir juste un seul
        title = nodes[i].innerText; 
      }
    }
    return title;  
  },
  getMeta(){
    let metas = [];
    let nodes = document.getElementsByTagName('meta'); 
    if(nodes !== null){
      for(let i=0; i<nodes.length;i++){
        let meta = {};
        let attr = nodes[i].attributes;
        if(attr !== null){
          for(let j=0; j<attr.length;j++){
            meta[attr[j].name] = attr[j].value;
          }
        }
        metas.push(meta);
      }
      if(metas.length > 0){
        let arr = {};
        for(let o in metas){
          let k = null;
          let v = null;
          let obj = {};
          for(let p in metas[o]){
            if(p === 'content'){
              v = metas[o][p];  
            }else{
              k = metas[o][p];        
            }
          }
          arr[k] = v;
        }
        metas = arr;
      }
    }     
    return metas;
  },
  getAll(){
    return {
      title: this.getTitle(),
      meta: this.getMeta(),
      h1: this.getH1(),
      h2: this.getH2(),
      h3: this.getH3(),
    }
  },
}

// on envoie un message au hooks.js qui ecoute
console.log('[backend.js] sending message to [hooks.js]');

if(typeof window.D2CMediaDebug !== "undefined"){
  
  window.postMessage({
    source: Const.CONTENTNAME,
    command: Const.LOAD,
    data: window.D2CMediaDebug
  }, '*');

  let analysedData = PageAnalyser.getAll();

  console.log(analysedData);
  
  window.postMessage({
    source: Const.CONTENTNAME,
    command: Const.ANALYSED,
    data: analysedData
  }, '*');
 

}else{
  console.log('[backend.js] "window.D2CMediaDebug" Not Found')
}

