// This is the devtools script, which is called when the user opens the
// Chrome devtool on a page. We check to see if we global hook has detected
// D2CMedia presence on the page. If yes, create the D2CMedia panel; otherwise poll
// for 10 seconds.

import Const from '/src/shared/constant.js';
import Consolas from '/src/shared/consolas.js';

Consolas.log('[D2CMedia Debug - devtools-background.js] loaded');

let panelLoaded = false;
let panelShown = false;
let created = false;
let checkCount = 0;


// si on reload ou change de page que le inspect tab de "D2CMedia" est deja ouvert
chrome.devtools.network.onNavigated.addListener(createPanelIfHasD2CMedia);

//check avec un timer pour voir si on doit creer ou pas le panel
const checkD2CMediaInterval = setInterval(createPanelIfHasD2CMedia, 1000);

createPanelIfHasD2CMedia();

//ceer le tab panel si la condition est bonne on essaye avec un timer plusieurs fois si long a loader
function createPanelIfHasD2CMedia (){
  Consolas.log('[devtools-background.js] checking if "window.D2CMediaDebug" is present [' + checkCount + ']');
  if (created || checkCount++ > 10){
    clearInterval(checkD2CMediaInterval);
    return;
  }
  
  panelLoaded = false;
  panelShown = false;

  //chec si a bien la variable que l'on attend pour savoir si on peut debugger cette page ou pas
  chrome.devtools.inspectedWindow.eval(
    'window.D2CMediaDebug',
    hasD2CMedia => {
      if (!hasD2CMedia || created) {
        Consolas.log('[devtools-background.js] "window.D2CMediaDebug" Not Found');
        return;
      }
      Consolas.log('[devtools-background.js] "window.D2CMediaDebug" Found');
      clearInterval(checkD2CMediaInterval);
      created = true;
      Consolas.log('[devtools-background.js] creating panel "D2CMedia" and page load page "devtools.html"');
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
  Consolas.log('[devtools-background.js] chrome.runtime.onConnect:');
  Consolas.log(portConnection);
  //add the listener pour le deconnecte
  portConnection.onDisconnect.addListener(port => {
    Consolas.log('[devtools-background.js] portConnection.onDisconnect:');
    port.onMessage.removeListener(portListener);
  });
  //assigne une varible pour la delete plus tard sur le disconnect
  //ecoute poue les message venant de devtools.js
  var portListener = (message, sender, sendResponse) => {
    Consolas.log('[devtools-background.js] portConnection.onMessage:');
    //Consolas.log(message);
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

//check pour un refresh sur un chrome tab
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  Consolas.log('[devtools-background.js] chrome.tabs.onUpdated:' + tabId);
  //est-ce qu'il nous appratient
  if(typeof connections[tabId] !== 'undefined'){
    Consolas.log('[devtools-background.js] tab update:' + tabId);
    //si le refresh le load est termine 
    if(changeInfo.status === 'loading'){
      connections[tabId].postMessage({
        name: Const.TOOLNAME,
        command: Const.LOADING
      });    
    }else if(changeInfo.status === 'complete'){
      //check si est debuggable si jamais il navigue sur une autre page qui 
      chrome.devtools.inspectedWindow.eval(
        'window.D2CMediaDebug',
        res => {
          if(res){
            //aller recherche le content une autre fois 
            //en injectant le script backend.js de nouveau qui va aller chercher le resultat
            //via le devtools.js
            connections[tabId].postMessage({
              name: Const.TOOLNAME,
              command: Const.INJECT
            });   
          }else{
            //on clear la page 
            //via le devtools.js
            connections[tabId].postMessage({
              name: Const.TOOLNAME,
              command: Const.CLEAR
            }); 
          }
        }
      );
    }
  }
});


// les messages que l'on recoit de hooks.js on relai au devtools.js du tab associe
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Consolas.log('[devtools-background.js] chrome.runtime.onMessage:');
  //Consolas.log(message);
  connections[sender.tab.id].postMessage(message);
  return true;
});


function onPanelShown(){
  Consolas.log('[devtools-background.js] onPanelShown');
}

function onPanelHidden(){
  Consolas.log('[devtools-background.js] onPanelHidden');
}

