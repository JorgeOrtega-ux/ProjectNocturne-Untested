// /assets/js/tools/timer-controller.js - Con persistencia de estado robusta

import { getTranslation } from '../general/translations-controller.js';
import { PREMIUM_FEATURES, activateModule, getCurrentActiveOverlay, allowCardMovement } from '../general/main.js';
import { prepareTimerForEdit, prepareCountToDateForEdit } from './menu-interactions.js';
import { playAlarmSound, stopAlarmSound } from './alarm-controller.js';

// --- ESTADO Y CONSTANTES ---
const TIMERS_STORAGE_KEY = 'user-timers'; // Única clave para todo el estado
let timers = [];
let activeTimers = new Map();
let pinnedTimerId = null;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTimerController();
});

function initializeTimerController() {
    loadAndRestoreTimers();      // Función unificada para cargar y restaurar
    renderAllTimerCards();
    setupGlobalEventListeners();
    updateMainDisplay();
    initializeSortable();
    updateMainControlsState();
    updatePinnedStatesInUI();
    console.log('✅ Inicialización de timer completada.');
}

// --- LÓGICA DE CARGA, RESTAURACIÓN Y GUARDADO (UNIFICADA) ---

/**
 * Carga los temporizadores desde localStorage. Si un temporizador estaba corriendo,
 * recalcula el tiempo restante y reanuda su ejecución.
 */
function loadAndRestoreTimers() {
    const storedTimers = localStorage.getItem(TIMERS_STORAGE_KEY);

    // Si no hay temporizadores guardados, crea uno por defecto.
    if (!storedTimers) {
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
        return;
    }

    try {
        const loadedTimers = JSON.parse(storedTimers);
        const now = Date.now();

        timers = loadedTimers.map(timer => {
            // Si el temporizador estaba corriendo cuando se cerró la página...
            if (timer.isRunning) {
                if (timer.type === 'countdown') {
                    // Recalcula el tiempo restante basado en cuánto tiempo ha pasado desde el último guardado.
                    const elapsedSinceLastSave = now - (timer.lastSaveTime || now);
                    const newRemaining = Math.max(0, timer.remaining - elapsedSinceLastSave);

                    if (newRemaining > 0) {
                        timer.remaining = newRemaining;
                        startCountdownTimer(timer); // Reanuda el intervalo del temporizador.
                        console.log(`🔄 Temporizador de cuenta atrás restaurado: ${timer.title}`);
                    } else {
                        timer.remaining = 0;
                        timer.isRunning = false;
                        // Opcional: Aquí se podría llamar a handleTimerEnd(timer.id) si se desea
                        // que el sonido se active si el tiempo terminó mientras la página estaba cerrada.
                    }
                } else if (timer.type === 'count_to_date') {
                    // Los temporizadores de fecha siempre se recalculan respecto a la fecha objetivo.
                    // Esto asegura que nunca se "pausen".
                    timer.remaining = new Date(timer.targetDate).getTime() - now;
                    if (timer.remaining > 0) {
                        startCountToDateTimer(timer); // Siempre están "corriendo".
                        console.log(`🔄 Temporizador de fecha restaurado: ${timer.title}`);
                    } else {
                        timer.remaining = 0;
                        timer.isRunning = false;
                    }
                }
            }
            return timer;
        });

        // Lógica para asegurar que siempre haya un temporizador fijado (pinned).
        let pinnedTimer = timers.find(t => t.isPinned);
        if (!pinnedTimer && timers.length > 0) {
            pinnedTimer = timers[0];
            pinnedTimer.isPinned = true;
        }
        pinnedTimerId = pinnedTimer ? pinnedTimer.id : null;
        timers.forEach(t => t.isPinned = (t.id === pinnedTimerId));

    } catch (error) {
        console.error('Error al cargar o restaurar temporizadores. Se reseteará el estado.', error);
        localStorage.removeItem(TIMERS_STORAGE_KEY);
        timers = [];
    }
}

/**
 * Guarda el array completo de temporizadores en localStorage.
 * Para los temporizadores en ejecución, actualiza su 'lastSaveTime'.
 */
