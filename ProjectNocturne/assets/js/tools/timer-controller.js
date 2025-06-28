// /assets/js/tools/timer-controller.js

import { getTranslation } from '../general/translations-controller.js';
import { PREMIUM_FEATURES, activateModule, getCurrentActiveOverlay } from '../general/main.js';

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
}

// =============================================================================
// === CAMBIO CLAVE: FUNCIÓN PARA AÑADIR NUEVOS TIMERS DESDE OTROS MÓDULOS =====
// =============================================================================

/**
 * Añade un nuevo temporizador a la lista, lo guarda y actualiza la UI.
 * Esta función es exportada para ser usada por menu-interactions.js.
 * @param {object} timerData - Datos del nuevo temporizador (title, initialDuration, etc.).
 */
export function addTimerAndRender(timerData) {
    const newTimer = {
        id: `timer-${Date.now()}`,
        title: timerData.title,
        initialDuration: timerData.duration, // Aseguramos que se use la duración en ms
        remaining: timerData.duration,
        isRunning: false,
        isPinned: timers.length === 0 // Fija el primer temporizador automáticamente
    };

    timers.push(newTimer);
    
    // Si este es el primer temporizador, se fija automáticamente.
    if (timers.length === 1) {
        pinnedTimerId = newTimer.id;
    }

    saveTimersToStorage();
    renderAllTimerCards();
    updateMainDisplay();
}


