# MedSys

MedSys is a small PHP-based web application for managing personal medical, psychological, and insurance records. It is designed to help track people, their validity periods, and insurance status in a simple and clear way.

## Purpose

The project provides a lightweight dashboard where users can:
- view a list of people in the system
- see whether medical and psychological validity periods are active or expired
- open a profile page for a person and inspect their details
- add new people and update existing records

## Main Features

- Dashboard overview with summary cards and a searchable person list
- Person profile page showing personal information and validity details
- Form for creating new records
- Simple REST-style API backed by SQLite
- Basic database initialization and schema migration support

## Project Structure

- src/app.php - application bootstrap
- src/router.php - request routing
- src/controller/ - request handlers
- src/service/ - business logic
- src/database/ - SQLite database and schema files
- static/ - frontend assets (CSS/JS)
- tests/ - basic schema and app checks

## Requirements

- PHP 8+
- SQLite support enabled in PHP
- A web server or PHP built-in server

## Running the Project

From the project root, start a local PHP server:

```bash
php -S 127.0.0.1:8000
```

Then open:

```text
http://127.0.0.1:8000/
```

## Notes

This project is intentionally simple and focused on clarity rather than heavy frameworks. It is a good starting point for a small internal records system or a learning project for PHP + SQLite + vanilla JavaScript.

## Disclaimer

This project was created for a GTA Online RP server with the purpose of helping a faction manage its responsibilities more effectively.
