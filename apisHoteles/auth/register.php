<?php
require_once 'cors.php';
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (
        !isset($data->nombre) ||
        !isset($data->correo) ||
        !isset($data->password) ||
        !isset($data->rol)
    ) {
        echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
        exit;
    }

    $nombre = $data->nombre;
    $correo = $data->correo;
    $password = password_hash($data->password, PASSWORD_BCRYPT);
    $rol = $data->rol;

    try {
        $stmt = $conn->prepare("INSERT INTO Usuarios (nombre, correo, contraseña, rol) VALUES (:nombre, :correo, :password, :rol)");
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':correo', $correo);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':rol', $rol);
        $stmt->execute();

        echo json_encode(["status" => "success", "message" => "Usuario registrado con éxito"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Error al registrar usuario: " . $e->getMessage()]);
    }
}
?>
