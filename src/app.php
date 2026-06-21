<?php

// Includes
require_once(__DIR__ . "/router.php");
require_once(__DIR__ . "/database/database.php");
require_once(__DIR__ . "/controller/PersoneController.php");

// Init
$dbFile = __DIR__ . "/database/medsys.db";
$db     = init_db($dbFile);

$method = $_SERVER["REQUEST_METHOD"];
$path   = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

$router = new Router($db);
$router->dispatch($method, $path);

// ── Insert dummy data ────────────────────────────────────
/* $dummyData = [
    [
        "nev" => "Kovács Péter",
        "szuletesi_ido" => "1985-03-15",
        "taj_szam" => "123456789",
        "orvosi_kezdete" => "2020-01-01",
        "pszichologiai_kezdete" => "2021-06-15",
        "megjegyzes" => "Nincs megjegyzés"
    ],
    [
        "nev" => "Nagy Anna",
        "szuletesi_ido" => "1990-07-22",
        "taj_szam" => "987654321",
        "orvosi_kezdete" => "2019-05-10",
        "pszichologiai_kezdete" => "2020-11-20",
        "megjegyzes" => "Allergiás a penicillinre"
    ],
    [
        "nev" => "Tóth László",
        "szuletesi_ido" => "1978-12-05",
        "taj_szam" => "456789123",
        "orvosi_kezdete" => "2018-03-25",
        "pszichologiai_kezdete" => null,
        "megjegyzes" => null
    ]
]; */
// Insert dummy data only if the table is empty
/* if (empty(db_getAll($db, "persones"))) {
    foreach ($dummyData as $person) {
        db_insert($db, "persones", $person);
    }
} */


// ── ROUTING ──────────────────────────────────────────────────────

/* if ($method === "GET") {
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
    $body = json_decode(file_get_contents("php://input"), true);
    if (!$body) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "Érvénytelen kérés törzs."]);
        exit();
    }

    $stmt = $db->prepare("
        INSERT INTO persones (nev, szuletesi_ido, taj_szam, orvosi_kezdete, pszichologiai_kezdete, megjegyzes)
        VALUES (:nev, :szuletesi_ido, :taj_szam, :orvosi_kezdete, :pszichologiai_kezdete, :megjegyzes)
    ");
    $stmt->bindValue(":nev",                    $body["nev"]                    ?? null);
    $stmt->bindValue(":szuletesi_ido",          $body["szuletesi_ido"]          ?? null);
    $stmt->bindValue(":taj_szam",               $body["taj_szam"]               ?? null);
    $stmt->bindValue(":orvosi_kezdete",         $body["orvosi_kezdete"]         ?? null);
    $stmt->bindValue(":pszichologiai_kezdete",  $body["pszichologiai_kezdete"]  ?? null);
    $stmt->bindValue(":megjegyzes",             $body["megjegyzes"]             ?? null);

    $result = $stmt->execute();
    if (!$result) {
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => "Mentés sikertelen."]);
        exit();
    }

    $newId = $db->lastInsertRowID();
    echo json_encode(["ok" => true, "id" => $newId]);
} else if ($method === "PUT") {
    $id = isset($_GET["id"]) ? (int) $_GET["id"] : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "Hiányzó azonosító."]);
        exit();
    }

    $body = json_decode(file_get_contents("php://input"), true);
    if (!$body) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "Érvénytelen kérés törzs."]);
        exit();
    }

    $stmt = $db->prepare("
        UPDATE persones SET
            nev = :nev,
            szuletesi_ido = :szuletesi_ido,
            taj_szam = :taj_szam,
            orvosi_kezdete = :orvosi_kezdete,
            pszichologiai_kezdete = :pszichologiai_kezdete,
            megjegyzes = :megjegyzes
        WHERE id = :id
    ");
    $stmt->bindValue(":nev",                    $body["nev"]                    ?? null);
    $stmt->bindValue(":szuletesi_ido",          $body["szuletesi_ido"]          ?? null);
    $stmt->bindValue(":taj_szam",               $body["taj_szam"]               ?? null);
    $stmt->bindValue(":orvosi_kezdete",         $body["orvosi_kezdete"]         ?? null);
    $stmt->bindValue(":pszichologiai_kezdete",  $body["pszichologiai_kezdete"]  ?? null);
    $stmt->bindValue(":megjegyzes",             $body["megjegyzes"]             ?? null);
    $stmt->bindValue(":id", $id, SQLITE3_INTEGER);

    $result = $stmt->execute();
    if (!$result) {
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => "Mentés sikertelen."]);
        exit();
    }

    echo json_encode(["ok" => true]);
} */
