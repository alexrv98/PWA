<?php
require_once '../auth/parametros.php';
require_once '../auth/cors.php';
require_once '../auth/db.php';
require_once '../auth/jwt_verify.php';

session_start(); 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_SESSION['auth_token'])) {
        $jwt = $_SESSION['auth_token']; 
        $usuario = verificarToken($jwt);

        if (!$usuario) {
            echo json_encode(["status" => "error", "message" => "Token inválido"]);
            exit;
        }

        $admin_id = $usuario['id']; 
        try {
            error_log("Usuario Admin ID: " . $admin_id);

            $stmt = $conn->prepare("SELECT id FROM hoteles WHERE usuario_id = :admin_id LIMIT 1");
            $stmt->bindParam(':admin_id', $admin_id, PDO::PARAM_INT);
            $stmt->execute();
            $hotel = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$hotel) {
                echo json_encode(["status" => "error", "message" => "No se encontró un hotel asignado al administrador"]);
                exit;
            }

            $hotel_id = $hotel['id'];

            error_log("Hotel ID encontrado: " . $hotel_id);

            // Consultar las reservaciones del hotel
            $stmt = $conn->prepare(
                "SELECT r.id as reservacion_id,
                        h.numero_habitacion,
                        t.nombre as tipo_habitacion,
                        t.capacidad,
                        t.camas,
                        h.precio,
                        r.fecha_inicio,
                        r.fecha_fin,
                        r.estado,
                        r.total_a_pagar,
                        DATEDIFF(r.fecha_fin, r.fecha_inicio) AS total_dias_hospedaje,
                        ho.id as hotel_id,
                        ho.nombre as nombre_hotel,
                        lt.nombre as nombre_lugar_turistico,
                        u.nombre as nombre_usuario,
                        u.correo as correo_usuario
                 FROM reservaciones r
                 INNER JOIN habitaciones h ON r.habitacion_id = h.id
                 INNER JOIN tipos_habitacion t ON h.tipo_habitacion_id = t.id
                 INNER JOIN hoteles ho ON h.hotel_id = ho.id
                 INNER JOIN lugares_turisticos lt ON ho.lugar_id = lt.id
                 INNER JOIN usuarios u ON r.usuario_id = u.id
                 WHERE ho.id = :hotel_id"
            );

            $stmt->bindParam(':hotel_id', $hotel_id, PDO::PARAM_INT);
            $stmt->execute();
            $reservaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => $reservaciones]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Error al obtener las reservaciones: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No se encontró token de autenticación en la sesión"]);
    }
}
?>
