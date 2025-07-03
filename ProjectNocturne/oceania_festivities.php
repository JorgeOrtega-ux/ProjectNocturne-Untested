<?php
// oceania_festivities.php

return [
    'AU' => [
        ['name' => 'Día de Australia', 'month' => 1, 'day' => 26],
        ['name' => 'Viernes Santo', 'rule' => ['friday', 'before', 'easter']],
        ['name' => 'Día de Anzac', 'month' => 4, 'day' => 25],
        ['name' => 'Cumpleaños del Rey', 'rule' => ['second', 'monday', 6]],
        ['name' => 'Navidad', 'month' => 12, 'day' => 25],
        ['name' => 'Boxing Day', 'month' => 12, 'day' => 26],
    ],
    'NZ' => [
        ['name' => 'Día de Waitangi', 'month' => 2, 'day' => 6],
        ['name' => 'Viernes Santo', 'rule' => ['friday', 'before', 'easter']],
        ['name' => 'Lunes de Pascua', 'rule' => ['monday', 'after', 'easter']],
        ['name' => 'Día de Anzac', 'month' => 4, 'day' => 25],
        ['name' => 'Cumpleaños del Rey', 'rule' => ['first', 'monday', 6]],
        ['name' => 'Día del Trabajo', 'rule' => ['fourth', 'monday', 10]],
    ],
    'FJ' => [
        ['name' => 'Viernes Santo', 'rule' => ['friday', 'before', 'easter']],
        ['name' => 'Sábado de Pascua', 'rule' => ['saturday', 'after', 'easter']],
        ['name' => 'Día de Ratu Sir Lala Sukuna', 'month' => 5, 'day' => 31],
        ['name' => 'Día de Fiyi', 'month' => 10, 'day' => 10],
        ['name' => 'Diwali', 'month' => 11, 'day' => 1], // Variable
    ],
    'PG' => [
        ['name' => 'Cumpleaños del Rey', 'rule' => ['second', 'monday', 6]],
        ['name' => 'Día Nacional del Recuerdo', 'month' => 7, 'day' => 23],
        ['name' => 'Día Nacional del Arrepentimiento', 'month' => 8, 'day' => 26],
        ['name' => 'Día de la Independencia', 'month' => 9, 'day' => 16],
    ],
    'WS' => [
        ['name' => 'Día de la Independencia', 'month' => 6, 'day' => 1],
        ['name' => 'Día del Padre', 'rule' => ['second', 'monday', 8]],
        ['name' => 'Día de la Madre', 'rule' => ['second', 'monday', 5]],
        ['name' => 'Lotu a Tamaiti (Día del Niño)', 'rule' => ['second', 'monday', 10]],
    ],
];
?>