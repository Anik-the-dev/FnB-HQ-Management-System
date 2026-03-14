-- Database Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()


-- 1. COMPANIES

CREATE TABLE IF NOT EXISTS companies (
    id            SERIAL        PRIMARY KEY,
    name          VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 2. OUTLETS

CREATE TABLE IF NOT EXISTS outlets (
    id            SERIAL        PRIMARY KEY,
    company_id    INT           NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name          VARCHAR(255)  NOT NULL,
    location      VARCHAR(500),
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Frequently filtered: outlets by company

CREATE INDEX IF NOT EXISTS idx_outlets_company_id ON outlets(company_id);

-- 3. MENU ITEMS

CREATE TABLE IF NOT EXISTS menu_items (
    id            SERIAL          PRIMARY KEY,
    company_id    INT             NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name          VARCHAR(255)    NOT NULL,
    description   TEXT,
    base_price    NUMERIC(10, 2)  NOT NULL CHECK (base_price >= 0),
    category      VARCHAR(100),
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Same company cannot have two items with the same name
    CONSTRAINT uq_menu_items_company_name UNIQUE (company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_menu_items_company_id ON menu_items(company_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category   ON menu_items(category);


-- 4. OUTLET MENU ITEMS  (HQ assigns items to outlets)

CREATE TABLE IF NOT EXISTS outlet_menu_items (
    id              SERIAL          PRIMARY KEY,
    outlet_id       INT             NOT NULL REFERENCES outlets(id)    ON DELETE CASCADE,
    menu_item_id    INT             NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    override_price  NUMERIC(10, 2)  CHECK (override_price >= 0),  -- NULL = use base_price
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- An item can only be assigned once per outlet
    CONSTRAINT uq_outlet_menu_item UNIQUE (outlet_id, menu_item_id)
);

-- Most queried: "give me all items for outlet X"
CREATE INDEX IF NOT EXISTS idx_outlet_menu_items_outlet_id    ON outlet_menu_items(outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_menu_items_menu_item_id ON outlet_menu_items(menu_item_id);


-- 5. INVENTORY

CREATE TABLE IF NOT EXISTS inventory (
    id                  SERIAL      PRIMARY KEY,
    outlet_id           INT         NOT NULL REFERENCES outlets(id)    ON DELETE CASCADE,
    menu_item_id        INT         NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity_on_hand    INT         NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    low_stock_threshold INT         NOT NULL DEFAULT 10,   -- useful for alerts later
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One inventory row per item per outlet
    CONSTRAINT uq_inventory_outlet_item UNIQUE (outlet_id, menu_item_id)
);

-- Heavily queried during every sale
CREATE INDEX IF NOT EXISTS idx_inventory_outlet_id    ON inventory(outlet_id);
CREATE INDEX IF NOT EXISTS idx_inventory_menu_item_id ON inventory(menu_item_id);


-- 6. OUTLET RECEIPT COUNTERS  (OT1-20260315-0012)
CREATE TABLE IF NOT EXISTS outlet_receipt_counters (
    outlet_id           INT     NOT NULL PRIMARY KEY REFERENCES outlets(id) ON DELETE CASCADE,
    last_sequence       INT     NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 7. TRANSACTIONS

CREATE TABLE IF NOT EXISTS transactions (
    id              SERIAL          PRIMARY KEY,
    outlet_id       INT             NOT NULL REFERENCES outlets(id) ON DELETE RESTRICT,
    receipt_number  VARCHAR(100)    NOT NULL,
    total_amount    NUMERIC(10, 2)  NOT NULL CHECK (total_amount >= 0),
    status          VARCHAR(20)     NOT NULL DEFAULT 'COMPLETED'
                        CHECK (status IN ('COMPLETED', 'VOIDED', 'REFUNDED')),
    notes           TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Receipt numbers are unique within an outlet
    CONSTRAINT uq_transactions_outlet_receipt UNIQUE (outlet_id, receipt_number)
);

-- Reporting queries always filter/group by outlet and date
CREATE INDEX IF NOT EXISTS idx_transactions_outlet_id  ON transactions(outlet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
-- Composite: most reporting queries filter by outlet AND date range
CREATE INDEX IF NOT EXISTS idx_transactions_outlet_created ON transactions(outlet_id, created_at DESC);

-- 8. TRANSACTION ITEMS 
CREATE TABLE IF NOT EXISTS transaction_items (
    id              SERIAL          PRIMARY KEY,
    transaction_id  INT             NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    menu_item_id    INT             NOT NULL REFERENCES menu_items(id)   ON DELETE RESTRICT,
    quantity        INT             NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(10, 2)  NOT NULL CHECK (unit_price >= 0),
    subtotal        NUMERIC(10, 2)  NOT NULL CHECK (subtotal >= 0),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Heavily used in top-selling-items report
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_menu_item_id   ON transaction_items(menu_item_id);


-- =============================================================================
-- AUTO-UPDATE updated_at TRIGGER
-- Keeps updated_at current on every UPDATE without application-level code
-- =============================================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to every table that has updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'companies', 'outlets', 'menu_items',
        'outlet_menu_items', 'inventory', 'transactions'
    ]
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS set_updated_at ON %I;
             CREATE TRIGGER set_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
            t, t
        );
    END LOOP;
END;
$$;


-- =============================================================================
-- SEED — Default company (HQ)
-- =============================================================================
INSERT INTO companies (name)
VALUES ('FnB HQ')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 9. USERS  (Authentication — admin and outlet staff)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL        PRIMARY KEY,
    username    VARCHAR(100)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,           -- bcrypt hashed
    role        VARCHAR(20)   NOT NULL DEFAULT 'outlet'
                    CHECK (role IN ('admin', 'outlet')),
    outlet_id   INT           REFERENCES outlets(id) ON DELETE SET NULL,
                                                  -- NULL for admin
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_outlet_required CHECK (
        role = 'admin' OR outlet_id IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_users_username  ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_outlet_id ON users(outlet_id);

-- updated_at trigger for users
DROP TRIGGER IF EXISTS set_updated_at ON users;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
