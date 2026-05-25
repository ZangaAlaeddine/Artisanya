<?php
/**
 * Artisanya Tunisia - Super Bridge API
 * V2.9 - Force-Detection Mode (PHP 5.6+)
 */

// Jeton de sécurité
define('FRONTEND_SECRET', 'Artisanya2026Key');

// Configuration des en-têtes CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Artisanya-Token");
header("Content-Type: application/json");

// Gestion du Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// --- DÉTECTION DU JETON (TENTATIVE AGRESSIVE) ---
$token_recu = '';

// 1. Priorité à $_REQUEST (regroupe GET et POST)
if (isset($_REQUEST['token'])) {
    $token_recu = $_REQUEST['token'];
}

// 2. Si vide, vérifier la QUERY_STRING directement
if (empty($token_recu) && isset($_SERVER['QUERY_STRING'])) {
    parse_str($_SERVER['QUERY_STRING'], $qs_params);
    if (isset($qs_params['token'])) $token_recu = $qs_params['token'];
}

// 3. Cas spécial Apache REDIRECT
if (empty($token_recu) && isset($_SERVER['REDIRECT_QUERY_STRING'])) {
    parse_str($_SERVER['REDIRECT_QUERY_STRING'], $rqs_params);
    if (isset($rqs_params['token'])) $token_recu = $rqs_params['token'];
}

// 4. Si toujours vide, vérifier le JSON
if (empty($token_recu)) {
    $raw_input = file_get_contents('php://input');
    $json_input = json_decode($raw_input, true);
    if (isset($json_input['token'])) $token_recu = $json_input['token'];
}

// 5. Vérifier les en-têtes HTTP (Headers)
if (empty($token_recu)) {
    // Liste des clés de headers possibles dans $_SERVER
    $header_keys = array('HTTP_X_ARTISANYA_TOKEN', 'X_ARTISANYA_TOKEN', 'HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION');
    foreach ($header_keys as $key) {
        if (isset($_SERVER[$key])) {
            $val = $_SERVER[$key];
            if (stripos($val, 'Bearer ') === 0) $val = substr($val, 7);
            $token_recu = $val;
            break;
        }
    }
}

$token_recu = trim($token_recu);

// --- VALIDATION DU JETON ---
if ($token_recu !== FRONTEND_SECRET) {
    http_response_code(403);
    echo json_encode(array(
        'success' => false, 
        'error' => 'Jeton invalide.',
        'debug' => array(
            'received' => $token_recu,
            'expected' => FRONTEND_SECRET,
            'method' => $_SERVER['REQUEST_METHOD'],
            'request_uri' => $_SERVER['REQUEST_URI'],
            'server_qs' => isset($_SERVER['QUERY_STRING']) ? $_SERVER['QUERY_STRING'] : 'none',
            'all_params' => $_REQUEST
        )
    ));
    exit;
}

// --- CONFIGURATION BASE DE DONNÉES ---
$db_host = 'localhost';
$db_name = 'artisanya_db';
$db_user = 'root'; 
$db_pass = ''; 

// Détection de l'action
$action = 'status';
if (isset($_REQUEST['action'])) $action = $_REQUEST['action'];
elseif (isset($qs_params['action'])) $action = $qs_params['action'];
elseif (isset($json_input['action'])) $action = $json_input['action'];

try {
    $pdo = new PDO("mysql:host=$db_host;charset=utf8mb4", $db_user, $db_pass, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));

    if ($action === 'status') {
        $diag = array('mysql_server' => 'online', 'database_exists' => false, 'tables_ready' => false, 'php_version' => PHP_VERSION);
        $stmt = $pdo->query("SHOW DATABASES LIKE '$db_name'");
        if ($stmt->fetch()) {
            $diag['database_exists'] = true;
            $pdo->exec("USE `$db_name`");
            $required = array('users', 'artisans', 'products', 'categories');
            $found = 0;
            foreach ($required as $table) {
                $res = $pdo->query("SHOW TABLES LIKE '$table'");
                if ($res->fetch()) $found++;
            }
            $diag['tables_ready'] = ($found === count($required));
        }
        echo json_encode(array('status' => ($diag['database_exists'] && $diag['tables_ready']) ? 'connected' : 'error', 'diagnostics' => $diag));
        exit;
    }

    if ($action === 'get_products') {
        $pdo->exec("USE `$db_name`");
        $stmt = $pdo->query("SELECT * FROM products WHERE status = 'Approved' LIMIT 20");
        echo json_encode(array('success' => true, 'products' => $stmt->fetchAll()));
        exit;
    }

    echo json_encode(array('success' => true, 'message' => 'API OK', 'action' => $action));

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => $e->getMessage()));
}
