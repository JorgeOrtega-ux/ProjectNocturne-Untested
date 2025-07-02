// /assets/js/tools/everything-controller.js

import { getTranslation, translateElementTree } from '../general/translations-controller.js';
import { use24HourFormat, toggleModule } from '../general/main.js';

// --- Clave para guardar el orden en localStorage ---
const WIDGET_ORDER_KEY = 'everything-widget-order';
const DEFAULT_WIDGET_ORDER = ['upcoming-widget', 'festivities-widget', 'actions-widget'];

// --- Definiciones de los Widgets ---
const WIDGET_DEFINITIONS = {
    'summary-widget': {
        className: 'widget-summary',
        generateContent: () => `
            <div class="summary-content">
                <div class="summary-item"><div class="summary-value" id="main-clock-time-short">--:--</div><div class="summary-label" data-translate="local_time" data-translate-category="everything"></div></div>
                <div class="summary-item"><div class="summary-value" id="active-alarms-count">0</div><div class="summary-label" data-translate="active_alarms" data-translate-category="everything"></div></div>
                <div class="summary-item"><div class="summary-value" id="active-timers-count">0</div><div class="summary-label" data-translate="running_timers" data-translate-category="everything"></div></div>
                <div class="summary-item"><div class="summary-value" id="world-clocks-count">0</div><div class="summary-label" data-translate="world_clocks" data-translate-category="everything"></div></div>
            </div>`
    },
    'upcoming-widget': {
        className: 'widget-upcoming',
        headerIcon: 'notifications_active',
        headerTitleKey: 'upcoming_events',
        generateContent: () => `
            <div class="upcoming-list">
                <div class="upcoming-item"><div class="upcoming-item-icon-wrapper"><span class="material-symbols-rounded upcoming-item-icon">alarm</span></div><div class="upcoming-item-details"><div class="upcoming-item-title" data-translate="next_alarm" data-translate-category="everything"></div><div class="upcoming-item-time" id="next-alarm-details">--</div></div></div>
                <div class="upcoming-item"><div class="upcoming-item-icon-wrapper"><span class="material-symbols-rounded upcoming-item-icon">hourglass_top</span></div><div class="upcoming-item-details"><div class="upcoming-item-title" data-translate="active_timer" data-translate-category="everything"></div><div class="upcoming-item-time" id="active-timer-details">--</div></div></div>
                <div class="upcoming-item"><div class="upcoming-item-icon-wrapper"><span class="material-symbols-rounded upcoming-item-icon">timer</span></div><div class="upcoming-item-details"><div class="upcoming-item-title" data-translate="stopwatch" data-translate-category="everything"></div><div class="upcoming-item-time" id="stopwatch-details">--</div></div></div>
            </div>`
    },
    'festivities-widget': {
        className: 'widget-festivities',
        headerIcon: 'celebration',
        headerTitleKey: 'Próximas Festividades',
        generateContent: () => `
            <div class="festivities-list">
                <div class="festivity-item"><span class="material-symbols-rounded festivity-item-icon">emoji_events</span><div class="festivity-details"><div class="festivity-title">Día de la Independencia (México)</div><div class="festivity-date">16 de Septiembre</div></div></div>
                <div class="festivity-item"><span class="material-symbols-rounded festivity-item-icon">cake</span><div class="festivity-details"><div class="festivity-title">Navidad</div><div class="festivity-date">25 de Diciembre</div></div></div>
            </div>`
    },
    'actions-widget': {
        className: 'widget-actions',
        headerIcon: 'bolt',
        headerTitleKey: 'quick_actions',
        generateContent: () => `
            <div class="actions-container">
                <div class="action-card" data-module="toggleMenuAlarm"><span class="material-symbols-rounded action-card-icon">add_alarm</span><span class="action-card-label" data-translate="new_alarm" data-translate-category="everything"></span></div>
                <div class="action-card" data-module="toggleMenuTimer"><span class="material-symbols-rounded action-card-icon">add_circle</span><span class="action-card-label" data-translate="new_timer" data-translate-category="everything"></span></div>
                <div class="action-card" data-module="toggleMenuWorldClock"><span class="material-symbols-rounded action-card-icon">public</span><span class="action-card-label" data-translate="add_clock" data-translate-category="everything"></span></div>
            </div>`
    }
};

let smartUpdateInterval = null;
const WIDGET_CONFIG = {
    summary: true,
    upcoming: true,
    festivities: true,
    quickActions: true
};

/**
 * Crea un único elemento de widget.
 * @param {string} id - El ID del widget.
 * @returns {HTMLElement|null}
 */
function createWidgetElement(id) {
    const definition = WIDGET_DEFINITIONS[id];
    if (!definition) return null;

    const widget = document.createElement('div');
    widget.id = id;
    widget.className = `widget ${definition.className}`;

    let contentHTML = '';
    if (definition.headerIcon && definition.headerTitleKey) {
        contentHTML += `
            <div class="widget-header">
                <div class="widget-icon"><span class="material-symbols-rounded">${definition.headerIcon}</span></div>
                <h2 class="widget-title" data-translate="${definition.headerTitleKey}" data-translate-category="everything"></h2>
            </div>`;
    }
    contentHTML += definition.generateContent();
    widget.innerHTML = contentHTML;
    return widget;
}

/**
 * Vuelve a vincular los event listeners a los elementos generados dinámicamente.
 */
function rebindEventListeners() {
    const actionCards = document.querySelectorAll('.action-card[data-module]');
    actionCards.forEach(card => {
        const moduleName = card.dataset.module;
        if (moduleName) {
            // Clonar y reemplazar el nodo elimina listeners antiguos y evita duplicados.
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            newCard.addEventListener('click', () => toggleModule(moduleName));
        }
    });
}

