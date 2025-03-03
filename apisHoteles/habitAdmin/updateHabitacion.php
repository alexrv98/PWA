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

        // Leer los datos enviados en el cuerpo de la solicitud
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
        $tipo_habitacion_id = $data['tipo_habitacion_id'] ?? null;
        $numero_habitacion = $data['numero_habitacion'] ?? null;
        $precio = $data['precio'] ?? null;

        if (!$id || !$tipo_habitacion_id || !$numero_habitacion || !$precio) {
            echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios"]);
            exit;
        }

        try {
            // Obtener el hotel_id de la habitación actual
            $queryHotelId = "SELECT hotel_id FROM habitaciones WHERE id = :id";
            $stmtHotelId = $conn->prepare($queryHotelId);
            $stmtHotelId->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtHotelId->execute();
            $hotel_id = $stmtHotelId->fetch(PDO::FETCH_ASSOC)['hotel_id'] ?? null;

            if (!$hotel_id) {
                echo json_encode(["status" => "error", "message" => "Habitación no encontrada"]);
                exit;
            }

            // Obtener la capacidad total actual del hotel (sin contar la habitación que se está actualizando)
            $queryCapacidad = "SELECT SUM(t.capacidad) AS capacidad_ocupada 
                               FROM habitaciones h
                               INNER JOIN tipos_habitacion t ON h.tipo_habitacion_id = t.id
                               WHERE h.hotel_id = :hotel_id AND h.id != :id";
            $stmtCapacidad = $conn->prepare($queryCapacidad);
            $stmtCapacidad->bindParam(':hotel_id', $hotel_id, PDO::PARAM_INT);
            $stmtCapacidad->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtCapacidad->execute();
            $capacidadOcupada = $stmtCapacidad->fetch(PDO::FETCH_ASSOC)['capacidad_ocupada'] ?? 0;

            // Obtener la capacidad máxima del hotel
            $queryHotel = "SELECT capacidad FROM hoteles WHERE id = :hotel_id";
            $stmtHotel = $conn->prepare($queryHotel);
            $stmtHotel->bindParam(':hotel_id', $hotel_id, PDO::PARAM_INT);
            $stmtHotel->execute();
            $capacidadMaxima = $stmtHotel->fetch(PDO::FETCH_ASSOC)['capacidad'] ?? 0;

            // Obtener la capacidad de la nueva habitación
            $queryHabitacion = "SELECT capacidad FROM tipos_habitacion WHERE id = :tipo_habitacion_id";
            $stmtHabitacion = $conn->prepare($queryHabitacion);
            $stmtHabitacion->bindParam(':tipo_habitacion_id', $tipo_habitacion_id, PDO::PARAM_INT);
            $stmtHabitacion->execute();
            $capacidadNueva = $stmtHabitacion->fetch(PDO::FETCH_ASSOC)['capacidad'] ?? 0;

            // Validar si la actualización supera la capacidad máxima del hotel
            if (($capacidadOcupada + $capacidadNueva) > $capacidadMaxima) {
                echo json_encode(["status" => "error", "message" => "No se puede actualizar la habitación. Se supera la capacidad máxima del hotel."]);
                exit;
            }

            // Actualizar la habitación
            $queryUpdate = "UPDATE habitaciones 
                            SET tipo_habitacion_id = :tipo_habitacion_id, numero_habitacion = :numero_habitacion, precio = :precio 
                            WHERE id = :id";
            $stmtUpdate = $conn->prepare($queryUpdate);
            $stmtUpdate->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtUpdate->bindParam(':tipo_habitacion_id', $tipo_habitacion_id, PDO::PARAM_INT);
            $stmtUpdate->bindParam(':numero_habitacion', $numero_habitacion, PDO::PARAM_STR);
            $stmtUpdate->bindParam(':precio', $precio, PDO::PARAM_STR);
            $stmtUpdate->execute();

            echo json_encode(["status" => "success", "message" => "Habitación actualizada con éxito."]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Error al actualizar habitación: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No se encontró token de autenticación en la sesión"]);
    }
}
?>
