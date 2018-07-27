// This is the devtools script, which is called when the user opens the
// Chrome devtool on a page. We check to see if we global hook has detected
// D2CMedia presence on the page. If yes, create the D2CMedia panel; otherwise poll
// for 10 seconds.

//import Const from './constant';

const Const = {
  INIT: 0x201,
  INJECT: 0x202,
  ONDATA: 0x302,
  TOOLNAME: 'd2cmedia-devtool-inspector',
  CONTENTNAME: 'd2cmedia-devtool-content'
};

console.log('[devtools-background.js] loaded');

let panelLoaded = false
let panelShown = false
let pendingAction
let created = false
let checkCount = 0

// si on reload ou change de page dans la meme page que l'on inspecte
chrome.devtools.network.onNavigated.addListener(createPanelIfHasD2CMedia);

//check avec un timer pour voir si on doit creer ou pas le panel
const checkD2CMediaInterval = setInterval(createPanelIfHasD2CMedia, 1000);

//ceer le tab panel si la condition est bonne on essaye avec un timer plusieurs fois si long a loader
function createPanelIfHasD2CMedia (){
  console.log('[devtools-background.js] checking if "window.D2CMediaDebug" is present [' + checkCount + ']');
  if (created || checkCount++ > 10){
    return
  }
  
  panelLoaded = false
  panelShown = false

  //chec si a bien la variable que l'on attend pour savoir si on peut debugger cette page ou pas
  chrome.devtools.inspectedWindow.eval(
    'window.D2CMediaDebug',
    hasD2CMedia => {
      if (!hasD2CMedia || created) {
        console.log('[devtools-background.js] "window.D2CMediaDebug" Not Found');
        return;
      }
      console.log('[devtools-background.js] "window.D2CMediaDebug" Found');
      clearInterval(checkD2CMediaInterval);
      created = true;
      console.log('[devtools-background.js] creating panel "D2CMedia" and page load page "devtools.html"');
      chrome.devtools.panels.create(
        'D2CMedia', 
        'icons/ic_launcher-r.png', 
        'devtools.html',
        panel => {
          // les listener sur le panel state
          panel.onShown.addListener(onPanelShown)
          panel.onHidden.addListener(onPanelHidden)
        }
      )
    }
  )
}

// les diffrentes connections vennant de plusieurs content page (tabs)
const connections = {};

chrome.runtime.onConnect.addListener(portConnection => {
  console.log('[devtools-background.js] chrome.runtime.onConnect:');
  console.log(portConnection);
  //add the listener pour le deconnecte
  portConnection.onDisconnect.addListener(port => {
    console.log('[devtools-background.js] portConnection.onDisconnect:');
    port.onMessage.removeListener(portListener);
  });
  //assigne une varible pour la delete plus tard sur le disconnect
  //ecoute poue les message venant de devtools.js
  var portListener = (message, sender, sendResponse) => {
    console.log('[devtools-background.js] portConnection.onMessage:');
    console.log(message);
    //on set le port pour cette connection pour pouvoir reparler avec a devtools.js
    connections[message.tabId] = portConnection;
    //on reparle a la devtools.js comme quoi on bien recu son message
    if(typeof message.name !== 'undefined' && typeof message.command !== 'undefined' 
      && message.name === Const.TOOLNAME && message.command === Const.INIT){
      connections[message.tabId].postMessage({
        name: Const.TOOLNAME,
        command: Const.INJECT
      });
    }
  }
  //put the function as the listener
  portConnection.onMessage.addListener(portListener);

});

// les messages que l'on recoit de hooks.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[devtools-background.js] chrome.runtime.onMessage:');
  console.log(message);
  connections[sender.tab.id].postMessage(message);
  return true;
});


function onPanelShown(){
  console.log('[devtools-background.js] onPanelShown');
}

function onPanelHidden(){
  console.log('[devtools-background.js] onPanelHidden');
}

