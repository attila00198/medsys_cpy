PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    taj_num INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS medical_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    issued_at TEXT,
    expires_at TEXT NOT NULL,
    remark TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS psychological_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    issued_at TEXT,
    expires_at TEXT NOT NULL,
    remark TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS insurances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    started_at TEXT,
    expires_at TEXT NOT NULL,
    payment INTEGER NOT NULL DEFAULT 0,
    remark TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

/* -- Users
INSERT INTO users (name, birth_date, taj_num) VALUES
    ('Kovács Péter',    '1985-03-12', 123456789),
    ('Nagy Erzsébet',   '1990-07-24', 234567890),
    ('Szabó Gábor',     '1978-11-05', 345678901),
    ('Horváth Katalin', '1995-02-18', 456789012),
    ('Tóth Márton',     '1982-09-30', 567890123);

-- Medical certificates
INSERT INTO medical_certificates (user_id, issued_at, expires_at, remark) VALUES
    (1, '2025-01-10', '2026-01-10', 'Minden rendben'),
    (2, '2024-11-05', '2025-11-05', 'Szemüveg kötelező'),
    (3, '2025-03-22', '2026-03-22', NULL),
    (4, '2024-08-14', '2025-08-14', 'Kontroll 6 hónap múlva'),
    (5, '2025-05-01', '2026-05-01', NULL);

-- Psychological certificates
INSERT INTO psychological_certificates (user_id, issued_at, expires_at, remark) VALUES
    (1, '2025-02-01', '2026-02-01', NULL),
    (2, '2024-12-10', '2025-12-10', 'Stresszkezelés ajánlott'),
    (3, '2025-01-15', '2026-01-15', NULL),
    (4, '2025-04-03', '2026-04-03', NULL),
    (5, '2024-09-20', '2025-09-20', 'Ismételt vizsgálat szükséges');

-- Insurances
INSERT INTO insurances (user_id, started_at, expires_at, payment, remark) VALUES
    (1, '2025-01-01', '2026-01-01', 45000, 'Éves díj fizetve'),
    (2, '2025-03-01', '2026-03-01', 45000, NULL),
    (3, '2024-07-01', '2025-07-01', 38000, 'Kedvezményes díj'),
    (4, '2025-02-15', '2026-02-15', 45000, NULL),
    (5, '2024-10-01', '2025-10-01', 45000, 'Megújítás szükséges'); */