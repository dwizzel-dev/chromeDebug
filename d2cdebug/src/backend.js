
// injected dans la content page que l'on inspect

console.log('[backend.js] loaded');


// on envoie un message au hooks.js qui ecoute
console.log('[backend.js] sending message to [hooks.js]');
window.postMessage({
  source: 'devtool-d2cmedia',
  route: '[backend.js]'
}, '*');

