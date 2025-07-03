<?php
// festivities.php

header('Content-Type: application/json; charset=utf-8');

/**
 * Calcula una fecha dinámica basada en una regla para un año específico.
 *
 * @param int $year El año para el cual calcular la fecha.
 * @param array $rule La regla, ej: ['first', 'monday', 5] para el primer lunes de mayo.
 * @return array|null Un array con ['month', 'day'] o null si la regla es inválida.
 */
function calculate_dynamic_date($year, $rule) {
    if (count($rule) !== 3) return null;

    list($occurrence, $dayOfWeek, $month) = $rule;
    $dayOfWeek = strtolower($dayOfWeek);

    // Crea un timestamp basado en la regla (ej: "first monday of May 2024")
    $time = strtotime("{$occurrence} {$dayOfWeek} of " . date('F', mktime(0, 0, 0, $month, 1, $year)) . " {$year}");

    if ($time) {
        return [
            'month' => (int)date('n', $time),
            'day'   => (int)date('j', $time)
        ];
    }
    return null;
}

$year = (int)date('Y');

// Cargar los datos de festividades desde archivos separados por continente.
$raw_festivities_africa   = require 'africa_festivities.php';
$raw_festivities_america  = require 'america_festivities.php';
$raw_festivities_asia     = require 'asia_festivities.php';
$raw_festivities_europe   = require 'europe_festivities.php';
$raw_festivities_oceania  = require 'oceania_festivities.php';

// Unificar todas las listas en una sola para el procesamiento.
$raw_festivities = array_merge(
    $raw_festivities_africa,
    $raw_festivities_america,
    $raw_festivities_asia,
    $raw_festivities_europe,
    $raw_festivities_oceania
);

// Procesar las reglas para obtener fechas concretas.
$processed_festivities = [];
foreach ($raw_festivities as $country_code => $festivals) {
    $processed_festivities[$country_code] = [];
    foreach ($festivals as $festival) {
        if (isset($festival['rule'])) {
            // Nota: La lógica para 'easter' es más compleja y se omite en esta implementación.
            if (strpos($festival['rule'][2], 'easter') === false) {
                $dynamic_date = calculate_dynamic_date($year, $festival['rule']);
                if ($dynamic_date) {
                    $processed_festivities[$country_code][] = [
                        'name'  => $festival['name'],
                        'month' => $dynamic_date['month'],
                        'day'   => $dynamic_date['day']
                    ];
                }
            }
        } else {
            // Es una fecha fija, se añade directamente.
            $processed_festivities[$country_code][] = $festival;
        }
    }
}

// Imprimir el resultado final en formato JSON.
// Se añade JSON_PRETTY_PRINT para una mejor legibilidad del output.
echo json_encode($processed_festivities, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>