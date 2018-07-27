// ce script est caller qusn le panel est active

//import Const from './constant';

const Const = {
  INIT: 0x201,
  INJECT: 0x202,
  ONDATA: 0x302,
  TOOLNAME: 'd2cmedia-devtool-inspector',
  CONTENTNAME: 'd2cmedia-devtool-content'
};

console.log('[devtool.js] loaded');

//creer la connection a devtools-background.js
console.log('[devtool.js] connecting to [devtools-background.js]');
var bgPageConnection = chrome.runtime.connect({
  name: 'devtool-d2cmedia'
});

//ecoute pour les message de la devtools-background.js
bgPageConnection.onMessage.addListener(message => {
  console.log('[devtool.js] message from [devtools-background.js]');
  console.log(message);
  //message from the devtools-background.js to inject javascript code to the content
  if(typeof message.name !== 'undefined' && typeof message.command !== 'undefined'){
    if(message.name == Const.TOOLNAME){
      switch(message.command){
        case Const.INJECT:
          console.log('[devtool.js] injecting "backend.js" to inspected content page');
          //injecte le script backend.js dans la content-page (page web que lon inspect) et attend le result
          injectScript(chrome.runtime.getURL('src/backend.js'), res => {
            console.log('[devtool.js] injection callback');
          });
          break;
        default:
          break;  
      }
    }else if(message.name == Const.CONTENTNAME){
      switch(message.command){
        case Const.ONDATA:
          console.log('[devtool.js] writing to panel');
          writeDataToPanel(message.data);
          break;
        default:
          break;  
      } 
    }
  }
});

//ecoute les deconnxion de la devtools-background.js
bgPageConnection.onDisconnect.addListener(message => {
  console.log('[devtool.js] disconnection of [devtools-background.js]');
  console.log(message);
});

//envoie un message a la devtools-background.js
console.log('[devtool.js] sending init signal to [devtools-background.js]');
bgPageConnection.postMessage({
  name: Const.TOOLNAME,
  command: Const.INIT,
  tabId: chrome.devtools.inspectedWindow.tabId
});

//pour injection de script
function injectScript(scriptName, cb){
  const src = `
    (function() {
      var script = document.constructor.prototype.createElement.call(document, 'script');
      script.src = "${scriptName}";
      console.log('[devtool.js] Injecting script in content page');
      console.log(script);
      document.documentElement.appendChild(script);
      //script.parentNode.removeChild(script);
    })()
    `
  chrome.devtools.inspectedWindow.eval(src, (res, err) => {
    if (err) {
      console.log(err)
    }
    cb(res);
  })
}

//write tot the panel
function writeDataToPanel(data){
  console.log('[devtool.js] data received');
  console.log(data);
  // HTML element to output our data.
  const output = document.querySelector('.container');
  let html = '<div class="content">';
  for(let o in data){
    html += '<div class="row">';
    html += `<div class="cell method">${data[o]['from']['class']}::${data[o]['from']['method']}</div>`;  
    html += `<div class="cell file">${data[o]['from']['file']} -- ${data[o]['from']['line']}</div>`;  
    html += `<div class="cell code"><xmp>${data[o]['obj']}</xmp></div>`;  
    html += `<div class="cell filter">filter: ${data[o]['filter']}</div>`;  
    html += '</div>';
  }
  html += '</div>';
  output.innerHTML = html;

}
