// ================= Classes ================= //
/**
 * Feature Development:
 * Save info currently viewing about API with id key: minute_hour_day_month_year and analysis info.
 * Save with common key for 1 link item to track metrics at time points.
 * Auto refresh link to save sold count, price changes.
 */

// ================= Storage Management ================= //
class PolyStorage {
    'use strict';
    
    // Get data from Chrome Storage
    static async get(key, defaultValue = null) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([key], (result) => {
                    resolve(result[key] !== undefined ? result[key] : defaultValue);
                });
            } else {
                // Fallback to localStorage
                const value = localStorage.getItem(key);
                resolve(value ? JSON.parse(value) : defaultValue);
            }
        });
    }
    
    // Set data to Chrome Storage
    static async set(key, value) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [key]: value }, () => {
                    resolve(true);
                });
            } else {
                // Fallback to localStorage
                localStorage.setItem(key, JSON.stringify(value));
                resolve(true);
            }
        });
    }
    
    // Remove data from Chrome Storage
    static async remove(key) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.remove([key], () => {
                    resolve(true);
                });
            } else {
                // Fallback to localStorage
                localStorage.removeItem(key);
                resolve(true);
            }
        });
    }
    
    // Clear all data
    static async clear() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.clear(() => {
                    resolve(true);
                });
            } else {
                // Fallback to localStorage
                localStorage.clear();
                resolve(true);
            }
        });
    }
}

// ================= Settings Management ================= //
class PolySettings {
    'use strict';
    
    static STORAGE_KEY = 'poly_metrics_settings';
    
