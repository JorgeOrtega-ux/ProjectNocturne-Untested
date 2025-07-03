<?php
// europe_festivities.php

return [
    'FR' => [
        ['name' => 'Día del Trabajo', 'month' => 5, 'day' => 1],
        ['name' => 'Día de la Victoria en Europa', 'month' => 5, 'day' => 8],
        ['name' => 'Jueves de la Ascensión', 'rule' => ['sixth', 'thursday', 'after_easter']],
        ['name' => 'Fiesta Nacional de Francia', 'month' => 7, 'day' => 14],
        ['name' => 'Asunción de María', 'month' => 8, 'day' => 15],
        ['name' => 'Día de Todos los Santos', 'month' => 11, 'day' => 1],
        ['name' => 'Día del Armisticio', 'month' => 11, 'day' => 11],
    ],
    'IT' => [
        ['name' => 'Epifanía', 'month' => 1, 'day' => 6],
        ['name' => 'Lunes de Pascua', 'rule' => ['monday', 'after', 'easter']],
        ['name' => 'Día de la Liberación', 'month' => 4, 'day' => 25],
        ['name' => 'Día del Trabajo', 'month' => 5, 'day' => 1],
        ['name' => 'Fiesta de la República', 'month' => 6, 'day' => 2],
        ['name' => 'Ferragosto (Asunción)', 'month' => 8, 'day' => 15],
        ['name' => 'Día de Todos los Santos', 'month' => 11, 'day' => 1],
    ],
    'ES' => [
        ['name' => 'Epifanía del Señor', 'month' => 1, 'day' => 6],
        ['name' => 'Viernes Santo', 'rule' => ['friday', 'before', 'easter']],
        ['name' => 'Día del Trabajo', 'month' => 5, 'day' => 1],
        ['name' => 'Asunción de la Virgen', 'month' => 8, 'day' => 15],
        ['name' => 'Fiesta Nacional de España', 'month' => 10, 'day' => 12],
        ['name' => 'Día de Todos los Santos', 'month' => 11, 'day' => 1],
        ['name' => 'Día de la Constitución', 'month' => 12, 'day' => 6],
    ],
    'GB' => [
        ['name' => 'Viernes Santo', 'rule' => ['friday', 'before', 'easter']],
        ['name' => 'Lunes de Pascua', 'rule' => ['monday', 'after', 'easter']],
        ['name' => 'Early May Bank Holiday', 'rule' => ['first', 'monday', 5]],
        ['name' => 'Spring Bank Holiday', 'rule' => ['last', 'monday', 5]],
        ['name' => 'Summer Bank Holiday', 'rule' => ['last', 'monday', 8]],
        ['name' => 'Boxing Day', 'month' => 12, 'day' => 26],
    ],
    'DE' => [
        ['name' => 'Viernes Santo', 'rule' => ['friday', 'before', 'easter']],
        ['name' => 'Lunes de Pascua', 'rule' => ['monday', 'after', 'easter']],
        ['name' => 'Día del Trabajo', 'month' => 5, 'day' => 1],
        ['name' => 'Día de la Ascensión', 'rule' => ['sixth', 'thursday', 'after_easter']],
        ['name' => 'Lunes de Pentecostés', 'rule' => ['eighth', 'monday', 'after_easter']],
        ['name' => 'Día de la Unidad Alemana', 'month' => 10, 'day' => 3],
    ],
];
?>