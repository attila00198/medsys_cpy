<?php

class UserController
{
    public function __construct(private UserService $userService) {}

    public function get()
    {
        if (!isset($_GET['id'])) {
            $data = $this->userService->getUser();
            echo json_encode(['ok' => true, 'data' => $data]);
            exit;
        }

        $data = $this->userService->getUser((int) $_GET['id']);
        echo json_encode(['ok' => true, 'data' => $data]);
        exit;
    }

    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Invalid body']);
            exit;
        }

        $lastId = $this->userService->createUser($data);
        echo json_encode(['ok' => true, 'id' => $lastId]);
        exit;
    }

    public function update()
    {
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Missing id']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Invalid body']);
            exit;
        }

        if (!$this->userService->updateUser((int) $_GET['id'], $data)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Could not save user']);
            exit;
        }

        echo json_encode(['ok' => true, 'message' => 'success']);
        exit;
    }
}
