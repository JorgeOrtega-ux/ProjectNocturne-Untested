// /assets/js/tools/alarm-controller.js
import { use24HourFormat, PREMIUM_FEATURES, activateModule, getCurrentActiveOverlay } from '../general/main.js';
import { prepareAlarmForEdit } from './menu-interactions.js';

// ========== CONFIGURACIÓN Y CONSTANTES ==========
const ALARMS_STORAGE_KEY = 'user-alarms';
const ALARM_SOUND_PATTERNS = {
    'classic-beep': {
        frequencies: [800],
        beepDuration: 150, // ms
        pauseDuration: 150, // ms
        type: 'square'
    },
    'gentle-chime': {
        frequencies: [523.25, 659.25, 783.99],
        beepDuration: 300,
        pauseDuration: 500,
        type: 'sine'
    },
    'digital-alarm': {
        frequencies: [1200, 800],
        beepDuration: 100,
        pauseDuration: 100,
        type: 'square'
    },
    'peaceful-tone': {
        frequencies: [440, 554.37, 659.25],
        beepDuration: 400,
        pauseDuration: 600,
        type: 'sine'
    },
    'urgent-beep': {
        frequencies: [1600, 1600],
        beepDuration: 80,
        pauseDuration: 80,
        type: 'sawtooth'
    }
};

const DEFAULT_ALARMS = [
    { id: 'default-1', title: 'Limpiar cuarto', hour: 10, minute: 0, sound: 'gentle-chime', enabled: false },
    { id: 'default-2', title: 'Hacer ejercicio', hour: 18, minute: 0, sound: 'digital-alarm', enabled: false },
    { id: 'default-3', title: 'Leer un libro', hour: 21, minute: 0, sound: 'peaceful-tone', enabled: false }
];

// ========== ESTADO DEL SISTEMA ==========
let clockInterval = null;
let userAlarms = [];
let activeAlarmTimers = new Map();
let isPlayingSound = false;
let audioContext = null;
let activeSoundSource = null;

// ========== INICIALIZACIÓN DEL AUDIO ==========
function initializeAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API no está disponible:', e);
            return false;
        }
    }
    return true;
}

// ========== GENERACIÓN DE SONIDOS ==========
function playAlarmSound(soundType = 'classic-beep') {
    if (isPlayingSound || !initializeAudioContext()) return;

    stopAlarmSound(); // Detiene cualquier sonido anterior

    isPlayingSound = true;
    const pattern = ALARM_SOUND_PATTERNS[soundType] || ALARM_SOUND_PATTERNS['classic-beep'];
    let freqIndex = 0;

    const playBeep = () => {
        if (!isPlayingSound) return;

        const freq = pattern.frequencies[freqIndex % pattern.frequencies.length];
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = pattern.type;
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + (pattern.beepDuration / 1000));

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + (pattern.beepDuration / 1000));

        freqIndex++;
    };

    playBeep(); // Reproduce el primer beep inmediatamente
    const intervalId = setInterval(playBeep, pattern.beepDuration + pattern.pauseDuration);
    activeSoundSource = { intervalId: intervalId };
}


function stopAlarmSound() {
    if (activeSoundSource && activeSoundSource.intervalId) {
        clearInterval(activeSoundSource.intervalId);
    }
    activeSoundSource = null;
    isPlayingSound = false;
}


// ========== GESTIÓN DE ALARMAS ==========
function createAlarm(title, hour, minute, sound) {
    const alarmLimit = PREMIUM_FEATURES ? 100 : 10;
    
    if (userAlarms.length >= alarmLimit) {
        const limitMessage = getTranslation('alarm_limit_reached', 'alarms').replace('{limit}', alarmLimit);
        alert(limitMessage);
        return false;
    }

    const alarmId = `alarm-${Date.now()}`;
    const alarm = {
        id: alarmId,
        title: title,
        hour: hour,
        minute: minute,
        sound: sound,
        enabled: true,
        created: new Date().toISOString()
    };

    userAlarms.push(alarm);
    saveAlarmsToStorage();
    showAlarmsSection('user');
    createAlarmCard(alarm, 'user');
    scheduleAlarm(alarm);
    
    return true;
}