function saveTimersToStorage() {
    const now = Date.now();
    timers.forEach(timer => {
        if (timer.isRunning) {
            timer.lastSaveTime = now; // Marca la última vez que se guardó el estado.
        }
    });
    localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(timers));
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
    saveTimersToStorage(); // Guardar estado inmediatamente al iniciar.
}

function startCountdownTimer(timer) {
    timer.isRunning = true;
    const interval = setInterval(() => {
        timer.remaining -= 1000;
        updateCardDisplay(timer.id);
        if (timer.id === pinnedTimerId) updateMainDisplay();
        
        // Guardar estado periódicamente (cada 2 segundos) para mayor precisión.
        if (Math.floor(timer.remaining / 1000) % 2 === 0) {
            saveTimersToStorage();
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
        
        if (timer.remaining <= 0) {
            clearInterval(interval);
            activeTimers.delete(timer.id);
            timer.isRunning = false;
            saveTimersToStorage(); // Guardar el estado final.
        }
    }, 1000);
    activeTimers.set(timer.id, interval);
}

function pauseTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer || !timer.isRunning) return;
    
    timer.isRunning = false;
    clearInterval(activeTimers.get(timerId));
    activeTimers.delete(timerId);
    
    saveTimersToStorage(); // Guardar el estado de pausa.
    updateTimerCardControls(timerId);
    updateMainControlsState();
}

function resetTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;
    
    // Pausar primero para detener cualquier intervalo.
    pauseTimer(timerId);
    
    if(timer.type !== 'count_to_date') {
        timer.remaining = timer.initialDuration;
    }
    timer.isRunning = false; // Asegurarse de que el estado sea "no corriendo".
    
    updateCardDisplay(timerId);
    if (timer.id === pinnedTimerId) {
        updateMainDisplay();
    }
    
    saveTimersToStorage(); // Guardar el estado reseteado.
    updateTimerCardControls(timerId);
    updateMainControlsState();
}

// --- EVENTOS DE GUARDADO ---

// Guardar el estado al cerrar o recargar la página.
window.addEventListener('beforeunload', saveTimersToStorage);


// --- FUNCIONES DE UI Y MANEJO DE EVENTOS (sin cambios significativos) ---
// El resto de las funciones como addTimerAndRender, updateTimer, renderAllTimerCards, etc.,
// se mantienen prácticamente iguales, ya que la lógica de guardado/carga está ahora centralizada.
// Las he incluido aquí para que el archivo esté completo.

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
    }
}

