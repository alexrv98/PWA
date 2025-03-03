<?php
require_once '../auth/cors.php';
require_once '../auth/db.php';
require_once '../auth/jwt_verify.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $habitacion_id = isset($_GET['habitacion_id']) ? intval($_GET['habitacion_id']) : null;

    if ($habitacion_id === null) {
        echo json_encode([
            "status" => "error",
            "message" => "El parámetro habitacion_id es obligatorio"
        ]);
        exit;
    }

    try {
        $query = "SELECT i.id AS imagen_id, i.img_url
                  FROM imagenes_habitacion i
                  WHERE i.habitacion_id = :habitacion_id";

        $stmt = $conn->prepare($query);
        $stmt->bindParam(':habitacion_id', $habitacion_id, PDO::PARAM_INT);
        $stmt->execute();
        $imagenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($imagenes) > 0) {
            echo json_encode([
                "status" => "success",
                "data" => $imagenes
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "No se encontraron imágenes para la habitación solicitada"
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener imágenes: " . $e->getMessage()
        ]);
    }
}
?>
