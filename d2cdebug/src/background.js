
// le script roule sur toute s les pages tel que mentionner dans le manifest.json

console.log('[D2CMedia Debug - backgound.js] loaded');

// la declarative rules on install ou upgrade.
//console.log('[backgound.js] check if tag "d2cmediadebug" is present');
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        // quand contient le tag voulu <d2cmediadebug> tag...
        new chrome.declarativeContent.PageStateMatcher({
          css: ["d2cmediadebug"]
        })
      ],
      // on set l'icone comme actif.
      actions: [new chrome.declarativeContent.ShowPageAction() ]
    }]);
  });
});

/*
chrome.runtime.onInstalled.addListener(function() {
  // When the app gets installed
  //creer un menu contextuel
  chrome.contextMenus.create({
    id: "open-d2dmedia-inspector",
    title: "D2CMedia Debug",
    contexts: ['all']
  });
});
*/