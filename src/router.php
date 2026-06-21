<?php

class Router
{
    private PersoneController $personeController;
    public function __construct(private Database $db)
    {
        $this->db = $db;
        $this->personeController = new PersoneController($db);
    }

    public function dispatch(string $method, string $url)
    {
        if ($url !== "/api/person") {
            return;
        }

        switch ($method) {
            case "GET":
                $this->personeController->get();
                break;
            case "POST":
                $this->personeController->create();
                break;
            case "PUT":
                $this->personeController->update();
                break;
            default:
                throw new Exception("Method not supported.");
        }
    }

    /* public function dispatch(string $method, string $url)
    {
        if ($url === "/api/person") {
            if ($method === "GET") {
                if (!isset($_GET["id"])) {
                    $data = $this->personeController->getAll();

                    header("Content-Type: application/json");
                    echo $this->json(["ok" => true, "data" => $data]);
                    exit(0);
                }
                $data = $this->personeController->getById($_GET["id"]);

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


                if (!$this->personeController->update($_GET["id"], $body)) {
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


                $id = $this->personeController->create($body);

                echo $this->json(["ok" => true, "id" => $id]);
                exit(0);
            }
        }
    } */
    private function json(array $data)
    {
        return json_encode($data);
    }
}
