<?php
include_once(__DIR__ . "/../database/database.php");

$dbFile = __DIR__ . "/../database/medsys.db";
$db = init_db($dbFile);

header("Content-Type: application/json; charset=utf-8");

// ── MINTA ADATOK (később SQLite lekérdezésre cserélve) ──────────
/* $persones = [
    [
        "id" => 1,
        "nev" => "Kovács Béla",
        "szuletesi_ido" => "1992-04-11",
        "taj_szam" => "123456789",
        "orvosi_alkalmas" => 1,
        "orvosi_kezdete" => "2026-05-20",
        "pszichologiai_alkalmas" => 1,
        "pszichologiai_kezdete" => "2026-05-22",
        "megjegyzes" => "",
    ],
    [
        "id" => 2,
        "nev" => "Nagy Anna",
        "szuletesi_ido" => "1988-09-23",
        "taj_szam" => "987654321",
        "orvosi_alkalmas" => 1,
        "orvosi_kezdete" => "2025-03-01",
        "pszichologiai_alkalmas" => 1,
        "pszichologiai_kezdete" => "2026-05-20",
        "megjegyzes" => "Soron kívüli felülvizsgálat szükséges",
    ],
    [
        "id" => 3,
        "nev" => "Tóth Eszter",
        "szuletesi_ido" => "1995-12-02",
        "taj_szam" => "111222333",
        "orvosi_alkalmas" => 0,
        "orvosi_kezdete" => null,
        "pszichologiai_alkalmas" => 1,
        "pszichologiai_kezdete" => "2026-01-10",
        "megjegyzes" => "",
    ],
    [
        "id" => 4,
        "nev" => "Szabó Dávid",
        "szuletesi_ido" => "1990-07-30",
        "taj_szam" => "444555666",
        "orvosi_alkalmas" => 1,
        "orvosi_kezdete" => "2026-04-01",
        "pszichologiai_alkalmas" => 0,
        "pszichologiai_kezdete" => null,
        "megjegyzes" => "Pszichológiai vizsgálatra beosztva: 2026.07.01.",
    ],
]; */

// ── Insert dummy data ────────────────────────────────────
/* foreach ($persones as $person) {
    db_insert("persones", $person);
}; */


// ── ROUTING ──────────────────────────────────────────────────────
$method = $_SERVER["REQUEST_METHOD"];
$query = parse_url($_SERVER["REQUEST_URI"], PHP_URL_QUERY);

if ($method === "GET") {
    if (isset($_GET["id"])) {
        $id = (int) $_GET["id"];
        $stmt = $db->prepare("SELECT * FROM persones WHERE id = :id");
        $stmt->bindValue(":id", $id, SQLITE3_INTEGER);
        $result = $stmt->execute();
        if ($result === false) {
            http_response_code(404);
            echo json_encode(["ok" => false, "error" => "Person not found"]);
            exit();
        }
        $person = $result->fetchArray(SQLITE3_ASSOC);
        echo json_encode(["ok" => true, "data" => $person]);
    } else {
        $stmt = $db->prepare("SELECT * FROM persones");
        $result = $stmt->execute();
        $persones = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $persones[] = $row;
        }
        echo json_encode(["ok" => true, "data" => $persones]);
        exit();
    }
} else if ($method === "POST") {
    // Handle POST request to insert new person
}
