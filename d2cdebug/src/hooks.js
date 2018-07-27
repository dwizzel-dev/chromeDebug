
// iinjecte dans toute les pages web

console.log('[hooks.js] loaded');

// attend pour un message du backend.js qui est injecte par le devtools.js
console.log('[hooks.js] listening for message from [backend.js]');
window.addEventListener('message', event => {
  if (event.source !== window) {
    return;
  }
  var message = event.data;
  //on verifie que ca vient bien du bon backend.js
  if (typeof message !== 'object' || message === null || !message.source === 'devtool-d2cmedia') {
    return;
  }
  console.log('[hooks.js] onEvent');
  console.log(message);
  message.route += '[hooks.js]';
  //on envoie un message au devtool-backgound.js
  chrome.runtime.sendMessage(message);
});