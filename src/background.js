(async () => {
  let lastStatus = null;
  chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (tab && tab.id === tabId && tab.status !== lastStatus) {
      lastStatus = tab.status;
      if (tab.status === "complete") {
        chrome.tabs.sendMessage(tabId, { url: tab.url });
        console.table(tabId, changeInfo, tab);
        console.log(`RUN Poly Metrics`);
      }
    }
  });
})();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Handle opening extension pages
    if (request.action === 'openPage') {
        const page = request.page || 'settings';
        const url = chrome.runtime.getURL(`pages/index.html#${page}`);
        
        chrome.tabs.create({ url: url }, (tab) => {
            if (chrome.runtime.lastError) {
                console.error('Error opening page:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                console.log('Successfully opened page:', page, 'in tab:', tab.id);
                sendResponse({ success: true, tabId: tab.id });
            }
        });
        
        return true; // Keep the message channel open for async response
    }
    
    return false;
});
