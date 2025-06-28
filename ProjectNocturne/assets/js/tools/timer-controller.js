// /assets/js/tools/timer-controller.js

import { getTranslation } from '../general/translations-controller.js';
import { PREMIUM_FEATURES, activateModule, getCurrentActiveOverlay, switchToSection, allowCardMovement } from '../general/main.js';
import { prepareTimerForEdit } from './menu-interactions.js';
import { playAlarmSound, stopAlarmSound } from './alarm-controller.js';

// --- ESTADO Y CONSTANTES ---
const TIMERS_STORAGE_KEY = 'user-timers';
let timers = [];
let activeTimers = new Map();
let pinnedTimerId = null;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTimerController();
});

function initializeTimerController() {
    loadTimersFromStorage();
    renderAllTimerCards();
    setupGlobalEventListeners();
    updateMainDisplay();
    initializeSortable();
    updateMainControlsState();
}

// --- INICIALIZACIÓN DE SORTABLEJS ---
function initializeSortable() {
    if (!allowCardMovement) return;
    const grid = document.querySelector('.timers-grid-container');
    if (grid && typeof Sortable !== 'undefined') {
        new Sortable(grid, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: function() {
                const newOrder = Array.from(grid.querySelectorAll('.timer-card')).map(card => card.id);
                timers.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
                saveTimersToStorage();
            }
        });
    } else if (typeof Sortable === 'undefined') {
        console.error('La librería SortableJS no está cargada. La función de arrastrar y soltar no funcionará.');
    }
}

// --- CREACIÓN Y ACTUALIZACIÓN DE TEMPORIZADORES ---
export function addTimerAndRender(timerData) {
    const isCountToDate = timerData.type === 'count_to_date';
    
    const newTimer = {
        id: `timer-${Date.now()}`,
        title: timerData.title,
        type: timerData.type,
        isRunning: false,
        isPinned: timers.length === 0,
    };

    if (isCountToDate) {
        newTimer.targetDate = timerData.targetDate;
        newTimer.remaining = new Date(timerData.targetDate).getTime() - Date.now();
    } else {
        newTimer.initialDuration = timerData.duration;
        newTimer.remaining = timerData.duration;
        newTimer.endAction = timerData.endAction;
        newTimer.sound = timerData.sound;
    }

    timers.push(newTimer);
    
    if (timers.length === 1) {
        newTimer.isPinned = true;
        pinnedTimerId = newTimer.id;
    }

    saveTimersToStorage();
    renderAllTimerCards();
    updateMainDisplay();
    
    if (isCountToDate) {
        startTimer(newTimer.id);
    }
}

export function updateTimer(timerId, newData) {
    const timerIndex = timers.findIndex(t => t.id === timerId);
    if (timerIndex === -1) return;

    if (activeTimers.has(timerId)) {
        clearInterval(activeTimers.get(timerId));
        activeTimers.delete(timerId);
    }

    const oldTimer = timers[timerIndex];
    timers[timerIndex] = {
        ...oldTimer,
        title: newData.title,
        initialDuration: newData.duration,
        remaining: newData.duration,
        endAction: newData.endAction,
        sound: newData.sound,
        isRunning: false
    };

    saveTimersToStorage();
    renderAllTimerCards();
    updateMainDisplay();
}

// --- GESTIÓN DE DATOS (STORAGE) ---
function loadTimersFromStorage() {
    const storedTimers = localStorage.getItem(TIMERS_STORAGE_KEY);
    if (storedTimers) {
        timers = JSON.parse(storedTimers);
        const pinnedTimer = timers.find(t => t.isPinned);
        pinnedTimerId = pinnedTimer ? pinnedTimer.id : (timers.length > 0 ? timers[0].id : null);
        
        timers.forEach(timer => {
            if (timer.isRunning) {
                 if (timer.type === 'count_to_date') {
                    timer.remaining = new Date(timer.targetDate).getTime() - Date.now();
                    startTimer(timer.id);
                } else {
                    timer.isRunning = false;
                }
            }
        });

    } else {
        timers = [];
        pinnedTimerId = null;
        saveTimersToStorage();
    }
}

function saveTimersToStorage() {
    localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(timers));
}


// --- RENDERIZADO Y UI ---
function renderAllTimerCards() {
    const container = document.querySelector('.timers-grid-container');
    if (!container) return;
    container.innerHTML = '';
    timers.forEach(timer => {
        const card = createTimerCard(timer);
        container.appendChild(card);
    });
    updatePinnedStatesInUI();
}

