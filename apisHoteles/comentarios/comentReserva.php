<?php
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
                "message" => "Usuario no autenticado o token inválido"
            ]);
            exit;
        }

        $hotel_id = isset($_GET['hotel_id']) ? intval($_GET['hotel_id']) : null;

        try {
            $query = "SELECT r.id AS reservacion_id, r.fecha_inicio, r.fecha_fin, r.estado,
                             h.id AS habitacion_id, h.numero_habitacion, h.precio,
                             ho.id AS hotel_id, ho.nombre AS hotel_nombre, ho.direccion,
                             u.id AS usuario_id, u.nombre AS usuario_nombre, u.correo AS usuario_correo, u.rol AS usuario_rol
                      FROM reservaciones r
                      INNER JOIN habitaciones h ON r.habitacion_id = h.id
                      INNER JOIN hoteles ho ON h.hotel_id = ho.id
                      INNER JOIN usuarios u ON r.usuario_id = u.id
                      WHERE r.usuario_id = :usuario_id";

            if ($hotel_id) {
                $query .= " AND ho.id = :hotel_id";
            }

            $stmt = $conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuario['id'], PDO::PARAM_INT);

            if ($hotel_id) {
                $stmt->bindParam(':hotel_id', $hotel_id, PDO::PARAM_INT);
            }

            $stmt->execute();
            $reservaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success",
                "data" => $reservaciones
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener reservaciones: " . $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No se encontró token de autenticación"
        ]);
    }
}
?>
