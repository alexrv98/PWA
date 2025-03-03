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

        $data = json_decode(file_get_contents("php://input"), true);
        $hotel_id = $data['hotel_id'] ?? null;
        $tipo_habitacion_id = $data['tipo_habitacion_id'] ?? null;
        $numero_habitacion = $data['numero_habitacion'] ?? null;
        $precio = $data['precio'] ?? null;
        $img_url = $data['img_url'] ?? null;

        if (!$hotel_id || !$tipo_habitacion_id || !$numero_habitacion || !$precio || !$img_url) {
            echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios"]);
            exit;
        }

        try {
            // Obtener la capacidad total actual del hotel
            $queryCapacidad = "SELECT SUM(t.capacidad) AS capacidad_ocupada
                               FROM habitaciones h
                               INNER JOIN tipos_habitacion t ON h.tipo_habitacion_id = t.id
                               WHERE h.hotel_id = :hotel_id";
            $stmtCapacidad = $conn->prepare($queryCapacidad);
            $stmtCapacidad->bindParam(':hotel_id', $hotel_id, PDO::PARAM_INT);
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

            if (($capacidadOcupada + $capacidadNueva) > $capacidadMaxima) {
                echo json_encode(["status" => "error", "message" => "No se puede agregar la habitación. Se supera la capacidad máxima del hotel."]);
                exit;
            }

            // Insertar la nueva habitación
            $queryInsert = "INSERT INTO habitaciones (hotel_id, tipo_habitacion_id, numero_habitacion, precio)
                            VALUES (:hotel_id, :tipo_habitacion_id, :numero_habitacion, :precio)";
            $stmtInsert = $conn->prepare($queryInsert);
            $stmtInsert->bindParam(':hotel_id', $hotel_id, PDO::PARAM_INT);
            $stmtInsert->bindParam(':tipo_habitacion_id', $tipo_habitacion_id, PDO::PARAM_INT);
            $stmtInsert->bindParam(':numero_habitacion', $numero_habitacion, PDO::PARAM_STR);
            $stmtInsert->bindParam(':precio', $precio, PDO::PARAM_STR);
            $stmtInsert->execute();

            // Obtener el ID de la habitación recién insertada
            $habitacion_id = $conn->lastInsertId();

            // Insertar la imagen de la habitación
            $queryImagen = "INSERT INTO imagenes_habitacion (habitacion_id, img_url)
            VALUES (:habitacion_id, :img_url)";
            $stmtImagen = $conn->prepare($queryImagen);
            $stmtImagen->bindParam(':habitacion_id', $habitacion_id, PDO::PARAM_INT);
            $stmtImagen->bindParam(':img_url', $img_url, PDO::PARAM_STR);
            $stmtImagen->execute();

            echo json_encode(["status" => "success", "message" => "Habitación agregada exitosamente."]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Error al agregar habitación: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No se encontró token de autenticación en la sesión"]);
    }
}
?>
