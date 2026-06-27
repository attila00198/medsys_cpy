-- Users
/* INSERT INTO users (name, birth_date, taj_num, remarks) VALUES
    ('Kovács Péter',    '1985-03-12', 123456789, "Megjegyzés"),
    ('Nagy Erzsébet',   '1990-07-24', 234567890, "Megjegyzés"),
    ('Szabó Gábor',     '1978-11-05', 345678901, "Megjegyzés"),
    ('Horváth Katalin', '1995-02-18', 456789012, "Megjegyzés"),
    ('Tóth Márton',     '1982-09-30', 567890123, "Megjegyzés");
-- Medical certificates
INSERT INTO medical_certificates (user_id, issued_at, expires_at) VALUES
    (1, '2025-01-10', '2026-01-10'),
    (2, '2024-11-05', '2025-11-05'),
    (3, '2025-03-22', '2026-03-22'),
    (4, '2024-08-14', '2025-08-14'),
    (5, '2025-05-01', '2026-05-01');

-- Psychological certificates
INSERT INTO psychological_certificates (user_id, issued_at, expires_at) VALUES
    (1, '2025-02-01', '2026-02-01'),
    (2, '2024-12-10', '2025-12-10'),
    (3, '2025-01-15', '2026-01-15'),
    (4, '2025-04-03', '2026-04-03'),
    (5, '2024-09-20', '2025-09-20');

-- Insurances
INSERT INTO insurances (user_id, issued_at, expires_at, payment) VALUES
    (1, '2025-01-01', '2026-01-01', 45000),
    (2, '2025-03-01', '2026-03-01', 45000),
    (3, '2024-07-01', '2025-07-01', 38000),
    (4, '2025-02-15', '2026-02-15', 4500),
    (5, '2024-10-01', '2025-10-01', 45000); */