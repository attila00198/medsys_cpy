<?php

// Includes
require_once(__DIR__ . "/router.php");
require_once(__DIR__ . "/database/database.php");
require_once(__DIR__ . "/controller/userController.php");
require_once(__DIR__ . "/service/userService.php");

// Init
$dbFile     = __DIR__ . "/database/medsys.db";
$dbSchema   = __DIR__ . "/database/init.sql";
$db         = new Database($dbFile, $dbSchema);

$method     = $_SERVER["REQUEST_METHOD"];
$path       = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

$personService      = new UserService($db);
$personController   = new UserController($personService);

$router     = new Router($personController);
$router->dispatch($method, $path);
