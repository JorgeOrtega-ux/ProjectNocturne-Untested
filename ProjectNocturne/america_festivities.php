<?php
// america_festivities.php

return [
    'US' => [
        ['name' => 'Día de Martin Luther King, Jr.', 'rule' => ['third', 'monday', 1]],
        ['name' => 'Día de los Presidentes', 'rule' => ['third', 'monday', 2]],
        ['name' => 'Día de los Caídos', 'rule' => ['last', 'monday', 5]],
        ['name' => 'Juneteenth', 'month' => 6, 'day' => 19],
        ['name' => 'Día de la Independencia', 'month' => 7, 'day' => 4],
        ['name' => 'Día del Trabajo', 'rule' => ['first', 'monday', 9]],
        ['name' => 'Día de Acción de Gracias', 'rule' => ['fourth', 'thursday', 11]],
    ],
    'BR' => [
        ['name' => 'Carnaval', 'month' => 2, 'day' => 28], // Variable
        ['name' => 'Tiradentes', 'month' => 4, 'day' => 21],
        ['name' => 'Día del Trabajo', 'month' => 5, 'day' => 1],
        ['name' => 'Corpus Christi', 'month' => 6, 'day' => 19], // Variable
        ['name' => 'Día de la Independencia', 'month' => 9, 'day' => 7],
        ['name' => 'Nuestra Señora de Aparecida', 'month' => 10, 'day' => 12],
        ['name' => 'Proclamación de la República', 'month' => 11, 'day' => 15],
    ],
    'MX' => [
        ['name' => 'Día de la Constitución', 'rule' => ['first', 'monday', 2]],
        ['name' => 'Natalicio de Benito Juárez', 'rule' => ['third', 'monday', 3]],
        ['name' => 'Día del Trabajo', 'month' => 5, 'day' => 1],
        ['name' => 'Día de la Independencia', 'month' => 9, 'day' => 16],
        ['name' => 'Día de la Revolución', 'rule' => ['third', 'monday', 11]],
        ['name' => 'Navidad', 'month' => 12, 'day' => 25],
    ],
    'AR' => [
        ['name' => 'Día Nacional de la Memoria por la Verdad y la Justicia', 'month' => 3, 'day' => 24],
        ['name' => 'Día del Veterano y de los Caídos en la Guerra de Malvinas', 'month' => 4, 'day' => 2],
        ['name' => 'Día de la Revolución de Mayo', 'month' => 5, 'day' => 25],
        ['name' => 'Paso a la Inmortalidad del Gral. Manuel Belgrano', 'month' => 6, 'day' => 20],
        ['name' => 'Día de la Independencia', 'month' => 7, 'day' => 9],
        ['name' => 'Paso a la Inmortalidad del Gral. José de San Martín', 'month' => 8, 'day' => 17],
        ['name' => 'Día del Respeto a la Diversidad Cultural', 'month' => 10, 'day' => 12],
    ],
    'CA' => [
        ['name' => 'Viernes Santo', 'rule' => ['friday', 'before', 'easter']],
        ['name' => 'Día de Victoria', 'rule' => ['last', 'monday', 5]], // Nota: Es el lunes anterior al 25 de mayo, esta regla es una aproximación.
        ['name' => 'Día de Canadá', 'month' => 7, 'day' => 1],
        ['name' => 'Día del Trabajo', 'rule' => ['first', 'monday', 9]],
        ['name' => 'Día de Acción de Gracias', 'rule' => ['second', 'monday', 10]],
        ['name' => 'Día del Recuerdo', 'month' => 11, 'day' => 11],
    ],
];
?>