function scheduleAlarm(alarm) {
    if (!alarm.enabled) return;

    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(alarm.hour, alarm.minute, 0, 0);

    // Si la hora ya pasó hoy, programar para mañana
    if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const timeUntilAlarm = alarmTime.getTime() - now.getTime();
    
    // Limpiar timer existente si existe
    if (activeAlarmTimers.has(alarm.id)) {
        clearTimeout(activeAlarmTimers.get(alarm.id));
    }

    const timerId = setTimeout(() => {
        triggerAlarm(alarm);
        activeAlarmTimers.delete(alarm.id);
    }, timeUntilAlarm);

    activeAlarmTimers.set(alarm.id, timerId);
}

function triggerAlarm(alarm) {
    // Reproducir sonido
    playAlarmSound(alarm.sound);

    const alarmCard = document.getElementById(alarm.id);
    if (alarmCard) {
        const optionsContainer = alarmCard.querySelector('.card-options-container');
        if (optionsContainer) {
            optionsContainer.classList.add('active');
        }
    }
    
    // Mostrar notificación del navegador si está disponible
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Alarma: ${alarm.title}`, {
            body: `${formatTime(alarm.hour, alarm.minute)}`,
            icon: '/favicon.ico'
        });
    }

    // Re-programar para el siguiente día
    scheduleAlarm(alarm);
}

function dismissAlarm(alarmId) {
    stopAlarmSound();
    const alarmCard = document.getElementById(alarmId);
    if (alarmCard) {
        const optionsContainer = alarmCard.querySelector('.card-options-container');
        if (optionsContainer) {
            optionsContainer.classList.remove('active');
        }
    }
    
    // Desactivar la alarma
    const alarmToToggle = userAlarms.find(a => a.id === alarmId);
    if (alarmToToggle && alarmToToggle.enabled) {
        toggleAlarm(alarmId);
    }
}


// ========== INTERFAZ DE USUARIO ==========
function createAlarmCard(alarm, type = 'user') {
    const alarmsGrid = document.querySelector(`.alarms-grid[data-alarm-grid="${type}"]`);
    if (!alarmsGrid) return;

    const cardHTML = `
        <div class="alarm-card ${!alarm.enabled ? 'alarm-disabled' : ''}" id="${alarm.id}" data-id="${alarm.id}">
            <div class="card-header">
                <div class="card-alarm-details">
                    <span class="alarm-title" title="${alarm.title}">${alarm.title}</span>
                    <span class="alarm-time">${formatTime(alarm.hour, alarm.minute)}</span>
                </div>
            </div>
            <div class="card-footer">
                <div class="alarm-info">
                    <span class="alarm-sound-name">${getTranslation(alarm.sound, 'sounds')}</span>
                </div>
            </div>
            
            <div class="card-options-container">
                <button class="dismiss-alarm-btn" data-action="dismiss-alarm">
                    <span data-translate="dismiss" data-translate-category="alarms">Dismiss</span>
                </button>
            </div>

            <div class="card-menu-container disabled">
                <div class="card-menu-btn-wrapper">
                    <button class="card-menu-btn" data-action="toggle-alarm-menu"
                            data-translate="options"
                            data-translate-category="world_clock_options"
                            data-translate-target="tooltip">
                        <span class="material-symbols-rounded">more_horiz</span>
                    </button>
                    <div class="card-dropdown-menu disabled body-title">
                        <div class="menu-link" data-action="toggle-alarm">
                            <div class="menu-link-icon"><span class="material-symbols-rounded">${alarm.enabled ? 'toggle_on' : 'toggle_off'}</span></div>
                            <div class="menu-link-text">
                                <span data-translate="${alarm.enabled ? 'deactivate_alarm' : 'activate_alarm'}" 
                                      data-translate-category="alarms" 
                                      data-translate-target="text">${alarm.enabled ? 'Deactivate Alarm' : 'Activate Alarm'}</span>
                            </div>
                        </div>
                        <div class="menu-link" data-action="test-alarm">
                            <div class="menu-link-icon"><span class="material-symbols-rounded">volume_up</span></div>
                            <div class="menu-link-text">
                                <span data-translate="test_alarm" 
                                      data-translate-category="alarms" 
                                      data-translate-target="text">Test Alarm</span>
                            </div>
                        </div>
                        <div class="menu-link" data-action="edit-alarm">
                            <div class="menu-link-icon"><span class="material-symbols-rounded">edit</span></div>
                            <div class="menu-link-text">
                                <span data-translate="edit_alarm" 
                                      data-translate-category="alarms" 
                                      data-translate-target="text">Edit Alarm</span>
                            </div>
                        </div>
                        <div class="menu-link" data-action="delete-alarm">
                            <div class="menu-link-icon"><span class="material-symbols-rounded">delete</span></div>
                            <div class="menu-link-text">
                                <span data-translate="delete_alarm" 
                                      data-translate-category="alarms" 
                                      data-translate-target="text">Delete Alarm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    alarmsGrid.insertAdjacentHTML('beforeend', cardHTML);

    const newCard = document.getElementById(alarm.id);
    if (newCard) {
        const menuContainer = newCard.querySelector('.card-menu-container');

        newCard.addEventListener('mouseenter', () => {
            menuContainer?.classList.add('active');
            menuContainer?.classList.remove('disabled');
        });

        newCard.addEventListener('mouseleave', () => {
            const dropdown = menuContainer?.querySelector('.card-dropdown-menu');
            if (dropdown?.classList.contains('disabled')) {
                menuContainer?.classList.remove('active');
                menuContainer?.classList.add('disabled');
            }
        });
        
        const dismissButton = newCard.querySelector('[data-action="dismiss-alarm"]');
        if(dismissButton) {
            dismissButton.addEventListener('click', () => dismissAlarm(alarm.id));
        }

        setTimeout(() => {
            applyTranslationsToAlarmCard(newCard);
            if (window.attachTooltipsToNewElements) {
                window.attachTooltipsToNewElements(newCard);
            }
        }, 0);
    }
}

