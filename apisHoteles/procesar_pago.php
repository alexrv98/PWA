<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'vendor/autoload.php';
require_once 'db.php';
require_once 'cors.php';

use Openpay\Data\Openpay;  

$openpay = Openpay::getInstance(
    'm0etd0av2nzfl0bte1oh',    
    'sk_c1aa3feee361422abb337ed5d88142f6', 
    'MX',                       
    '189.190.42.61'             
);

$input = json_decode(file_get_contents("php://input"), true);

if (
    !isset($input['token']) ||
    !isset($input['totalReserva']) ||
    !isset($input['device_session_id']) ||
    !isset($input['cliente'])
) {
    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
    exit;
}

$cliente = $input['cliente'];
$nombre = isset($cliente['nombre']) ? trim($cliente['nombre']) : 'Cliente';
$apellido = isset($cliente['apellido']) ? trim($cliente['apellido']) : 'Desconocido';
$correo = isset($cliente['correo']) ? trim($cliente['correo']) : 'cliente@ejemplo.com';
$telefono = isset($cliente['telefono']) ? trim($cliente['telefono']) : '1234567890';
$direccion = isset($cliente['direccion']) ? trim($cliente['direccion']) : 'Calle Ficticia 123';
$estado = isset($cliente['estado']) ? trim($cliente['estado']) : 'CDMX';
$ciudad = isset($cliente['ciudad']) ? trim($cliente['ciudad']) : 'Ciudad de México';
$codigo_postal = isset($cliente['codigo_postal']) ? trim($cliente['codigo_postal']) : '12345';

try {
    $customer = $openpay->customers->add([
        'name' => $nombre,
        'last_name' => $apellido,
        'email' => $correo,
        'phone_number' => $telefono,
        'address' => [
            'line1' => $direccion,
            'state' => $estado,
            'city' => $ciudad,
            'postal_code' => $codigo_postal,
            'country_code' => 'MX'
        ]
    ]);

    if (isset($input['expiration_year']) && strlen($input['expiration_year']) == 4) {
        $expiration_year = substr($input['expiration_year'], -2); 
    } else {
        $expiration_year = isset($input['expiration_year']) ? $input['expiration_year'] : '99';
    }

    $chargeData = [
        'method' => 'card',
        'source_id' => $input['token'],
        'amount' => (float) $input['totalReserva'],
        'currency' => 'MXN',
        'description' => 'Pago de reservación',
        'device_session_id' => $input['device_session_id']
    ];

    $charge = $customer->charges->create($chargeData);

    echo json_encode([
        'status' => 'success',
        'message' => 'Pago exitoso',
        'transaction_id' => $charge->id
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
