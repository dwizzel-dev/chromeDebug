
// the background script runs all the time on evry pages

console.log('[backgound.js] loaded');

// Update the declarative rules on install or upgrade.
console.log('[backgound.js] check if tag "d2cmediadebug" is present');
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        // When a page contains a <video> tag...
        new chrome.declarativeContent.PageStateMatcher({
          css: ["d2cmediadebug"]
        })
      ],
      // ... show the page action.
      actions: [new chrome.declarativeContent.ShowPageAction() ]
    }]);
  });
});