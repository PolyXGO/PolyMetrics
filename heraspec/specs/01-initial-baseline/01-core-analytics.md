# Core Analytics & Logic

## Purpose
Calculates and displays detailed financial analytics for Envato Market items, including revenue, author fees, buyer fees, and estimated profit based on sales volume and configurable tax rates.

## Logic Specifications

### 1. Data Extraction
- **Sales Count**: Parsed from `.item-header__sales-count strong`.
- **Item Price**: Parsed from `.js-purchase-price`.
- **Last Update**: Parsed from `.js-condense-item-page-info-panel--last_update time.updated`.
- **Created Date**: Parsed from `.js-condense-item-page-info-panel--created-at` or `Published` row.

### 2. Fee Structure
- **Buyer Fee**: Fixed at **$5.00** per item.
- **Author Fee**: Progressive tier based on total sales volume (Code `PolyEnvato.authorFee`).
    - Starts at **37.5%** for < $3,750 sales.
    - Decreases by **1.25%** for every $3,750 increment.
    - Minimum **12.5%** for > $75,000 sales.
    - **Logic**: Use the highest tier achieved based on total revenue.

### 3. Calculations
- **Revenue (USD)**: `Price * SalesCount`.
- **Net Price (Basis)**: `Price - BuyerFee`.
- **Total Buyer Fee**: `BuyerFee * SalesCount`.
- **Total Author Fee**: `(NetPrice * AuthorFee_Percent) * SalesCount`.
    - Calculated iteratively across tiers in `calculationRevenue` (though code suggests it might simplify to current level for projection).
- **Profit (Pre-Tax)**: `Revenue - TotalBuyerFee - TotalAuthorFee`.
- **Profit (Post-Tax)**: `ProfitPreTax - (ProfitPreTax * UserTaxRate / 100)`.

### 4. Metrics
- **Days Since Update**: Current Date - Last Update Date.
- **Average Sales**:
    - Per Day: `SalesCount / TotalDays`.
    - Per Month: `SalesCount / TotalMonths`.

## Output
- **Stats Table**: Injected after `.item-header__details-section`.
    - Columns: Sales, Price (Net), Revenue, Profit, Avg Days, Avg Month, Tax, Net Profit.
    - Includes collapsible "Author Fee Details" showing the specific fee tier applied.
