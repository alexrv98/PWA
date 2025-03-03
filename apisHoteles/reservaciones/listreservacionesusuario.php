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

        if ($usuario) {
            try {
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
                            r.id_transaccion,
                            r.total_a_pagar,
                            r.num_adultos,
                            r.num_ninos,
                            DATEDIFF(r.fecha_fin, r.fecha_inicio) AS total_dias_hospedaje,
                            ho.id as hotel_id,  
                            ho.nombre as nombre_hotel,
                            lt.nombre as nombre_lugar_turistico
                    FROM reservaciones r
                    INNER JOIN habitaciones h ON r.habitacion_id = h.id
                    INNER JOIN tipos_habitacion t ON h.tipo_habitacion_id = t.id
                    INNER JOIN hoteles ho ON h.hotel_id = ho.id
                    INNER JOIN lugares_turisticos lt ON ho.lugar_id = lt.id
                    WHERE r.usuario_id = :usuario_id"
                );

                $stmt->bindParam(':usuario_id', $usuario['id']);
                $stmt->execute();
                $reservaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    "status" => "success",
                    "data" => $reservaciones
                ]);
            } catch (PDOException $e) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Error al obtener las reservaciones: " . $e->getMessage()
                ]);
            }
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Token inválido o expirado"
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No se encontró token de autenticación"
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Método de solicitud no permitido"
    ]);
}
?>
