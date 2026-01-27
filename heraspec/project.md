# HeraSpec Project

## Overview
PolyMetrics is a Chrome Extension designed for Envato Market (CodeCanyon, ThemeForest) authors and users. It provides detailed analytics on product sales, revenue, and profit, along with productivity tools like bookmark management, quick links, and community interaction enhancements.

## Project Types
- browser-extension

## Tech Stack
- **Core**: JavaScript (ES6+), HTML5, CSS3
- **Libraries**: jQuery 3.7.1, Chart.js 4.4.0, Moment.js 2.29.1, SweetAlert2 11.7.31
- **Platform**: Chrome Extension Manifest V3

## Structure
- `src/common.js`: Core logic classes (`PolyStorage`, `PolySettings`, `BookmarkManager`, `PolyEnvato`).
- `src/scripts.js`: Main execution entry point, UI initialization, and event listeners.
- `src/background.js`: Service worker for background tasks.
- `src/pages/`: UI pages for Popup and Settings.

## Conventions
- **Class-Based Logic**: Core functionality is encapsulated in static classes.
- **Storage**: Uses `PolyStorage` wrapper for `chrome.storage.local` with fallback.
- **DOM Manipulation**: jQuery is used for DOM interaction and injections.
- **Styling**: Vanilla CSS injected via content scripts.
