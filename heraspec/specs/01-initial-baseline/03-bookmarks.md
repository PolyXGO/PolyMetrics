# Bookmark System

## Purpose
Allows users to save, categorize, and manage Envato Market items directly within the extension.

## Requirements

### 1. Data Models
- **Category**: `{ id, name, color }`
- **Bookmark**: `{ id, title, url, categoryId, createdAt, updatedAt }`

### 2. Storage
- **Key**: `poly_bookmarks` and `poly_bookmark_categories`.
- **Mechanism**: `chrome.storage.local` with fallback.

### 3. Logic
- **URL Normalization**:
    - Detects Envato item URLs: `/item/<slug>/<id>`.
    - Strips sub-paths (reviews, comments) to ensure the bookmark points to the main product page.
    - Uses this normalized URL for uniqueness checks.
- **Default Categories**: Uncategorized, My Favorites, To Review, Competitors.

### 4. UI
- **FAB**: Floating Action Button `#poly-bookmarks-btn` (Icon: Bookmark).
- **Panel**: Slide-out panel (implementation detail in `common.js`/`scripts.js` logic).
- **Icon State**: On item pages, the bookmark icon should reflect whether the current item is already bookmarked.
