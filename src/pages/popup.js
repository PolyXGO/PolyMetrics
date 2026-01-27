// Simple popup - just open index.html with the selected tab
document.addEventListener('DOMContentLoaded', () => {
    // Open settings page
    const openSettingsBtn = document.getElementById('open-settings');
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                const url = chrome.runtime.getURL('pages/index.html#settings');
                chrome.tabs.create({ url: url }, (tab) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error opening settings:', chrome.runtime.lastError);
                    }
                });
                window.close();
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }
    
    // Open documentation page
    const openDocsBtn = document.getElementById('open-documentation');
    if (openDocsBtn) {
        openDocsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                const url = chrome.runtime.getURL('pages/index.html#documentation');
                chrome.tabs.create({ url: url }, (tab) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error opening documentation:', chrome.runtime.lastError);
                    }
                });
                window.close();
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }
});

