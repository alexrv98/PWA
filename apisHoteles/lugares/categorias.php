<?php
require_once '../auth/cors.php';
require_once '../auth/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->prepare("SELECT id, nombre FROM categorias");
        $stmt->execute();
        $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => $categorias
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener las categorías: " . $e->getMessage()
        ]);
    }
}
?>
