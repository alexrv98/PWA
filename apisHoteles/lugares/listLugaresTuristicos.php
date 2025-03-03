<?php
require_once '../auth/cors.php';
require_once '../auth/db.php';
require_once '../auth/jwt_verify.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $categoria_id = isset($_GET['categoria_id']) ? $_GET['categoria_id'] : null;

    try {
        if ($categoria_id) {
            $stmt = $conn->prepare("
                SELECT lt.id, lt.nombre, lt.descripcion, lt.ubicacion, lt.imagen, 
                       lt.latitud, lt.longitud, c.nombre AS categoria 
                FROM lugares_turisticos lt
                JOIN categorias c ON lt.categoria_id = c.id
                WHERE lt.categoria_id = :categoria_id
            ");
            $stmt->bindParam(':categoria_id', $categoria_id, PDO::PARAM_INT);
        } else {
            $stmt = $conn->prepare("
                SELECT lt.id, lt.nombre, lt.descripcion, lt.ubicacion, lt.imagen, 
                       lt.latitud, lt.longitud, c.nombre AS categoria 
                FROM lugares_turisticos lt
                JOIN categorias c ON lt.categoria_id = c.id
            ");
        }

        $stmt->execute();
        $lugares = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => $lugares
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener los lugares turísticos: " . $e->getMessage()
        ]);
    }
}
?>