// ================================================================
// INICIO DE LA MODIFICACIÓN: createTimerCard actualizada
// ================================================================
function createTimerCard(timer) {
    const card = document.createElement('div');
    card.className = 'timer-card';
    card.id = timer.id;
    card.dataset.id = timer.id;

    const isCountdown = timer.type === 'countdown';
    const playPauseAction = timer.isRunning ? 'pause-card-timer' : 'start-card-timer';
    const playPauseIcon = timer.isRunning ? 'pause' : 'play_arrow';
    const playPauseTextKey = timer.isRunning ? 'pause' : 'play';

    card.innerHTML = `
        <div class="card-header">
            <div class="card-location-details">
                <span class="location-text" title="${timer.title}">${timer.title}</span>
            </div>
        </div>
        <div class="card-body">
            <span class="clock-time">${formatTime(timer.remaining, timer.type)}</span>
        </div>
        <div class="card-buttons-container">
             <button class="card-pin-btn" data-action="pin-timer" data-translate="pin_timer" data-translate-category="tooltips" data-translate-target="tooltip">
                <span class="material-symbols-rounded">push_pin</span>
            </button>
            <div class="card-options-btn-wrapper">
                 <button class="card-options-btn" data-action="toggle-timer-options" data-translate="options" data-translate-category="tooltips" data-translate-target="tooltip">
                    <span class="material-symbols-rounded">more_horiz</span>
                </button>
                <div class="card-options-menu" style="display: none;">
                    ${isCountdown ? `
                    <div class="menu-link" data-action="${playPauseAction}">
                        <div class="menu-link-icon"><span class="material-symbols-rounded">${playPauseIcon}</span></div>
                        <div class="menu-link-text"><span data-translate="${playPauseTextKey}" data-translate-category="tooltips">${getTranslation(playPauseTextKey, 'tooltips')}</span></div>
                    </div>
                    <div class="menu-link" data-action="reset-card-timer">
                        <div class="menu-link-icon"><span class="material-symbols-rounded">refresh</span></div>
                        <div class="menu-link-text"><span data-translate="reset" data-translate-category="tooltips">${getTranslation('reset', 'tooltips')}</span></div>
                    </div>
                    ` : ''}
                    <div class="menu-link" data-action="edit-timer">
                        <div class="menu-link-icon"><span class="material-symbols-rounded">edit</span></div>
                        <div class="menu-link-text"><span data-translate="edit_timer" data-translate-category="timer">${getTranslation('edit_timer', 'timer')}</span></div>
                    </div>
                    <div class="menu-link" data-action="delete-timer">
                        <div class="menu-link-icon"><span class="material-symbols-rounded">delete</span></div>
                        <div class="menu-link-text"><span data-translate="delete_timer" data-translate-category="timer">${getTranslation('delete_timer', 'timer')}</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return card;
}
// ================================================================
// FIN DE LA MODIFICACIÓN
// ================================================================

function updateMainDisplay() {
    const mainDisplay = document.querySelector('.tool-timer span');
    if (!mainDisplay) return;

    const pinnedTimer = timers.find(t => t.id === pinnedTimerId);
    if (pinnedTimer) {
        mainDisplay.textContent = formatTime(pinnedTimer.remaining, pinnedTimer.type);
    } else {
        mainDisplay.textContent = formatTime(0, 'countdown');
    }
}

function updateMainControlsState() {
    const section = document.querySelector('.section-timer');
    if (!section) return;

    const startBtn = section.querySelector('[data-action="start-pinned-timer"]');
    const pauseBtn = section.querySelector('[data-action="pause-pinned-timer"]');
    const resetBtn = section.querySelector('[data-action="reset-pinned-timer"]');
    const buttons = [startBtn, pauseBtn, resetBtn];

    const pinnedTimer = timers.find(t => t.id === pinnedTimerId);

    if (pinnedTimer && pinnedTimer.type === 'count_to_date') {
        buttons.forEach(btn => btn?.classList.add('disabled-interactive'));
    } else {
        buttons.forEach(btn => btn?.classList.remove('disabled-interactive'));
    }
}

function updateCardDisplay(timerId) {
    const card = document.getElementById(timerId);
    if (!card) return;
    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;

    const timeElement = card.querySelector('.clock-time');
    if (timeElement) {
        timeElement.textContent = formatTime(timer.remaining, timer.type);
    }
}

// ================================================================
// INICIO DE LA MODIFICACIÓN: Nueva función para actualizar botones de la tarjeta
// ================================================================
function updateTimerCardControls(timerId) {
    const card = document.getElementById(timerId);
    if (!card) return;

    const timer = timers.find(t => t.id === timerId);
    if (!timer || timer.type !== 'countdown') return;

    const playPauseLink = card.querySelector('[data-action="start-card-timer"], [data-action="pause-card-timer"]');
    if (!playPauseLink) return;

    const icon = playPauseLink.querySelector('.menu-link-icon span');
    const text = playPauseLink.querySelector('.menu-link-text span');

    if (timer.isRunning) {
        playPauseLink.dataset.action = 'pause-card-timer';
        icon.textContent = 'pause';
        text.dataset.translate = 'pause';
        text.textContent = getTranslation('pause', 'tooltips');
    } else {
        playPauseLink.dataset.action = 'start-card-timer';
        icon.textContent = 'play_arrow';
        text.dataset.translate = 'play';
        text.textContent = getTranslation('play', 'tooltips');
    }
}
// ================================================================
// FIN DE LA MODIFICACIÓN
// ================================================================

function updatePinnedStatesInUI() {
    document.querySelectorAll('.timer-card').forEach(card => {
        const pinBtn = card.querySelector('.card-pin-btn');
        if (card.id === pinnedTimerId) {
            pinBtn.classList.add('active');
            card.style.border = '2px solid #000000';
        } else {
            pinBtn.classList.remove('active');
            card.style.border = '1px solid #00000020';
        }
    });
}

function formatTime(ms, type = 'countdown') {
    if (ms <= 0 && type === 'count_to_date') return "¡Evento finalizado!";
    if (ms <= 0) return "00:00:00";

    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    
    if (type === 'count_to_date') {
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
        return `${hours}:${minutes}:${seconds}`;
    } else {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
}


// --- LÓGICA DEL TEMPORIZADOR ---
function startTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer || timer.isRunning) return;

    if (timer.type === 'count_to_date') {
        if (timer.remaining <= 0) return;
        startCountToDateTimer(timer);
    } else {
        if (timer.remaining <= 0) return;
        startCountdownTimer(timer);
    }
    updateTimerCardControls(timerId); // <--- AÑADIDO
}

function startCountdownTimer(timer) {
    timer.isRunning = true;
    const interval = setInterval(() => {
        timer.remaining -= 1000;
        updateCardDisplay(timer.id);
        if (timer.id === pinnedTimerId) updateMainDisplay();
        if (timer.remaining < 1000) {
            handleTimerEnd(timer.id);
        }
    }, 1000);
    activeTimers.set(timer.id, interval);
}

function startCountToDateTimer(timer) {
    timer.isRunning = true;
    const interval = setInterval(() => {
        timer.remaining = new Date(timer.targetDate).getTime() - Date.now();
        updateCardDisplay(timer.id);
        if (timer.id === pinnedTimerId) updateMainDisplay();
        if (timer.remaining <= 0) {
            clearInterval(interval);
            activeTimers.delete(timer.id);
            timer.isRunning = false;
            saveTimersToStorage();
        }
    }, 1000);
    activeTimers.set(timer.id, interval);
}


function handleTimerEnd(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer || timer.type === 'count_to_date') return;
    
    stopTimer(timerId, true);

    playAlarmSound(timer.sound);
    setTimeout(stopAlarmSound, 5000);

    switch (timer.endAction) {
        case 'restart':
            resetTimer(timerId);
            startTimer(timerId);
            break;
        case 'stop':
        default:
            break;
    }
    updateTimerCardControls(timerId); // <--- AÑADIDO
}

function pauseTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer || !timer.isRunning) return;
    timer.isRunning = false;
    clearInterval(activeTimers.get(timerId));
    activeTimers.delete(timerId);
    saveTimersToStorage();
    updateTimerCardControls(timerId); // <--- AÑADIDO
}

function resetTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;
    pauseTimer(timerId);
    
    if(timer.type !== 'count_to_date') {
        timer.remaining = timer.initialDuration;
    }
    
    updateCardDisplay(timerId);
    if (timer.id === pinnedTimerId) {
        updateMainDisplay();
    }
    saveTimersToStorage();
    updateTimerCardControls(timerId); // <--- AÑADIDO
}

function stopTimer(timerId, finished = false) {
    pauseTimer(timerId);
    const timer = timers.find(t => t.id === timerId);
    if (timer && finished) {
        timer.remaining = 0;
        updateCardDisplay(timerId);
        if (timer.id === pinnedTimerId) {
            updateMainDisplay();
        }
    }
}


// --- MANEJO DE EVENTOS ---
// ================================================================
// INICIO DE LA MODIFICACIÓN: setupGlobalEventListeners actualizado
// ================================================================
function setupGlobalEventListeners() {
    const section = document.querySelector('.section-timer');
    if (!section) return;

    section.querySelector('[data-action="start-pinned-timer"]').addEventListener('click', () => {
        if (pinnedTimerId) startTimer(pinnedTimerId);
    });
    section.querySelector('[data-action="pause-pinned-timer"]').addEventListener('click', () => {
        if (pinnedTimerId) pauseTimer(pinnedTimerId);
    });
     section.querySelector('[data-action="reset-pinned-timer"]').addEventListener('click', () => {
        if (pinnedTimerId) resetTimer(pinnedTimerId);
    });

    const container = section.querySelector('.timers-grid-container');
    container.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const card = target.closest('.timer-card');
        if (!card) return;
        
        const timerId = card.dataset.id;
        const action = target.dataset.action;

        switch(action) {
            case 'pin-timer':
                handlePinTimer(timerId);
                break;
            case 'toggle-timer-options':
                e.stopPropagation();
                toggleOptionsMenu(target);
                break;
            case 'start-card-timer':
                startTimer(timerId);
                target.closest('.card-options-menu').style.display = 'none';
                break;
            case 'pause-card-timer':
                pauseTimer(timerId);
                target.closest('.card-options-menu').style.display = 'none';
                break;
            case 'reset-card-timer':
                resetTimer(timerId);
                target.closest('.card-options-menu').style.display = 'none';
                break;
            case 'edit-timer':
                handleEditTimer(timerId);
                break;
            case 'delete-timer':
                handleDeleteTimer(timerId);
                break;
        }
    });
}
// ================================================================
// FIN DE LA MODIFICACIÓN
// ================================================================

function handlePinTimer(timerId) {
    if (pinnedTimerId === timerId) return;
    
    pinnedTimerId = timerId;
    timers.forEach(t => t.isPinned = (t.id === timerId));
    
    updatePinnedStatesInUI();
    updateMainDisplay();
    updateMainControlsState();
    saveTimersToStorage();
}

function toggleOptionsMenu(optionsBtn) {
    const wrapper = optionsBtn.parentElement;
    const menu = wrapper.querySelector('.card-options-menu');
    
    const isActive = menu.style.display === 'flex';

    document.querySelectorAll('.card-options-menu').forEach(m => {
        m.style.display = 'none';
    });

    if (!isActive) {
        menu.style.display = 'flex';
    }
}

function handleEditTimer(timerId) {
    const timerData = timers.find(t => t.id === timerId);
    if (timerData) {
        if(timerData.type === 'count_to_date') {
            alert("La edición para este tipo de temporizador no está implementada.");
            return;
        }
        prepareTimerForEdit(timerData);
        if (getCurrentActiveOverlay() !== 'menuTimer') {
            activateModule('toggleMenuTimer');
        }
    }
}

function handleDeleteTimer(timerId) {
    if (!confirm(getTranslation('delete_timer_confirm', 'timer'))) return;

    timers = timers.filter(t => t.id !== timerId);
    if (activeTimers.has(timerId)) {
        clearInterval(activeTimers.get(timerId));
        activeTimers.delete(timerId);
    }
    
    if (pinnedTimerId === timerId) {
        pinnedTimerId = timers.length > 0 ? timers[0].id : null;
        if (pinnedTimerId) {
             const newPinnedTimer = timers.find(t => t.id === pinnedTimerId);
             if(newPinnedTimer) newPinnedTimer.isPinned = true;
        }
    }
    
    saveTimersToStorage();
    renderAllTimerCards();
    updateMainDisplay();
    updateMainControlsState();
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.card-options-btn-wrapper')) {
        document.querySelectorAll('.card-options-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});