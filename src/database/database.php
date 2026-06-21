<?php

class Database
{
    private SQLite3 $db;

    public function __construct(string $dbFile, string $schema = "")
    {
        $this->db = new SQLite3($dbFile);
        $this->db->exec("PRAGMA foreign_keys = ON");

        if ($schema !== "" && file_exists($schema)) {
            $this->db->exec(file_get_contents($schema));
        }
    }

    public function prepare(string $query)
    {
        return $this->db->prepare($query);
    }

    public function query(string $query)
    {
        return $this->db->query($query);
    }

    public function lastInsertRowID()
    {
        return $this->db->lastInsertRowID();
    }
}
