<?php
require_once '../auth/cors.php';
require_once '../auth/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "SELECT id, nombre, capacidad, camas FROM tipos_habitacion";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $tipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => $tipos
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener tipos de habitación: " . $e->getMessage()
        ]);
    }
}
?>
