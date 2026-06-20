# Data to save
- full name
- date of birth
- taj. number
- Psy. start date
- medical start date
- expires after
- payed amount

## Pnales for revorking the database structure.
We need three tables:
- person
- medical_certs
- insurrance

### Person
```SQL
CREATE TABLE medical_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    birth_date TEXT,
    taj_number TEXT UNIQUE
);
```

### Medical Certifications
```SQL
CREATE TABLE medical_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    issued_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,

    FOREIGN KEY (person_id)
        REFERENCES persons(id)
);
```

### Insurranc
```SQL
CREATE TABLE medical_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    issued_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,

    FOREIGN KEY (person_id)
        REFERENCES persons(id)
);
```