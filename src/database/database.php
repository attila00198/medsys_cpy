<?php

class Database
{
    private PDO $db;

    public function __construct(string $dbFile, string $schema = "")
    {
        $this->db = new PDO('sqlite:' . $dbFile);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $this->db->exec("PRAGMA foreign_keys = ON");

        if ($schema !== "" && file_exists($schema)) {
            $this->applySchema(file_get_contents($schema));
        }
    }

    public function prepare(string $query): PDOStatement
    {
        return $this->db->prepare($query);
    }

    public function exec(string $query): void
    {
        $this->db->exec($query);
    }

    public function query(string $query): PDOStatement
    {
        return $this->db->query($query);
    }

    public function lastInsertId(): string|false
    {
        return $this->db->lastInsertId();
    }

    private function applySchema(string $sql): void
    {
        $cleanSql = $this->stripSqlComments($sql);

        foreach ($this->splitSqlStatements($cleanSql) as $statement) {
            $statement = trim($statement);
            if ($statement === '') {
                continue;
            }

            if (!preg_match('/^(CREATE|ALTER|DROP|PRAGMA)\b/i', $statement)) {
                continue;
            }

            if (preg_match('/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`?([a-zA-Z0-9_]+)`?)/i', $statement, $matches)) {
                $this->ensureTable($matches[1], $statement);
                continue;
            }

            $this->db->exec($statement);
        }
    }

    private function ensureTable(string $tableName, string $createStatement): void
    {
        $tableExists = (bool) $this->db->query(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = " . $this->db->quote($tableName)
        )->fetchColumn();

        if (!$tableExists) {
            $this->db->exec($createStatement);
            return;
        }

        $existingColumns = $this->getTableColumns($tableName);
        $desiredColumns = $this->getColumnDefinitions($createStatement);

        foreach ($desiredColumns as $columnName => $definition) {
            if (!array_key_exists($columnName, $existingColumns)) {
                $this->db->exec("ALTER TABLE {$tableName} ADD COLUMN {$columnName} {$definition}");
            }
        }

        foreach (array_diff(array_keys($existingColumns), array_keys($desiredColumns)) as $columnName) {
            if ($columnName === 'id') {
                continue;
            }

            $this->db->exec("ALTER TABLE {$tableName} DROP COLUMN {$columnName}");
        }
    }

    private function stripSqlComments(string $sql): string
    {
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
        $sql = preg_replace('/--.*$/m', '', $sql);
        return $sql;
    }

    private function splitSqlStatements(string $sql): array
    {
        $statements = [];
        $current = '';
        $depth = 0;

        for ($i = 0, $length = strlen($sql); $i < $length; $i++) {
            $char = $sql[$i];
            $current .= $char;

            if ($char === '(') {
                $depth++;
            } elseif ($char === ')') {
                $depth = max(0, $depth - 1);
            } elseif ($char === ';' && $depth === 0) {
                $statements[] = $current;
                $current = '';
            }
        }

        if (trim($current) !== '') {
            $statements[] = $current;
        }

        return $statements;
    }

    private function getTableColumns(string $tableName): array
    {
        $columns = [];
        $result = $this->db->query("PRAGMA table_info('{$tableName}')");
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $columns[$row['name']] = $row;
        }

        return $columns;
    }

    private function getColumnDefinitions(string $createStatement): array
    {
        $normalizedStatement = rtrim(trim($createStatement), ';');

        if (!preg_match('/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`?([a-zA-Z0-9_]+)`?)\s*\((.*)\)\s*$/is', $normalizedStatement, $matches)) {
            return [];
        }

        $body = $matches[2];
        $columns = [];
        $parts = $this->splitTopLevelItems($body);

        foreach ($parts as $part) {
            $part = trim($part);
            if ($part === '' || preg_match('/^(CONSTRAINT|FOREIGN|PRIMARY|UNIQUE|CHECK)\b/i', $part)) {
                continue;
            }

            if (preg_match('/^([a-zA-Z0-9_]+)\s+(.+)$/', $part, $columnMatch)) {
                $columns[$columnMatch[1]] = trim($columnMatch[2]);
            }
        }

        return $columns;
    }

    private function splitTopLevelItems(string $body): array
    {
        $items = [];
        $current = '';
        $depth = 0;

        for ($i = 0, $length = strlen($body); $i < $length; $i++) {
            $char = $body[$i];
            if ($char === '(') {
                $depth++;
            } elseif ($char === ')') {
                $depth = max(0, $depth - 1);
            }

            if ($char === ',' && $depth === 0) {
                $items[] = $current;
                $current = '';
                continue;
            }

            $current .= $char;
        }

        if (trim($current) !== '') {
            $items[] = $current;
        }

        return $items;
    }
}
