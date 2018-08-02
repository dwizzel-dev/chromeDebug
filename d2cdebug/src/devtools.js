// ce script est caller quand le panel est active

import Const from '/src/shared/constant.js';
import Consolas from '/src/shared/consolas.js';
import PanelWriter from '/src/shared/panelwriter.js';

Consolas.log('[D2CMedia Debug - devtool.js] loaded');

//creer la connection a devtools-background.js
Consolas.log('[devtool.js] connecting to [devtools-background.js]');
var bgPageConnection = chrome.runtime.connect({
  name: 'devtool-d2cmedia'
});

//ecoute pour les message de la devtools-background.js
bgPageConnection.onMessage.addListener(message => {
  Consolas.log('[devtool.js] message from [devtools-background.js]');
  Consolas.log(message);
  //message from the devtools-background.js to inject javascript code to the content
  if(typeof message.name !== 'undefined' && typeof message.command !== 'undefined'){
    if(message.name == Const.TOOLNAME){
      switch(message.command){
        case Const.INJECT:
          Consolas.log('[devtool.js] injecting "backend.js" to inspected content page');
          //injecte le script backend.js dans la content-page (page web que lon inspect) et attend le result
          // cause des problemes si jquery nest pas la meme version que sur le content page
          // on va tout faire en version vanilla javascript alors
          /*
          injectScript(chrome.runtime.getURL('lib/jquery/3.3.1/jquery.min.js'), res => {
            Consolas.log('[devtool.js] injection callback');
          });
          setTimeout(() => {
            injectScript(chrome.runtime.getURL('src/backend.js'), res => {
              Consolas.log('[devtool.js] injection callback');
            });  
          }, 1000);
          */
          //injecte seulement le backend sans le jquery
          injectScript(chrome.runtime.getURL('src/backend.js'), res => {
            Consolas.log('[devtool.js] injection callback');
          });    
          break;
        case Const.CLEAR:
          Consolas.log('[devtool.js] clearing panel page content');
          PanelWriter.wrt(Const.CLEAR);
          PanelWriter.wrtAnalyzed(Const.CLEAR);
          break;  
        case Const.LOADING:
          Consolas.log('[devtool.js] clearing panel page content');
          PanelWriter.wrt(Const.LOADING);
          PanelWriter.wrtAnalyzed(Const.CLEAR);
          break;    
        default:
          break;  
      }
    }else if(message.name == Const.CONTENTNAME){
      switch(message.command){
        case Const.ONDATA:
          Consolas.log('[devtool.js] writing to panel');
          if(message.data.length === 0){
            PanelWriter.wrt(Const.EMPTY);
          }else{
            PanelWriter.wrt(message.data);  
          }
          break;
        case Const.ONANALYSED:
          Consolas.log('[devtool.js] analyse to panel');
          if(message.data.length === 0){
            PanelWriter.wrtAnalyzed(Const.CLEAR);
          }else{
            PanelWriter.wrtAnalyzed(message.data);
          }
          break;  
        default:
          break;  
      } 
    }
  }
});

//ecoute les deconnxion de la devtools-background.js
bgPageConnection.onDisconnect.addListener(message => {
  Consolas.log('[devtool.js] disconnection of [devtools-background.js]');
  Consolas.log(message);
});

//envoie un message a la devtools-background.js
Consolas.log('[devtool.js] sending init signal to [devtools-background.js]');
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
      // console.log('[devtool.js] Injecting ${scriptName} script in content page');
      // console.log(script);
      document.documentElement.appendChild(script);
      //script.parentNode.removeChild(script);
    })()
    `
  chrome.devtools.inspectedWindow.eval(src, (res, err) => {
    if (err) {
      Consolas.log(err)
    }
    cb(res);
  })
}



