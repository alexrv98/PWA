
<?php
require_once 'cors.php';

session_set_cookie_params([
    'lifetime' => 3600, 
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false, 
    'httponly' => true,
    'samesite' => 'Lax', 
]);

session_start();

if (isset($_SESSION['auth_token'])) {
    echo json_encode(["status" => "success", "message" => "Usuario autenticado"]);
} else {
    echo json_encode(["status" => "error", "message" => "No autenticado"]);
}
