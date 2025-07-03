// /assets/js/tools/everything-controller.js

import { getTranslation, translateElementTree } from '../general/translations-controller.js';
import { use24HourFormat, toggleModule } from '../general/main.js';

// --- Clave para guardar el orden en localStorage ---
const WIDGET_ORDER_KEY = 'everything-widget-order';
// --- MODIFICACIÓN: Se elimina 'actions-widget' del orden por defecto ---
const DEFAULT_WIDGET_ORDER = ['upcoming-widget'];

// --- Definiciones de los Widgets ---
const WIDGET_DEFINITIONS = {
    'clock-widget': {
        className: 'widget-clock',
        generateContent: () => `
            <div class="clock-content">
                <div class="clock-time" id="main-clock-time-long">--:--:--</div>
                <div class="clock-date" id="main-clock-date"></div>
            </div>`
    },
    'upcoming-widget': {
        className: 'widget-upcoming',
        headerIcon: 'notifications_active',
        headerTitleKey: 'upcoming_events',
        generateContent: () => `
            <div class="widget-list">
                <div class="widget-list-item interactive"><div class="widget-list-item-icon"><span class="material-symbols-rounded">alarm</span></div><div class="widget-list-item-details"><span class="widget-list-item-title" data-translate="next_alarm" data-translate-category="everything"></span><span class="widget-list-item-value" id="next-alarm-details">--</span></div></div>
                <div class="widget-list-item interactive"><div class="widget-list-item-icon"><span class="material-symbols-rounded">hourglass_top</span></div><div class="widget-list-item-details"><span class="widget-list-item-title" data-translate="active_timer" data-translate-category="everything"></span><span class="widget-list-item-value" id="active-timer-details">--</span></div></div>
                <div class="widget-list-item interactive"><div class="widget-list-item-icon"><span class="material-symbols-rounded">timer</span></div><div class="widget-list-item-details"><span class="widget-list-item-title" data-translate="stopwatch" data-translate-category="everything"></span><span class="widget-list-item-value" id="stopwatch-details">--</span></div></div>
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
    clock: true,
    upcoming: true,
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
    const mainContainer = document.querySelector('.everything-grid-container');
    if (!mainContainer) return;
    mainContainer.innerHTML = '';

    // 1. Renderizar el widget del reloj (siempre primero)
    const clockWidget = createWidgetElement('clock-widget');
    if (clockWidget) {
        mainContainer.appendChild(clockWidget);
    }

    // =========> INICIO DE LA MODIFICACIÓN <=========
    // 2. Crear y añadir la fila para Acciones Rápidas en segundo lugar
    const actionsRow = document.createElement('div');
    actionsRow.className = 'widgets-row';
    const actionsWidget = createWidgetElement('actions-widget');
    if (actionsWidget) {
        actionsRow.appendChild(actionsWidget);
    }
    mainContainer.appendChild(actionsRow);

    // 3. Crear y añadir la fila para los widgets restantes (Próximos eventos) en tercer lugar
    const upcomingRow = document.createElement('div');
    upcomingRow.className = 'widgets-row';
    const savedOrder = JSON.parse(localStorage.getItem(WIDGET_ORDER_KEY)) || DEFAULT_WIDGET_ORDER;
    savedOrder.forEach(widgetId => {
        const widgetElement = createWidgetElement(widgetId);
        if (widgetElement) {
            upcomingRow.appendChild(widgetElement);
        }
    });
    mainContainer.appendChild(upcomingRow);
    // =========> FIN DE LA MODIFICACIÓN <=========


    if (typeof translateElementTree === 'function') {
        translateElementTree(mainContainer);
    }
    
    rebindEventListeners();
}


/**
 * Inicializa SortableJS para permitir arrastrar y soltar los widgets.
 */
function initializeWidgetSortable() {
    // Apuntar a todas las filas de widgets para inicializar Sortable
    const widgetRows = document.querySelectorAll('.widgets-row');
    widgetRows.forEach(row => {
        // Solo hacer arrastrable la fila que NO contiene las acciones rápidas
        if (!row.querySelector('.widget-actions')) {
            new Sortable(row, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                // Evitar que se pueda arrastrar sobre el reloj o las acciones
                filter: '.widget-clock, .widget-actions',
                onMove: function (evt) {
                    return !evt.related.classList.contains('widget-clock') && !evt.related.classList.contains('widget-actions');
                },
                onEnd: (evt) => {
                    const newOrder = Array.from(evt.to.children)
                                        .map(widget => widget.id)
                                        .filter(id => id !== 'clock-widget' && id !== 'actions-widget');
                    localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(newOrder));
                }
            });
        }
    });
}

/**
 * Inicializa el controlador de la sección "Everything".
 */
export function initializeEverything() {
    if (smartUpdateInterval) clearInterval(smartUpdateInterval);
    
    renderAllWidgets();
    initializeWidgetSortable();
    
    updateEverythingWidgets();
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
        clock: document.getElementById('clock-widget'),
        upcoming: document.getElementById('upcoming-widget'),
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
 * Actualiza los widgets y la información de la fecha.
 */
export function updateEverythingWidgets() {
    console.log('🔄 Actualizando widgets de "Everything" por un evento...');
    updateCurrentDate();
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
    const clockTime = document.getElementById('main-clock-time-long');
    const clockDate = document.getElementById('main-clock-date');

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const dayOfWeek = getTranslation(dayNames[now.getDay()], 'weekdays');
    const month = getTranslation(monthNames[now.getMonth()], 'months');
    const fullDateString = `${dayOfWeek}, ${now.getDate()} de ${month} de ${now.getFullYear()}`;

    if (subtitle) {
        subtitle.textContent = fullDateString;
    }

    if (clockTime) {
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !use24HourFormat };
        clockTime.textContent = now.toLocaleTimeString(navigator.language, timeOptions);
    }
    
    if (clockDate) {
        clockDate.textContent = fullDateString;
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