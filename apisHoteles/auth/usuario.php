<?php
require_once 'parametros.php';
require_once 'cors.php';
require_once 'db.php';
require_once 'jwt_verify.php';

session_start();


if (isset($_SESSION['auth_token'])) {
    $jwt = $_SESSION['auth_token']; 
    $usuario = verificarToken($jwt);

    if ($usuario) {
        $id = $usuario['id'];
        try {
            $stmt = $conn->prepare("SELECT id, nombre, correo, rol FROM Usuarios WHERE id = :id AND activo = 1");
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                echo json_encode([
                    "status" => "success",
                    "session_id" => session_id(),
                    "auth_token" => $_SESSION['auth_token'] ?? 'No hay token almacenado',
                    "id" => $user['id'],
                    "nombre" => $user['nombre'],
                    "correo" => $user['correo'],
                    "rol" => $user['rol']  

                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Usuario no encontrado'
                ]);
            }
        } catch (PDOException $e) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error en la base de datos: ' . $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Token inválido o expirado'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'No se encontró token de autenticación'
    ]);
}
