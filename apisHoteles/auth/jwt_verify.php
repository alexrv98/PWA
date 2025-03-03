<?php
define('JWT_SECRET_KEY', 'DTIConsultores88RAVa$21');
function verificarToken($jwt) {  // Recibimos el token como parámetro
    try {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) {
            throw new Exception("Formato de token inválido");
        }

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $providedSignature = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[2]));

        $expectedSignature = hash_hmac('sha256', "$tokenParts[0].$tokenParts[1]", JWT_SECRET_KEY, true);
        if (!hash_equals($expectedSignature, $providedSignature)) {
            throw new Exception("Firma del token inválida");
        }

        $decodedPayload = json_decode($payload, true);

        if (!isset($decodedPayload['exp']) || $decodedPayload['exp'] < time()) {
            throw new Exception("Token expirado");
        }

        return $decodedPayload;  // Devuelve el payload del token

    } catch (Exception $e) {
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
        http_response_code(401);
        exit;
    }
}
