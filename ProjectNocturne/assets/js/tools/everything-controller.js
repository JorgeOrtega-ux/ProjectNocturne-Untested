// /assets/js/tools/everything-controller.js - REDISEÑO COMPLETO

import { getTranslation, translateElementTree } from '../general/translations-controller.js';
import { use24HourFormat, toggleModule } from '../general/main.js';

// --- Estado y Configuración ---
let smartUpdateInterval = null;

const WIDGET_DEFINITIONS = {
    'local-time-widget': {
        className: 'widget--large local-time-widget',
        generateContent: () => `
            <div id="main-clock-time">--:--</div>
            <p id="current-date-subtitle"></p>
        `
    },
    'agenda-widget': {
        className: 'widget--medium agenda-widget',
        headerIcon: 'today',
        headerTitleKey: 'upcoming_events',
        generateContent: () => `<div class="widget-content"><div class="agenda-list"></div></div>`
    },
    'actions-widget': {
        className: 'widget--small actions-widget',
        headerIcon: 'bolt',
        headerTitleKey: 'quick_actions',
        generateContent: () => `
            <div class="widget-content">
                <div class="action-button" data-module="toggleMenuAlarm">
                    <span class="material-symbols-rounded action-button-icon">add_alarm</span>
                    <span class="action-button-label" data-translate="new_alarm" data-translate-category="everything"></span>
                </div>
                <div class="action-button" data-module="toggleMenuTimer">
                    <span class="material-symbols-rounded action-button-icon">add_circle</span>
                    <span class="action-button-label" data-translate="new_timer" data-translate-category="everything"></span>
                </div>
                <div class="action-button" data-module="toggleMenuWorldClock">
                    <span class="material-symbols-rounded action-button-icon">public</span>
                    <span class="action-button-label" data-translate="add_clock" data-translate-category="everything"></span>
                </div>
            </div>`
    },
    'summary-widget': {
        className: 'widget--full-width summary-widget',
        generateContent: () => `
            <div class="widget-content">
                <div class="summary-item"><div class="summary-value" id="active-alarms-count">0</div><div class="summary-label" data-translate="active_alarms" data-translate-category="everything"></div></div>
                <div class="summary-item"><div class="summary-value" id="active-timers-count">0</div><div class="summary-label" data-translate="running_timers" data-translate-category="everything"></div></div>
                <div class="summary-item"><div class="summary-value" id="world-clocks-count">0</div><div class="summary-label" data-translate="world_clocks" data-translate-category="everything"></div></div>
            </div>`
    }
};

const WIDGET_LAYOUT = [
    'local-time-widget', 'agenda-widget', 'actions-widget', 'summary-widget'
];

/**
 * Pone en mayúscula la primera letra de una cadena.
 * @param {string} string - La cadena a capitalizar.
 * @returns {string}
 */
