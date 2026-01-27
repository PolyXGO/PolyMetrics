# UI Components & Visualization

## Purpose
Provides the visual interface for interacting with analytics and navigating the page.

## Requirements

### 1. Toolbar
- **Location**: Injected into `.item-header__details-section`.
- **Components**:
    - **Tax Input**: Number input (0-100%). Updates calculations on change.
    - **Currency Selector**: Dropdown of supported currencies. Updates symbols and approximate conversion.
    - **Exchange Rate**: Read-only input showing current rate for selected currency.
    - **Quick Links Button**: Opens Quick Links modal.
    - **Settings Button**: Opens Settings modal.

### 2. Charts
- **Library**: Chart.js 4.4.0.
- **Container**: `#poly-chart-container`.
- **Types**: User-selectable (Bar, Line, Radar, Polar Area). Defaults to Bar.
- **Data Series**:
    - **Revenue Chart**: Compares Revenue vs Profit.
    - **Distribution Chart**: Pie chart of Revenue Distribution (Fees vs Profit vs Tax).

### 3. Scroll Controls
- **Scroll To Top**:
    - Icon: `arrow-up-circle-fill`.
    - Action: Smooth scroll to top.
    - Position: Fixed bottom-right (configurable offset).
- **Scroll To Bottom**:
    - Icon: `arrow-down-circle-fill`.
    - Action: Smooth scroll to bottom.
- **Scroll To Recommended**:
    - Icon: `chat-left-dots`.
    - Action: Smooth scroll to `#recommended_items` section.
