// /assets/js/tools/everything-controller.js

import { getTranslation } from '../general/translations-controller.js';
import { use24HourFormat } from '../general/main.js';

// --- SELECTORES DEL DOM ---
const UIElements = {
    currentDateSubtitle: document.getElementById('current-date-subtitle'),
    mainClockTime: document.getElementById('main-clock-time-short'),
    activeAlarmsCount: document.getElementById('active-alarms-count'),
    activeTimersCount: document.getElementById('active-timers-count'),
    worldClocksCount: document.getElementById('world-clocks-count'),
    nextAlarmDetails: document.getElementById('next-alarm-details'),
    activeTimerDetails: document.getElementById('active-timer-details'),
    stopwatchDetails: document.getElementById('stopwatch-details')
};

let updateInterval = null;

/**
 * Inicializa el controlador de la sección "Everything".
 */
export function initializeEverything() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    updateAllWidgets();
    updateInterval = setInterval(updateAllWidgets, 1000); // Actualiza cada segundo
    console.log('✅ Controlador "Everything" inicializado.');
}

/**
 * Función principal que actualiza todos los widgets en la pantalla.
 */
function updateAllWidgets() {
    updateCurrentDate();
    updateSummaryWidgets();
    updateUpcomingEvents();
}

/**
 * Actualiza la fecha y la hora local principal.
 */
function updateCurrentDate() {
    const now = new Date();

    // Actualización de la fecha con sistema de traducción
    if (UIElements.currentDateSubtitle) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

        const dayOfWeek = getTranslation(dayNames[now.getDay()], 'weekdays');
        const month = getTranslation(monthNames[now.getMonth()], 'months');
        const dayOfMonth = now.getDate();
        const year = now.getFullYear();

        // Formato: "lunes, 30 de junio de 2025"
        UIElements.currentDateSubtitle.textContent = `${dayOfWeek}, ${dayOfMonth} de ${month} de ${year}`;
    }

    // Actualización de la hora (sin cambios)
    if (UIElements.mainClockTime) {
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: !use24HourFormat };
        UIElements.mainClockTime.textContent = now.toLocaleTimeString(navigator.language, timeOptions);
    }
}

/**
 * Actualiza los widgets de resumen (conteos).
 */
function updateSummaryWidgets() {
    // Conteo de Alarmas Activas
    if (window.alarmManager && typeof window.alarmManager.getActiveAlarmsCount === 'function' && UIElements.activeAlarmsCount) {
        UIElements.activeAlarmsCount.textContent = window.alarmManager.getActiveAlarmsCount();
    }

    // Conteo de Temporizadores Corriendo
    if (window.timerManager && typeof window.timerManager.getRunningTimersCount === 'function' && UIElements.activeTimersCount) {
        UIElements.activeTimersCount.textContent = window.timerManager.getRunningTimersCount();
    }

    // Conteo de Relojes Mundiales
    if (window.worldClockManager && typeof window.worldClockManager.getClockCount === 'function' && UIElements.worldClocksCount) {
        UIElements.worldClocksCount.textContent = window.worldClockManager.getClockCount();
    }
}

/**
 * Actualiza la lista de próximos eventos.
 */
function updateUpcomingEvents() {
    // Próxima Alarma
    if (window.alarmManager && typeof window.alarmManager.getNextAlarmDetails === 'function' && UIElements.nextAlarmDetails) {
        const nextAlarm = window.alarmManager.getNextAlarmDetails();
        UIElements.nextAlarmDetails.textContent = nextAlarm || getTranslation('no_active_alarms', 'everything');
    }

    // Temporizador Activo
    if (window.timerManager && typeof window.timerManager.getActiveTimerDetails === 'function' && UIElements.activeTimerDetails) {
        const activeTimer = window.timerManager.getActiveTimerDetails();
        UIElements.activeTimerDetails.textContent = activeTimer || getTranslation('no_running_timers', 'everything');
    }

    // Cronómetro
    if (window.stopwatchController && typeof window.stopwatchController.getStopwatchDetails === 'function' && UIElements.stopwatchDetails) {
        const stopwatchStatus = window.stopwatchController.getStopwatchDetails();
        UIElements.stopwatchDetails.textContent = stopwatchStatus;
    }
}