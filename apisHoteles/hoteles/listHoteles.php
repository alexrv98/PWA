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

        if (!$usuario || !isset($usuario['id'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Usuario no autenticado"
            ]);
            exit;
        }

        $usuario_id = intval($usuario['id']);

        $lugar_id = isset($_GET['lugar_id']) ? intval($_GET['lugar_id']) : null;

        if (!isset($usuario_id)) {
            echo json_encode([
                "status" => "error",
                "message" => "Falta el parámetro usuario_id"
            ]);
            exit;
        }

        try {
            $query = "SELECT h.id, h.nombre, h.descripcion, h.lugar_id, l.nombre AS lugar_nombre, l.ubicacion AS lugar_ubicacion, 
                             h.direccion, h.telefono, h.imagenes, h.capacidad 
                      FROM hoteles h
                      INNER JOIN lugares_turisticos l ON h.lugar_id = l.id
                      WHERE h.usuario_id = :usuario_id";

            if ($lugar_id) {
                $query .= " AND h.lugar_id = :lugar_id";
            }

            $stmt = $conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);

            if ($lugar_id) {
                $stmt->bindParam(':lugar_id', $lugar_id, PDO::PARAM_INT);
            }

            $stmt->execute();
            $hoteles = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success",
                "data" => $hoteles
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener los hoteles: " . $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No se encontró token de autenticación en la sesión"
        ]);
    }
}
?>