function showAlarmsSection(type = 'user') {
    const sectionBottom = document.querySelector('.section-alarm .section-bottom');
    if (!sectionBottom) return;

    const alarms = type === 'user' ? userAlarms : DEFAULT_ALARMS;
    
    if (alarms.length > 0) {
        sectionBottom.style.display = 'block';
    } else {
        const grid = document.querySelector(`.alarms-grid[data-alarm-grid="${type}"]`);
        if (grid) {
            const container = grid.closest('.alarms-container');
            if (container) {
                container.style.display = 'none';
            }
        }
    }
}

// ========== FUNCIONES DE GESTIÓN ==========
function toggleAlarm(alarmId) {
    const alarm = userAlarms.find(a => a.id === alarmId) || DEFAULT_ALARMS.find(a => a.id === alarmId);
    if (!alarm) return;

    alarm.enabled = !alarm.enabled;
    if (userAlarms.find(a => a.id === alarmId)) {
        saveAlarmsToStorage();
    }
    
    if (alarm.enabled) {
        scheduleAlarm(alarm);
    } else {
        if (activeAlarmTimers.has(alarmId)) {
            clearTimeout(activeAlarmTimers.get(alarmId));
            activeAlarmTimers.delete(alarmId);
        }
    }

    updateAlarmCardVisuals(alarm);
}

function deleteAlarm(alarmId) {
    const alarmIndex = userAlarms.findIndex(a => a.id === alarmId);
    if (alarmIndex === -1) return;

    // Limpiar timer si existe
    if (activeAlarmTimers.has(alarmId)) {
        clearTimeout(activeAlarmTimers.get(alarmId));
        activeAlarmTimers.delete(alarmId);
    }

    // Remover de array y localStorage
    userAlarms.splice(alarmIndex, 1);
    saveAlarmsToStorage();

    // Remover tarjeta del DOM
    const alarmCard = document.getElementById(alarmId);
    if (alarmCard) {
        alarmCard.remove();
    }

    // Ocultar sección si no hay más alarmas
    showAlarmsSection('user');
}

