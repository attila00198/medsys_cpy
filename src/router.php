<?php

class Router
{
    public function __construct(private PersonController $personController)
    {
        $this->personController = $personController;
    }

    public function dispatch(string $method, string $url)
    {
        if ($url !== "/api/person") {
            return;
        }

        switch ($method) {
            case "GET":
                $this->personController->get();
                break;
            case "POST":
                $this->personController->create();
                break;
            case "PUT":
                $this->personController->update();
                break;
            default:
                throw new Exception("Method not supported.");
        }
    }
}
