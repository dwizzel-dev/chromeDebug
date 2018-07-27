
// injected dans la content page que l'on inspect

console.log('[backend.js] loaded');

let Const = {
  LOAD: 0x301,
  CONTENTNAME: 'd2cmedia-devtool-content'
};


// on envoie un message au hooks.js qui ecoute
console.log('[backend.js] sending message to [hooks.js]');

if(typeof window.D2CMediaDebug !== "undefined"){
  window.postMessage({
    source: Const.CONTENTNAME,
    command: Const.LOAD,
    data: window.D2CMediaDebug
  }, '*');
}else{
  console.log('[backend.js] "window.D2CMediaDebug" Not Found')
}

