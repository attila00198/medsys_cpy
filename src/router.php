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
}