/**
 * Renderiza todos los widgets en el DOM en el orden correcto.
 */
function renderAllWidgets() {
    const mainContainer = document.querySelector('.everything-main-container');
    if (!mainContainer) return;
    mainContainer.innerHTML = ''; // Limpiar completamente

    // Crear y añadir el widget de resumen
    const summaryWidget = createWidgetElement('summary-widget');
    if (summaryWidget) {
        mainContainer.appendChild(summaryWidget);
    }

    // Crear y añadir el contenedor para los widgets reordenables
    const widgetRow = document.createElement('div');
    widgetRow.className = 'widget-row';
    mainContainer.appendChild(widgetRow);

    // Renderizar widgets reordenables
    const savedOrder = JSON.parse(localStorage.getItem(WIDGET_ORDER_KEY)) || DEFAULT_WIDGET_ORDER;
    savedOrder.forEach(widgetId => {
        const widgetElement = createWidgetElement(widgetId);
        if (widgetElement) {
            widgetRow.appendChild(widgetElement);
        }
    });

    // Aplicar traducciones a todos los widgets generados
    if (typeof translateElementTree === 'function') {
        translateElementTree(mainContainer);
    }
    
    // **PASO CRUCIAL**: Volver a vincular los eventos a los botones de acción rápida
    rebindEventListeners();
}

/**
 * Inicializa SortableJS para permitir arrastrar y soltar los widgets.
 */
function initializeWidgetSortable() {
    const widgetRow = document.querySelector('.widget-row');
    if (widgetRow && typeof Sortable !== 'undefined') {
        new Sortable(widgetRow, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                const newOrder = Array.from(evt.to.children).map(widget => widget.id);
                localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(newOrder));
            }
        });
    }
}

/**
 * Inicializa el controlador de la sección "Everything".
 */
export function initializeEverything() {
    if (smartUpdateInterval) clearInterval(smartUpdateInterval);
    
    renderAllWidgets();
    initializeWidgetSortable();
    
    updateEverythingWidgets(); // Llama para poblar los datos iniciales
    applyWidgetVisibility();

    smartUpdateInterval = setInterval(smartUpdate, 1000);
    console.log('✅ Controlador "Everything" inicializado con widgets dinámicos y funcionales.');

    document.addEventListener('translationsApplied', () => {
        updateEverythingWidgets();
    });
}

/**
 * Aplica la visibilidad a los widgets basado en la configuración.
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
 * Actualiza los widgets de resumen y eventos.
 */
export function updateEverythingWidgets() {
    console.log('🔄 Actualizando widgets de "Everything" por un evento...');
    updateCurrentDate();
    updateSummaryWidgets();
    updateUpcomingEvents();
}

/**
 * El intervalo inteligente que se ejecuta cada segundo.
 */
function smartUpdate() {
    updateCurrentDate();

    if (window.stopwatchController?.isStopwatchRunning()) {
        const stopwatchDetails = document.getElementById('stopwatch-details');
        if (stopwatchDetails) stopwatchDetails.textContent = window.stopwatchController.getStopwatchDetails();
    }
    
    if (window.timerManager?.getRunningTimersCount() > 0) {
        const activeTimerDetails = document.getElementById('active-timer-details');
        if (activeTimerDetails) activeTimerDetails.textContent = window.timerManager.getActiveTimerDetails();
    }
}

/**
 * Actualiza la fecha y la hora local principal.
 */
function updateCurrentDate() {
    const now = new Date();
    const subtitle = document.getElementById('current-date-subtitle');
    const clockTime = document.getElementById('main-clock-time-short');

    if (subtitle) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const dayOfWeek = getTranslation(dayNames[now.getDay()], 'weekdays');
        const month = getTranslation(monthNames[now.getMonth()], 'months');
        subtitle.textContent = `${dayOfWeek}, ${now.getDate()} de ${month} de ${now.getFullYear()}`;
    }

    if (clockTime) {
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: !use24HourFormat };
        clockTime.textContent = now.toLocaleTimeString(navigator.language, timeOptions);
    }
}

/**
 * Actualiza los widgets de resumen (conteos).
 */
function updateSummaryWidgets() {
    const alarmsCount = document.getElementById('active-alarms-count');
    const timersCount = document.getElementById('active-timers-count');
    const clocksCount = document.getElementById('world-clocks-count');

    if (window.alarmManager && alarmsCount) {
        alarmsCount.textContent = window.alarmManager.getActiveAlarmsCount();
    }
    if (window.timerManager && timersCount) {
        timersCount.textContent = window.timerManager.getRunningTimersCount();
    }
    if (window.worldClockManager && clocksCount) {
        clocksCount.textContent = window.worldClockManager.getClockCount();
    }
}

/**
 * Actualiza la lista de próximos eventos.
 */
function updateUpcomingEvents() {
    const nextAlarm = document.getElementById('next-alarm-details');
    const activeTimer = document.getElementById('active-timer-details');
    const stopwatch = document.getElementById('stopwatch-details');

    if (window.alarmManager && nextAlarm) {
        const details = window.alarmManager.getNextAlarmDetails();
        nextAlarm.textContent = details || getTranslation('no_active_alarms', 'everything');
    }
    if (window.timerManager && activeTimer) {
        const details = window.timerManager.getActiveTimerDetails();
        activeTimer.textContent = details || getTranslation('no_running_timers', 'everything');
    }
    if (window.stopwatchController && stopwatch) {
        stopwatch.textContent = window.stopwatchController.getStopwatchDetails();
    }
}