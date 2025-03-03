<?php
require_once '../auth/cors.php';
require_once '../auth/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $data = json_decode($inputJSON, true);

    $destino = $data['destino']; 
    $fechaInicio = $data['fechaInicio'];  
    $fechaFin = $data['fechaFin'];  
    $numHuespedes = $data['numHuespedes'] ?? null;  
    $numCamas = $data['numCamas'] ?? null; 

    try {
        $stmt = $conn->prepare("
            SELECT 
                h.id, 
                h.nombre, 
                h.descripcion, 
                h.direccion, 
                h.telefono, 
                h.capacidad,
                h.imagenes, 
                lt.nombre AS lugar, 
                lt.ubicacion
            FROM hoteles h
            JOIN lugares_turisticos lt ON h.lugar_id = lt.id
            WHERE h.lugar_id = :destino
            AND EXISTS (
                SELECT 1
                FROM habitaciones ha
                JOIN tipos_habitacion th ON ha.tipo_habitacion_id = th.id
                WHERE ha.hotel_id = h.id
                AND ha.id NOT IN (
                    SELECT r.habitacion_id 
                    FROM reservaciones r
                    WHERE (r.fecha_inicio <= :fechaFin AND r.fecha_fin >= :fechaInicio)
                )
            )
        ");

        // Asignar los parámetros
        $stmt->bindParam(':destino', $destino, PDO::PARAM_INT);
        $stmt->bindParam(':fechaInicio', $fechaInicio, PDO::PARAM_STR);
        $stmt->bindParam(':fechaFin', $fechaFin, PDO::PARAM_STR);

        // Ejecutar la consulta
        $stmt->execute();

        // Obtener los resultados
        $hoteles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => $hoteles
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener hoteles: " . $e->getMessage()
        ]);
    }
}
?>
