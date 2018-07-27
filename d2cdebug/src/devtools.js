
// ce script est caller qusn le panel est active


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
});

//ecoute les deconnxion de la devtools-background.js
bgPageConnection.onDisconnect.addListener(message => {
  console.log('[devtool.js] disconnection of [devtools-background.js]');
  console.log(message);
});

//envoie un message a la devtools-background.js
console.log('[devtool.js] sending init signal to [devtools-background.js]');
bgPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
});


//injecte le script backend.js dans la content-page (page web que lon inspect) et attend le result
injectScript(chrome.runtime.getURL('src/backend.js'), res => {
  console.log('[devtool.js] injection callback');
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


