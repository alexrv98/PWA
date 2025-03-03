<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'vendor/autoload.php';
require_once 'db.php';
require_once 'cors.php';

use Openpay\Data\Openpay;

$openpay = Openpay::getInstance('m0etd0av2nzfl0bte1oh', 'sk_c1aa3feee361422abb337ed5d88142f6', 'MX', '189.190.42.61');

$input = json_decode(file_get_contents("php://input"), true);

$id_reserva = $input['id'] ?? $input['reservacion_id'] ?? null;

if (!$id_reserva) {
    echo json_encode(['status' => 'error', 'message' => 'ID de reserva requerido']);
    exit;
}

$query = $conn->prepare("SELECT id_transaccion FROM reservaciones WHERE id = ?");
$query->execute([$id_reserva]);
$reserva = $query->fetch();

if (!$reserva) {
    echo json_encode(['status' => 'error', 'message' => 'Reserva no encontrada']);
    exit;
}

try {
    $charge = $openpay->charges->get($reserva['id_transaccion']);
    
    $charge->refund(['amount' => $charge->amount]);

    $update = $conn->prepare("UPDATE reservaciones SET estado = 'cancelada' WHERE id = ?");
    $update->execute([$id_reserva]);

    echo json_encode(['status' => 'success', 'message' => 'Reserva cancelada y reembolso realizado.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