    static defaultSettings = {
        defaultTax: 20,
        defaultCurrency: 'VND',
        toggleState: 'closed', // 'open' or 'closed'
        // quickLinks removed from global settings - now stored per URL
        currencies: [
            { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
            { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 23000 },
            { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
            { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
            { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.50 },
            { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
            { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.12 },
            { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 4.97 },
            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.53 },
            { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.38 },
            { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.88 },
            { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.34 },
            { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 7.83 },
            { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1320.50 },
            { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', rate: 17.15 },
            { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 92.50 },
            { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 34.85 },
        ]
    };
    
    // Load settings from storage
    static async load() {
        const settings = await PolyStorage.get(this.STORAGE_KEY, this.defaultSettings);
        return { ...this.defaultSettings, ...settings };
    }
    
    // Save settings to storage
    static async save(settings) {
        return await PolyStorage.set(this.STORAGE_KEY, settings);
    }
    
    // Get currency by code
    static async getCurrency(code) {
        const settings = await this.load();
        return settings.currencies.find(c => c.code === code) || settings.currencies[0];
    }
    
    // Get all currencies
    static async getCurrencies() {
        const settings = await this.load();
        return settings.currencies;
    }
    
    // Add or update currency
    static async updateCurrency(currency) {
        const settings = await this.load();
        const index = settings.currencies.findIndex(c => c.code === currency.code);
        
        if (index >= 0) {
            settings.currencies[index] = currency;
        } else {
            settings.currencies.push(currency);
        }
        
        await this.save(settings);
        return settings;
    }
    
    // Remove currency
    static async removeCurrency(code) {
        const settings = await this.load();
        settings.currencies = settings.currencies.filter(c => c.code !== code);
        await this.save(settings);
        return settings;
    }
    
    // Reset to defaults
    static async reset() {
        await PolyStorage.remove(this.STORAGE_KEY);
        return this.defaultSettings;
    }
    
    // Save toggle state
    static async saveToggleState(state) {
        const settings = await this.load();
        settings.toggleState = state;
        await this.save(settings);
    }
    
    // Get toggle state
    static async getToggleState() {
        const settings = await this.load();
        return settings.toggleState || 'closed';
    }
    
    // Get normalized URL (main product page) - same logic as BookmarkManager
    static getNormalizedUrl(url) {
        if (!url) return url;
        
        try {
            const urlObj = new URL(url);
            // Match patterns like:
            // /item/name/123456
            // /item/name/reviews/123456
            // /item/name/comments/123456
            // /item/name/support/123456
            const itemMatch = url.match(/\/item\/([^\/]+)(?:\/(?:reviews|comments|support))?\/(\d+)/);
            if (itemMatch) {
                const itemName = itemMatch[1];
                const itemId = itemMatch[2];
                return `${urlObj.origin}/item/${itemName}/${itemId}`;
            }
            return url;
        } catch (e) {
            return url;
        }
    }
    
    // Quick Links Management - Keep old storage structure (pathname), but normalize URL before use
    static getQuickLinksKey(url) {
        // Normalize URL first to get main product page
        const normalizedUrl = this.getNormalizedUrl(url);
        try {
            const urlObj = new URL(normalizedUrl);
            const pathname = urlObj.pathname;
            // Use pathname as key (e.g., /item/polyutilities/49522529) - keep old structure
            return `quicklinks_${pathname.replace(/\//g, '_')}`;
        } catch (e) {
            return `quicklinks_${normalizedUrl.replace(/[^a-zA-Z0-9]/g, '_')}`;
        }
    }
    
    // Get Quick Links - normalize URL first, then get from normalized key
    static async getQuickLinks(url = window.location.href) {
        // Normalize URL to main product page, then get from that key
        // This ensures all related links (reviews, comments, support) use the same Quick Links
        const key = this.getQuickLinksKey(url);
        return await PolyStorage.get(key, []);
    }
    
    static async saveQuickLinks(quickLinks, url = window.location.href) {
        // Always save to normalized URL (main product page) key
        const key = this.getQuickLinksKey(url);
        return await PolyStorage.set(key, quickLinks);
    }
    
    static async addQuickLink(link, url = window.location.href) {
        // Always save to normalized URL (main product page) key
        const key = this.getQuickLinksKey(url);
        const quickLinks = await PolyStorage.get(key, []);
        quickLinks.push(link);
        return await PolyStorage.set(key, quickLinks);
    }
    
    static async removeQuickLink(index, url = window.location.href) {
        // Always save to normalized URL (main product page) key
        const key = this.getQuickLinksKey(url);
        const quickLinks = await PolyStorage.get(key, []);
        if (quickLinks && quickLinks[index]) {
            quickLinks.splice(index, 1);
            await PolyStorage.set(key, quickLinks);
        }
    }
}

// ================= Bookmark Management ================= //
class BookmarkManager {
    'use strict';
    
    static BOOKMARKS_KEY = 'poly_bookmarks';
    static CATEGORIES_KEY = 'poly_bookmark_categories';
    
    // Generate random hash ID
    static generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    // ===== Categories Management ===== //
    
    // Get default categories
    static getDefaultCategories() {
        return [
            { id: this.generateId(), name: 'Uncategorized', color: '#6c757d' },
            { id: this.generateId(), name: 'My Favorites', color: '#ffc107' },
            { id: this.generateId(), name: 'To Review', color: '#17a2b8' },
            { id: this.generateId(), name: 'Competitors', color: '#dc3545' },
        ];
    }
    
    // Get all categories
    static async getCategories() {
        let categories = await PolyStorage.get(this.CATEGORIES_KEY, null);
        if (!categories || categories.length === 0) {
            categories = this.getDefaultCategories();
            await PolyStorage.set(this.CATEGORIES_KEY, categories);
        }
        return categories;
    }
    
    // Get category by ID
    static async getCategory(id) {
        const categories = await this.getCategories();
        return categories.find(c => c.id === id) || categories[0];
    }
    
    // Add new category
    static async addCategory(name, color = '#6c757d') {
        const categories = await this.getCategories();
        const newCategory = {
            id: this.generateId(),
            name: name,
            color: color
        };
        categories.push(newCategory);
        await PolyStorage.set(this.CATEGORIES_KEY, categories);
        return newCategory;
    }
    
    // Update category
    static async updateCategory(id, name, color) {
        const categories = await this.getCategories();
        const index = categories.findIndex(c => c.id === id);
        if (index >= 0) {
            categories[index].name = name;
            categories[index].color = color;
            await PolyStorage.set(this.CATEGORIES_KEY, categories);
            return categories[index];
        }
        return null;
    }
    
    // Delete category
    static async deleteCategory(id) {
        const categories = await this.getCategories();
        const filteredCategories = categories.filter(c => c.id !== id);
        
        // Move bookmarks from deleted category to Uncategorized
        if (filteredCategories.length > 0) {
            const uncategorizedId = filteredCategories[0].id;
            const bookmarks = await this.getBookmarks();
            bookmarks.forEach(bookmark => {
                if (bookmark.categoryId === id) {
                    bookmark.categoryId = uncategorizedId;
                }
            });
            await PolyStorage.set(this.BOOKMARKS_KEY, bookmarks);
        }
        
        await PolyStorage.set(this.CATEGORIES_KEY, filteredCategories);
        return true;
    }
    
    // ===== Bookmarks Management ===== //
    
    // Normalize URL to main product page (remove /reviews, /comments, /support, query params)
    static normalizeUrl(url) {
        if (!url) return url;
        
        try {
            const urlObj = new URL(url);
            
            // Check if it's a CodeCanyon or ThemeForest item URL
            // Match patterns like:
            // /item/name/123456
            // /item/name/reviews/123456
            // /item/name/comments/123456
            // /item/name/support/123456
            const itemMatch = url.match(/\/item\/([^\/]+)(?:\/(?:reviews|comments|support))?\/(\d+)/);
            if (itemMatch) {
                // Reconstruct the main product URL
                const itemName = itemMatch[1];
                const itemId = itemMatch[2];
                return `${urlObj.origin}/item/${itemName}/${itemId}`;
            }
            
            // If not a product URL, return as is
            return url;
        } catch (e) {
            // If URL parsing fails, return original
            return url;
        }
    }
    
    // Get all bookmarks
    static async getBookmarks() {
        return await PolyStorage.get(this.BOOKMARKS_KEY, []);
    }
    
    // Get bookmarks by category
    static async getBookmarksByCategory(categoryId) {
        const bookmarks = await this.getBookmarks();
        return bookmarks.filter(b => b.categoryId === categoryId);
    }
    
    // Get bookmark by ID
    static async getBookmark(id) {
        const bookmarks = await this.getBookmarks();
        return bookmarks.find(b => b.id === id);
    }
    
    // Check if URL is bookmarked (normalized)
    static async isBookmarked(url) {
        const normalizedUrl = this.normalizeUrl(url);
        const bookmarks = await this.getBookmarks();
        return bookmarks.some(b => this.normalizeUrl(b.url) === normalizedUrl);
    }
    
    // Add new bookmark (normalize URL before saving)
    static async addBookmark(title, url, categoryId) {
        const normalizedUrl = this.normalizeUrl(url);
        const bookmarks = await this.getBookmarks();
        
        // Check if already bookmarked (using normalized URL)
        if (bookmarks.some(b => this.normalizeUrl(b.url) === normalizedUrl)) {
            return { success: false, message: 'Already bookmarked' };
        }
        
        const newBookmark = {
            id: this.generateId(),
            title: title,
            url: normalizedUrl, // Save normalized URL
            categoryId: categoryId,
            createdAt: new Date().toISOString()
        };
        
        bookmarks.push(newBookmark);
        await PolyStorage.set(this.BOOKMARKS_KEY, bookmarks);
        return { success: true, bookmark: newBookmark };
    }
    
    // Update bookmark (normalize URL before saving)
    static async updateBookmark(id, title, url, categoryId) {
        const normalizedUrl = this.normalizeUrl(url);
        const bookmarks = await this.getBookmarks();
        const index = bookmarks.findIndex(b => b.id === id);
        
        if (index >= 0) {
            bookmarks[index].title = title;
            bookmarks[index].url = normalizedUrl; // Save normalized URL
            bookmarks[index].categoryId = categoryId;
            bookmarks[index].updatedAt = new Date().toISOString();
            await PolyStorage.set(this.BOOKMARKS_KEY, bookmarks);
            return bookmarks[index];
        }
        return null;
    }
    
    // Move bookmark to another category
    static async moveBookmark(id, newCategoryId) {
        const bookmarks = await this.getBookmarks();
        const index = bookmarks.findIndex(b => b.id === id);
        
        if (index >= 0) {
            bookmarks[index].categoryId = newCategoryId;
            bookmarks[index].updatedAt = new Date().toISOString();
            await PolyStorage.set(this.BOOKMARKS_KEY, bookmarks);
            return bookmarks[index];
        }
        return null;
    }
    
    // Delete bookmark
    static async deleteBookmark(id) {
        const bookmarks = await this.getBookmarks();
        const filteredBookmarks = bookmarks.filter(b => b.id !== id);
        await PolyStorage.set(this.BOOKMARKS_KEY, filteredBookmarks);
        return true;
    }
    
    // Search bookmarks
    static async searchBookmarks(query) {
        const bookmarks = await this.getBookmarks();
        const lowerQuery = query.toLowerCase();
        return bookmarks.filter(b => 
            b.title.toLowerCase().includes(lowerQuery) || 
            b.url.toLowerCase().includes(lowerQuery)
        );
    }
}

class PolyEnvato {
    'use strict';
    static validTimeFrame = [
        [[6, 7], [1, 2]],
        [[1, 2], [4, 5]],
    ];

    static authorFee = [
        55,
        [
            [0, 37.5],
            [3750, 36.25],
            [7500, 35.0],
            [11250, 33.75],
            [15000, 32.5],
            [18750, 31.25],
            [22500, 30.0],
            [26250, 28.75],
            [30000, 27.5],
            [33750, 26.25],
            [37500, 25.0],
            [41250, 23.75],
            [45000, 22.5],
            [48750, 21.25],
            [52500, 20.0],
            [56250, 18.75],
            [60000, 17.5],
            [63750, 16.25],
            [67500, 15.0],
            [71250, 13.75],
            [75000, 12.5],
        ],
    ];

    // Initialize tools
    static initTools = async () => {
        const settings = await PolySettings.load();
        const headerDetailsElement = $('.item-header__details-section');
        
        // Build currency options
        let currencyOptions = '';
        settings.currencies.forEach(currency => {
            const selected = currency.code === settings.defaultCurrency ? 'selected' : '';
            currencyOptions += `<option value="${currency.code}" data-rate="${currency.rate}" ${selected}>${currency.code} (${currency.symbol})</option>`;
        });
        
        const toolbar = `
            <div class="poly-toolsbar">
                <div class="poly-toolbar-row">
                    <div class="poly-toolbar-item">
                        <label>TAX:</label>
                        <input id="poly-tax" type="text" value="${settings.defaultTax}">%
                        <span style="font-size:10px">Corporate/Personal income tax rate</span>
                    </div>
                    <div class="poly-toolbar-item">
                        <label>Currency:</label>
                        <select id="poly-currency">${currencyOptions}</select>
                    </div>
                    <div class="poly-toolbar-item">
                        <label>Exchange Rate:</label>
                        <input id="poly-exchange-rate" type="number" step="0.01" value="${settings.currencies.find(c => c.code === settings.defaultCurrency).rate}" readonly>
                        <span id="poly-currency-symbol"></span>
                    </div>
                    <div class="poly-toolbar-item">
                        <button id="poly-quicklinks-btn" title="Quick Links">🔗</button>
                        <button id="poly-settings-btn" title="Settings">⚙️</button>
                    </div>
                </div>
                <div id="poly-quicklinks-display"></div>
                <div id="poly-chart-container">
                    <div class="poly-chart-row">
                        <div class="poly-chart-col">
                            <div class="poly-chart-header">
                                <h4 class="poly-chart-title">Revenue Breakdown</h4>
                                <select id="poly-chart-type" class="poly-chart-type-select">
                                    <option value="bar">Bar Chart</option>
                                    <option value="line">Line Chart</option>
                                    <option value="radar">Radar Chart</option>
                                    <option value="polarArea">Polar Area</option>
                                </select>
                            </div>
                            <canvas id="poly-revenue-chart"></canvas>
                        </div>
                        <div class="poly-chart-col">
                            <h4 class="poly-chart-title">Revenue Distribution (%)</h4>
                            <canvas id="poly-pie-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>`;
        
        headerDetailsElement.append(toolbar);
        
        // Update symbol display
        PolyEnvato.updateCurrencySymbol();

        // Event handlers
        $('#poly-tax').on('input', function () {
            const tax = $(this).val().replace(/[^0-9]/g, '');
            PolyEnvato.aggregateCalculations(tax);
        });
        
        $('#poly-currency').on('change', async function () {
            const selectedOption = $(this).find('option:selected');
            const rate = selectedOption.data('rate');
            $('#poly-exchange-rate').val(rate);
            PolyEnvato.updateCurrencySymbol();
            
            // Save as default
            const settings = await PolySettings.load();
            settings.defaultCurrency = $(this).val();
            await PolySettings.save(settings);
            
            // Recalculate
            const tax = $('#poly-tax').val();
            PolyEnvato.aggregateCalculations(tax);
        });
        
        // Exchange rate is readonly, only changeable in settings
        
        // Validate TAX input - only numbers
        $('#poly-tax').on('input', function () {
            let value = $(this).val().replace(/[^0-9]/g, '');
            if (value > 100) value = 100;
            if (value < 0) value = 0;
            $(this).val(value);
        });
        
        $('#poly-settings-btn').on('click', () => {
            PolyEnvato.openSettingsModal();
        });
        
        $('#poly-quicklinks-btn').on('click', () => {
            PolyEnvato.openQuickLinksModal();
        });
        
        // Chart type change handler
        $(document).on('change', '#poly-chart-type', function() {
            const tax = $('#poly-tax').val();
            PolyEnvato.aggregateCalculations(tax);
        });
        
        // Render quick links
        PolyEnvato.renderQuickLinks();
        
        // Initial calculation and chart rendering after a short delay
        setTimeout(() => {
            const initialTax = $('#poly-tax').val() || settings.defaultTax;
            PolyEnvato.aggregateCalculations(initialTax);
        }, 300);
    };
    
    // Update currency symbol display
    static updateCurrencySymbol = () => {
        const currencyCode = $('#poly-currency').val();
        const selectedOption = $('#poly-currency').find('option:selected');
        const symbolText = selectedOption.text().match(/\((.*?)\)/);
        $('#poly-currency-symbol').text(symbolText ? symbolText[1] : '$');
    };

    // Send message
   /* static sendMessage = () => {
        const areaHolder = $('#contact');
        const contactForm = $('.sidebar-l form[data-view="sendMessageForm"]').clone(true).addClass('poly-form').prependTo('.content-s').end().remove();
        let restInformation = '';
        let location = 'vietnam';

        $('.badges img').each(function () {
            const title = $(this).attr('title');
            if (title && title.toLowerCase().includes('located in')) {
                location = title.replace('Located in', '').trim();
            }
            restInformation += `<div class="poly-envato-item">📍 ${title}</div>`;
        });

        const timeByLocation = PolyEnvato.getCountryTime(location);
        const suggestionEmailSentAt = `
            <div class="poly-timer">
                <div id="poly-lock">${timeByLocation}</div>
            </div>
            <div id="poly-can-send"></div>
            <div>You should send emails during the following time frames:
                <ul class="poly-time-block">
                    <li>6-7 a.m</li>
                    <li>10-11 a.m</li>
                    <li>1-2 p.m</li>
                    <li>4-5 p.m</li>
                </ul>
            </div>`;

        areaHolder.before(`<div class="poly-envato">${restInformation}${suggestionEmailSentAt}</div>`);
        PolyEnvato.updateClock(location);

        const nameBlock = $('#contact h4').text().replace(/\s+/g, ' ').trim();
        const name = PolyEnvato.removeWordsFromString(nameBlock, ['Email', 'email']);
        const message = `Hello ${PolyEnvato.capitalizeFirstLetter(name)},

I noticed that you're using Perfex CRM. I'm currently developing modules that add enhanced features to Perfex, and I believe you might be interested in the improved functionality and performance enhancements that PolyUtilities offers.

You can explore these features and see how they can benefit your workflow by visiting: Discover PolyUtilities for Perfex CRM at https://codecanyon.net/item/polyutilities-for-perfex-crm-quick-access-menu-custom-js-css-and-more/49522529

I apologize if this email is unsolicited and appreciate your understanding.

Best regards,`;

        $('#message').val(message);
    };
*/
    // Aggregate and calculate
    static aggregateCalculations = (taxValue = 20) => {
        console.log('Calculations Envato...');

        $('.poly-elements').remove();

        const updatedDate = PolyEnvato.stripHtmlTags($('.js-condense-item-page-info-panel--last_update time.updated').html());
        
        // Try to get created date from the new selector first, fallback to old selector
        let createdDateRaw = PolyEnvato.stripHtmlTags($('.js-condense-item-page-info-panel--created-at td.meta-attributes__attr-detail').html());
        if (!createdDateRaw) {
            createdDateRaw = PolyEnvato.stripHtmlTags($('.meta-attributes__table tr:contains("Published") td.meta-attributes__attr-detail').html());
        }
        const createdDate = PolyEnvato.parseRelativeTimeToDate(createdDateRaw);
        const days = PolyEnvato.calculateDaysBetweenDates(createdDate, updatedDate);
        const daysSinceUpdatedDate = PolyEnvato.daysSinceDate(updatedDate);
        const monthsSinceUpdatedDate = PolyEnvato.daysSinceDate(updatedDate)/30;
        const yearsSinceUpdatedDate = PolyEnvato.daysSinceDate(updatedDate)/30/12;
        const suggestionMessage = `<div>It's been <span class="poly-no poly-no-days-since">${PolyEnvato.customFormatNumber(daysSinceUpdatedDate)} days ~ ${PolyEnvato.customFormatNumber(monthsSinceUpdatedDate)} months ~ ${PolyEnvato.customFormatNumber(yearsSinceUpdatedDate, ',', '.', 2)} years</span> since the last version update.</div>`;
        const salePrice = PolyEnvato.convertToPlainNumber(PolyEnvato.extractNumbers($('.js-purchase-price').html()));
        const sold = PolyEnvato.convertToPlainNumber($('.item-header__sales-count strong').html());
        const daysNo = PolyEnvato.convertToPlainNumber(days);
        const avgMonth = PolyEnvato.customFormatNumber(sold / (daysNo / 30), ',', '.', 2);
        const avgDay = PolyEnvato.customFormatNumber(sold / daysNo, ',', '.', 2);
        const iconDate = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-check-fill" viewBox="0 0 16 16">
            <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2m-5.146-5.146-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
        </svg>`;
        const headerDetailsElement = $('.item-header__details-section');
        const date = `<div class="poly-header-info">
            <div class="poly-date-info">${iconDate}&nbsp;${days} days from ${createdDate} to ${updatedDate}.</div>
            ${suggestionMessage}
        </div>`;

        // Get exchange rate from input
        const exchangeRate = parseFloat($('#poly-exchange-rate').val()) || 23000;
        const currencyCode = $('#poly-currency').val() || 'VND';
        const currencySymbol = $('#poly-currency-symbol').text() || '₫';
        
        const authorFeeEnvato = PolyEnvato.authorFee[1];
        const buyerFee = 5;
        const salePriceExcludeFee = salePrice - buyerFee;
        const revenueUSD = salePrice * sold;
        const totalBuyerFee = buyerFee * sold;
        
        const listAuthorFeeLevel = { value: [], bind: '', totals_author_fee: 0, totals_profit: 0 };
        
        PolyEnvato.calculationRevenue(salePriceExcludeFee, sold, listAuthorFeeLevel);
        
        const profitUSDByAuthorFeeLevel = listAuthorFeeLevel.totals_profit;
        const authorFeeRange = `${authorFeeEnvato[authorFeeEnvato.length - 1][1]}% - ${authorFeeEnvato[0][1]}%`;

        //TODO: testing
        console.log(`$${salePrice} * ${sold}(sales) = $${ PolyEnvato.customFormatNumber(revenueUSD, ",", ".", 2)} => Profit valid if equal: %c$${PolyEnvato.customFormatNumber(profitUSDByAuthorFeeLevel, ",", ".", 2)} (profit) vs %c$${PolyEnvato.customFormatNumber(revenueUSD - (listAuthorFeeLevel.totals_author_fee+totalBuyerFee), ",", ".", 2)} ($${PolyEnvato.customFormatNumber(revenueUSD, ",", ".", 2)} - ($${PolyEnvato.customFormatNumber(listAuthorFeeLevel.totals_author_fee, ",", ".", 2)} + $${PolyEnvato.customFormatNumber(totalBuyerFee, ",", ".", 2)}))`, "color: blue; font-size: 20px; background-color: yellow; padding: 5px;", "color: red; font-size: 20px; background-color: yellow; padding: 5px;");
        //TODO: testing

        const tableAuthorFeeLevel = `
            <table class="poly-table">
                <thead>
                    <tr>
                        <td>Price Level</td>
                        <td>Author Fee %</td>
                        <td>Author Fee</td>
                        <td>Profit</td>
                        <td>Sales target</td>
                    </tr>
                </thead>
                <tbody>${listAuthorFeeLevel.bind}</tbody>
            </table>`;

        const iconToggle = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="poly-toggle-icon" viewBox="0 0 16 16">
            <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
        </svg>`;
        
        const feeNote = `
            <div>Without author fee, buyer fee</div>
            <div class="poly-fee-block poly-collapsible">
                <div class="poly-toggle-btn" title="Toggle detailed statistics">${iconToggle}</div>
                <div>Total buyer fee: $${PolyEnvato.customFormatNumber(totalBuyerFee)} ($${buyerFee}/ item ~${PolyEnvato.customFormatNumber(exchangeRate * buyerFee)}${currencySymbol})</div>
                <div>Total author fee: $${PolyEnvato.customFormatNumber(listAuthorFeeLevel.totals_author_fee, ",", ".", 2)} (${authorFeeRange})</div>
                ${tableAuthorFeeLevel}
            </div>`;

        const tax = taxValue;
        const profitTax = (tax * profitUSDByAuthorFeeLevel) / 100;
        const profitUSDWithoutTAX = profitUSDByAuthorFeeLevel - profitTax;

        const profitMaxPrice = salePriceExcludeFee - (salePriceExcludeFee * authorFeeEnvato[authorFeeEnvato.length - 1][1]) / 100;
        const profitMinPrice = salePriceExcludeFee - (salePriceExcludeFee * authorFeeEnvato[0][1]) / 100;

        const restTable = `
            <table class="poly-table">
                <thead>
                    <tr>
                        <td>Sales</td>
                        <td>Price</td>
                        <td>Revenue without fee & TAX</td>
                        <td class="poly-table-profit">Profit before TAX</td>
                        <td>Avg days</td>
                        <td>Avg month</td>
                        <td>TAX ${tax}%</td>
                        <td>Profit after TAX</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${PolyEnvato.customFormatNumber(sold)}</td>
                        <td>
                            <div class="poly-fee-block">
                                <div>Sale price: <span class="poly-no">$${PolyEnvato.customFormatNumber(salePrice, ',', '.', 2)}</span></div>
                                <div>Profit price from <span class="poly-no">$${PolyEnvato.customFormatNumber(profitMinPrice, ',', '.', 2)}</span> to <span class="poly-no">$${PolyEnvato.customFormatNumber(profitMaxPrice, ',', '.', 2)}</span></div>
                            </div>
                        </td>
                        <td><span class="poly-no">$${PolyEnvato.customFormatNumber(revenueUSD)}</span></td>
                        <td>
                            <span class="poly-no">$${PolyEnvato.customFormatNumber(profitUSDByAuthorFeeLevel)}</span>
                            <div>${feeNote}</div>
                        </td>
                        <td>${avgDay}</td>
                        <td>${avgMonth}</td>
                        <td class="poly-with-fix"><span class="poly-no">$${PolyEnvato.customFormatNumber(profitTax)}</span> ~${PolyEnvato.customFormatNumber(profitTax * exchangeRate)}${currencySymbol}</td>
                        <td class="poly-with-fix"><span class="poly-no poly-no-profit">$${PolyEnvato.customFormatNumber(profitUSDWithoutTAX)}</span> ~${PolyEnvato.customFormatNumber(profitUSDWithoutTAX * exchangeRate)}${currencySymbol}</td>
                    </tr>
                </tbody>
            </table>`;

        headerDetailsElement.after(`<div class="poly-elements">${date}${restTable}</div>`);
        
        // Initialize Chart
        PolyEnvato.initChart({
            revenue: revenueUSD,
            profitBeforeTax: profitUSDByAuthorFeeLevel,
            tax: profitTax,
            profitAfterTax: profitUSDWithoutTAX
        });
        
        // Add toggle functionality
        PolyEnvato.initToggle();
    };
    
    // Initialize toggle functionality for collapsible elements
    static initToggle = async () => {
        // Load toggle state from storage
        const settings = await PolySettings.load();
        const toggleState = settings.toggleState || 'closed';
        
        console.log('Init toggle with state:', toggleState);
        
        setTimeout(() => {
            const $feeBlockTable = jQuery('.poly-fee-block table');
            const $toggleBtn = jQuery('.poly-toggle-btn');
            const $toggleIcon = jQuery('.poly-toggle-btn svg');
            
            console.log('Toggle elements found:', {
                tables: $feeBlockTable.length,
                buttons: $toggleBtn.length,
                icons: $toggleIcon.length
            });
            
            // Set initial state based on storage
            if (toggleState === 'closed') {
                $feeBlockTable.css('display', 'none');
                $toggleIcon.removeClass('poly-rotated');
            } else {
                $feeBlockTable.css('display', 'table');
                $toggleIcon.addClass('poly-rotated');
            }
            
            // Remove any existing handlers first
            jQuery(document).off('click', '.poly-toggle-btn');
            
            // Toggle click handler
            jQuery(document).on('click', '.poly-toggle-btn', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Toggle button clicked!');
                
                const $btn = jQuery(this);
                const $icon = $btn.find('svg');
                const $parent = $btn.parent('.poly-fee-block');
                
                console.log('Parent found:', $parent.length);
                
                if ($parent.length === 0) {
                    console.error('No parent .poly-fee-block found');
                    return;
                }
                
                // Find table directly in parent
                const $table = $parent.find('table');
                
                console.log('Table found:', $table.length, 'visible:', $table.is(':visible'));
                
                if ($table.length > 0) {
                    const isVisible = $table.is(':visible');
                    
                    if (isVisible) {
                        $table.css('display', 'none');
                        $icon.removeClass('poly-rotated');
                        // Save closed state
                        PolySettings.saveToggleState('closed');
                        console.log('Table hidden, state saved: closed');
                    } else {
                        $table.css('display', 'table');
                        $icon.addClass('poly-rotated');
                        // Save open state
                        PolySettings.saveToggleState('open');
                        console.log('Table shown, state saved: open');
                    }
                } else {
                    console.error('No table found in parent');
                }
            });
        }, 500);
    };

    // Cập nhật đồng hồ theo quốc gia
    static updateClock = (country) => {
        setInterval(() => {
            const currentTime = PolyEnvato.getCountryTime(country);
            const isSendEmailNow = PolyEnvato.canSendEmailNow(country);
            $('#poly-lock').html(currentTime);
            $('#poly-can-send').html(
                isSendEmailNow
                    ? `The current time frame in ${country} is appropriate; you can send the email now.`
                    : `The current time frame in ${country} is not appropriate; you should send the email later.`
            );
        }, 1000);
    };

    // Lấy múi giờ theo quốc gia
    // static getTimeZoneByCountry = (country) => {
    //     return PolyEnvato.timeZones[country.toLowerCase()] || 'UTC';
    // };

    // // Lấy thời gian theo quốc gia
    // static getCountryTime = (country) => {
    //     return moment().tz(PolyEnvato.getTimeZoneByCountry(country)).format('YYYY-MM-DD hh:mm:ss A');
    // };

    // // Kiểm tra nếu có thể gửi email ngay bây giờ
    // static canSendEmailNow = (country) => {
    //     const timezone = PolyEnvato.getTimeZoneByCountry(country);
    //     const currentTime = moment().tz(timezone);
    //     const hour = currentTime.hour();
    //     const periodIndex = hour < 12 ? 0 : 1;
    //     const hoursToCheck = PolyEnvato.validTimeFrame[periodIndex];

    //     return hoursToCheck.some(range => hour >= range[0] && hour < range[1]);
    // };

    // Xóa các từ trong chuỗi
    static removeWordsFromString = (inputString, wordsToRemove) => {
        const pattern = `\\b(${wordsToRemove.join('|')})\\b`;
        const regex = new RegExp(pattern, 'gi');
        return inputString.replace(regex, '').replace(/\s+/g, ' ').trim();
    };

    // Viết hoa chữ cái đầu tiên
    static capitalizeFirstLetter = (string) => {
        return string.replace(/\b\w/g, char => char.toUpperCase());
    };

    // Loại bỏ thẻ HTML
    static stripHtmlTags = (htmlString) => {
        return $('<div>').html(htmlString).text().trim();
    };

    // Parse relative time string (e.g., "2 years ago", "10 months ago", "21 days ago") to date
    static parseRelativeTimeToDate = (relativeTimeString) => {
        const trimmed = relativeTimeString.trim();
        const match = trimmed.match(/(\d+)\s+(year|month|day)s?\s+ago/i);
        
        if (!match) {
            // If it doesn't match the relative format, assume it's already a date string
            return relativeTimeString;
        }

        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const now = new Date();
        
        let targetDate;
        
        if (unit === 'year') {
            // For years, use the first day of that year
            const targetYear = now.getFullYear() - value;
            targetDate = new Date(targetYear, 0, 1); // January 1st of target year
        } else if (unit === 'month') {
            // For months, use the first day of that month
            const totalMonths = now.getMonth() - value;
            const targetYear = now.getFullYear() + Math.floor(totalMonths / 12);
            const targetMonth = ((totalMonths % 12) + 12) % 12;
            targetDate = new Date(targetYear, targetMonth, 1);
        } else if (unit === 'day') {
            // For days, use the exact day
            targetDate = new Date(now);
            targetDate.setDate(now.getDate() - value);
        }
        
        // Format the date as YYYY-MM-DD or the format expected by your other functions
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };

    // Tính số ngày từ ngày cụ thể đến hiện tại
    static daysSinceDate = (toDate) => {
        const differenceInTime = new Date() - new Date(toDate);
        return Math.round(differenceInTime / (1000 * 3600 * 24));
    };

    // Tính số ngày giữa hai ngày
    static calculateDaysBetweenDates = (fromDate, toDate) => {
        const diffInDays = Math.round((new Date(toDate) - new Date(fromDate)) / (24 * 60 * 60 * 1000));
        return diffInDays.toLocaleString();
    };

    // Chuyển đổi chuỗi số thành số nguyên
    /*static convertToPlainNumber = (numberString = '0') => {
        return parseInt(numberString.replace(/[,\.]/g, ''), 10);
    };*/

    static convertToPlainNumber = (numberString = 0) => {
        if (typeof numberString !== 'string') {
            numberString = String(numberString);
        }
        return parseInt(numberString.replace(/[,\.]/g, ''), 10);
    };

    // Định dạng số tùy chỉnh
    static customFormatNumber = (number, thousandSeparator = ',', decimalSeparator = '.', toFixed = 0) => {
        const parts = number.toFixed(toFixed).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
        return parts.join(decimalSeparator);
    };

    // Trích xuất số từ chuỗi
    static extractNumbers = (inputString) => {
        return parseFloat((inputString || '').replace(/[^0-9.]/g, ''));
    };

    // Tính toán doanh thu
    static calculationRevenue = (salePriceExcludeFee, totalItemsSales, objReference) => {
        let totalRevenue = salePriceExcludeFee * totalItemsSales;
        let remainingRevenue = totalRevenue;
        const authorFee = PolyEnvato.authorFee[1];
        let totalProfit = 0;
        let totalsAuthorFeeBySales = 0;

        for (let i = 0; i < authorFee.length; i++) {
            const [rangeStart, percent] = authorFee[i];
            const feePercent = percent / 100;
            const rangeEnd = i + 1 < authorFee.length ? authorFee[i + 1][0] : totalRevenue;
            const rangeRevenue = Math.min(remainingRevenue, rangeEnd - rangeStart);
            const soldEstimate = rangeRevenue / salePriceExcludeFee;
            const rangeProfit = rangeRevenue * (1 - feePercent);
            totalProfit += rangeProfit;
            remainingRevenue -= rangeRevenue;
            const authorFeeBySales = rangeRevenue * feePercent;
            totalsAuthorFeeBySales += authorFeeBySales;
            const rangeRevenueByLevel = rangeRevenue * i;

            objReference.value.push({
                revenue: rangeRevenueByLevel,
                profit: rangeProfit,
                author_fee: authorFeeBySales,
                sales_target: soldEstimate,
                percent
            });

            objReference.bind += `
                <tr>
                    <td>$${PolyEnvato.customFormatNumber(rangeRevenueByLevel)}</td>
                    <td>${percent}%</td>
                    <td>$${PolyEnvato.customFormatNumber(authorFeeBySales, ',', '.', 2)}</td>
                    <td>$${PolyEnvato.customFormatNumber(rangeProfit, ',', '.', 2)}</td>
                    <td>${PolyEnvato.customFormatNumber(soldEstimate, ',', '.', 2)}</td>
                </tr>`;

            if (remainingRevenue <= 0) break;
        }

        objReference.totals_author_fee = totalsAuthorFeeBySales;
        objReference.totals_profit = totalProfit;
        return objReference;
    };
    
    // Open Settings Modal
    static openSettingsModal = async () => {
        const settings = await PolySettings.load();
        
        // Build currencies list
        let currenciesHTML = '';
        settings.currencies.forEach((currency, index) => {
            currenciesHTML += `
                <tr data-index="${index}">
                    <td><input type="text" class="currency-code" value="${currency.code}" ${index < 2 ? 'readonly' : ''}></td>
                    <td><input type="text" class="currency-name" value="${currency.name}"></td>
                    <td><input type="text" class="currency-symbol" value="${currency.symbol}"></td>
                    <td><input type="number" class="currency-rate" value="${currency.rate}" step="0.01"></td>
                    <td>${index < 2 ? '' : '<button class="poly-btn-remove" data-code="'+currency.code+'">✕</button>'}</td>
                </tr>`;
        });
        
        const modalHTML = `
            <div id="poly-settings-modal" class="poly-modal">
                <div class="poly-modal-content">
                    <div class="poly-modal-header">
                        <h3>⚙️ Settings</h3>
                        <span class="poly-modal-close">&times;</span>
                    </div>
                    <div class="poly-modal-body">
                        <div class="poly-settings-section">
                            <label>Default Tax Rate (%):</label>
                            <input type="number" id="settings-tax" value="${settings.defaultTax}" min="0" max="100">
                        </div>
                        
                        <div class="poly-settings-section">
                            <label>Default Currency:</label>
                            <select id="settings-default-currency">
                                ${settings.currencies.map(c => `<option value="${c.code}" ${c.code === settings.defaultCurrency ? 'selected' : ''}>${c.code}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="poly-settings-section">
                            <h4>Currencies & Exchange Rates</h4>
                            <table class="poly-settings-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Symbol</th>
                                        <th>Rate (to USD)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="currencies-list">
                                    ${currenciesHTML}
                                </tbody>
                            </table>
                            <button id="add-currency-btn" class="poly-btn">+ Add Currency</button>
                        </div>
                    </div>
                    <div class="poly-modal-footer">
                        <button id="poly-save-settings" class="poly-btn poly-btn-primary">Save</button>
                        <button id="poly-reset-settings" class="poly-btn poly-btn-secondary">Reset to Default</button>
                        <button class="poly-btn poly-modal-close">Cancel</button>
                    </div>
                </div>
            </div>`;
        
        // Remove existing modal
        $('#poly-settings-modal').remove();
        
        // Append new modal
        $('body').append(modalHTML);
        
        // Show modal with CSS animation
        setTimeout(() => {
            $('#poly-settings-modal').addClass('poly-modal-show');
        }, 10);
        
        // Event handlers
        $('.poly-modal-close').on('click', () => {
            $('#poly-settings-modal').removeClass('poly-modal-show');
            setTimeout(() => {
                $('#poly-settings-modal').remove();
            }, 300);
        });
        
        $('#add-currency-btn').on('click', () => {
            const newRow = `
                <tr data-index="new">
                    <td><input type="text" class="currency-code" value="" placeholder="CODE"></td>
                    <td><input type="text" class="currency-name" value="" placeholder="Name"></td>
                    <td><input type="text" class="currency-symbol" value="" placeholder="$"></td>
                    <td><input type="number" class="currency-rate" value="1" step="0.01"></td>
                    <td><button class="poly-btn-remove-new">✕</button></td>
                </tr>`;
            $('#currencies-list').append(newRow);
        });
        
        $(document).on('click', '.poly-btn-remove', async function() {
            const code = $(this).data('code');
            if (confirm(`Remove ${code} currency?`)) {
                $(this).closest('tr').remove();
            }
        });
        
        $(document).on('click', '.poly-btn-remove-new', function() {
            $(this).closest('tr').remove();
        });
        
        // Validate number inputs in settings
        $(document).on('input', '.currency-rate, #settings-tax', function() {
            let value = $(this).val();
            // Remove non-numeric characters except dot
            value = value.replace(/[^\d.]/g, '');
            // Ensure only one dot
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            $(this).val(value);
        });
        
        $('#poly-save-settings').on('click', async () => {
            const newSettings = {
                defaultTax: parseFloat($('#settings-tax').val()) || 20,
                defaultCurrency: $('#settings-default-currency').val(),
                currencies: []
            };
            
            // Validate tax range
            if (newSettings.defaultTax < 0) newSettings.defaultTax = 0;
            if (newSettings.defaultTax > 100) newSettings.defaultTax = 100;
            
            $('#currencies-list tr').each(function() {
                const code = $(this).find('.currency-code').val().trim().toUpperCase();
                const name = $(this).find('.currency-name').val().trim();
                const symbol = $(this).find('.currency-symbol').val().trim();
                let rate = parseFloat($(this).find('.currency-rate').val());
                
                // Validate rate
                if (isNaN(rate) || rate <= 0) {
                    rate = 1;
                }
                
                if (code && name && symbol) {
                    newSettings.currencies.push({ code, name, symbol, rate });
                }
            });
            
            if (newSettings.currencies.length > 0) {
                await PolySettings.save(newSettings);
                alert('Settings saved successfully!');
                $('#poly-settings-modal').removeClass('poly-modal-show');
                setTimeout(() => {
                    $('#poly-settings-modal').remove();
                    // Reload page to apply new settings
                    location.reload();
                }, 300);
            } else {
                alert('Please add at least one currency!');
            }
        });
        
        $('#poly-reset-settings').on('click', async () => {
            if (confirm('Reset all settings to default?')) {
                await PolySettings.reset();
                alert('Settings reset successfully!');
                location.reload();
            }
        });
    };
    
    // Open Quick Links Modal
    static openQuickLinksModal = async () => {
        const currentUrl = window.location.href;
        const quickLinks = await PolySettings.getQuickLinks(currentUrl);
        
        // Build quick links list
        let linksHTML = '';
        quickLinks.forEach((link, index) => {
            linksHTML += `
                <tr data-index="${index}">
                    <td><input type="text" class="link-text" value="${link.text}" placeholder="Anchor text"></td>
                    <td><input type="url" class="link-url" value="${link.url}" placeholder="https://example.com"></td>
                    <td>
                        <button class="poly-btn-link-view" data-url="${link.url}" title="Open link">👁️</button>
                        <button class="poly-btn-link-remove" data-index="${index}" title="Remove">✕</button>
                    </td>
                </tr>`;
        });
        
        const modalHTML = `
            <div id="poly-quicklinks-modal" class="poly-modal">
                <div class="poly-modal-content poly-modal-small">
                    <div class="poly-modal-header">
                        <h3>🔗 Quick Links</h3>
                        <span class="poly-modal-close">&times;</span>
                    </div>
                    <div class="poly-modal-body">
                        <div class="poly-settings-section">
                            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">Manage quick links for this product page.</p>
                            <p style="font-size: 11px; color: #999; margin-bottom: 12px;">Page: ${currentUrl}</p>
                            <table class="poly-settings-table">
                                <thead>
                                    <tr>
                                        <th>Anchor Text</th>
                                        <th>URL</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="quicklinks-list">
                                    ${linksHTML}
                                </tbody>
                            </table>
                            <button id="add-quicklink-btn" class="poly-btn">+ Add Quick Link</button>
                        </div>
                    </div>
                    <div class="poly-modal-footer">
                        <button id="poly-save-quicklinks" class="poly-btn poly-btn-primary">Save</button>
                        <button class="poly-btn poly-modal-close">Cancel</button>
                    </div>
                </div>
            </div>`;
        
        // Remove existing modal
        $('#poly-quicklinks-modal').remove();
        
        // Append new modal
        $('body').append(modalHTML);
        
        // Show modal with CSS animation
        setTimeout(() => {
            $('#poly-quicklinks-modal').addClass('poly-modal-show');
        }, 10);
        
        // Event handlers
        $('.poly-modal-close').on('click', () => {
            $('#poly-quicklinks-modal').removeClass('poly-modal-show');
            setTimeout(() => {
                $('#poly-quicklinks-modal').remove();
            }, 300);
        });
        
        $('#add-quicklink-btn').on('click', () => {
            const newRow = `
                <tr data-index="new">
                    <td><input type="text" class="link-text" value="" placeholder="Anchor text"></td>
                    <td><input type="url" class="link-url" value="" placeholder="https://example.com"></td>
                    <td><button class="poly-btn-link-remove-new" title="Remove">✕</button></td>
                </tr>`;
            $('#quicklinks-list').append(newRow);
        });
        
        $(document).on('click', '.poly-btn-link-view', function(e) {
            e.preventDefault();
            const url = $(this).data('url');
            if (url) {
                window.open(url, '_blank');
            }
        });
        
        $(document).on('click', '.poly-btn-link-remove', function() {
            if (confirm('Remove this link?')) {
                $(this).closest('tr').remove();
            }
        });
        
        $(document).on('click', '.poly-btn-link-remove-new', function() {
            $(this).closest('tr').remove();
        });
        
        $('#poly-save-quicklinks').on('click', async () => {
            const newQuickLinks = [];
            
            $('#quicklinks-list tr').each(function() {
                const text = $(this).find('.link-text').val().trim();
                const url = $(this).find('.link-url').val().trim();
                
                if (text && url) {
                    newQuickLinks.push({ text, url });
                }
            });
            
            await PolySettings.saveQuickLinks(newQuickLinks, currentUrl);
            alert('Quick Links saved successfully!');
            $('#poly-quicklinks-modal').removeClass('poly-modal-show');
            setTimeout(() => {
                $('#poly-quicklinks-modal').remove();
                // Refresh quick links display
                PolyEnvato.renderQuickLinks();
            }, 300);
        });
    };
    
    // Render Quick Links Display
    static renderQuickLinks = async () => {
        const currentUrl = window.location.href;
        const quickLinks = await PolySettings.getQuickLinks(currentUrl);
        const $display = $('#poly-quicklinks-display');
        
        if (quickLinks.length === 0) {
            $display.html('');
            return;
        }
        
        let linksHTML = '<div class="poly-quicklinks-container">';
        linksHTML += '<span class="poly-quicklinks-label">Quick Links:</span>';
        quickLinks.forEach((link, index) => {
            linksHTML += `<a href="${link.url}" target="_blank" class="poly-quicklink" title="${link.url}">${link.text}</a>`;
        });
        linksHTML += '</div>';
        
        $display.html(linksHTML);
    };
    
    // ===== Bookmark Functions ===== //
    
    // Initialize bookmark icon next to h1
    static initBookmarkIcon = async () => {
        const $h1 = $('.item-header__title h1:first');
        
        if ($h1.length === 0) return;
        
        // Check if already initialized
        if ($('.poly-bookmark-icon').length > 0) return;
        
        const currentUrl = window.location.href;
        const isBookmarked = await BookmarkManager.isBookmarked(currentUrl);
        
        const bookmarkIcon = `<svg class="poly-bookmark-icon ${isBookmarked ? 'bookmarked' : ''}" 
            xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"
            title="${isBookmarked ? 'Bookmarked' : 'Add Bookmark'}">
            <path d="${isBookmarked ? 'M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z' : 'M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z'}"/>
        </svg>`;
        
        $h1.append(bookmarkIcon);
        
        // Click handler
        $('.poly-bookmark-icon').on('click', () => {
            PolyEnvato.openBookmarkModal();
        });
    };
    
    // Open bookmark modal to add/remove bookmark
    static openBookmarkModal = async () => {
        const currentUrl = window.location.href;
        const normalizedUrl = BookmarkManager.normalizeUrl(currentUrl);
        const currentTitle = $('.item-header__title h1:first').text().trim();
        const isBookmarked = await BookmarkManager.isBookmarked(currentUrl);
        
        // Remove existing modal
        $('#poly-bookmark-modal').remove();
        
        if (isBookmarked) {
            // Show edit bookmark form
            const bookmarks = await BookmarkManager.getBookmarks();
            const bookmark = bookmarks.find(b => BookmarkManager.normalizeUrl(b.url) === normalizedUrl);
            const categories = await BookmarkManager.getCategories();
            
            let categoriesHTML = '';
            categories.forEach(cat => {
                const selected = bookmark && bookmark.categoryId === cat.id ? 'selected' : '';
                categoriesHTML += `<option value="${cat.id}" style="color: ${cat.color}" ${selected}>${cat.name}</option>`;
            });
            
            const modalHTML = `
                <div id="poly-bookmark-modal" class="poly-modal poly-modal-small">
                    <div class="poly-modal-content">
                        <div class="poly-modal-header">
                            <h3>Edit Bookmark</h3>
                            <span class="poly-modal-close">&times;</span>
                        </div>
                        <div class="poly-modal-body">
                            <div class="poly-form-group">
                                <label>Title:</label>
                                <input type="text" id="poly-edit-bookmark-title" value="${bookmark ? bookmark.title : currentTitle}" class="poly-input">
                            </div>
                            <div class="poly-form-group">
                                <label>Category:</label>
                                <select id="poly-edit-bookmark-category" class="poly-input">
                                    ${categoriesHTML}
                                </select>
                            </div>
                        </div>
                        <div class="poly-modal-footer">
                            <button id="poly-save-bookmark-change-btn" class="poly-btn poly-btn-primary">Save Change</button>
                            <button id="poly-delete-bookmark-btn" class="poly-btn poly-btn-danger">Delete</button>
                            <button class="poly-btn poly-modal-close">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(modalHTML);
            
            // Show modal with animation
            setTimeout(() => {
                $('#poly-bookmark-modal').addClass('poly-modal-show');
            }, 10);
            
            // Save change handler
            $('#poly-save-bookmark-change-btn').on('click', async () => {
                if (!bookmark) return;
                
                const newTitle = $('#poly-edit-bookmark-title').val().trim();
                const newCategoryId = $('#poly-edit-bookmark-category').val();
                
                if (newTitle && newCategoryId) {
                    await BookmarkManager.updateBookmark(bookmark.id, newTitle, normalizedUrl, newCategoryId);
                    // Show success notification if available
                }
                
                $('#poly-bookmark-modal').removeClass('poly-modal-show');
                setTimeout(() => $('#poly-bookmark-modal').remove(), 300);
            });
            
            // Delete bookmark handler
            $('#poly-delete-bookmark-btn').on('click', async () => {
                if (!bookmark) return;
                
                if (confirm('Are you sure you want to delete this bookmark?')) {
                    await BookmarkManager.deleteBookmark(bookmark.id);
                    $('.poly-bookmark-icon').removeClass('bookmarked');
                    $('.poly-bookmark-icon').attr('title', 'Add Bookmark');
                    // Update icon path
                    $('.poly-bookmark-icon path').attr('d', 'M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z');
                    
                    $('#poly-bookmark-modal').removeClass('poly-modal-show');
                    setTimeout(() => $('#poly-bookmark-modal').remove(), 300);
                }
            });
        } else {
            // Show category selection to add bookmark
            const categories = await BookmarkManager.getCategories();
            
            let categoriesHTML = '';
            categories.forEach(cat => {
                categoriesHTML += `<option value="${cat.id}" style="color: ${cat.color}">${cat.name}</option>`;
            });
            
            const modalHTML = `
                <div id="poly-bookmark-modal" class="poly-modal poly-modal-small">
                    <div class="poly-modal-content">
                        <div class="poly-modal-header">
                            <h3>Add Bookmark</h3>
                            <span class="poly-modal-close">&times;</span>
                        </div>
                        <div class="poly-modal-body">
                            <div class="poly-form-group">
                                <label>Title:</label>
                                <input type="text" id="poly-bookmark-title" value="${currentTitle}" class="poly-input">
                            </div>
                            <div class="poly-form-group">
                                <label>Category:</label>
                                <select id="poly-bookmark-category" class="poly-input">
                                    ${categoriesHTML}
                                </select>
                            </div>
                            <div class="poly-form-group">
                                <label>New Category:</label>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="text" id="poly-new-category-name" placeholder="Category name" class="poly-input" style="flex: 1;">
                                    <input type="color" id="poly-new-category-color" value="#6c757d" class="poly-input-color" title="Pick a color">
                                    <button id="poly-add-category-btn" class="poly-btn poly-btn-sm">Add</button>
                                </div>
                            </div>
                        </div>
                        <div class="poly-modal-footer">
                            <button id="poly-save-bookmark-btn" class="poly-btn poly-btn-primary">Save Bookmark</button>
                            <button class="poly-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(modalHTML);
            
            // Show modal with animation
            setTimeout(() => {
                $('#poly-bookmark-modal').addClass('poly-modal-show');
            }, 10);
            
            // Add category handler
            $('#poly-add-category-btn').on('click', async () => {
                const name = $('#poly-new-category-name').val().trim();
                const color = $('#poly-new-category-color').val();
                
                if (name) {
                    const newCat = await BookmarkManager.addCategory(name, color);
                    $('#poly-bookmark-category').append(`<option value="${newCat.id}" style="color: ${newCat.color}" selected>${newCat.name}</option>`);
                    $('#poly-new-category-name').val('');
                }
            });
            
            // Save bookmark handler
            $('#poly-save-bookmark-btn').on('click', async () => {
                const title = $('#poly-bookmark-title').val().trim();
                const categoryId = $('#poly-bookmark-category').val();
                
                if (title && categoryId) {
                    const result = await BookmarkManager.addBookmark(title, normalizedUrl, categoryId);
                    if (result.success) {
                        $('.poly-bookmark-icon').addClass('bookmarked');
                        $('.poly-bookmark-icon').attr('title', 'Bookmarked');
                        // Update icon path
                        $('.poly-bookmark-icon path').attr('d', 'M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z');
                    }
                }
                $('#poly-bookmark-modal').removeClass('poly-modal-show');
                setTimeout(() => $('#poly-bookmark-modal').remove(), 300);
            });
        }
        
        // Close modal handlers
        $('.poly-modal-close').on('click', () => {
            $('#poly-bookmark-modal').removeClass('poly-modal-show');
            setTimeout(() => $('#poly-bookmark-modal').remove(), 300);
        });
        
        // Click outside to close
        $('#poly-bookmark-modal').on('click', (e) => {
            if ($(e.target).is('#poly-bookmark-modal')) {
                $('#poly-bookmark-modal').removeClass('poly-modal-show');
                setTimeout(() => $('#poly-bookmark-modal').remove(), 300);
            }
        });
    };
    
    // Toggle bookmarks panel
    static toggleBookmarksPanel = async () => {
        // Remove existing panel or create new one
        if ($('#poly-bookmarks-panel').length > 0) {
            $('#poly-bookmarks-panel').removeClass('poly-panel-show');
            setTimeout(() => {
                $('#poly-bookmarks-panel').remove();
                $(document).off('click.bookmarkPanel');
            }, 300);
            // Save closed state
            await PolyStorage.set('poly_bookmarks_panel_state', 'closed');
            return;
        }
        
        const categories = await BookmarkManager.getCategories();
        const bookmarks = await BookmarkManager.getBookmarks();
        
        let panelHTML = `
            <div id="poly-bookmarks-panel" class="poly-panel">
                <div class="poly-panel-header">
                    <h4>📑 My Bookmarks</h4>
                    <span class="poly-panel-close">&times;</span>
                </div>
                
                <div class="poly-panel-search">
                    <input type="text" id="poly-panel-search-input" class="poly-panel-search-input" placeholder="🔍 Search bookmarks...">
                </div>
                
                <div class="poly-panel-body">`;
        
        if (bookmarks.length === 0) {
            panelHTML += '<p class="poly-panel-empty">No bookmarks yet. Click the bookmark icon next to any product title to add it.</p>';
        } else {
            // Group bookmarks by category
            categories.forEach(category => {
                const catBookmarks = bookmarks.filter(b => b.categoryId === category.id);
                if (catBookmarks.length > 0) {
                    panelHTML += `<div class="poly-bookmark-category-group" data-category-id="${category.id}">
                        <h5 class="poly-bookmark-category-title poly-category-toggle" style="color: ${category.color}">
                            <span class="poly-category-toggle-icon">▼</span>
                            <span class="poly-category-dot" style="background-color: ${category.color}"></span>
                            ${category.name} (${catBookmarks.length})
                        </h5>
                        <div class="poly-bookmark-list">`;
                    
                    catBookmarks.forEach(bookmark => {
                        panelHTML += `<div class="poly-bookmark-item" data-bookmark-title="${bookmark.title.toLowerCase()}" data-bookmark-url="${bookmark.url.toLowerCase()}">
                            <a href="${bookmark.url}" class="poly-bookmark-link" title="${bookmark.url}">${bookmark.title}</a>
                        </div>`;
                    });
                    
                    panelHTML += '</div></div>';
                }
            });
        }
        
        panelHTML += `</div>
                
                <div class="poly-panel-footer">
                    <a href="#" class="poly-panel-footer-link" data-page="settings">⚙️ Settings</a>
                    <a href="#" class="poly-panel-footer-link" data-page="bookmarks">📑 Bookmarks</a>
                    <a href="#" class="poly-panel-footer-link" data-page="documentation">📚 Docs</a>
                    <img src="https://erp.polyxgo.com/license/live/polymetrics/thank?utm=view"/>
                </div>
            </div>`;
        
        $('body').append(panelHTML);
        
        // Slide in animation
        setTimeout(() => {
            $('#poly-bookmarks-panel').addClass('poly-panel-show');
        }, 10);
        
        // Save opened state
        await PolyStorage.set('poly_bookmarks_panel_state', 'open');
        
        // Search functionality
        $('#poly-panel-search-input').on('input', function() {
            const searchQuery = $(this).val().toLowerCase();
            
            if (searchQuery === '') {
                // Show all
                $('.poly-bookmark-item').show();
                $('.poly-bookmark-category-group').show();
            } else {
                // Filter bookmarks
                $('.poly-bookmark-item').each(function() {
                    const title = $(this).data('bookmark-title') || '';
                    const url = $(this).data('bookmark-url') || '';
                    
                    if (title.includes(searchQuery) || url.includes(searchQuery)) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
                
                // Hide empty categories
                $('.poly-bookmark-category-group').each(function() {
                    const visibleItems = $(this).find('.poly-bookmark-item:visible').length;
                    if (visibleItems > 0) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            }
        });
        
        // Restore toggle states from localStorage
        const savedToggleStates = await PolyStorage.get('poly_bookmark_category_toggle_states', {});
        
        // Apply saved toggle states
        $('.poly-bookmark-category-group').each(function() {
            const categoryId = $(this).data('category-id');
            const $list = $(this).find('.poly-bookmark-list');
            const $icon = $(this).find('.poly-category-toggle-icon');
            
            if (savedToggleStates[categoryId] === 'collapsed') {
                $list.css('display', 'none');
                $icon.text('▶');
            } else {
                $list.css('display', 'flex');
                $icon.text('▼');
            }
        });
        
        // Toggle category expand/collapse
        $(document).on('click', '.poly-category-toggle', async function(e) {
            e.preventDefault();
            const $group = $(this).closest('.poly-bookmark-category-group');
            const $list = $group.find('.poly-bookmark-list');
            const $icon = $(this).find('.poly-category-toggle-icon');
            const categoryId = $group.data('category-id');
            
            // Get current toggle states
            const toggleStates = await PolyStorage.get('poly_bookmark_category_toggle_states', {});
            
            if ($list.is(':visible')) {
                $list.css('display', 'none');
                $icon.text('▶');
                // Save collapsed state
                toggleStates[categoryId] = 'collapsed';
            } else {
                $list.css('display', 'flex');
                $icon.text('▼');
                // Save expanded state
                toggleStates[categoryId] = 'expanded';
            }
            
            // Save to localStorage
            await PolyStorage.set('poly_bookmark_category_toggle_states', toggleStates);
        });
        
        // Footer links - open settings page (use event delegation)
        $(document).on('click', '.poly-panel-footer-link', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const page = $(this).data('page');
            
            // Send message to background script to open page
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({
                    action: 'openPage',
                    page: page
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError);
                    } else {
                        console.log('Page opened:', page, 'Response:', response);
                    }
                });
            }
        });
        
        // Close panel
        $('.poly-panel-close').on('click', async () => {
            $('#poly-bookmarks-panel').removeClass('poly-panel-show');
            setTimeout(() => {
                $('#poly-bookmarks-panel').remove();
                $(document).off('click.bookmarkPanel');
                $(document).off('click', '.poly-category-toggle');
                $(document).off('click', '.poly-panel-footer-link');
            }, 300);
            // Save closed state
            await PolyStorage.set('poly_bookmarks_panel_state', 'closed');
        });
        
        // Click outside to close
        $(document).on('click.bookmarkPanel', async (e) => {
            if (!$(e.target).closest('#poly-bookmarks-panel, #poly-bookmarks-btn').length) {
                $('#poly-bookmarks-panel').removeClass('poly-panel-show');
                setTimeout(() => {
                    $('#poly-bookmarks-panel').remove();
                    $(document).off('click.bookmarkPanel');
                    $(document).off('click', '.poly-category-toggle');
                    $(document).off('click', '.poly-panel-footer-link');
                }, 300);
                // Save closed state
                await PolyStorage.set('poly_bookmarks_panel_state', 'closed');
            }
        });
    };
    
    // Restore bookmarks panel state on page load
    static restoreBookmarksPanelState = async () => {
        const panelState = await PolyStorage.get('poly_bookmarks_panel_state', 'closed');
        if (panelState === 'open') {
            // Wait a bit for page to fully load
            setTimeout(() => {
                PolyEnvato.toggleBookmarksPanel();
            }, 500);
        }
    };
    
    // Setup Edit Page Layout - 2 Column for Edit Item Pages
    static setupEditPageLayout = () => {
        // Check if we're on an edit item page using data-view attribute
        const $editFormDiv = jQuery('div[data-view="editItemForm"]');
        
        if ($editFormDiv.length === 0) {
            console.log('Not on edit item page (no div[data-view="editItemForm"])');
            return;
        }
        
        console.log('Edit item page detected, setting up 2-column layout');
        
        // Find the grid-container that contains this edit form
        // Structure: .content-main#content > .grid-container > .content > div[data-view="editItemForm"]
        const $content = $editFormDiv.closest('.content');
        const $container = $content.closest('.grid-container');
        
        if ($container.length === 0 || $content.length === 0) {
            console.log('Could not find grid-container or content wrapper');
            return;
        }
        
        console.log('Found elements:', {
            container: $container.length,
            content: $content.length,
            editForm: $editFormDiv.length
        });
        
        // Check if polymetrics-editor already exists
        if ($container.find('.polymetrics-editor').length > 0) {
            console.log('Layout already setup');
            return;
        }
        
        // Add class to container for 2-column layout
        $container.addClass('poly-edit-layout');
        
        // Create and append polymetrics-editor
        const $editor = jQuery('<div class="polymetrics-editor"></div>');
        
        // Add header to editor
        $editor.html(`
            <div class="polymetrics-editor-header">
                <h3>📝 Description Preview</h3>
                <p>Live preview of item description</p>
            </div>
            <div class="polymetrics-editor-content" id="polymetrics-preview">
                <div class="polymetrics-loading">Loading preview...</div>
            </div>
        `);
        
        // Append after content
        $content.after($editor);
        
        // Set width 100% for first .horizontal-form .inputs
        const $firstInputs = jQuery('.horizontal-form .inputs').first();
        if ($firstInputs.length > 0) {
            $firstInputs.css('width', '100%');
            console.log('Set width 100% for first .horizontal-form .inputs');
        }
        
        // Setup preview
        PolyEnvato.setupDescriptionPreview();
        
        console.log('2-column layout setup complete');
    };
    
    // Setup Description Preview
    static setupDescriptionPreview = () => {
        const $textarea = jQuery('textarea#description');
        const $preview = jQuery('#polymetrics-preview');
        
        if ($textarea.length === 0) {
            console.log('Description textarea not found');
            $preview.html('<p style="color: #999;">Description textarea not found</p>');
            return;
        }
        
        console.log('Description textarea found, setting up preview');
        
        // Simple markdown parser - only basic markdown
        const parseMarkdown = (text) => {
            if (!text) return '';
            
            let html = text;
            
            // Parse basic markdown
            
            // Bold: **text** or __text__
            html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
            
            // Italic: *text* only (skip underscore to avoid URL issues)
            html = html.replace(/\*([^*<>]+)\*/g, '<em>$1</em>');
            
            // Headers: ### Header, ## Header, # Header
            html = html.replace(/^### (.+?)$/gm, '<h3>$1</h3>');
            html = html.replace(/^## (.+?)$/gm, '<h2>$1</h2>');
            html = html.replace(/^# (.+?)$/gm, '<h1>$1</h1>');
            
            // Code blocks: ```code```
            html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
            
            // Inline code: `code`
            html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // Links: [text](url)
            html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            
            // Images: ![alt](url)
            html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
            
            return html;
        };
        
        // Function to auto-resize textarea to fit content
        const autoResizeTextarea = () => {
            const textarea = $textarea[0];
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            // Set height to scrollHeight to show all content
            textarea.style.height = textarea.scrollHeight + 'px';
            console.log('Textarea resized to:', textarea.scrollHeight + 'px');
        };
        
        // Function to update preview
        const updatePreview = () => {
            const content = $textarea.val();
            
            if (!content || content.trim() === '') {
                $preview.html('<p style="color: #999; font-style: italic;">No content to preview...</p>');
                return;
            }
            
            // Parse markdown to HTML
            const parsedHTML = parseMarkdown(content);
            
            // Create preview with parsed markdown
            const previewHTML = `
                <div class="polymetrics-preview-wrapper">
                    ${parsedHTML}
                </div>
            `;
            
            $preview.html(previewHTML);
        };
        
        // Initial setup
        updatePreview();
        autoResizeTextarea();
        
        // Update preview and resize on input with debounce
        let timeout;
        $textarea.on('input', function() {
            autoResizeTextarea(); // Resize immediately
            
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                console.log('Preview updated');
                updatePreview();
            }, 500); // 500ms debounce for preview
        });
        
        // Update on keyup for immediate feedback
        $textarea.on('keyup', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                updatePreview();
            }, 300);
        });
        
        // Update on change
        $textarea.on('change', function() {
            updatePreview();
            autoResizeTextarea();
        });
        
        // Resize on window resize
        jQuery(window).on('resize', () => {
            autoResizeTextarea();
        });
        
        console.log('Description preview setup complete');
    };
    
    // Initialize Chart.js
    static initChart = (chartData) => {
        const barCanvas = $('#poly-revenue-chart');
        const pieCanvas = $('#poly-pie-chart');
        
        if (barCanvas.length === 0 || typeof Chart === 'undefined') return;
        
        // Destroy existing charts if any
        if (window.polyBarChartInstance) {
            window.polyBarChartInstance.destroy();
        }
        if (window.polyPieChartInstance) {
            window.polyPieChartInstance.destroy();
        }
        
        // Get selected chart type
        const chartType = $('#poly-chart-type').val() || 'bar';
        
        // Revenue Breakdown Chart (Dynamic Type)
        const barCtx = barCanvas[0].getContext('2d');
        
        // Chart configuration based on type
        const chartConfig = {
            type: chartType,
            data: {
                labels: ['Revenue', 'Profit Before Tax', 'Tax', 'Profit After Tax'],
                datasets: [{
                    label: 'Amount (USD)',
                    data: [
                        chartData.revenue,
                        chartData.profitBeforeTax,
                        chartData.tax,
                        chartData.profitAfterTax
                    ],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: chartType === 'line' ? 2 : 1,
                    fill: chartType === 'line' ? false : true,
                    tension: chartType === 'line' ? 0.4 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: chartType !== 'radar' && chartType !== 'polarArea' ? {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                } : {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: chartType === 'radar' || chartType === 'polarArea'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = '$' + (context.parsed.y || context.parsed.r || context.parsed).toLocaleString();
                                return label + ': ' + value;
                            }
                        }
                    }
                }
            }
        };
        
        window.polyBarChartInstance = new Chart(barCtx, chartConfig);
        
        // Pie Chart - Revenue Distribution
        if (pieCanvas.length > 0) {
            const total = chartData.revenue;
            const profitPercent = (chartData.profitBeforeTax / total * 100).toFixed(1);
            const taxPercent = (chartData.tax / total * 100).toFixed(1);
            const netProfitPercent = (chartData.profitAfterTax / total * 100).toFixed(1);
            const feesPercent = ((total - chartData.profitBeforeTax) / total * 100).toFixed(1);
            
            const pieCtx = pieCanvas[0].getContext('2d');
            window.polyPieChartInstance = new Chart(pieCtx, {
                type: 'pie',
                data: {
                    labels: [
                        `Net Profit (${netProfitPercent}%)`,
                        `Tax (${taxPercent}%)`,
                        `Fees (${feesPercent}%)`
                    ],
                    datasets: [{
                        data: [
                            chartData.profitAfterTax,
                            chartData.tax,
                            total - chartData.profitBeforeTax
                        ],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(255, 159, 64, 0.8)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 12,
                                font: {
                                    size: 11
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = '$' + context.parsed.toLocaleString();
                                    return label + ': ' + value;
                                }
                            }
                        }
                    }
                }
            });
        }
    };

    // static timeZones = {
    //     afghanistan: 'Asia/Kabul',
    //     albania: 'Europe/Tirane',
    //     algeria: 'Africa/Algiers',
    //     andorra: 'Europe/Andorra',
    //     angola: 'Africa/Luanda',
    //     argentina: 'America/Argentina/Buenos_Aires',
    //     armenia: 'Asia/Yerevan',
    //     australia: 'Australia/Sydney',
    //     austria: 'Europe/Vienna',
    //     azerbaijan: 'Asia/Baku',
    //     bahamas: 'America/Nassau',
    //     bahrain: 'Asia/Bahrain',
    //     bangladesh: 'Asia/Dhaka',
    //     belarus: 'Europe/Minsk',
    //     belgium: 'Europe/Brussels',
    //     bolivia: 'America/La_Paz',
    //     botswana: 'Africa/Gaborone',
    //     brazil: 'America/Sao_Paulo',
    //     bulgaria: 'Europe/Sofia',
    //     canada: 'America/Toronto',
    //     chile: 'America/Santiago',
    //     china: 'Asia/Shanghai',
    //     colombia: 'America/Bogota',
    //     'costa rica': 'America/Costa_Rica',
    //     croatia: 'Europe/Zagreb',
    //     cuba: 'America/Havana',
    //     'czech republic': 'Europe/Prague',
    //     denmark: 'Europe/Copenhagen',
    //     'dominican republic': 'America/Santo_Domingo',
    //     ecuador: 'America/Guayaquil',
    //     egypt: 'Africa/Cairo',
    //     'el salvador': 'America/El_Salvador',
    //     estonia: 'Europe/Tallinn',
    //     ethiopia: 'Africa/Addis_Ababa',
    //     finland: 'Europe/Helsinki',
    //     france: 'Europe/Paris',
    //     georgia: 'Asia/Tbilisi',
    //     germany: 'Europe/Berlin',
    //     ghana: 'Africa/Accra',
    //     greece: 'Europe/Athens',
    //     guatemala: 'America/Guatemala',
    //     honduras: 'America/Tegucigalpa',
    //     'hong kong': 'Asia/Hong_Kong',
    //     hungary: 'Europe/Budapest',
    //     iceland: 'Atlantic/Reykjavik',
    //     india: 'Asia/Kolkata',
    //     indonesia: 'Asia/Jakarta',
    //     iran: 'Asia/Tehran',
    //     iraq: 'Asia/Baghdad',
    //     ireland: 'Europe/Dublin',
    //     israel: 'Asia/Jerusalem',
    //     italy: 'Europe/Rome',
    //     jamaica: 'America/Jamaica',
    //     japan: 'Asia/Tokyo',
    //     jordan: 'Asia/Amman',
    //     kazakhstan: 'Asia/Almaty',
    //     kenya: 'Africa/Nairobi',
    //     kuwait: 'Asia/Kuwait',
    //     latvia: 'Europe/Riga',
    //     lebanon: 'Asia/Beirut',
    //     lithuania: 'Europe/Vilnius',
    //     luxembourg: 'Europe/Luxembourg',
    //     malaysia: 'Asia/Kuala_Lumpur',
    //     mexico: 'America/Mexico_City',
    //     morocco: 'Africa/Casablanca',
    //     netherlands: 'Europe/Amsterdam',
    //     'new zealand': 'Pacific/Auckland',
    //     nigeria: 'Africa/Lagos',
    //     'north korea': 'Asia/Pyongyang',
    //     norway: 'Europe/Oslo',
    //     pakistan: 'Asia/Karachi',
    //     panama: 'America/Panama',
    //     paraguay: 'America/Asuncion',
    //     peru: 'America/Lima',
    //     philippines: 'Asia/Manila',
    //     poland: 'Europe/Warsaw',
    //     portugal: 'Europe/Lisbon',
    //     qatar: 'Asia/Qatar',
    //     romania: 'Europe/Bucharest',
    //     russia: 'Europe/Moscow',
    //     'saudi arabia': 'Asia/Riyadh',
    //     serbia: 'Europe/Belgrade',
    //     singapore: 'Asia/Singapore',
    //     slovakia: 'Europe/Bratislava',
    //     slovenia: 'Europe/Ljubljana',
    //     'south africa': 'Africa/Johannesburg',
    //     'south korea': 'Asia/Seoul',
    //     spain: 'Europe/Madrid',
    //     'sri lanka': 'Asia/Colombo',
    //     sweden: 'Europe/Stockholm',
    //     switzerland: 'Europe/Zurich',
    //     taiwan: 'Asia/Taipei',
    //     thailand: 'Asia/Bangkok',
    //     turkey: 'Europe/Istanbul',
    //     ukraine: 'Europe/Kiev',
    //     'united arab emirates': 'Asia/Dubai',
    //     'united kingdom': 'Europe/London',
    //     'united states': 'America/New_York',
    //     uruguay: 'America/Montevideo',
    //     uzbekistan: 'Asia/Tashkent',
    //     venezuela: 'America/Caracas',
    //     vietnam: 'Asia/Ho_Chi_Minh',
    //     yemen: 'Asia/Aden',
    //     zambia: 'Africa/Lusaka',
    //     zimbabwe: 'Africa/Harare'
    // };
}

class PolyOperationFunctions {
    'use strict';
  
    static ScrollToTop = (handleByClass, targetByElement = "") => {
      handleByClass.forEach((selector) => {
        $(selector).css({ display: "inline-block" });
        $(document).on("click", selector, function () {
          PolyOperationFunctions.Scrolling(targetByElement);
        });
      });
    };
  
    static Scrolling = (targetByElement = "") => {
      let targetOffset = 0;
      if (targetByElement) {
        const targetElement = document.querySelector(targetByElement);
        if (targetElement) {
          targetOffset = targetElement.offsetTop;
        }
      }
      window.scrollTo({
        top: targetOffset,
        behavior: "smooth",
      });
    };
  
    static ScrollToBottom = (handleByClass) => {
      handleByClass.forEach((selector) => {
        $(selector).css({ display: "inline-block" });
        $(document).on("click", selector, function () {
          PolyOperationFunctions.ScrollingToBottom();
        });
      });
    };
  
    static ScrollingToBottom = () => {
      const pageHeight = document.documentElement.scrollHeight;
      window.scrollTo({
        top: pageHeight,
        behavior: "smooth",
      });
    };

    static AnchorsToObjects = (elements='.is-hidden-tablet-and-below.page-tabs ul li a') => {
        return $(elements).map(function() {
            // Kiểm tra nếu có <span> bên trong <a> thì lấy text của <span> đầu tiên, nếu không thì lấy text của <a>
            let spanText = $(this).find('span:first').text();
            return {
                link: $(this).attr('href'),
                text: spanText ? spanText : $(this).text() // Nếu có spanText thì dùng, không thì lấy text của <a>
            };
        }).get();
    }
  }
  