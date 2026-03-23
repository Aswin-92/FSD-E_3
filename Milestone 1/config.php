<?php
// =============================================================
//  config.php – Database & App Configuration
//  Place this file in the project root (htdocs/rtese/)
// =============================================================

define('DB_HOST',     'localhost');
define('DB_USER',     'root');        // XAMPP default
define('DB_PASS',     '');            // XAMPP default (empty)
define('DB_NAME',     'rtese_db');
define('DB_CHARSET',  'utf8mb4');
define('APP_NAME',    'RTESE');
define('POLL_INTERVAL', 2);           // seconds between client polls

// -----------------------------------------------------------
// PDO singleton
// -----------------------------------------------------------
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST, DB_NAME, DB_CHARSET
        );
        $opts = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $opts);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'DB connection failed: ' . $e->getMessage()]));
        }
    }
    return $pdo;
}

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
function jsonResponse(mixed $data, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function getBody(): array {
    $raw = file_get_contents('php://input');
    return $raw ? (json_decode($raw, true) ?? []) : [];
}