function updateAlarmCard(alarmId, newData) {
    const alarmIndex = userAlarms.findIndex(a => a.id === alarmId);
    if (alarmIndex === -1) return;

    const alarm = userAlarms[alarmIndex];
    Object.assign(alarm, newData);
    saveAlarmsToStorage();

    // Re-programar alarma
    if (activeAlarmTimers.has(alarmId)) {
        clearTimeout(activeAlarmTimers.get(alarmId));
        activeAlarmTimers.delete(alarmId);
    }
    
    if (alarm.enabled) {
        scheduleAlarm(alarm);
    }

    // Actualizar tarjeta visual
    updateAlarmCardVisuals(alarm);
}

function updateAlarmCardVisuals(alarm) {
    const alarmCard = document.getElementById(alarm.id);
    if (!alarmCard) return;

    const titleElement = alarmCard.querySelector('.alarm-title');
    const timeElement = alarmCard.querySelector('.alarm-time');
    const soundElement = alarmCard.querySelector('.alarm-sound-name');
    const toggleLink = alarmCard.querySelector('[data-action="toggle-alarm"]');
    const toggleIcon = toggleLink?.querySelector('.menu-link-icon span');
    const toggleText = toggleLink?.querySelector('.menu-link-text span');

    if (titleElement) {
        titleElement.textContent = alarm.title;
        titleElement.setAttribute('title', alarm.title);
    }
    if (timeElement) {
        timeElement.textContent = formatTime(alarm.hour, alarm.minute);
    }
    if (soundElement) {
        soundElement.textContent = getTranslation(alarm.sound, 'sounds');
    }

    if (toggleIcon) {
        toggleIcon.textContent = alarm.enabled ? 'toggle_on' : 'toggle_off';
    }

    if (toggleText) {
        const translationKey = alarm.enabled ? 'deactivate_alarm' : 'activate_alarm';
        toggleText.setAttribute('data-translate', translationKey);
        toggleText.textContent = getTranslation(translationKey, 'alarms');
    }
    
    // Cambiar apariencia visual según estado
    if (alarm.enabled) {
        alarmCard.classList.remove('alarm-disabled');
    } else {
        alarmCard.classList.add('alarm-disabled');
    }

    setTimeout(() => {
        applyTranslationsToAlarmCard(alarmCard);
        if (window.attachTooltipsToNewElements) {
            window.attachTooltipsToNewElements(alarmCard);
        }
    }, 0);
}

// ========== ALMACENAMIENTO ==========
function saveAlarmsToStorage() {
    try {
        localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(userAlarms));
    } catch (error) {
        console.error('Error guardando alarmas:', error);
    }
}

