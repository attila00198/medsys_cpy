<?php

class Router
{
    public function __construct(private UserController $userController)
    {
    }

    public function dispatch(string $method, string $url)
    {
        if ($url !== '/api/users') {
            return;
        }

        switch ($method) {
            case 'GET':
                $this->userController->get();
                break;
            case 'POST':
                $this->userController->create();
                break;
            case 'PUT':
                $this->userController->update();
                break;
            case 'DELETE':
                $this->userController->delete();
                break;
            default:
                throw new Exception('Method not supported.');
        }
    }
}
