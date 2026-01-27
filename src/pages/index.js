// PolyStorage and PolySettings classes
class PolyStorage {
    static async get(key, defaultValue = null) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([key], (result) => {
                    resolve(result[key] !== undefined ? result[key] : defaultValue);
                });
            } else {
                const value = localStorage.getItem(key);
                resolve(value ? JSON.parse(value) : defaultValue);
            }
        });
    }
    
    static async set(key, value) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [key]: value }, () => {
                    resolve(true);
                });
            } else {
                localStorage.setItem(key, JSON.stringify(value));
                resolve(true);
            }
        });
    }
    
    static async remove(key) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.remove([key], () => {
                    resolve(true);
                });
            } else {
                localStorage.removeItem(key);
                resolve(true);
            }
        });
    }
}

class PolySettings {
    static STORAGE_KEY = 'poly_metrics_settings';
    
    static defaultSettings = {
        defaultTax: 20,
        defaultCurrency: 'VND',
        toggleState: 'closed',
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
    
    static async load() {
        const settings = await PolyStorage.get(this.STORAGE_KEY, this.defaultSettings);
        return { ...this.defaultSettings, ...settings };
    }
    
    static async save(settings) {
        return await PolyStorage.set(this.STORAGE_KEY, settings);
    }
}

// BookmarkManager class
class BookmarkManager {
    static BOOKMARKS_KEY = 'poly_bookmarks';
    static CATEGORIES_KEY = 'poly_bookmark_categories';
    
    static generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    static getDefaultCategories() {
        return [
            { id: this.generateId(), name: 'Uncategorized', color: '#6c757d' },
            { id: this.generateId(), name: 'My Favorites', color: '#ffc107' },
            { id: this.generateId(), name: 'To Review', color: '#17a2b8' },
            { id: this.generateId(), name: 'Competitors', color: '#dc3545' },
        ];
    }
    
    static async getCategories() {
        let categories = await PolyStorage.get(this.CATEGORIES_KEY, null);
        if (!categories || categories.length === 0) {
            categories = this.getDefaultCategories();
            await PolyStorage.set(this.CATEGORIES_KEY, categories);
        }
        return categories;
    }
    
    static async getCategory(id) {
        const categories = await this.getCategories();
        return categories.find(c => c.id === id) || categories[0];
    }
    
    static async addCategory(name, color = '#6c757d') {
        const categories = await this.getCategories();
        const newCategory = { id: this.generateId(), name, color };
        categories.push(newCategory);
        await PolyStorage.set(this.CATEGORIES_KEY, categories);
        return newCategory;
    }
    
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
    
    static async deleteCategory(id) {
        const categories = await this.getCategories();
        const filteredCategories = categories.filter(c => c.id !== id);
        
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
    
    static async getBookmarks() {
        return await PolyStorage.get(this.BOOKMARKS_KEY, []);
    }
    
    static async getBookmarksByCategory(categoryId) {
        const bookmarks = await this.getBookmarks();
        return bookmarks.filter(b => b.categoryId === categoryId);
    }
    
    static async getBookmark(id) {
        const bookmarks = await this.getBookmarks();
        return bookmarks.find(b => b.id === id);
    }
    
    static async addBookmark(title, url, categoryId) {
        const bookmarks = await this.getBookmarks();
        const newBookmark = {
            id: this.generateId(),
            title, url, categoryId,
            createdAt: new Date().toISOString()
        };
        bookmarks.push(newBookmark);
        await PolyStorage.set(this.BOOKMARKS_KEY, bookmarks);
        return newBookmark;
    }
    
    static async updateBookmark(id, title, url, categoryId) {
        const bookmarks = await this.getBookmarks();
        const index = bookmarks.findIndex(b => b.id === id);
        if (index >= 0) {
            bookmarks[index].title = title;
            bookmarks[index].url = url;
            bookmarks[index].categoryId = categoryId;
            bookmarks[index].updatedAt = new Date().toISOString();
            await PolyStorage.set(this.BOOKMARKS_KEY, bookmarks);
            return bookmarks[index];
        }
        return null;
    }
    
    static async deleteBookmark(id) {
        const bookmarks = await this.getBookmarks();
        const filteredBookmarks = bookmarks.filter(b => b.id !== id);
        await PolyStorage.set(this.BOOKMARKS_KEY, filteredBookmarks);
        return true;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check hash for initial tab
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`tab-${hash}`)) {
        switchTab(hash);
    }
    
