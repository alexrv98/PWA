<?php
header("Access-Control-Allow-Origin: http://localhost:8081");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejo de preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Forzar JSON en la respuesta
header('Content-Type: application/json');

// Permitir caché en Service Worker
header("Cache-Control: public, max-age=86400, s-maxage=86400");