<?php
include_once(__DIR__ . "/../database/database.php");

$dbFile = __DIR__ . "/../database/medsys.db";
$db = init_db($dbFile);

header("Content-Type: application/json; charset=utf-8");

// ── Insert dummy data ────────────────────────────────────
$dummyData = [
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
];
// Insert dummy data only if the table is empty
/* if (empty(db_getAll($db, "persones"))) {
    foreach ($dummyData as $person) {
        db_insert($db, "persones", $person);
    }
} */


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
