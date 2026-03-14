-- =============================================================================
-- SEED DATA — Development & Testing
-- =============================================================================
-- Run AFTER schema.sql
-- =============================================================================

-- Company already seeded in schema.sql (id = 1)

-- -----------------------------------------------------------------------------
-- Outlets
-- -----------------------------------------------------------------------------
INSERT INTO outlets (company_id, name, location) VALUES
    (1, 'Chittagong Outlet',  '7B-2, Jumaira Tower, Muradpur'),
    (1, 'Dhaka Outlet', '6B, Block D, Gulshan-1'),
    (1, 'Rajshahi Outlet',   '8B,Block C, Road -2, Ranibazar')
ON CONFLICT DO NOTHING;

-- Initialize receipt counters for each outlet
INSERT INTO outlet_receipt_counters (outlet_id, last_sequence)
VALUES (1, 0), (2, 0), (3, 0)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Master Menu Items
-- -----------------------------------------------------------------------------
INSERT INTO menu_items (company_id, name, description, base_price, category) VALUES
    (1, 'Chicken Fry',        'Boneless Chicken',  1200.00, 'Snacks'),
    (1, 'Chowmein',    'noodles',               230.00, 'Noodles'),
    (1, 'Masala Tea',         'Pulled milk tea',                             50.00, 'Beverages'),
    (1, 'Iced Coffee',       'Cold brew coffee with condensed milk',        280.00, 'Beverages')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Outlet Menu Assignments  (each outlet gets a subset, some with price override)
-- -----------------------------------------------------------------------------

-- Outlet 1 — Downtown (sells everything)
INSERT INTO outlet_menu_items (outlet_id, menu_item_id, override_price) VALUES
    (1, 1,  NULL), 
    (1, 2,  NULL),  
    (1, 3,  NULL),  
    (1, 4,  NULL), 

ON CONFLICT DO NOTHING;

-- Outlet 2 — Midvalley (partial menu)
INSERT INTO outlet_menu_items (outlet_id, menu_item_id, override_price) VALUES
    (2, 1,  NULL), 
    (2, 2,  250.00),
    (2, 3,  NULL),   

ON CONFLICT DO NOTHING;


-- -----------------------------------------------------------------------------
-- Inventory (starting stock per outlet per item)
-- -----------------------------------------------------------------------------

-- Outlet 1 inventory
INSERT INTO inventory (outlet_id, menu_item_id, quantity_on_hand, low_stock_threshold)
SELECT 1, menu_item_id, 100, 10
FROM outlet_menu_items WHERE outlet_id = 1
ON CONFLICT DO NOTHING;

-- Outlet 2 inventory
INSERT INTO inventory (outlet_id, menu_item_id, quantity_on_hand, low_stock_threshold)
SELECT 2, menu_item_id, 80, 10
FROM outlet_menu_items WHERE outlet_id = 2
ON CONFLICT DO NOTHING;

-- Outlet 3 inventory
INSERT INTO inventory (outlet_id, menu_item_id, quantity_on_hand, low_stock_threshold)
SELECT 3, menu_item_id, 60, 10
FROM outlet_menu_items WHERE outlet_id = 3
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Users  (passwords are bcrypt hash of "password123")
-- -----------------------------------------------------------------------------
INSERT INTO users (username, password, role, outlet_id) VALUES
    ('admin',
     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'admin', NULL),
ON CONFLICT DO NOTHING;
