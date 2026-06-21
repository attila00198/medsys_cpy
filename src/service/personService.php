<?php

class PersonService
{
    public function __construct(private Database $db) {}

    public function getPerson(?int $id = null)
    {
        if ($id === null) {
            $stmt = $this->db->prepare("SELECT * FROM persones");

            $result = $stmt->execute();

            $rows = [];

            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $rows[] = $row;
            }

            return $rows;
        }

        $stmt = $this->db->prepare("SELECT * FROM persones WHERE id = :id");
        $stmt->bindValue(":id", $id, SQLITE3_INTEGER);
        $res = $stmt->execute();

        return $res->fetchArray(SQLITE3_ASSOC);
    }

    public function createPerson(array $data)
    {
        $columns = implode(", ", array_keys($data));
        $placeholders = ":" . implode(", :", array_keys($data));
        $stmt = $this->db->prepare("INSERT INTO persones ($columns) VALUES ($placeholders)");
        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        $stmt->execute();

        $latId = $this->db->lastInsertRowID();
        return $latId;
    }

    public function updatePerson(int $id, array $data)
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
}
