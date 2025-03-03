<?php
require_once '../auth/cors.php';
require_once '../auth/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $destino_id = isset($_GET['id']) ? intval($_GET['id']) : null;

    if (!$destino_id) {
        echo json_encode([
            "status" => "error",
            "message" => "ID de destino no proporcionado"
        ]);
        exit;
    }

    try {
        $stmt = $conn->prepare("
            SELECT lt.id, lt.nombre, lt.descripcion, lt.ubicacion, lt.imagen, c.nombre AS categoria 
            FROM lugares_turisticos lt
            JOIN categorias c ON lt.categoria_id = c.id
            WHERE lt.id = :destino_id
        ");
        $stmt->bindParam(':destino_id', $destino_id, PDO::PARAM_INT);
        $stmt->execute();
        $destino = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($destino) {
            echo json_encode([
                "status" => "success",
                "data" => $destino
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Destino no encontrado"
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener el destino: " . $e->getMessage()
        ]);
    }
}
?>
