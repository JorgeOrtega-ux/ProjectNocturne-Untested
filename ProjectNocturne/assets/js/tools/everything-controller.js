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

let smartUpdateInterval = null;

// New config for widget visibility
const WIDGET_CONFIG = {
    summary: true, // Local Time, Active Alarms, Running Timers, World Clocks counts
    upcoming: true, // Next Alarm, Active Timer, Stopwatch details
    festivities: true, // Upcoming Festivities
    quickActions: true // New Alarm, New Timer, Add Clock quick actions
};


/**
 * Inicializa el controlador de la sección "Everything".
 */
export function initializeEverything() {
    if (smartUpdateInterval) {
        clearInterval(smartUpdateInterval);
    }
    // Llama a todas las actualizaciones una vez al inicio para evitar datos vacíos
    updateEverythingWidgets();
    applyWidgetVisibility(); // Apply visibility based on WIDGET_CONFIG

    // Inicia un intervalo inteligente
    smartUpdateInterval = setInterval(smartUpdate, 1000);
    console.log('✅ Controlador "Everything" inicializado con intervalo inteligente.');

    // ===================== INICIO DE LA CORRECCIÓN =====================
    // Escucha el evento 'translationsApplied', que se dispara cuando el
    // cambio de idioma se ha completado y las nuevas traducciones están listas.
    document.addEventListener('translationsApplied', () => {
        console.log('✅ Traducciones aplicadas, actualizando widgets de "Everything"...');
        updateEverythingWidgets();
    });
    // ====================== FIN DE LA CORRECCIÓN =======================
}

/**
 * Applies visibility settings to widgets based on WIDGET_CONFIG.
 */
function applyWidgetVisibility() {
    const widgets = {
        summary: document.getElementById('summary-widget'),
        upcoming: document.getElementById('upcoming-widget'),
        festivities: document.getElementById('festivities-widget'),
        quickActions: document.getElementById('actions-widget')
    };

    for (const key in WIDGET_CONFIG) {
        if (widgets[key]) {
            if (WIDGET_CONFIG[key]) {
                widgets[key].classList.remove('disabled');
            } else {
                widgets[key].classList.add('disabled');
            }
        }
    }
}


/**
 * Función que actualiza los widgets de resumen y eventos.
 * Esta función será exportada para ser llamada por otros módulos en eventos específicos.
 */
export function updateEverythingWidgets() {
    console.log('🔄 Actualizando widgets de "Everything" por un evento...');
    if (WIDGET_CONFIG.summary) updateCurrentDate(); // Se asegura que la fecha esté siempre correcta
    if (WIDGET_CONFIG.summary) updateSummaryWidgets();
    if (WIDGET_CONFIG.upcoming) updateUpcomingEvents();
    // For 'festivities' and 'quickActions', visibility is handled by applyWidgetVisibility,
    // and their content is mostly static or managed by other specific listeners.
}

/**
 * El nuevo intervalo inteligente que se ejecuta cada segundo.
 */
function smartUpdate() {
    // The date and local time are always updated if summary is active.
    if (WIDGET_CONFIG.summary) updateCurrentDate();

    // The stopwatch only updates if it's running and the upcoming widget is active.
    if (WIDGET_CONFIG.upcoming && window.stopwatchController && typeof window.stopwatchController.isStopwatchRunning === 'function' && window.stopwatchController.isStopwatchRunning()) {
        if (UIElements.stopwatchDetails) {
            UIElements.stopwatchDetails.textContent = window.stopwatchController.getStopwatchDetails();
        }
    }
    
    // The active timer also needs constant update if upcoming widget is active.
    if (WIDGET_CONFIG.upcoming && window.timerManager && typeof window.timerManager.getRunningTimersCount === 'function' && window.timerManager.getRunningTimersCount() > 0) {
        if (UIElements.activeTimerDetails) {
            UIElements.activeTimerDetails.textContent = window.timerManager.getActiveTimerDetails();
        }
    }
}

/**
 * Actualiza la fecha y la hora local principal.
 */
function updateCurrentDate() {
    const now = new Date();

    if (UIElements.currentDateSubtitle) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const dayOfWeek = getTranslation(dayNames[now.getDay()], 'weekdays');
        const month = getTranslation(monthNames[now.getMonth()], 'months');
        const dayOfMonth = now.getDate();
        const year = now.getFullYear();
        UIElements.currentDateSubtitle.textContent = `${dayOfWeek}, ${dayOfMonth} de ${month} de ${year}`;
    }

    if (UIElements.mainClockTime) {
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: !use24HourFormat };
        UIElements.mainClockTime.textContent = now.toLocaleTimeString(navigator.language, timeOptions);
    }
}

/**
 * Actualiza los widgets de resumen (conteos).
 */
function updateSummaryWidgets() {
    if (!WIDGET_CONFIG.summary) return; // Only proceed if summary widget is active

    if (window.alarmManager && UIElements.activeAlarmsCount) {
        UIElements.activeAlarmsCount.textContent = window.alarmManager.getActiveAlarmsCount();
    }
    if (window.timerManager && UIElements.activeTimersCount) {
        UIElements.activeTimersCount.textContent = window.timerManager.getRunningTimersCount();
    }
    if (window.worldClockManager && UIElements.worldClocksCount) {
        UIElements.worldClocksCount.textContent = window.worldClockManager.getClockCount();
    }
}

/**
 * Actualiza la lista de próximos eventos.
 */
function updateUpcomingEvents() {
    if (!WIDGET_CONFIG.upcoming) return; // Only proceed if upcoming events widget is active

    if (window.alarmManager && UIElements.nextAlarmDetails) {
        const nextAlarm = window.alarmManager.getNextAlarmDetails();
        UIElements.nextAlarmDetails.textContent = nextAlarm || getTranslation('no_active_alarms', 'everything');
    }
    if (window.timerManager && UIElements.activeTimerDetails) {
        const activeTimer = window.timerManager.getActiveTimerDetails();
        UIElements.activeTimerDetails.textContent = activeTimer || getTranslation('no_running_timers', 'everything');
    }
    if (window.stopwatchController && UIElements.stopwatchDetails) {
        UIElements.stopwatchDetails.textContent = window.stopwatchController.getStopwatchDetails();
    }
}