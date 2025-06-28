// /assets/js/tools/timer-controller.js - Con persistencia de estado

import { getTranslation } from '../general/translations-controller.js';
import { PREMIUM_FEATURES, activateModule, getCurrentActiveOverlay, switchToSection, allowCardMovement } from '../general/main.js';
import { prepareTimerForEdit } from './menu-interactions.js';
import { playAlarmSound, stopAlarmSound } from './alarm-controller.js';

// --- ESTADO Y CONSTANTES ---
const TIMERS_STORAGE_KEY = 'user-timers';
const TIMER_STATE_STORAGE_KEY = 'timer-states'; // Nueva clave para estados de ejecución
let timers = [];
let activeTimers = new Map();
let pinnedTimerId = null;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTimerController();
});

function initializeTimerController() {
    loadTimersFromStorage();
    restoreActiveTimers(); // Nueva función para restaurar timers activos
    renderAllTimerCards();
    setupGlobalEventListeners();
    updateMainDisplay();
    initializeSortable();
    updateMainControlsState();
}

// --- NUEVA FUNCIÓN: RESTAURAR TIMERS ACTIVOS ---
function restoreActiveTimers() {
    const savedStates = localStorage.getItem(TIMER_STATE_STORAGE_KEY);
    if (!savedStates) return;

    try {
        const states = JSON.parse(savedStates);
        const now = Date.now();

        states.forEach(state => {
            const timer = timers.find(t => t.id === state.timerId);
            if (!timer) return;

            if (state.isRunning) {
                if (timer.type === 'countdown') {
                    // Calcular cuánto tiempo ha pasado desde que se guardó el estado
                    const elapsedSinceLastSave = now - state.lastSaveTime;
                    timer.remaining = Math.max(0, state.remaining - elapsedSinceLastSave);
                    
                    if (timer.remaining > 0) {
                        timer.isRunning = true;
                        startCountdownTimer(timer);
                        console.log(`🔄 Timer restaurado: ${timer.title} - ${formatTime(timer.remaining)}`);
                    } else {
                        // El timer debería haber terminado mientras estaba cerrada la aplicación
                        timer.remaining = 0;
                        timer.isRunning = false;
                        handleTimerEnd(timer.id);
                    }
                } else if (timer.type === 'count_to_date') {
                    // Para count-to-date, recalcular el tiempo restante
                    timer.remaining = new Date(timer.targetDate).getTime() - now;
                    
                    if (timer.remaining > 0) {
                        timer.isRunning = true;
                        startCountToDateTimer(timer);
                        console.log(`🔄 Timer de fecha restaurado: ${timer.title}`);
                    } else {
                        timer.remaining = 0;
                        timer.isRunning = false;
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error restaurando estados de timers:', error);
        // Limpiar estados corruptos
        localStorage.removeItem(TIMER_STATE_STORAGE_KEY);
    }
}

// --- NUEVA FUNCIÓN: GUARDAR ESTADOS DE TIMERS ---
function saveTimerStates() {
    const states = [];
    const now = Date.now();

    timers.forEach(timer => {
        if (timer.isRunning) {
            states.push({
                timerId: timer.id,
                isRunning: timer.isRunning,
                remaining: timer.remaining,
                lastSaveTime: now,
                type: timer.type
            });
        }
    });

    try {
        localStorage.setItem(TIMER_STATE_STORAGE_KEY, JSON.stringify(states));
    } catch (error) {
        console.error('Error guardando estados de timers:', error);
    }
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
    updateMainControlsState();

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
    saveTimerStates(); // Guardar estados actualizados
    renderAllTimerCards();
    updateMainDisplay();
    updateMainControlsState();
}

// --- GESTIÓN DE DATOS (STORAGE) - MEJORADA ---
function loadTimersFromStorage() {
    const storedTimers = localStorage.getItem(TIMERS_STORAGE_KEY);
    let loadedTimers = [];

    if (storedTimers) {
        try {
            loadedTimers = JSON.parse(storedTimers);
            if (!Array.isArray(loadedTimers)) {
                loadedTimers = [];
            }
        } catch (e) {
            console.error("Error al analizar los temporizadores de localStorage", e);
            loadedTimers = [];
        }
    }

    if (loadedTimers.length > 0) {
        timers = loadedTimers;
        let pinnedTimer = timers.find(t => t.isPinned);

        if (!pinnedTimer) {
            pinnedTimer = timers[0];
            timers[0].isPinned = true;
            saveTimersToStorage();
        }
        
        pinnedTimerId = pinnedTimer.id;

        // Resetear estado de ejecución temporalmente - será restaurado por restoreActiveTimers()
        timers.forEach(timer => {
            timer.isRunning = false;
        });

    } else {
        timers = [{
            id: `timer-default-${Date.now()}`,
            title: "Default Timer",
            type: 'countdown',
            initialDuration: 300000,
            remaining: 300000,
            endAction: 'stop',
            sound: 'classic-beep',
            isRunning: false,
            isPinned: true
        }];
        pinnedTimerId = timers[0].id;
        saveTimersToStorage();
    }
}

function saveTimersToStorage() {
    localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(timers));
    saveTimerStates(); // Siempre guardar estados junto con los timers
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
        <div class="card-options-container">
             <button class="dismiss-timer-btn" data-action="dismiss-timer">
                <span data-translate="dismiss" data-translate-category="alarms">${getTranslation('dismiss', 'alarms')}</span>
            </button>
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

function updateMainDisplay() {
    const mainDisplay = document.querySelector('.tool-timer span');
    if (!mainDisplay) return;

    const pinnedTimer = timers.find(t => t.id === pinnedTimerId);
    if (pinnedTimer) {
        mainDisplay.textContent = formatTime(pinnedTimer.remaining, pinnedTimer.type);
    } else {
        mainDisplay.textContent = formatTime(300000, 'countdown');
    }
}

function updateMainControlsState() {
    const section = document.querySelector('.section-timer');
    if (!section) return;

    const startBtn = section.querySelector('[data-action="start-pinned-timer"]');
    const pauseBtn = section.querySelector('[data-action="pause-pinned-timer"]');
    const resetBtn = section.querySelector('[data-action="reset-pinned-timer"]');
    const buttons = [startBtn, pauseBtn, resetBtn];

    const hasTimers = timers.length > 0;
    const pinnedTimer = timers.find(t => t.id === pinnedTimerId);
    const isPinnedCountToDate = pinnedTimer && pinnedTimer.type === 'count_to_date';

    if (!hasTimers || isPinnedCountToDate) {
        buttons.forEach(btn => btn?.classList.add('disabled-interactive'));
    } else {
        buttons.forEach(btn => btn?.classList.remove('disabled-interactive'));
        startBtn?.classList.toggle('disabled-interactive', pinnedTimer?.isRunning);
        pauseBtn?.classList.toggle('disabled-interactive', !pinnedTimer?.isRunning);
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

function updatePinnedStatesInUI() {
    document.querySelectorAll('.timer-card').forEach(card => {
        const pinBtn = card.querySelector('.card-pin-btn');
        if (pinBtn) {
            pinBtn.classList.toggle('active', card.id === pinnedTimerId);
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

// --- LÓGICA DEL TEMPORIZADOR - MEJORADA ---
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
    
    updateTimerCardControls(timerId);
    updateMainControlsState();
    saveTimerStates(); // Guardar estado inmediatamente
}

function startCountdownTimer(timer) {
    timer.isRunning = true;
    const interval = setInterval(() => {
        timer.remaining -= 1000;
        updateCardDisplay(timer.id);
        if (timer.id === pinnedTimerId) updateMainDisplay();
        
        // Guardar estado periódicamente (cada 5 segundos)
        if (Math.floor(timer.remaining / 1000) % 5 === 0) {
            saveTimerStates();
        }
        
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
        
        // Guardar estado periódicamente (cada 30 segundos para count-to-date)
        if (Math.floor(Date.now() / 1000) % 30 === 0) {
            saveTimerStates();
        }
        
        if (timer.remaining <= 0) {
            clearInterval(interval);
            activeTimers.delete(timer.id);
            timer.isRunning = false;
            saveTimerStates();
        }
    }, 1000);
    activeTimers.set(timer.id, interval);
}

function handleTimerEnd(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer || timer.type === 'count_to_date') return;
    
    stopTimer(timerId, true);

    updateTimerCardControls(timerId);
    updateMainControlsState();
    saveTimerStates(); // Guardar estado final

    if (timer.endAction === 'restart') {
        playAlarmSound(timer.sound);
        setTimeout(() => {
            stopAlarmSound();
            resetTimer(timerId);
            startTimer(timerId);
        }, 3000);

    } else {
        playAlarmSound(timer.sound);
        
        const card = document.getElementById(timerId);
        if (card) {
            const optionsContainer = card.querySelector('.card-options-container');
            if (optionsContainer) {
                optionsContainer.classList.add('active');
            }
        }
    }
}

function pauseTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer || !timer.isRunning) return;
    
    timer.isRunning = false;
    clearInterval(activeTimers.get(timerId));
    activeTimers.delete(timerId);
    
    saveTimersToStorage();
    saveTimerStates(); // Guardar estado de pausa
    updateTimerCardControls(timerId);
    updateMainControlsState();
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
    saveTimerStates(); // Guardar estado de reset
    updateTimerCardControls(timerId);
    updateMainControlsState();
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
        saveTimerStates(); // Guardar estado final
    }
}

// --- MANEJO DE EVENTOS ---
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
            case 'dismiss-timer':
                dismissTimer(timerId);
                break;
        }
    });
}

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
    saveTimerStates(); // Limpiar estados del timer eliminado
    renderAllTimerCards();
    updateMainDisplay();
    updateMainControlsState();
}

function dismissTimer(timerId) {
    stopAlarmSound();
    const card = document.getElementById(timerId);
    if (card) {
        const optionsContainer = card.querySelector('.card-options-container');
        if (optionsContainer) {
            optionsContainer.classList.remove('active');
        }
    }
}

// --- EVENTOS GLOBALES ---
document.addEventListener('click', (e) => {
    if (!e.target.closest('.card-options-btn-wrapper')) {
        document.querySelectorAll('.card-options-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});

// --- GUARDAR ESTADOS AL CERRAR LA APLICACIÓN ---
window.addEventListener('beforeunload', () => {
    saveTimerStates();
});

// --- GUARDAR ESTADOS PERIÓDICAMENTE ---
setInterval(() => {
    if (activeTimers.size > 0) {
        saveTimerStates();
    }
}, 10000); // Cada 10 segundos