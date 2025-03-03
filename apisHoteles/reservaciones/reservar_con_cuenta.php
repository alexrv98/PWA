<?php
require_once '../auth/cors.php';
require_once '../auth/db.php';
require_once '../auth/jwt_verify.php';

session_start();

if (isset($_SESSION['auth_token'])) {
    $jwt = $_SESSION['auth_token'];
    $usuario = verificarToken($jwt); 
    if ($usuario) {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            !$data ||
            !isset($data['usuario_id']) ||
            !isset($data['habitacion_id']) ||
            !isset($data['fechaInicio']) ||
            !isset($data['fechaFin']) ||
            !isset($data['num_adultos']) ||
            !isset($data['num_ninos']) ||
            !isset($data['totalReserva']) ||
            !isset($data['id_transaccion'])
        ) {
            echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
            exit;
        }

        // Asignar variables
        $usuario_id = $data['usuario_id'];
        $habitacion_id = $data['habitacion_id'];
        $fechaInicio = $data['fechaInicio'];
        $fechaFin = $data['fechaFin'];
        $totalReserva = $data['totalReserva'];
        $num_adultos = $data['num_adultos'];
        $num_ninos = $data['num_ninos'];
        $id_transaccion = $data['id_transaccion'];

        try {
            // Insertar en la base de datos
            $stmt = $conn->prepare("INSERT INTO reservaciones (usuario_id, habitacion_id, fecha_inicio, fecha_fin, total_a_pagar, num_adultos, num_ninos, estado, id_transaccion) 
            VALUES (:usuario_id, :habitacion_id, :fechaInicio, :fechaFin, :totalReserva, :num_adultos, :num_ninos, :estado, :id_transaccion)");

            $stmt->execute([
                ':usuario_id' => $usuario_id,
                ':habitacion_id' => $habitacion_id,
                ':fechaInicio' => $fechaInicio,
                ':fechaFin' => $fechaFin,
                ':totalReserva' => $totalReserva,
                ':num_adultos' => $num_adultos,
                ':num_ninos' => $num_ninos,
                ':estado' => 'confirmada',
                ':id_transaccion' => $id_transaccion
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Reserva realizada con éxito']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Token inválido o expirado']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'No se encontró token de autenticación']);
}
?>
