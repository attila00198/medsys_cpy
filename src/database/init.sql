PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    taj_num TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS medical_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    issued_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    remark TEXT,
    FOREIGN KEY (person_id) REFERENCES persons(id)
);
CREATE TABLE IF NOT EXISTS insurances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    remark TEXT,
    FOREIGN KEY (person_id) REFERENCES persons(id)
);