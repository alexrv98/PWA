<?php
session_set_cookie_params([
    'lifetime' => 3600, 
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false, 
    'httponly' => true,
    'samesite' => 'Lax',
]);