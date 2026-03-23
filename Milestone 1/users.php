<?php
// =============================================================
//  php/users.php  – User & Channel management
// =============================================================

require_once __DIR__ . '/config.php';   // ← FIXED PATH

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$action = $_GET['action'] ?? 'list';
$db     = getDB();

match ($action) {
    'list'      => listUsers($db),
    'login'     => loginUser($db),
    'heartbeat' => heartbeat($db),
    'channels'  => listChannels($db),
    default     => jsonResponse(['error' => 'Unknown action'], 400),
};

// -----------------------------------------------------------
function listUsers(PDO $db): never {
    $rows = $db->query(
        'SELECT id, username, email, avatar_color, role, is_online, last_seen
         FROM users ORDER BY username'
    )->fetchAll();
    jsonResponse(['users' => $rows]);
}

// -----------------------------------------------------------
function loginUser(PDO $db): never {
    $user = trim($_GET['username'] ?? $_POST['username'] ?? '');
    $pass = trim($_GET['password'] ?? $_POST['password'] ?? '');

    if (!$user || !$pass) {
        jsonResponse(['error' => 'Username and password are required'], 422);
    }

    // Try MD5 password first, then plain text (fallback)
    $stmt = $db->prepare(
        'SELECT id, username, email, avatar_color, role
         FROM users WHERE username = :u AND (password = MD5(:p) OR password = :p2)'
    );
    $stmt->execute([':u' => $user, ':p' => $pass, ':p2' => $pass]);
    $row = $stmt->fetch();

    if (!$row) {
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }

    // mark online
    $db->prepare('UPDATE users SET is_online = 1, last_seen = NOW() WHERE id = :id')
       ->execute([':id' => $row['id']]);

    jsonResponse(['success' => true, 'user' => $row]);
}

// -----------------------------------------------------------
function heartbeat(PDO $db): never {
    $userId = (int)($_GET['user_id'] ?? 0);
    if ($userId) {
        $db->prepare('UPDATE users SET is_online = 1, last_seen = NOW() WHERE id = :id')
           ->execute([':id' => $userId]);
    }
    jsonResponse(['ok' => true, 'ts' => date('c')]);
}

// -----------------------------------------------------------
function listChannels(PDO $db): never {
    $rows = $db->query(
        'SELECT c.id, c.name, c.description, c.color,
                u.username AS created_by,
                (SELECT COUNT(*) FROM events e WHERE e.channel_id = c.id) AS event_count
         FROM channels c
         JOIN users u ON u.id = c.created_by
         ORDER BY c.name'
    )->fetchAll();
    jsonResponse(['channels' => $rows]);
}
