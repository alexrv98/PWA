<?php
require_once 'parametros.php';
require_once 'cors.php';
require_once 'db.php';
require_once 'jwt_verify.php';

session_start();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$data || !isset($data->correo) || !isset($data->password)) {
        echo json_encode([
            "status" => "error",
            "message" => "Datos incompletos"
        ]);
        exit;
    }

    $correo = $data->correo;
    $password = $data->password;

    try {
        $stmt = $conn->prepare("SELECT id, nombre, rol, contraseña FROM Usuarios WHERE correo = :correo AND activo = 1");
        $stmt->bindParam(':correo', $correo);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['contraseña'])) {
            $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
            $payload = json_encode([
                'id' => $user['id'],
                'nombre' => $user['nombre'],
                'rol' => $user['rol'],
                'iat' => time(),
                'exp' => time() + 3600 
            ]);

            $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
            $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
            $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET_KEY, true);
            $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

            $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;

            // Almacenar el JWT en la sesión del servidor
            $_SESSION['auth_token'] = $jwt;

            echo json_encode([
                "status" => "success",
                "message" => "Inicio de sesión exitoso",
                "session_id" => session_id(),  
                "nombre" => $user['nombre'],
                "rol" => $user['rol']
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Credenciales incorrectas"
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error en el servidor: " . $e->getMessage()
        ]);
    }
}
