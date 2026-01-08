-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pensions table
CREATE TABLE IF NOT EXISTS pensions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('SIPP', 'managed')),
    contribution_type TEXT NOT NULL CHECK(contribution_type IN ('regular_fixed', 'manual')),
    monthly_amount DECIMAL(10, 2),
    day_of_month INTEGER CHECK(day_of_month >= 1 AND day_of_month <= 31),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pension_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    contribution_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pension_id) REFERENCES pensions(id) ON DELETE CASCADE
);

-- Holdings table
CREATE TABLE IF NOT EXISTS holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pension_id INTEGER NOT NULL,
    ticker TEXT NOT NULL,
    shares DECIMAL(12, 4) NOT NULL,
    currency_unit TEXT NOT NULL DEFAULT 'pounds' CHECK(currency_unit IN ('pounds', 'pence')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pension_id) REFERENCES pensions(id) ON DELETE CASCADE,
    UNIQUE(pension_id, ticker)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pensions_user_id ON pensions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_pension_id ON contributions(pension_id);
CREATE INDEX IF NOT EXISTS idx_contributions_date ON contributions(contribution_date);
CREATE INDEX IF NOT EXISTS idx_holdings_pension_id ON holdings(pension_id);
