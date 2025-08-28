# Changelog

## [Latest] - 2024-12-19

### Fixed
- **GMV Calculation Fix**: Corrected GMV calculations throughout the dashboard to use `price_total` (price × quantity) instead of `price` (unit price only)
  - Updated all RPC functions: `get_sales_metrics_by_date_type`, `get_products_performance`, `get_products_metrics`, `get_regions_performance`, `get_regions_metrics`
  - Fixed `vw_daily_sales_by_date_type` view to use correct price_total field
  - GMV now accurately represents Gross Merchandise Value (total sales value including quantity)
  - Affects Sales, Products, Regions, and Finance pages

### Added
- **Date Filter Consistency**: Added date type filter buttons ("По дате доставки", "По дате отгрузки", "По дате заказа") to Products, Regions, and Finance pages
- **Persistent Date State**: Implemented URL-based state management to preserve date ranges and filters when switching between dashboard tabs

### Technical Details
- Database schema correctly distinguishes between:
  - `price`: Unit price of individual item
  - `price_total`: Total price (price × quantity) - used for GMV calculations
- All metrics now consistently use `price_total` for revenue calculations
- Previous calculations were underestimating GMV when quantity > 1

---

## Previous versions
- Initial dashboard implementation with Ozon FBS analytics
- Sales metrics, product performance, regional analysis
- Financial breakdown and transaction details
- Supabase integration with custom views and RPC functions