-- SEED DATA — Development & Testing


-- Outlets

INSERT INTO outlets (company_id, name, location) VALUES
    (1, 'Chittagong Outlet',  '7B-2, Jumaira Tower, Muradpur'),
    (1, 'Dhaka Outlet', '6B, Block D, Gulshan-1'),
    (1, 'Rajshahi Outlet',   '8B,Block C, Road -2, Ranibazar')
ON CONFLICT DO NOTHING;

-- Initialize receipt counters for each outlet
INSERT INTO outlet_receipt_counters (outlet_id, last_sequence)
VALUES (1, 0), (2, 0), (3, 0)
ON CONFLICT DO NOTHING;


-- Master Menu Items

INSERT INTO menu_items (company_id, name, description, base_price, category) VALUES
    (1, 'Chicken Fry',        'Boneless Chicken',  1200.00, 'Snacks'),
    (1, 'Chowmein',    'noodles',               230.00, 'Noodles'),
    (1, 'Masala Tea',         'Pulled milk tea',                             50.00, 'Beverages'),
    (1, 'Iced Coffee',       'Cold brew coffee with condensed milk',        280.00, 'Beverages')
ON CONFLICT DO NOTHING;

-- Users  (passwords are bcrypt hash of "password")
INSERT INTO users (username, password, role, outlet_id) VALUES
    ('admin',
     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'admin', NULL)
ON CONFLICT DO NOTHING;
