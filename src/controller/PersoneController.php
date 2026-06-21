<?php

class PersoneController
{
    public function __construct(private $db)
    {
        $this->db = $db;
    }

    public function get_all_persone()
    {
        $stmt = $this->db->prepare("SELECT * FROM persones");
        $res = $stmt->execute();
        if (! $res) {
            return false;
        } else {
            $rows = [];
            while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
                $rows[] = $row;
            }
            return $rows;
        }
    }

    public function get_persone_by_id(int $id)
    {
        $stmt = $this->db->prepare("SELECT * FROM persones WHERE id = :id");
        $stmt->bindValue(":id", $id, SQLITE3_INTEGER);
        $res = $stmt->execute();

        if (!$res) {
            return false;
        } else {
            return $res->fetchArray(SQLITE3_ASSOC);
        }
    }

    public function add_person(array $data)
    {
        $columns = implode(", ", array_keys($data));
        $placeholders = ":" . implode(", :", array_keys($data));
        $stmt = $this->db->prepare("INSERT INTO persones ($columns) VALUES ($placeholders)");
        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->execute();
        return $this->db->lastInsertRowID();
    }

    public function update_person(int $id, array $data)
    {
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
        return $stmt->execute();
    }
};
