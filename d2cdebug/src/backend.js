
// injected dans la content page que l'on inspect

console.log('[backend.js] loaded');

let Const = {
  LOAD: 0x301,
  ANALYSED: 0x401,
  CONTENTNAME: 'd2cmedia-devtool-content'
};

const PageAnalyser = {
  getH1(){
    return $('H1').text().trim();
  },
  getH2(){
    let h2 = [];
    $('H2').each(function(index){
      h2.push($(this).text().trim()); 
    });  
    return h2;
  },
  getH3(){
    let h3 = [];
    $('H3').each(function(index){
      h3.push($(this).text().trim()); 
    });
    return h3;
  },
  getTitle(){
    return $('TITLE').text();  
  },
  getMeta(){
    let meta = {};
    $('META').each(function(index){
      let name = '';
      if(typeof $(this).attr('name') !== 'undefined'){
        name = $(this).attr('name');
      }else if(typeof $(this).attr('property') !== 'undefined'){
        name = $(this).attr('property');
      }else if(typeof $(this).attr('itemprop') !== 'undefined'){
        name = $(this).attr('itemprop'); 
      }
      if(name !== ''){
        meta[name] = $(this).attr('content');  
      } 
    });
    return meta;
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

