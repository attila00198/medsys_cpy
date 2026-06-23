<?php

class PersonService
{
    public function __construct(private Database $db) {}

    public function getPerson(?int $id = null)
    {
        if ($id === null) {
            $stmt = $this->db->prepare("
                SELECT
                    u.id,
                    u.name,
                    u.birth_date,
                    u.taj_num,
                    mc.expires_at   AS med_expires_at,
                    pc.expires_at   AS psy_expires_at,
                    i.expires_at    AS ins_expires_at,
                    i.payment       As ins_payment
                FROM users u
                LEFT JOIN medical_certificates     mc ON mc.user_id = u.id
                LEFT JOIN psychological_certificates pc ON pc.user_id = u.id
                LEFT JOIN insurances               i  ON i.user_id  = u.id
            ");

            $result = $stmt->execute();
            $rows = [];
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $rows[] = $this->formatForDashboard($row);
            }

            return $rows;
        }

        $stmt = $this->db->prepare("
            SELECT
                u.id,
                u.name,
                u.birth_date,
                u.taj_num,
                mc.expires_at   AS med_expires_at,
                pc.expires_at   AS psy_expires_at,
                i.expires_at    AS ins_expires_at,
                i.payment       AS ins_payment
            FROM users u
            LEFT JOIN medical_certificates       mc ON mc.user_id = u.id
            LEFT JOIN psychological_certificates pc ON pc.user_id = u.id
            LEFT JOIN insurances                 i  ON i.user_id  = u.id
            WHERE u.id = :id
        ");
        $stmt->bindValue(":id", $id, SQLITE3_INTEGER);
        $res = $stmt->execute();
        $row = $res->fetchArray(SQLITE3_ASSOC);

        return $row ? $this->formatForProfile($row) : null;
    }

    public function createPerson(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO users (name, birth_date, taj_num)
         VALUES (:name, :birth_date, :taj_num)"
        );
        $stmt->bindValue(":name",       $data["name"]);
        $stmt->bindValue(":birth_date", $data["birth_date"]);
        $stmt->bindValue(":taj_num",    $data["taj_num"]);
        $stmt->execute();

        $userId = $this->db->lastInsertRowID();
        $currentDate = date("Y-m-d"); // Egyszer kérjük le a mai dátumot stringként

        if (!empty($data["med_expires_at"])) {
            $stmt = $this->db->prepare(
                "INSERT INTO medical_certificates (user_id, issued_at, expires_at)
             VALUES (:user_id, :issued_at, :expires_at)" // JAVÍTVA: :issued_at hozzáadva
            );
            $stmt->bindValue(":user_id",    $userId, SQLITE3_INTEGER);
            $stmt->bindValue(":issued_at",  $currentDate); // JAVÍTVA: tiszta string hiba nélkül
            $stmt->bindValue(":expires_at", $data["med_expires_at"]);
            $stmt->execute();
        }

        if (!empty($data["psy_expires_at"])) {
            $stmt = $this->db->prepare(
                "INSERT INTO psychological_certificates (user_id, issued_at, expires_at)
             VALUES (:user_id, :issued_at, :expires_at)" // JAVÍTVA: :issued_at hozzáadva
            );
            $stmt->bindValue(":user_id",    $userId, SQLITE3_INTEGER);
            $stmt->bindValue(":issued_at",  $currentDate);
            $stmt->bindValue(":expires_at", $data["psy_expires_at"]);
            $stmt->execute();
        }

        if (!empty($data["ins_expires_at"])) {
            $stmt = $this->db->prepare(
                "INSERT INTO insurances (user_id, issued_at, expires_at, payment)
             VALUES (:user_id, :issued_at, :expires_at, :payment)" // JAVÍTVA: :issued_at hozzáadva
            );
            $stmt->bindValue(":user_id",    $userId, SQLITE3_INTEGER);
            $stmt->bindValue(":issued_at",  $currentDate);
            $stmt->bindValue(":expires_at", $data["ins_expires_at"]);
            $stmt->bindValue(":payment",    $data["ins_payment"] ?? 0, SQLITE3_INTEGER);
            $stmt->execute();
        }

        return $userId;
    }

