"use strict"

console.log('[D2CMedia Debug - module/hooks.js] loaded');

import Const from '/src/shared/constant.js';
import Consolas from '/src/shared/consolas.js';

// attend pour un message du backend.js qui est injecte par le devtools.js
Consolas.log('[hooks.js] listening for message from [backend.js]');
window.addEventListener('message', event => {
  if (event.source !== window) {
    return;
  }
  var message = event.data;
  //on verifie que ca vient bien du bon backend.js
  if (typeof message !== 'object' || message === null || !message.source === Const.CONTENTNAME) {
    return;
  }
  Consolas.log('[hooks.js] onEvent');
  Consolas.log(message);
  
  if(typeof message.command !== "undefined" && typeof message.data !== 'undefined'){
    switch(message.command){
      case Const.LOAD:
        //on envoie un message au devtool-backgound.js
        Consolas.log('[hooks.js] sending load data to [devtool-background.js]');
        chrome.runtime.sendMessage({
          name: Const.CONTENTNAME,
          data: message.data,
          command: Const.ONDATA 
        });
        break;
      case Const.ANALYSED:
        //on envoie un message au devtool-backgound.js
        Consolas.log('[hooks.js] sending analysed data to [devtool-background.js]');
        chrome.runtime.sendMessage({
          name: Const.CONTENTNAME,
          data: message.data,
          command: Const.ONANALYSED 
        });
        break;
      default:
        Consolas.log('[hooks.js] Command Not Found');
        break;
    }
  }else{
    Consolas.log('[hooks.js] Command or Data Not Found');
  }
});