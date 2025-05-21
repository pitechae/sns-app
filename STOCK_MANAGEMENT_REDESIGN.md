# Stock Management and Reporting Module Redesign

## Overview

This document outlines the comprehensive plan to redesign and refactor the stock management and reporting module. The plan maintains the existing UI/UX design system while enhancing functionality and database structure.

## Current Assessment

Already implemented:
- Basic stock ledger functionality
- Stock transaction types
- API endpoints for stock transactions
- Integration with POS system

## Atomic TODO List

### 1. Database Structure Refactoring

- [ ] **Create stock_transactions table**
  - Fields: id, date, type (entry, adjustment, transfer), quantity, product_id, reference_id, notes, created_at, updated_at
  - Indexes: product_id, date, type

- [ ] **Create stock_locations table**
  - Fields: id, name, code, address, is_active, created_at, updated_at

- [ ] **Create stock_transfers table**
  - Fields: id, date, from_location_id, to_location_id, status, notes, created_at, updated_at

- [ ] **Create stock_transfer_items table**
  - Fields: id, transfer_id, product_id, quantity, created_at, updated_at

- [ ] **Modify items table**
  - Add fields: reorder_level, ideal_stock, cost_price, last_purchase_date

### 2. API Endpoints Development

- [ ] **Stock Entry API**
  - Implement POST /api/stock/entries endpoint
  - Add validation for required fields
  - Ensure proper transaction recording

- [ ] **Stock Adjustment API**
  - Implement POST /api/stock/adjustments endpoint
  - Add validation for adjustment reasons
  - Link with POS sales transactions

- [ ] **Stock Transfer API**
  - Implement CRUD endpoints for transfers
  - Add status tracking (draft, in-transit, completed)

- [ ] **Stock Reports API**
  - Implement GET /api/reports/stock/summary
  - Implement GET /api/reports/stock/aging
  - Implement GET /api/reports/stock/balance
  - Implement GET /api/reports/stock/sales
  - Enhance existing GET /api/stock/transactions

### 3. Service Layer Implementation

- [ ] **StockService**
  - Create methods for stock entry, adjustment, and transfer
  - Implement stock level calculation logic
  - Add transaction history tracking

- [ ] **ReportService**
  - Implement summary report generation
  - Create aging calculation logic (30-90 days)
  - Develop balance report calculations
  - Build sales report integration with POS data

- [ ] **WebSocket Integration**
  - Enhance real-time stock updates
  - Add notifications for low stock
  - Implement transfer status updates

### 4. UI Components Enhancement

- [ ] **StockEntry Component**
  - Design form for adding new stock
  - Add batch/serial number support
  - Implement barcode scanning integration

- [ ] **StockAdjustment Component**
  - Create adjustment form with reason codes
  - Add support for bulk adjustments
  - Implement audit trail

- [ ] **StockTransfer Component**
  - Design transfer creation workflow
  - Add status tracking UI
  - Implement approval process

- [ ] **Report Components**
  - Enhance StockLedger with filtering options
  - Create StockSummary component
  - Develop StockAging component with date range columns
  - Build StockBalance component
  - Implement StockSales component

### 5. Integration with Existing Systems

- [ ] **POS Integration**
  - Enhance stock adjustment on sales
  - Add real-time inventory checks
  - Implement warnings for low stock items

- [ ] **Reporting Dashboard**
  - Create stock overview dashboard
  - Add key metrics and visualizations
  - Implement export functionality

### 6. Testing and Optimization

- [ ] **Unit Tests**
  - Write tests for all service methods
  - Create API endpoint tests
  - Implement component tests

- [ ] **Performance Optimization**
  - Add database indexes for common queries
  - Implement caching for reports
  - Optimize large dataset handling

- [ ] **Data Migration Plan**
  - Create scripts for migrating existing data
  - Implement data validation
  - Add rollback procedures

### 7. Documentation

- [ ] **API Documentation**
  - Document all endpoints with examples
  - Create Swagger/OpenAPI specs

- [ ] **User Documentation**
  - Write usage guides for each feature
  - Create troubleshooting section

- [ ] **Developer Documentation**
  - Document database schema
  - Create component documentation
  - Add code examples

## Implementation Strategy

### Phase 1: Database and Core Services
- Implement database structure changes
- Develop core service layer
- Create basic API endpoints

### Phase 2: Reports and Advanced Features
- Implement reporting services
- Develop advanced features like transfers
- Create data visualization components

### Phase 3: Integration and Optimization
- Integrate with POS system
- Optimize performance
- Implement real-time updates

### Phase 4: Testing and Documentation
- Comprehensive testing
- Complete documentation
- User training materials

## Technical Specifications

### Database Schema

```sql
-- Stock Transactions Table
CREATE TABLE stock_transactions (
  id TEXT PRIMARY KEY,
  date INTEGER NOT NULL,
  type TEXT NOT NULL,
  quantity REAL NOT NULL,
  product_id TEXT NOT NULL,
  reference_id TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Stock Locations Table
CREATE TABLE stock_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Stock Transfers Table
CREATE TABLE stock_transfers (
  id TEXT PRIMARY KEY,
  date INTEGER NOT NULL,
  from_location_id TEXT NOT NULL,
  to_location_id TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (from_location_id) REFERENCES stock_locations(id),
  FOREIGN KEY (to_location_id) REFERENCES stock_locations(id)
);

-- Stock Transfer Items Table
CREATE TABLE stock_transfer_items (
  id TEXT PRIMARY KEY,
  transfer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity REAL NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (transfer_id) REFERENCES stock_transfers(id),
  FOREIGN KEY (product_id) REFERENCES items(id)
);
```

### API Endpoints

#### Stock Entry
```
POST /api/stock/entries
{
  "productId": "string",
  "quantity": "number",
  "date": "string",
  "notes": "string"
}
```

#### Stock Adjustment
```
POST /api/stock/adjustments
{
  "productId": "string",
  "quantity": "number",
  "reason": "string",
  "date": "string",
  "notes": "string"
}
```

#### Stock Transfer
```
POST /api/stock/transfers
{
  "fromLocationId": "string",
  "toLocationId": "string",
  "date": "string",
  "items": [
    {
      "productId": "string",
      "quantity": "number"
    }
  ],
  "notes": "string"
}
```

#### Stock Reports
```
GET /api/reports/stock/summary?locationId=string&categoryId=string
GET /api/reports/stock/aging?days=30,60,90&locationId=string
GET /api/reports/stock/balance?fromDate=string&toDate=string&locationId=string
GET /api/reports/stock/sales?fromDate=string&toDate=string&productId=string
```

## Compliance and Best Practices

- All code will follow the project's established coding standards using Biome.js
- TypeScript will be used throughout with proper type definitions
- Accessibility (WCAG AA) compliance will be maintained
- The Norman door UX principle will guide all interface designs
- All components will be responsive and mobile-first
