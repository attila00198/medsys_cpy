<?php

class UserService
{
    public function __construct(private Database $db) {}
    public function getUser(?int $id = null)
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
                    i.payment       AS ins_payment
                FROM users u
                LEFT JOIN medical_certificates       mc ON mc.user_id = u.id
                LEFT JOIN psychological_certificates pc ON pc.user_id = u.id
                LEFT JOIN insurances                 i  ON i.user_id  = u.id
            ");
            $stmt->execute();

            return array_map(
                fn($row) => $this->formatForDashboard($row),
                $stmt->fetchAll()
            );
        }

        $stmt = $this->db->prepare("
            SELECT
                u.id,
                u.name,
                u.birth_date,
                u.taj_num,
                u.remarks,
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
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ? $this->formatForProfile($row) : null;
    }

    public function createUser(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO users (name, birth_date, taj_num, remarks)
             VALUES (:name, :birth_date, :taj_num, :remarks)"
        );
        $stmt->execute([
            ':name'       => $data['name'],
            ':birth_date' => $data['birth_date'],
            ':taj_num'    => $data['taj_num'],
            ':remarks'    => $data['remarks'] ?? null,
        ]);

        $userId = $this->db->lastInsertId();
        $currentDate = date('Y-m-d');

        if (!empty($data['med_expires_at'])) {
            $stmt = $this->db->prepare(
                "INSERT INTO medical_certificates (user_id, issued_at, expires_at)
                 VALUES (:user_id, :issued_at, :expires_at)"
            );
            $stmt->execute([
                ':user_id'    => $userId,
                ':issued_at'  => $currentDate,
                ':expires_at' => $data['med_expires_at'],
            ]);
        }

        if (!empty($data['psy_expires_at'])) {
            $stmt = $this->db->prepare(
                "INSERT INTO psychological_certificates (user_id, issued_at, expires_at)
                 VALUES (:user_id, :issued_at, :expires_at)"
            );
            $stmt->execute([
                ':user_id'    => $userId,
                ':issued_at'  => $currentDate,
                ':expires_at' => $data['psy_expires_at'],
            ]);
        }

        if (!empty($data['ins_expires_at'])) {
            $stmt = $this->db->prepare(
                "INSERT INTO insurances (user_id, issued_at, expires_at, payment)
                 VALUES (:user_id, :issued_at, :expires_at, :payment)"
            );
            $stmt->execute([
                ':user_id'    => $userId,
                ':issued_at'  => $currentDate,
                ':expires_at' => $data['ins_expires_at'],
                ':payment'    => $data['ins_payment'] ?? 0,
            ]);
        }

        return (int) $userId;
    }

    public function updateUser(int $id, array $data): bool
    {
        $currentDate = date('Y-m-d');

        // Csak akkor frissíti a users táblát, ha van alapadat a payloadban
        $hasBasicData = isset($data['name'], $data['birth_date'], $data['taj_num']);
        if ($hasBasicData) {
            $stmt = $this->db->prepare(
                "UPDATE users SET name = :name, birth_date = :birth_date,
                 taj_num = :taj_num, remarks = :remarks
                 WHERE id = :id"
            );
            $stmt->execute([
                ':name'       => $data['name'],
                ':birth_date' => $data['birth_date'],
                ':taj_num'    => $data['taj_num'],
                ':remarks'    => $data['remarks'] ?? null,
                ':id'         => $id,
            ]);
        }

        if (isset($data['med_expires_at'])) {
            $stmt = $this->db->prepare(
                "INSERT INTO medical_certificates (user_id, issued_at, expires_at)
                 VALUES (:user_id, :issued_at, :expires_at)
                 ON CONFLICT(user_id) DO UPDATE SET
                     issued_at  = excluded.issued_at,
                     expires_at = excluded.expires_at"
            );
            $stmt->execute([
                ':user_id'    => $id,
                ':issued_at'  => $currentDate,
                ':expires_at' => $data['med_expires_at'],
            ]);
        }

        if (isset($data['psy_expires_at'])) {
            $stmt = $this->db->prepare(
                "INSERT INTO psychological_certificates (user_id, issued_at, expires_at)
                 VALUES (:user_id, :issued_at, :expires_at)
                 ON CONFLICT(user_id) DO UPDATE SET
                     issued_at  = excluded.issued_at,
                     expires_at = excluded.expires_at"
            );
            $stmt->execute([
                ':user_id'    => $id,
                ':issued_at'  => $currentDate,
                ':expires_at' => $data['psy_expires_at'],
            ]);
        }

        if (isset($data['ins_expires_at'])) {
            $stmt = $this->db->prepare(
                "INSERT INTO insurances (user_id, started_at, expires_at, payment)
                 VALUES (:user_id, :started_at, :expires_at, :payment)
                 ON CONFLICT(user_id) DO UPDATE SET
                     started_at = excluded.started_at,
                     expires_at = excluded.expires_at,
                     payment    = excluded.payment"
            );
            $stmt->execute([
                ':user_id'    => $id,
                ':started_at' => $currentDate,
                ':expires_at' => $data['ins_expires_at'],
                ':payment'    => $data['ins_payment'] ?? 0,
            ]);
        }

        return true;
    }

    private function formatForDashboard(array $row): array
    {
        return [
            'id'             => $row['id'],
            'name'           => $row['name'],
            'birth_date'     => $row['birth_date'],
            'taj_num'        => $row['taj_num'],
            'is_med_expired' => $this->isExpired($row['med_expires_at']),
            'is_psy_expired' => $this->isExpired($row['psy_expires_at']),
            'is_ins_expired' => $this->isExpired($row['ins_expires_at']),
        ];
    }

    private function formatForProfile(array $row): array
    {
        return [
            'id'             => $row['id'],
            'name'           => $row['name'],
            'birth_date'     => $row['birth_date'],
            'taj_num'        => $row['taj_num'],
            'remarks'        => $row['remarks'],
            'med_expires_at' => $row['med_expires_at'],
            'psy_expires_at' => $row['psy_expires_at'],
            'ins_expires_at' => $row['ins_expires_at'],
            'is_med_expired' => $this->isExpired($row['med_expires_at']),
            'is_psy_expired' => $this->isExpired($row['psy_expires_at']),
            'is_ins_expired' => $this->isExpired($row['ins_expires_at']),
            'ins_payment'    => $row['ins_payment'],
        ];
    }

    private function isExpired(?string $date): bool
    {
        if (empty($date)) return false;
        return new DateTime($date) < new DateTime();
    }
}
