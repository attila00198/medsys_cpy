<?php

class PersonController
{
    public function __construct(private Database $db)
    {
        $this->db = $db;
    }

    public function get()
    {
        if (!isset($_GET["id"])) {
            $data = $this->getAll();
            echo json_encode(["ok" => true, "data" => $data]);
            exit;
        }
        $id = $_GET["id"];
        $data = $this->getOne($id);
        echo json_encode(["ok" => true, "data" => $data]);
        exit;
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["ok" => false, "error" => "Invalid body"]);
            exit;
        }

        $columns = implode(", ", array_keys($data));
        $placeholders = ":" . implode(", :", array_keys($data));
        $stmt = $this->db->prepare("INSERT INTO persones ($columns) VALUES ($placeholders)");
        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->execute();

        $latId = $this->db->lastInsertRowID();
        echo json_encode(["ok" => true, "id" => $latId]);
        exit;
    }

    public function update()
    {
        if (!isset($_GET["id"])) {
            echo json_encode(["ok" => false, "error" => "Missing id"]);
            exit;
        }

        $id = $_GET["id"];
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["ok" => false, "error" => "Invalid body"]);
            exit;
        }

        $set = [];
        foreach ($data as $key => $value) {
            $set[] = "$key = :$key";
        }
        $set = implode(", ", $set);
        $stmt = $this->db->prepare("UPDATE persones SET $set WHERE id = :id");
        $stmt->bindValue(":id", $id);
        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->execute();

        echo json_encode(["ok" => true, "message" => "success"]);
        exit;
    }

    private function getAll()
    {
        $stmt = $this->db->prepare("SELECT * FROM persones");

        $result = $stmt->execute();

        $rows = [];

        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $rows[] = $row;
        }

        return $rows;
    }

    private function getOne(int $id)
    {
        $stmt = $this->db->prepare("SELECT * FROM persones WHERE id = :id");
        $stmt->bindValue(":id", $id, SQLITE3_INTEGER);
        $res = $stmt->execute();

        return $res->fetchArray(SQLITE3_ASSOC);
    }
}