export function addTimerAndRender(timerData) {
    const isCountToDate = timerData.type === 'count_to_date';

    const newTimer = {
        id: `timer-${Date.now()}`,
        title: timerData.title,
        type: timerData.type,
        isRunning: false,
        isPinned: false,
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

    if (timers.length === 1 || !timers.some(t => t.isPinned)) {
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

    if (newData.type === 'count_to_date') {
        timers[timerIndex] = {
            ...oldTimer,
            title: newData.title,
            targetDate: newData.targetDate,
            remaining: new Date(newData.targetDate).getTime() - Date.now(),
            isRunning: false // Will be restarted if needed
        };
        startTimer(timerId); // Restart the timer with new date
    } else { // It's a countdown timer
        timers[timerIndex] = {
            ...oldTimer,
            title: newData.title,
            initialDuration: newData.duration,
            remaining: newData.duration,
            endAction: newData.endAction,
            sound: newData.sound,
            isRunning: false
        };
    }

    saveTimersToStorage();
    renderAllTimerCards();
    updateMainDisplay();
    updateMainControlsState();
}

function renderAllTimerCards() {
    const container = document.querySelector('.timers-grid-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    timers.forEach(timer => {
        const card = createTimerCard(timer);
        container.appendChild(card);
    });
    
    setTimeout(() => {
        updatePinnedStatesInUI();
    }, 50);
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
    if (!pinnedTimerId && timers.length > 0) {
        const firstTimer = timers[0];
        pinnedTimerId = firstTimer.id;
        firstTimer.isPinned = true;
        saveTimersToStorage();
    }

    document.querySelectorAll('.timer-card').forEach(card => {
        const pinBtn = card.querySelector('.card-pin-btn');
        if (pinBtn) {
            pinBtn.classList.toggle('active', card.id === pinnedTimerId);
        }
    });
}

function formatTime(ms, type = 'countdown') {
    if (ms <= 0) {
        return type === 'count_to_date' ? getTranslation('event_finished', 'timer') || "¡Evento finalizado!" : "00:00:00";
    }

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

function handleTimerEnd(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer || timer.type === 'count_to_date') return;
    
    // Detiene el intervalo y actualiza el estado
    timer.isRunning = false;
    if (activeTimers.has(timerId)) {
        clearInterval(activeTimers.get(timerId));
        activeTimers.delete(timerId);
    }
    timer.remaining = 0;

    updateCardDisplay(timerId);
    if (timer.id === pinnedTimerId) updateMainDisplay();
    updateTimerCardControls(timerId);
    updateMainControlsState();
    saveTimersToStorage();

    if (timer.endAction === 'restart') {
        playAlarmSound(timer.sound);
        setTimeout(() => {
            stopAlarmSound();
            resetTimer(timerId);
            startTimer(timerId);
        }, 3000);

    } else { // 'stop'
        playAlarmSound(timer.sound);
        const card = document.getElementById(timerId);
        card?.querySelector('.card-options-container')?.classList.add('active');
    }
}

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
            case 'pin-timer': handlePinTimer(timerId); break;
            case 'toggle-timer-options': e.stopPropagation(); toggleOptionsMenu(target); break;
            case 'start-card-timer': startTimer(timerId); closeMenu(target); break;
            case 'pause-card-timer': pauseTimer(timerId); closeMenu(target); break;
            case 'reset-card-timer': resetTimer(timerId); closeMenu(target); break;
            case 'edit-timer': handleEditTimer(timerId); break;
            case 'delete-timer': handleDeleteTimer(timerId); break;
            case 'dismiss-timer': dismissTimer(timerId); break;
        }
    });

    // Cierra menús de opciones si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.card-options-btn-wrapper')) {
            document.querySelectorAll('.card-options-menu').forEach(menu => menu.style.display = 'none');
        }
    });
}

function closeMenu(target) {
    const menu = target.closest('.card-options-menu');
    if (menu) menu.style.display = 'none';
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
    const menu = optionsBtn.parentElement.querySelector('.card-options-menu');
    const isHidden = menu.style.display === 'none' || menu.style.display === '';
    document.querySelectorAll('.card-options-menu').forEach(m => m.style.display = 'none');
    if (isHidden) menu.style.display = 'flex';
}

function handleEditTimer(timerId) {
    const timerData = timers.find(t => t.id === timerId);
    if (timerData) {
        if (timerData.type === 'count_to_date') {
            prepareCountToDateForEdit(timerData);
        } else {
            prepareTimerForEdit(timerData);
        }
        if (getCurrentActiveOverlay() !== 'menuTimer') {
            activateModule('toggleMenuTimer');
        }
    }
}

function handleDeleteTimer(timerId) {
    if (!confirm(getTranslation('delete_timer_confirm', 'timer') || '¿Estás seguro de que quieres eliminar este temporizador?')) return;

    if (activeTimers.has(timerId)) {
        clearInterval(activeTimers.get(timerId));
        activeTimers.delete(timerId);
    }
    
    timers = timers.filter(t => t.id !== timerId);
    
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

function dismissTimer(timerId) {
    stopAlarmSound();
    const card = document.getElementById(timerId);
    if (card) {
        const optionsContainer = card.querySelector('.card-options-container');
        if (optionsContainer) {
            optionsContainer.classList.remove('active');
        }
    }
    const timer = timers.find(t => t.id === timerId);
    // Cuando un temporizador con acción 'stop' es descartado, se resetea a su valor inicial.
    if (timer && timer.endAction === 'stop') {
        resetTimer(timerId);
    }
}