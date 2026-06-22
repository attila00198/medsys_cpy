<?php

class PersonController
{
    public function __construct(private PersonService $personService)
    {
        $this->personService = $personService;
    }

    public function get()
    {
        if (!isset($_GET["id"])) {
            $data = $this->personService->getPerson();
            echo json_encode(["ok" => true, "data" => $data]);
            exit;
        }
        $id = $_GET["id"];
        $data = $this->personService->getPerson((int) $id);
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

        $lastId = $this->personService->createPerson($data);

        echo json_encode(["ok" => true, "id" => $lastId]);
        exit;
    }

    public function update()
    {
        if (!isset($_GET["id"])) {
            http_response_code(400);
            echo json_encode(["ok" => false, "error" => "Missing id"]);
            exit;
        }

        $id = (int) $_GET["id"];
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["ok" => false, "error" => "Invalid body"]);
            exit;
        }

        if (!$this->personService->updatePerson($id, $data)) {
            http_response_code(400);
            echo json_encode(["ok" => false, "error" => "Could not save person"]);
            exit; // ← JAVÍTVA: korábban hiányzott
        }

        echo json_encode(["ok" => true, "message" => "success"]);
        exit;
    }
}
