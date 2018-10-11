
// injected dans la content page que l'on inspect

console.log('[D2CMedia Debug - backend.js] loaded');

import Const from '/src/shared/constant.js';
import Consolas from '/src/shared/consolas.js';


const PageAnalyser = {
  getSiteId(){
    let arr = [];
    //site id
    let nodes = document.querySelectorAll(`input[id="topsiteid"]`);
    if(nodes !== null){
      for(let i=0; i<nodes.length;i++){
        return nodes[i].value;
      }
    }
    return '';
  },
  getDealerId(){
    let arr = [];
    //dealer id
    let nodes = document.querySelectorAll(`input[id="basedealerid"]`);
    if(nodes !== null){
      for(let i=0; i<nodes.length;i++){
        return nodes[i].value;
      }
    }
    return '';
  },
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
    let cmpt = 0;
    let defaultKeyName = 'noname-';
    let nodes = document.querySelectorAll(`input[type="${type}"]`);
    if(nodes !== null){
      for(let i=0; i<nodes.length;i++){
        let value = nodes[i].value.replace(/(\r\n|\n|\r)/gm,"").trim();
        if(typeof nodes[i].name !== 'undefined' && nodes[i].name !== ''){
          arr[nodes[i].name] = value;
        }else if(typeof nodes[i].id !== 'undefined' && nodes[i].id !== ''){
          arr[nodes[i].id] = value;
        }else{
          //default name with increment
          arr[defaultKeyName + (cmpt++)] = value;
        }  
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
      siteId: this.getSiteId(),
      dealerId: this.getDealerId(),
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

if(typeof window.D2CMediaDebug !== 'undefined'){
  
  let pgData = PageAnalyser.getAll(); 

  window.postMessage({
    source: Const.CONTENTNAME,
    command: Const.LOAD,
    data: window.D2CMediaDebug
  }, '*');

  window.postMessage({
    source: Const.CONTENTNAME,
    command: Const.ANALYSED,
    data: pgData
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

