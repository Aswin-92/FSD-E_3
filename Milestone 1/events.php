<?php
// =============================================================
//  php/events.php – CRUD + SSE stream for events
//  Routes handled via $_GET['action']:
//    publish  POST  – push a new event
//    poll     GET   – long-poll for new events since ?since=<datetime>
//    ack      POST  – acknowledge receipt of an event
//    list     GET   – paginated event list for a channel
//    stats    GET   – dashboard counters
// =============================================================

require_once __DIR__ . '/config.php';   // ← FIXED PATH

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$action = $_GET['action'] ?? 'list';
$db     = getDB();

match ($action) {
    'publish' => publishEvent($db),
    'poll'    => pollEvents($db),
    'ack'     => ackEvent($db),
    'list'    => listEvents($db),
    'stats'   => getStats($db),
    default   => jsonResponse(['error' => 'Unknown action'], 400),
};

// -----------------------------------------------------------
function publishEvent(PDO $db): never {
    $body       = getBody();
    $channelId  = (int)($body['channel_id'] ?? 1);
    $userId     = (int)($body['user_id']    ?? 1);
    $type       = trim($body['type']        ?? 'message');
    $payload    = $body['payload']          ?? [];

    if (!$type || !$payload) {
        jsonResponse(['error' => 'type and payload are required'], 422);
    }

    $stmt = $db->prepare(
        'INSERT INTO events (channel_id, user_id, type, payload, status, created_at)
         VALUES (:ch, :u, :t, :p, "pending", NOW(3))'
    );
    $stmt->execute([
        ':ch' => $channelId,
        ':u'  => $userId,
        ':t'  => $type,
        ':p'  => json_encode($payload),
    ]);
    $id = (int)$db->lastInsertId();

    // write sync log
    $db->prepare(
        'INSERT INTO sync_log (event_id, action, meta) VALUES (:e, "published", :m)'
    )->execute([':e' => $id, ':m' => json_encode(['user_id' => $userId])]);

    jsonResponse(['success' => true, 'event_id' => $id], 201);
}

// -----------------------------------------------------------
function pollEvents(PDO $db): never {
    $channelId = (int)($_GET['channel_id'] ?? 1);
    $since     = $_GET['since'] ?? date('Y-m-d H:i:s', strtotime('-5 seconds'));
    $limit     = min((int)($_GET['limit'] ?? 50), 200);

    $stmt = $db->prepare(
        'SELECT e.id, e.type, e.payload, e.status, e.created_at,
                u.username, u.avatar_color
         FROM   events e
         JOIN   users  u ON u.id = e.user_id
         WHERE  e.channel_id = :ch
           AND  e.created_at > :since
         ORDER  BY e.created_at ASC
         LIMIT  :lim'
    );
    $stmt->bindValue(':ch',    $channelId, PDO::PARAM_INT);
    $stmt->bindValue(':since', $since,     PDO::PARAM_STR);
    $stmt->bindValue(':lim',   $limit,     PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    foreach ($rows as &$r) {
        $r['payload'] = json_decode($r['payload'], true);
    }

    jsonResponse([
        'events'    => $rows,
        'count'     => count($rows),
        'server_ts' => date('Y-m-d H:i:s.') . substr((string)microtime(true), -3),
    ]);
}

// -----------------------------------------------------------
function ackEvent(PDO $db): never {
    $body    = getBody();
    $eventId = (int)($body['event_id'] ?? 0);
    $userId  = (int)($body['user_id']  ?? 0);

    if (!$eventId || !$userId) {
        jsonResponse(['error' => 'event_id and user_id required'], 422);
    }

    $db->prepare(
        'INSERT IGNORE INTO event_acks (event_id, user_id) VALUES (:e, :u)'
    )->execute([':e' => $eventId, ':u' => $userId]);

    $db->prepare(
        'UPDATE events SET status = "acknowledged" WHERE id = :e'
    )->execute([':e' => $eventId]);

    $db->prepare(
        'INSERT INTO sync_log (event_id, action, meta) VALUES (:e, "acknowledged", :m)'
    )->execute([':e' => $eventId, ':m' => json_encode(['user_id' => $userId])]);

    jsonResponse(['success' => true]);
}

// -----------------------------------------------------------
function listEvents(PDO $db): never {
    $channelId = (int)($_GET['channel_id'] ?? 1);
    $page      = max(1, (int)($_GET['page'] ?? 1));
    $perPage   = min((int)($_GET['per_page'] ?? 20), 100);
    $offset    = ($page - 1) * $perPage;

    $total = (int)$db->query(
        "SELECT COUNT(*) FROM events WHERE channel_id = $channelId"
    )->fetchColumn();

    $stmt = $db->prepare(
        'SELECT e.id, e.type, e.payload, e.status, e.created_at,
                u.username, u.avatar_color
         FROM   events e
         JOIN   users  u ON u.id = e.user_id
         WHERE  e.channel_id = :ch
         ORDER  BY e.created_at DESC
         LIMIT  :lim OFFSET :off'
    );
    $stmt->bindValue(':ch',  $channelId, PDO::PARAM_INT);
    $stmt->bindValue(':lim', $perPage,   PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset,    PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    foreach ($rows as &$r) {
        $r['payload'] = json_decode($r['payload'], true);
    }

    jsonResponse([
        'events'     => $rows,
        'pagination' => [
            'page'       => $page,
            'per_page'   => $perPage,
            'total'      => $total,
            'last_page'  => (int)ceil($total / $perPage),
        ],
    ]);
}

// -----------------------------------------------------------
function getStats(PDO $db): never {
    $row = $db->query(
        'SELECT
           COUNT(*)                                              AS total_events,
           SUM(status = "pending")                              AS pending,
           SUM(status = "delivered")                            AS delivered,
           SUM(status = "acknowledged")                         AS acknowledged,
           SUM(status = "failed")                               AS failed,
           COUNT(DISTINCT channel_id)                           AS active_channels,
           COUNT(CASE WHEN created_at >= NOW() - INTERVAL 1 MINUTE THEN 1 END) AS last_minute
         FROM events'
    )->fetch();

    $users = $db->query('SELECT COUNT(*) FROM users WHERE is_online = 1')->fetchColumn();

    jsonResponse([
        'events'       => $row,
        'online_users' => (int)$users,
        'server_time'  => date('c'),
    ]);
}
