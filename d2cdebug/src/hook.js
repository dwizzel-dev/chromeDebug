
// iinjecte dans toute les pages web

console.log('[D2CMedia Debug - hook.js] loaded');

/*
// this way wont support the chrome.runtime cause its undefined for injected script 
const script = document.createElement('script');
script.setAttribute("type", "module");
script.setAttribute("src", chrome.extension.getURL('src/shared/hooks.js'));
document.documentElement.appendChild(script);
*/

//IMPORTANT:
//pas de support pour les modules alors il faut le copier ici /src/shared/constant.js

//  manifest.json : "run_at" => "document_start" OR "document_end" OR "document_idle"


const Const = {
  
  //devtools
  INIT: 0x201,
  INJECT: 0x202,
  CLEAR: 0x203,
  LOADING: 0x204,
  EMPTY: 0x205,
  
  //backend command
  LOAD: 0x301,
  ANALYSED: 0x302,
  EXTERNDATA: 0x303,

  //hooks emiter
  ONDATA: 0x401,
  ONANALYSED: 0x402,
  ONEXTERNDATA: 0x403,
    
  //devtool name for post message filtering
  TOOLNAME: 'd2cmedia-devtool-inspector',
  CONTENTNAME: 'd2cmedia-devtool-content'
  
};


// attend pour un message du backend.js qui est injecte par le devtools.js
window.addEventListener('message', event => {
  if (event.source !== window) {
    return;
  }
  var message = event.data;
  //on verifie que ca vient bien du bon backend.js
  if (typeof message !== 'object' || message === null || !message.source === Const.CONTENTNAME) {
    return;
  }
  if(typeof message.command !== "undefined" && typeof message.data !== 'undefined'){
    switch(message.command){
      case Const.LOAD:
        //on envoie un message au devtool-backgound.js
        chrome.runtime.sendMessage({
          name: Const.CONTENTNAME,
          data: message.data,
          command: Const.ONDATA 
        });
        break;
      case Const.ANALYSED:
        //on envoie un message au devtool-backgound.js
        chrome.runtime.sendMessage({
          name: Const.CONTENTNAME,
          data: message.data,
          command: Const.ONANALYSED 
        });
        break;
      case Const.EXTERNDATA:
        //on envoie un message au devtool-backgound.js
        chrome.runtime.sendMessage({
          name: Const.CONTENTNAME,
          data: message.data,
          command: Const.ONEXTERNDATA
        });
        break;  
      default:
        break;
    }
  }
});


