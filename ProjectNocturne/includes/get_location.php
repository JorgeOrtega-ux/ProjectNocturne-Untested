<?php
header('Content-Type: application/json');

/**
 * Obtiene la dirección IP real del visitante.
 * @return string La dirección IP.
 */
function get_user_ip() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    // En caso de que vengan múltiples IPs, tomamos la primera.
    return explode(',', $ip)[0];
}

$user_ip = get_user_ip();

// Verificar si cURL está habilitado.
if (!function_exists('curl_init')) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error del servidor: la extensión cURL de PHP no está habilitada.',
        'ip_detected' => $user_ip
    ]);
    exit;
}

// Llamada a la API de ipwho.is usando la IP detectada directamente.
$url = "http://ipwho.is/{$user_ip}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response_body = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

// Análisis final de la respuesta
$final_response = json_decode($response_body, true);

// Añadimos información de depuración a la respuesta final
if (!is_array($final_response)) {
    $final_response = [];
}
$final_response['debug_info'] = [
    'ip_used_for_api' => $user_ip,
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