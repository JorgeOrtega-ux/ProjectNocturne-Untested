<?php
header('Content-Type: application/json');
// Permitimos que el script sea llamado desde el frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// El script solo debe responder a peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        'success' => false,
        'message' => 'Error: Se esperaba una petición POST.'
    ]);
    exit;
}

// Leemos el cuerpo de la petición JSON que envía el JavaScript
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Verificamos que se haya enviado una IP
if (!$data || !isset($data['ip'])) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => 'Error: No se proporcionó una dirección IP.'
    ]);
    exit;
}

$ip_to_check = $data['ip'];

// Validamos que la IP recibida sea una IP válida
if (!filter_var($ip_to_check, FILTER_VALIDATE_IP)) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => 'Error: La dirección IP proporcionada no es válida.',
        'ip_received' => $ip_to_check
    ]);
    exit;
}

// Verificar si cURL está habilitado.
if (!function_exists('curl_init')) {
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: la extensión cURL de PHP no está habilitada.'
    ]);
    exit;
}

// Usamos la IP recibida para la llamada a la API.
$url = "http://ipwho.is/{$ip_to_check}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response_body = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

$final_response = json_decode($response_body, true);

if (!is_array($final_response)) {
    $final_response = [];
}
// Añadimos información de depuración para confirmar qué IP se usó
$final_response['debug_info'] = [
    'ip_received_from_client' => $ip_to_check,
];

if ($curl_error) {
    $final_response['success'] = false;
    $final_response['message'] = 'Error de cURL: ' . $curl_error;
} elseif ($httpcode < 200 || $httpcode >= 300) {
    $final_response['success'] = false;
    if (!isset($final_response['message'])) {
      $final_response['message'] = 'El servicio de ubicación devolvió un error. Código: ' . $httpcode;
    }
}

echo json_encode($final_response);
?>