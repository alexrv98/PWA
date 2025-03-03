<?php
require_once '../auth/parametros.php';
require_once '../auth/cors.php';
require_once '../auth/db.php';
require_once '../auth/jwt_verify.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['auth_token'])) {
        $jwt = $_SESSION['auth_token'];
        $usuario = verificarToken($jwt);
        if (!$usuario || !isset($usuario['id'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Usuario no autenticado"
            ]);
            exit;
        }

        $hotel_id = isset($_GET['hotel_id']) ? intval($_GET['hotel_id']) : null;

        if (!$hotel_id) {
            echo json_encode([
                "status" => "error",
                "message" => "El parámetro hotel_id es requerido"
            ]);
            exit;
        }

        try {
            $query = "SELECT h.id, h.numero_habitacion, h.precio,
                             t.id AS tipo_habitacion_id, t.nombre AS tipo_nombre, 
                             t.capacidad, t.camas 
                      FROM habitaciones h
                      INNER JOIN tipos_habitacion t ON h.tipo_habitacion_id = t.id
                      WHERE h.hotel_id = :hotel_id
                      ORDER BY h.id ASC";

            $stmt = $conn->prepare($query);
            $stmt->bindParam(':hotel_id', $hotel_id, PDO::PARAM_INT);
            $stmt->execute();
            $habitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success",
                "data" => $habitaciones
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener habitaciones: " . $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No se encontró token de autenticación en la sesión"
        ]);
    }
}
?>
