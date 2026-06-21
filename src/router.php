<?php

class Router
{
    public function __construct(private Database $db)
    {
        $this->db = $db;
    }

    public function dispatch(string $method, string $url)
    {
        if ($url === "/api/person") {
            if ($method === "GET") {
                if (!isset($_GET["id"])) {
                    $pc = new PersoneController($this->db);
                    $data = $pc->get_all_persone();

                    header("Content-Type: application/json");
                    echo $this->json(["ok" => true, "data" => $data]);
                    exit(0);
                }
                $pc = new PersoneController($this->db);
                $data = $pc->get_persone_by_id($_GET["id"]);

                header("Content-Type: application/json");
                echo $this->json(["ok" => true, "data" => $data]);
                exit(0);
            } elseif ($method === "PUT") {
                if (!isset($_GET["id"])) {
                    header("Content-Type: application/json");
                    echo $this->json(["ok" => false, "message" => "Missing ID"]);
                    exit(1);
                }

                $body = json_decode(file_get_contents("php://input"), true);
                if (!$body) {
                    http_response_code(400);
                    echo $this->json(["ok" => false, "error" => "Invalid body"]);
                    exit(1);
                }


                $pc = new PersoneController($this->db);
                if (!$pc->update_person($_GET["id"], $body)) {
                    http_response_code(400);
                    echo $this->json(["ok" => false, "message" => "Something went wrong."]);
                    exit(1);
                }
                echo $this->json(["ok" => true, "message" => "success"]);
                exit(0);
            } elseif ($method === "POST") {
                $body = json_decode(file_get_contents("php://input"), true);
                if (!$body) {
                    http_response_code(400);
                    echo $this->json(["ok" => false, "error" => "Invalid body"]);
                    exit(1);
                }


                $pc = new PersoneController($this->db);
                $id = $pc->add_person($body);

                echo $this->json(["ok" => true, "id" => $id]);
                exit(0);
            }
        }
    }
    private function json(array $data)
    {
        return json_encode($data);
    }
}