    public function updatePerson(int $id, array $data): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET name = :name, birth_date = :birth_date, taj_num = :taj_num
         WHERE id = :id"
        );
        $stmt->bindValue(":name",       $data["name"]);
        $stmt->bindValue(":birth_date", $data["birth_date"]);
        $stmt->bindValue(":taj_num",    $data["taj_num"]);
        $stmt->bindValue(":id",         $id, SQLITE3_INTEGER);
        $stmt->execute();

        $currentDate = date("Y-m-d"); // Egyszer kérjük le a mai dátumot stringként

        if (!empty($data["med_expires_at"])) {
            $stmt = $this->db->prepare(
                "INSERT INTO medical_certificates (user_id, issued_at, expires_at)
             VALUES (:user_id, :issued_at, :expires_at) -- JAVÍTVA: :issued_at hozzáadva
             ON CONFLICT(user_id) DO UPDATE SET 
                 issued_at  = excluded.issued_at,   -- JAVÍTVA: frissül az aktuális dátumra
                 expires_at = excluded.expires_at"
            );
            $stmt->bindValue(":user_id",    $id, SQLITE3_INTEGER);
            $stmt->bindValue(":issued_at",  $currentDate);
            $stmt->bindValue(":expires_at", $data["med_expires_at"]);
            $stmt->execute();
        }

        if (!empty($data["psy_expires_at"])) {
            $stmt = $this->db->prepare(
                "INSERT INTO psychological_certificates (user_id, issued_at, expires_at)
             VALUES (:user_id, :issued_at, :expires_at) -- JAVÍTVA: :issued_at hozzáadva
             ON CONFLICT(user_id) DO UPDATE SET 
                 issued_at  = excluded.issued_at,   -- JAVÍTVA: frissül az aktuális dátumra
                 expires_at = excluded.expires_at"
            );
            $stmt->bindValue(":user_id",    $id, SQLITE3_INTEGER);
            $stmt->bindValue(":issued_at",  $currentDate);
            $stmt->bindValue(":expires_at", $data["psy_expires_at"]);
            $stmt->execute();
        }

        if (!empty($data["ins_expires_at"])) {
            $stmt = $this->db->prepare(
                "INSERT INTO insurances (user_id, started_at, expires_at, payment)
             VALUES (:user_id, :started_at, :expires_at, :payment)
             ON CONFLICT(user_id) DO UPDATE SET
                 started_at = excluded.started_at,
                 expires_at = excluded.expires_at,
                 payment    = excluded.payment"
            );
            $stmt->bindValue(":user_id",    $id, SQLITE3_INTEGER);
            $stmt->bindValue(":started_at", $currentDate);
            $stmt->bindValue(":expires_at", $data["ins_expires_at"]);
            $stmt->bindValue(":payment",    $data["ins_payment"] ?? 0, SQLITE3_INTEGER);
            $stmt->execute();
        }

        return true;
    }

    private function formatForDashboard(array $row): array
    {
        return [
            'id'                => $row['id'],
            'name'              => $row['name'],
            'birth_date'        => $row['birth_date'],
            'taj_num'           => $row['taj_num'],
            'is_med_expired'    => $this->isExpired($row['med_expires_at']),
            'is_psy_expired'    => $this->isExpired($row['psy_expires_at']),
            'is_ins_expired'    => $this->isExpired($row['ins_expires_at']),
        ];
    }

    private function formatForProfile(array $row): array
    {
        return [
            'id'                => $row['id'],
            'name'              => $row['name'],
            'birth_date'        => $row['birth_date'],
            'taj_num'           => $row['taj_num'],
            'med_expires_at'    => $row['med_expires_at'],
            'psy_expires_at'    => $row['psy_expires_at'],
            'ins_expires_at'    => $row['ins_expires_at'],
            'is_med_expired'    => $this->isExpired($row['med_expires_at']),
            'is_psy_expired'    => $this->isExpired($row['psy_expires_at']),
            'is_ins_expired'    => $this->isExpired($row['ins_expires_at']),
            "ins_payment"       => $row["ins_payment"],
        ];
    }

    private function isExpired(?string $date): bool
    {
        if (empty($date)) {
            return false;
        }
        return new DateTime($date) < new DateTime();
    }
}