function loadAlarmsFromStorage() {
    try {
        const storedAlarms = localStorage.getItem(ALARMS_STORAGE_KEY);
        if (storedAlarms) {
            userAlarms = JSON.parse(storedAlarms);
            
            if (userAlarms.length > 0) {
                showAlarmsSection('user');
                userAlarms.forEach(alarm => {
                    createAlarmCard(alarm, 'user');
                    if (alarm.enabled) {
                        scheduleAlarm(alarm);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error cargando alarmas:', error);
        userAlarms = [];
    }
}

function loadDefaultAlarms() {
    DEFAULT_ALARMS.forEach(alarm => {
        createAlarmCard(alarm, 'default');
    });
    showAlarmsSection('default');
}

// ========== UTILIDADES ==========
function formatTime(hour, minute) {
    if (use24HourFormat) {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    } else {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        let hour12 = hour % 12;
        hour12 = hour12 ? hour12 : 12;
        return `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`;
    }
}

function getTranslation(key, category) {
    if (typeof window.getTranslation === 'function') {
        const text = window.getTranslation(key, category);
        return text === key ? key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : text;
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function applyTranslationsToAlarmCard(card) {
    const elementsToTranslate = card.querySelectorAll('[data-translate]');
    
    elementsToTranslate.forEach(element => {
        const translateKey = element.getAttribute('data-translate');
        const translateCategory = element.getAttribute('data-translate-category') || 'alarms';
        const translateTarget = element.getAttribute('data-translate-target') || 'text';

        if (!translateKey) return;

        const translatedText = getTranslation(translateKey, translateCategory);

        switch (translateTarget) {
            case 'text':
                element.textContent = translatedText;
                break;
            case 'tooltip':
                element.setAttribute('data-tooltip', translatedText);
                break;
            default:
                element.textContent = translatedText;
        }
    });
}

function toggleAlarmsSection(type) {
    // Busca el contenedor principal de la sección de alarmas (user o default)
    const gridSelector = `.alarms-grid[data-alarm-grid="${type}"]`;
    const alarmsGrid = document.querySelector(gridSelector);
    if (!alarmsGrid) return;
    
    const container = alarmsGrid.closest('.alarms-container');
    if (!container) return;

    const collapseBtn = container.querySelector('.collapse-alarms-btn');
    
    if (alarmsGrid && collapseBtn) {
        const isExpanded = alarmsGrid.classList.toggle('expanded');
        collapseBtn.classList.toggle('expanded', isExpanded);
        
        const icon = collapseBtn.querySelector('.expand-icon');
        if (icon) {
             // El ícono ahora rota usando solo CSS, no es necesario cambiar el texto.
        }
    }
}

// ========== RELOJ PRINCIPAL ==========
function updateLocalTime() {
    const alarmClockElement = document.querySelector('.tool-alarm span');

    if (alarmClockElement) {
        const now = new Date();
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !use24HourFormat
        };
        alarmClockElement.textContent = now.toLocaleTimeString(navigator.language, options);
    }
}

function startClock() {
    if (clockInterval) return;
    
    updateLocalTime();
    clockInterval = setInterval(updateLocalTime, 1000);
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    const sectionBottom = document.querySelector('.section-alarm .section-bottom');
    if (sectionBottom) {
        sectionBottom.addEventListener('click', function(e) {
            const actionTarget = e.target.closest('[data-action]');
            if (!actionTarget) return;

            const action = actionTarget.dataset.action;
            const card = actionTarget.closest('.alarm-card');
            if (!card) return;

            const alarmId = card.dataset.id;

            if (action === 'toggle-alarm-menu') {
                e.stopPropagation();
                const currentDropdown = card.querySelector('.card-dropdown-menu');

                document.querySelectorAll('.card-dropdown-menu').forEach(menu => {
                    if (menu !== currentDropdown) {
                        menu.classList.add('disabled');
                    }
                });

                currentDropdown?.classList.toggle('disabled');

            } else if (action === 'toggle-alarm') {
                toggleAlarm(alarmId);
            } else if (action === 'test-alarm') {
                const alarm = userAlarms.find(a => a.id === alarmId) || DEFAULT_ALARMS.find(a => a.id === alarmId);
                if (alarm) {
                    playAlarmSound(alarm.sound);
                }

            } else if (action === 'edit-alarm') {
                e.stopPropagation();
                const alarm = userAlarms.find(a => a.id === alarmId);
                if (alarm) {
                    prepareAlarmForEdit(alarm);
                    
                    if (getCurrentActiveOverlay() !== 'menuAlarm') {
                        activateModule('toggleMenuAlarm');
                    }
                }

            } else if (action === 'delete-alarm') {
                if (confirm(getTranslation('confirm_delete_alarm', 'alarms'))) {
                    deleteAlarm(alarmId);
                }
            }
        });
    }

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.card-menu-btn-wrapper')) {
            document.querySelectorAll('.card-dropdown-menu').forEach(menu => {
                menu.classList.add('disabled');
            });
        }
    });
}

// ========== FUNCIONES PÚBLICAS ==========
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ========== INICIALIZACIÓN ==========
export function initializeAlarmClock() {
    startClock();
    loadAlarmsFromStorage();
    loadDefaultAlarms();
    setupEventListeners();
    requestNotificationPermission();

    // Exponer funciones globalmente
    window.alarmManager = {
        createAlarm,
        toggleAlarm,
        deleteAlarm,
        updateAlarm: updateAlarmCard,
        toggleAlarmsSection,
        playAlarmSound,
        dismissAlarm
    };
}

// ========== EVENTOS DE IDIOMA ==========
document.addEventListener('languageChanged', () => {
    setTimeout(() => {
        document.querySelectorAll('.alarm-card').forEach(applyTranslationsToAlarmCard);
    }, 500);
});

document.addEventListener('translationsApplied', () => {
    setTimeout(() => {
        document.querySelectorAll('.alarm-card').forEach(applyTranslationsToAlarmCard);
    }, 100);
});