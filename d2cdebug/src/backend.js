
// injected dans la content page que l'on inspect

console.log('[D2CMedia Debug - backend.js] loaded');

import Const from '/src/shared/constant.js';
import Consolas from '/src/shared/consolas.js';


const PageAnalyser = {
  getTag(tag){
    let arr = [];
    let nodes = document.querySelectorAll(tag);
    if(nodes !== null){
      for(let i=0; i<nodes.length;i++){
        arr.push(nodes[i].innerText.replace(/(\r\n|\n|\r)/gm,"").trim()); 
      }
    }
    return arr;
  },
  getInput(type){
    let arr = {};
    let nodes = document.querySelectorAll(`input[type="${type}"]`);
    if(nodes !== null){
      for(let i=0; i<nodes.length;i++){
        arr[nodes[i].name] = nodes[i].value.replace(/(\r\n|\n|\r)/gm,"").trim();
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
        title = nodes[i].innerText.replace(/(\r\n|\n|\r)/gm,"").trim(); 
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
            meta[attr[j].name] = attr[j].value.replace(/(\r\n|\n|\r)/gm,"").trim();
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
      h1: this.getTag('h1'),
      h2: this.getTag('h2'),
      h3: this.getTag('h3'),
      hidden: this.getInput('hidden'),
    }
  },
}

// on envoie un message au hooks.js qui ecoute
Consolas.log('[backend.js] sending message to [hooks.js]');

if(typeof window.D2CMediaDebug !== "undefined"){
  
  window.postMessage({
    source: Const.CONTENTNAME,
    command: Const.LOAD,
    data: window.D2CMediaDebug
  }, '*');

  window.postMessage({
    source: Const.CONTENTNAME,
    command: Const.ANALYSED,
    data: PageAnalyser.getAll()
  }, '*');

  //send a message to the devtool-background.js from the javascript in the content-page via the hook.js
  window.CommRouter = {
    send(data){
      window.postMessage({
        source: Const.CONTENTNAME,
        command: Const.EXTERNDATA,
        data: data
      }, '*');
    }

  }
 

}else{
  Consolas.log('[D2CMedia Debug - backend.js] "window.D2CMediaDebug" Not Found')
}