const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};


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
                <span class="material-symbols-rounded">${definition.headerIcon}</span>
                <span data-translate="${definition.headerTitleKey}" data-translate-category="everything"></span>
            </div>`;
    }
    contentHTML += definition.generateContent();
    widget.innerHTML = contentHTML;
    return widget;
}

function rebindEventListeners() {
    document.querySelectorAll('.action-button[data-module]').forEach(card => {
        const moduleName = card.dataset.module;
        if (moduleName) {
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            newCard.addEventListener('click', () => toggleModule(moduleName));
        }
    });
}

function renderAllWidgets() {
    const mainContainer = document.querySelector('.everything-main-container');
    if (!mainContainer) return;
    mainContainer.innerHTML = '';

    WIDGET_LAYOUT.forEach(widgetId => {
        const widgetElement = createWidgetElement(widgetId);
        if (widgetElement) {
            mainContainer.appendChild(widgetElement);
        }
    });

    if (typeof translateElementTree === 'function') {
        translateElementTree(mainContainer);
    }
    
    rebindEventListeners();
}

export function initializeEverything() {
    if (smartUpdateInterval) clearInterval(smartUpdateInterval);
    
    renderAllWidgets();
    updateEverythingWidgets();

    smartUpdateInterval = setInterval(smartUpdate, 1000);
    console.log('✅ Controlador "Everything" rediseñado e inicializado.');

    document.addEventListener('translationsApplied', updateEverythingWidgets);
}

export function updateEverythingWidgets() {
    updateCurrentDate();
    updateSummaryWidgets();
    updateAgendaWidget();
}

function smartUpdate() {
    updateCurrentDate(); // Solo actualiza elementos que cambian cada segundo
}

function updateCurrentDate() {
    const now = new Date();
    const timeEl = document.getElementById('main-clock-time');
    const dateEl = document.getElementById('current-date-subtitle');
    const lang = (typeof window.getCurrentLanguage === 'function') ? window.getCurrentLanguage() : 'en-us';

    if (timeEl) {
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: !use24HourFormat };
        timeEl.textContent = now.toLocaleTimeString(navigator.language, timeOptions);
    }

    if (dateEl) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        
        let dayOfWeek = getTranslation(dayNames[now.getDay()], 'weekdays');
        let month = getTranslation(monthNames[now.getMonth()], 'months');

        if (lang === 'en-us') {
            dayOfWeek = capitalizeFirstLetter(dayOfWeek);
            month = capitalizeFirstLetter(month);
        }
        
        let dateString;
        switch(lang) {
            case 'es-mx':
                dateString = `${dayOfWeek}, ${now.getDate()} de ${month} de ${now.getFullYear()}`;
                break;
            case 'fr-fr':
                dateString = `${dayOfWeek} ${now.getDate()} ${month} ${now.getFullYear()}`;
                break;
            case 'en-us':
            default:
                dateString = `${dayOfWeek}, ${month} ${now.getDate()}, ${now.getFullYear()}`;
                break;
        }
        dateEl.textContent = dateString;
    }
}

function updateSummaryWidgets() {
    const alarmsCount = document.getElementById('active-alarms-count');
    const timersCount = document.getElementById('active-timers-count');
    const clocksCount = document.getElementById('world-clocks-count');

    if (window.alarmManager && alarmsCount) alarmsCount.textContent = window.alarmManager.getActiveAlarmsCount();
    if (window.timerManager && timersCount) timersCount.textContent = window.timerManager.getRunningTimersCount();
    if (window.worldClockManager && clocksCount) clocksCount.textContent = window.worldClockManager.getClockCount();
}

function getAgendaItems() {
    const items = [];
    const now = new Date();

    // Obtener alarmas
    if (window.alarmManager) {
        const activeAlarms = [...window.alarmManager.userAlarms, ...window.alarmManager.defaultAlarmsState].filter(a => a.enabled);
        activeAlarms.forEach(alarm => {
            const alarmTime = new Date();
            alarmTime.setHours(alarm.hour, alarm.minute, 0, 0);
            if (alarmTime <= now) {
                alarmTime.setDate(alarmTime.getDate() + 1);
            }
            items.push({
                time: alarmTime,
                type: 'alarm',
                icon: 'alarm',
                title: alarm.type === 'default' ? getTranslation(alarm.title, 'alarms') : alarm.title,
                subtitle: alarmTime.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: !use24HourFormat })
            });
        });
    }

    // Obtener temporizadores activos
    if (window.timerManager) {
        const runningTimers = [...window.timerManager.userTimers, ...window.timerManager.defaultTimersState].filter(t => t.isRunning);
        runningTimers.forEach(timer => {
            const endTime = new Date(now.getTime() + timer.remaining);
            items.push({
                time: endTime,
                type: 'timer',
                icon: 'hourglass_top',
                title: timer.id.startsWith('default-timer-') ? getTranslation(timer.title, 'timer') : timer.title,
                subtitle: `${getTranslation('ends_at', 'everything') || 'Finaliza a las'} ${endTime.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: !use24HourFormat })}`
            });
        });
    }
    
    // Hardcoded Festivities
    // A futuro, esto podría venir de una API o un archivo de configuración más complejo
    const year = now.getFullYear();
    const festivities = [
        { month: 8, day: 16, title: "Día de la Independencia (México)" },
        { month: 11, day: 25, title: "Navidad" }
    ];

    festivities.forEach(fest => {
        let festDate = new Date(year, fest.month, fest.day);
        if (festDate < now) {
            festDate.setFullYear(year + 1);
        }
        items.push({
            time: festDate,
            type: 'festivity',
            icon: 'celebration',
            title: fest.title,
            subtitle: festDate.toLocaleDateString(navigator.language, { month: 'long', day: 'numeric' })
        });
    });

    return items.sort((a, b) => a.time - b.time);
}

function updateAgendaWidget() {
    const agendaList = document.querySelector('.agenda-list');
    if (!agendaList) return;

    const items = getAgendaItems();
    agendaList.innerHTML = '';

    if (items.length === 0) {
        agendaList.innerHTML = `<p>${getTranslation('no_upcoming_events', 'everything') || 'No upcoming events.'}</p>`;
        return;
    }

    items.slice(0, 4).forEach(item => { // Limitar a 4 para no saturar
        const itemEl = document.createElement('div');
        itemEl.className = 'agenda-item';
        itemEl.innerHTML = `
            <div class="agenda-item-icon">
                <span class="material-symbols-rounded">${item.icon}</span>
            </div>
            <div class="agenda-item-details">
                <div class="agenda-item-title">${item.title}</div>
                <div class="agenda-item-subtitle">${item.subtitle}</div>
            </div>
        `;
        agendaList.appendChild(itemEl);
    });
}