    // Tab switching
    document.querySelectorAll('.poly-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
            window.location.hash = tabName;
        });
    });
    
    // Load settings
    await loadSettings();
    
    // Load bookmarks
    await loadBookmarks();
    
    // Event handlers
    setupEventHandlers();
    setupBookmarkHandlers();
});

// Switch Tab
function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.poly-tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.poly-tab-btn[data-tab="${tabName}"]`);
    if (btn) btn.classList.add('active');
    
    // Update panels
    document.querySelectorAll('.poly-tab-panel').forEach(panel => panel.classList.remove('active'));
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) panel.classList.add('active');
}

// Load Settings
async function loadSettings() {
    const settings = await PolySettings.load();
    
    // Set tax
    document.getElementById('settings-tax').value = settings.defaultTax || 20;
    
    // Set currency dropdown
    const currencySelect = document.getElementById('settings-currency');
    currencySelect.innerHTML = '';
    settings.currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.code;
        option.textContent = `${currency.code} (${currency.symbol})`;
        if (currency.code === settings.defaultCurrency) {
            option.selected = true;
        }
        currencySelect.appendChild(option);
    });
    
    // Render currencies table
    renderCurrenciesTable(settings.currencies);
}

// Render Currencies Table
function renderCurrenciesTable(currencies) {
    const tbody = document.getElementById('currencies-list');
    tbody.innerHTML = '';
    
    currencies.forEach((currency, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="currency-code" value="${currency.code}" ${index < 2 ? 'readonly' : ''}></td>
            <td><input type="text" class="currency-name" value="${currency.name}"></td>
            <td><input type="text" class="currency-symbol" value="${currency.symbol}"></td>
            <td><input type="number" class="currency-rate" value="${currency.rate}" step="0.01"></td>
            <td>${index < 2 ? '<span style="color:#999">Protected</span>' : '<button class="poly-btn-remove" data-index="' + index + '">✕</button>'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Setup Event Handlers
function setupEventHandlers() {
    // Add currency
    document.getElementById('add-currency-btn').addEventListener('click', () => {
        const tbody = document.getElementById('currencies-list');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="currency-code" value="" placeholder="CODE"></td>
            <td><input type="text" class="currency-name" value="" placeholder="Currency Name"></td>
            <td><input type="text" class="currency-symbol" value="" placeholder="$"></td>
            <td><input type="number" class="currency-rate" value="1" step="0.01"></td>
            <td><button class="poly-btn-remove-new">✕</button></td>
        `;
        tbody.appendChild(row);
    });
    
    // Remove currency
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('poly-btn-remove') || e.target.classList.contains('poly-btn-remove-new')) {
            if (confirm('Remove this currency?')) {
                e.target.closest('tr').remove();
            }
        }
    });
    
    // Validate number inputs
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('currency-rate') || e.target.id === 'settings-tax') {
            let value = e.target.value;
            value = value.replace(/[^\d.]/g, '');
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            e.target.value = value;
        }
    });
    
    // Save settings
    document.getElementById('save-settings-btn').addEventListener('click', async () => {
        const settings = await PolySettings.load();
        
        // Update tax
        settings.defaultTax = parseInt(document.getElementById('settings-tax').value) || 20;
        if (settings.defaultTax < 0) settings.defaultTax = 0;
        if (settings.defaultTax > 100) settings.defaultTax = 100;
        
        // Update currency
        settings.defaultCurrency = document.getElementById('settings-currency').value;
        
        // Update currencies
        const currencies = [];
        document.querySelectorAll('#currencies-list tr').forEach(row => {
            const code = row.querySelector('.currency-code').value.trim().toUpperCase();
            const name = row.querySelector('.currency-name').value.trim();
            const symbol = row.querySelector('.currency-symbol').value.trim();
            let rate = parseFloat(row.querySelector('.currency-rate').value);
            
            if (isNaN(rate) || rate <= 0) rate = 1;
            
            if (code && name && symbol) {
                currencies.push({ code, name, symbol, rate });
            }
        });
        
        if (currencies.length > 0) {
            settings.currencies = currencies;
            await PolySettings.save(settings);
            
            // Show success message
            showNotification('Settings saved successfully!', 'success');
        } else {
            showNotification('Please add at least one currency!', 'error');
        }
    });
    
    // Reset settings
    document.getElementById('reset-settings-btn').addEventListener('click', async () => {
        if (confirm('Reset all settings to default? This will remove all custom currencies and settings.')) {
            await PolyStorage.remove(PolySettings.STORAGE_KEY);
            showNotification('Settings reset successfully!', 'success');
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    });
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `poly-notification poly-notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ============= Bookmark Functions ============= //

// Load Bookmarks
async function loadBookmarks() {
    await renderCategories();
    await renderBookmarks();
}

// Render Categories
async function renderCategories() {
    const categories = await BookmarkManager.getCategories();
    const categoriesList = document.getElementById('bookmark-categories-list');
    const filterSelect = document.getElementById('bookmark-filter-category');
    
    // Render categories grid
    categoriesList.innerHTML = '';
    for (const category of categories) {
        const bookmarksCount = (await BookmarkManager.getBookmarksByCategory(category.id)).length;
        const card = document.createElement('div');
        card.className = 'poly-category-card';
        card.innerHTML = `
            <div class="poly-category-header">
                <div class="poly-category-name">
                    <span class="poly-category-color-dot" style="background-color: ${category.color}"></span>
                    <span>${category.name}</span>
                </div>
                <div class="poly-category-actions">
                    <button class="poly-btn-icon" data-action="edit" data-id="${category.id}" title="Edit">✏️</button>
                    <button class="poly-btn-icon" data-action="delete" data-id="${category.id}" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="poly-category-count">${bookmarksCount} bookmark${bookmarksCount !== 1 ? 's' : ''}</div>
        `;
        categoriesList.appendChild(card);
    }
    
    // Update filter select
    filterSelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        option.style.color = category.color;
        filterSelect.appendChild(option);
    });
}

// Render Bookmarks
async function renderBookmarks(filterCategoryId = '', searchQuery = '') {
    let bookmarks = await BookmarkManager.getBookmarks();
    const categories = await BookmarkManager.getCategories();
    
    // Apply filters
    if (filterCategoryId) {
        bookmarks = bookmarks.filter(b => b.categoryId === filterCategoryId);
    }
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        bookmarks = bookmarks.filter(b => 
            b.title.toLowerCase().includes(query) || 
            b.url.toLowerCase().includes(query)
        );
    }
    
    const bookmarksList = document.getElementById('bookmarks-list');
    
    if (bookmarks.length === 0) {
        bookmarksList.innerHTML = `
            <div class="poly-bookmarks-empty">
                <div class="poly-bookmarks-empty-icon">📑</div>
                <div class="poly-bookmarks-empty-text">No bookmarks found</div>
                <div class="poly-bookmarks-empty-hint">Visit product pages and click the bookmark icon next to the title to save bookmarks</div>
            </div>
        `;
        return;
    }
    
    bookmarksList.innerHTML = '';
    bookmarks.forEach(bookmark => {
        const category = categories.find(c => c.id === bookmark.categoryId) || categories[0];
        const card = document.createElement('div');
        card.className = 'poly-bookmark-card';
        card.innerHTML = `
            <div class="poly-bookmark-info">
                <div class="poly-bookmark-title">${bookmark.title}</div>
                <div class="poly-bookmark-meta">
                    <span class="poly-bookmark-category-label">
                        <span class="poly-category-color-dot" style="background-color: ${category.color}"></span>
                        ${category.name}
                    </span>
                    <a href="${bookmark.url}" target="_blank" class="poly-bookmark-url">${bookmark.url}</a>
                </div>
            </div>
            <div class="poly-bookmark-actions">
                <button class="poly-btn poly-btn-sm poly-btn-secondary" data-action="edit" data-id="${bookmark.id}">✏️ Edit</button>
                <button class="poly-btn poly-btn-sm poly-btn-secondary" data-action="visit" data-url="${bookmark.url}">🔗 Visit</button>
                <button class="poly-btn poly-btn-sm poly-btn-danger" data-action="delete" data-id="${bookmark.id}">🗑️ Delete</button>
            </div>
        `;
        bookmarksList.appendChild(card);
    });
}

// Setup Bookmark Handlers
function setupBookmarkHandlers() {
    // Add Category Button - use event delegation on document
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'add-bookmark-category-btn') {
            e.preventDefault();
            showCategoryModal();
        }
    });
    
    // Category Actions (Edit/Delete)
    const categoriesList = document.getElementById('bookmark-categories-list');
    if (categoriesList) {
        categoriesList.addEventListener('click', async (e) => {
            const btn = e.target.closest('.poly-btn-icon');
            if (!btn) return;
            
            const action = btn.dataset.action;
            const categoryId = btn.dataset.id;
            
            if (action === 'edit') {
                const category = await BookmarkManager.getCategory(categoryId);
                showCategoryModal(category);
            } else if (action === 'delete') {
                if (confirm('Delete this category? Bookmarks will be moved to Uncategorized.')) {
                    await BookmarkManager.deleteCategory(categoryId);
                    showNotification('Category deleted successfully!', 'success');
                    await loadBookmarks();
                }
            }
        });
    }
    
    // Bookmark Actions
    const bookmarksList = document.getElementById('bookmarks-list');
    if (bookmarksList) {
        bookmarksList.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            
            const action = btn.dataset.action;
            
            if (action === 'visit') {
                const url = btn.dataset.url;
                window.open(url, '_blank');
            } else if (action === 'edit') {
                const bookmarkId = btn.dataset.id;
                const bookmark = await BookmarkManager.getBookmark(bookmarkId);
                showBookmarkModal(bookmark);
            } else if (action === 'delete') {
                const bookmarkId = btn.dataset.id;
                if (confirm('Delete this bookmark?')) {
                    await BookmarkManager.deleteBookmark(bookmarkId);
                    showNotification('Bookmark deleted successfully!', 'success');
                    await loadBookmarks();
                }
            }
        });
    }
    
    // Filter and Search
    const filterCategory = document.getElementById('bookmark-filter-category');
    if (filterCategory) {
        filterCategory.addEventListener('change', async (e) => {
            const categoryId = e.target.value;
            const searchQuery = document.getElementById('bookmark-search').value;
            await renderBookmarks(categoryId, searchQuery);
        });
    }
    
    const bookmarkSearch = document.getElementById('bookmark-search');
    if (bookmarkSearch) {
        bookmarkSearch.addEventListener('input', async (e) => {
            const searchQuery = e.target.value;
            const categoryId = document.getElementById('bookmark-filter-category').value;
            await renderBookmarks(categoryId, searchQuery);
        });
    }
}

// Show Category Modal
function showCategoryModal(category = null) {
    const isEdit = category !== null;
    const modalId = 'category-modal';
    
    // Remove existing modal
    document.getElementById(modalId)?.remove();
    
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'poly-modal poly-modal-small poly-modal-show';
    modal.innerHTML = `
        <div class="poly-modal-content">
            <div class="poly-modal-header">
                <h3>${isEdit ? 'Edit' : 'Add'} Category</h3>
                <span class="poly-modal-close">&times;</span>
            </div>
            <div class="poly-modal-body">
                <div class="poly-category-form">
                    <div class="poly-settings-group">
                        <label class="poly-settings-label">Category Name</label>
                        <input type="text" id="category-name" class="poly-settings-input" value="${isEdit ? category.name : ''}" placeholder="e.g. My Favorites">
                    </div>
                    <div class="poly-settings-group">
                        <label class="poly-settings-label">Color</label>
                        <input type="color" id="category-color" class="poly-input-color-picker" value="${isEdit ? category.color : '#6c757d'}">
                    </div>
                </div>
            </div>
            <div class="poly-modal-footer">
                <button id="save-category-btn" class="poly-btn poly-btn-primary">${isEdit ? 'Update' : 'Add'} Category</button>
                <button class="poly-btn poly-btn-secondary poly-modal-close">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Save handler
    document.getElementById('save-category-btn').addEventListener('click', async () => {
        const name = document.getElementById('category-name').value.trim();
        const color = document.getElementById('category-color').value;
        
        if (!name) {
            showNotification('Please enter a category name', 'error');
            return;
        }
        
        if (isEdit) {
            await BookmarkManager.updateCategory(category.id, name, color);
            showNotification('Category updated successfully!', 'success');
        } else {
            await BookmarkManager.addCategory(name, color);
            showNotification('Category added successfully!', 'success');
        }
        
        modal.remove();
        await loadBookmarks();
    });
    
    // Close handlers
    modal.querySelectorAll('.poly-modal-close').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Show Bookmark Modal
function showBookmarkModal(bookmark = null) {
    const isEdit = bookmark !== null;
    const modalId = 'bookmark-edit-modal';
    
    // Remove existing modal
    document.getElementById(modalId)?.remove();
    
    // Get categories for dropdown
    BookmarkManager.getCategories().then(categories => {
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'poly-modal poly-modal-small poly-modal-show';
        
        let categoriesOptions = '';
        categories.forEach(cat => {
            const selected = isEdit && bookmark.categoryId === cat.id ? 'selected' : '';
            categoriesOptions += `<option value="${cat.id}" ${selected} style="color: ${cat.color}">${cat.name}</option>`;
        });
        
        modal.innerHTML = `
            <div class="poly-modal-content">
                <div class="poly-modal-header">
                    <h3>Edit Bookmark</h3>
                    <span class="poly-modal-close">&times;</span>
                </div>
                <div class="poly-modal-body">
                    <div class="poly-settings-group">
                        <label class="poly-settings-label">Title</label>
                        <input type="text" id="bookmark-edit-title" class="poly-settings-input" value="${isEdit ? bookmark.title : ''}">
                    </div>
                    <div class="poly-settings-group">
                        <label class="poly-settings-label">URL</label>
                        <input type="text" id="bookmark-edit-url" class="poly-settings-input" value="${isEdit ? bookmark.url : ''}">
                    </div>
                    <div class="poly-settings-group">
                        <label class="poly-settings-label">Category</label>
                        <select id="bookmark-edit-category" class="poly-settings-select">
                            ${categoriesOptions}
                        </select>
                    </div>
                </div>
                <div class="poly-modal-footer">
                    <button id="save-bookmark-edit-btn" class="poly-btn poly-btn-primary">Update Bookmark</button>
                    <button class="poly-btn poly-btn-secondary poly-modal-close">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Save handler
        document.getElementById('save-bookmark-edit-btn').addEventListener('click', async () => {
            const title = document.getElementById('bookmark-edit-title').value.trim();
            const url = document.getElementById('bookmark-edit-url').value.trim();
            const categoryId = document.getElementById('bookmark-edit-category').value;
            
            if (!title || !url) {
                showNotification('Please enter title and URL', 'error');
                return;
            }
            
            await BookmarkManager.updateBookmark(bookmark.id, title, url, categoryId);
            showNotification('Bookmark updated successfully!', 'success');
            modal.remove();
            await loadBookmarks();
        });
        
        // Close handlers
        modal.querySelectorAll('.poly-modal-close').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    });
}

