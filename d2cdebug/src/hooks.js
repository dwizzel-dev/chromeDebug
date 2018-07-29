
// iinjecte dans toute les pages web

console.log('[hooks.js] loaded');

let Const = {
  LOAD: 0x301,
  ONDATA: 0x302,
  ONANALYSED: 0x303,
  ANALYSED: 0x401,
  CONTENTNAME: 'd2cmedia-devtool-content',
};

// attend pour un message du backend.js qui est injecte par le devtools.js
console.log('[hooks.js] listening for message from [backend.js]');
window.addEventListener('message', event => {
  if (event.source !== window) {
    return;
  }
  var message = event.data;
  //on verifie que ca vient bien du bon backend.js
  if (typeof message !== 'object' || message === null || !message.source === Const.CONTENTNAME) {
    return;
  }
  console.log('[hooks.js] onEvent');
  console.log(message);
  
  if(typeof message.command !== "undefined" && typeof message.data !== 'undefined'){
    switch(message.command){
      case Const.LOAD:
        //on envoie un message au devtool-backgound.js
        console.log('[hooks.js] sending load data to [devtool-background.js]');
        chrome.runtime.sendMessage({
          name: Const.CONTENTNAME,
          data: message.data,
          command: Const.ONDATA 
        });
        break;
      case Const.ANALYSED:
        //on envoie un message au devtool-backgound.js
        console.log('[hooks.js] sending analysed data to [devtool-background.js]');
        chrome.runtime.sendMessage({
          name: Const.CONTENTNAME,
          data: message.data,
          command: Const.ONANALYSED 
        });
        break;
      default:
        console.log('[hooks.js] Command Not Found');
        break;
    }
  }else{
    console.log('[hooks.js] Command or Data Not Found');
  }
});