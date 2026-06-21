<?php
function init_db(string $dbFile)
{
    $db = new SQLite3($dbFile);

    $db->exec("PRAGMA foreign_keys = ON");

    $schema = file_get_contents(__DIR__ . "/init.sql");

    $db->exec($schema);

    return $db;
}

function db_insert($db, $table, $data)
{
    $columns = implode(", ", array_keys($data));
    $placeholders = ":" . implode(", :", array_keys($data));
    $stmt = $db->prepare("INSERT INTO $table ($columns) VALUES ($placeholders)");
    foreach ($data as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }
    return $stmt->execute();
}

function db_getAll($db, $table)
{
    $result = $db->query("SELECT * FROM $table");
    $rows = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $rows[] = $row;
    }
    return $rows;
}

function db_get_by_id($db, $table, $id)
{
    $stmt = $db->prepare("SELECT * FROM $table WHERE id = :id");
    $stmt->bindValue(":id", $id, SQLITE3_INTEGER);

    $result = $stmt->execute();

    return $result->fetchArray(SQLITE3_ASSOC);
}

function db_update($db, $table, $id, $data)
{
    $set = [];
    foreach ($data as $key => $value) {
        $set[] = "$key = :$key";
    }
    $set = implode(", ", $set);
    $stmt = $db->prepare("UPDATE $table SET $set WHERE id = :id");
    $stmt->bindValue(":id", $id);
    foreach ($data as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }
    return $stmt->execute();
}