// --- GESTIÓN DE DATOS (STORAGE) ---
function loadTimersFromStorage() {
    const storedTimers = localStorage.getItem(TIMERS_STORAGE_KEY);
    if (storedTimers) {
        timers = JSON.parse(storedTimers);
        // Encuentra el temporizador fijado o fija el primero si no hay ninguno
        const pinnedTimer = timers.find(t => t.isPinned);
        pinnedTimerId = pinnedTimer ? pinnedTimer.id : (timers.length > 0 ? timers[0].id : null);

    } else {
        // Estado inicial con un temporizador de ejemplo si no hay nada guardado
        timers = [{
            id: `timer-${Date.now()}`,
            title: "Temporizador de 5 minutos",
            initialDuration: 300000, // 5 minutos en ms
            remaining: 300000,
            isRunning: false,
            isPinned: true
        }];
        pinnedTimerId = timers[0].id;
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
    container.innerHTML = ''; // Limpiamos para redibujar
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

    card.innerHTML = `
        <div class="card-header">
            <div class="card-location-details">
                <span class="location-text" title="${timer.title}">${timer.title}</span>
            </div>
        </div>
        <div class="card-body">
            <span class="clock-time">${formatTime(timer.remaining)}</span>
        </div>
        <div class="card-buttons-container">
            <button class="card-pin-btn" data-action="pin-timer" data-translate="pin_timer" data-translate-category="tooltips" data-translate-target="tooltip">
                <span class="material-symbols-rounded">push_pin</span>
            </button>
            <div class="card-options-btn-wrapper">
                 <button class="card-options-btn" data-action="toggle-timer-options" data-translate="options" data-translate-category="tooltips" data-translate-target="tooltip">
                    <span class="material-symbols-rounded">more_horiz</span>
                </button>
                <div class="card-options-menu">
                    <div class="menu-link" data-action="edit-timer">
                        <div class="menu-link-icon"><span class="material-symbols-rounded">edit</span></div>
                        <div class="menu-link-text"><span data-translate="edit_timer" data-translate-category="timer">Editar</span></div>
                    </div>
                    <div class="menu-link" data-action="delete-timer">
                        <div class="menu-link-icon"><span class="material-symbols-rounded">delete</span></div>
                        <div class="menu-link-text"><span data-translate="delete_timer" data-translate-category="timer">Eliminar</span></div>
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
        mainDisplay.textContent = formatTime(pinnedTimer.remaining);
    } else {
        mainDisplay.textContent = formatTime(0); // Muestra 00:00:00 si no hay temporizadores
    }
}

function updateCardDisplay(timerId) {
    const card = document.getElementById(timerId);
    if (!card) return;
    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;

    const timeElement = card.querySelector('.clock-time');
    if (timeElement) {
        timeElement.textContent = formatTime(timer.remaining);
    }
}

function updatePinnedStatesInUI() {
    document.querySelectorAll('.timer-card').forEach(card => {
        const pinBtn = card.querySelector('.card-pin-btn');
        if (card.id === pinnedTimerId) {
            pinBtn.classList.add('active');
            card.style.border = '2px solid #000000'; // Estilo más visible para la tarjeta fijada
        } else {
            pinBtn.classList.remove('active');
            card.style.border = '1px solid #00000020';
        }
    });
}

function formatTime(ms) {
    // Maneja el caso de que ms sea 0 o negativo
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000)); 
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}


// --- LÓGICA DEL TEMPORIZADOR ---

function startTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer || timer.isRunning || timer.remaining <= 0) return;

    timer.isRunning = true;
    const interval = setInterval(() => {
        timer.remaining -= 1000;
        updateCardDisplay(timerId);
        if (timer.id === pinnedTimerId) {
            updateMainDisplay();
        }
        if (timer.remaining < 1000) { // Para que se detenga justo en 0
            stopTimer(timerId, true);
            alert(`¡El temporizador "${timer.title}" ha finalizado!`);
        }
    }, 1000);
    activeTimers.set(timerId, interval);
}

function pauseTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer || !timer.isRunning) return;
    timer.isRunning = false;
    clearInterval(activeTimers.get(timerId));
    activeTimers.delete(timerId);
    saveTimersToStorage();
}

function resetTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;
    pauseTimer(timerId);
    timer.remaining = timer.initialDuration;
    updateCardDisplay(timerId);
    if (timer.id === pinnedTimerId) {
        updateMainDisplay();
    }
    saveTimersToStorage();
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
function setupGlobalEventListeners() {
    const section = document.querySelector('.section-timer');
    if (!section) return;

    // Eventos para los botones de la barra superior
    section.querySelector('[data-action="start-pinned-timer"]').addEventListener('click', () => {
        if (pinnedTimerId) startTimer(pinnedTimerId);
    });
    section.querySelector('[data-action="pause-pinned-timer"]').addEventListener('click', () => {
        if (pinnedTimerId) pauseTimer(pinnedTimerId);
    });
     section.querySelector('[data-action="reset-pinned-timer"]').addEventListener('click', () => {
        if (pinnedTimerId) resetTimer(pinnedTimerId);
    });

    // Delegación de eventos para las tarjetas
    const container = section.querySelector('.timers-grid-container');
    container.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const card = target.closest('.timer-card');
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
            case 'edit-timer':
                handleEditTimer(timerId);
                break;
            case 'delete-timer':
                handleDeleteTimer(timerId);
                break;
        }
    });
}

function handlePinTimer(timerId) {
    if (pinnedTimerId === timerId) return; // No hacer nada si ya está fijado
    
    pinnedTimerId = timerId;
    timers.forEach(t => t.isPinned = (t.id === timerId));
    
    updatePinnedStatesInUI();
    updateMainDisplay();
    saveTimersToStorage();
}

function toggleOptionsMenu(optionsBtn) {
    const wrapper = optionsBtn.parentElement;
    const menu = wrapper.querySelector('.card-options-menu');
    
    const isActive = menu.style.display === 'flex';

    // Cerrar todos los demás menús abiertos
    document.querySelectorAll('.card-options-menu').forEach(m => {
        m.style.display = 'none';
    });

    // Abrir o cerrar el menú actual
    if (!isActive) {
        menu.style.display = 'flex';
    }
}

function handleEditTimer(timerId) {
    console.log("Solicitado editar temporizador:", timerId);
    alert("La función de editar aún no está implementada.");
    // Aquí iría la lógica para abrir el menú `toggleMenuTimer`
    // y poblarlo con los datos del temporizador a editar.
}

function handleDeleteTimer(timerId) {
    if (!confirm("¿Estás seguro de que quieres eliminar este temporizador?")) return;

    timers = timers.filter(t => t.id !== timerId);
    if (activeTimers.has(timerId)) {
        clearInterval(activeTimers.get(timerId));
        activeTimers.delete(timerId);
    }
    
    if (pinnedTimerId === timerId) {
        // Si se elimina el fijado, fijar el primero que quede
        pinnedTimerId = timers.length > 0 ? timers[0].id : null;
        if (pinnedTimerId) {
             const newPinnedTimer = timers.find(t => t.id === pinnedTimerId);
             if(newPinnedTimer) newPinnedTimer.isPinned = true;
        }
    }
    
    saveTimersToStorage();
    renderAllTimerCards();
    updateMainDisplay();
}

// --- Cerrar menús de opciones si se hace clic fuera ---
document.addEventListener('click', (e) => {
    if (!e.target.closest('.card-options-btn-wrapper')) {
        document.querySelectorAll('.card-options-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});