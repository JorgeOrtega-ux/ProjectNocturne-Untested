import { getTranslation } from './translations-controller.js';
import { activateModule, deactivateModule } from './module-manager.js';

let onConfirmCallback = null;
let activeModalType = null;

// Mapeo para las traducciones de confirmación
const typeToTranslationKey = {
    'alarm': 'alarms',
    'timer': 'timer',
    'world-clock': 'world_clock',
    'audio': 'sounds'
};

function populateConfirmationModal(data) {
    const modalMenu = document.querySelector('.menu-delete');
    if (!modalMenu) return;

    const { type: itemType, name } = data;
    const titleElement = modalMenu.querySelector('h1');
    const messageElement = modalMenu.querySelector('span');
    const confirmButton = modalMenu.querySelector('.confirm-btn');
    const cancelButton = modalMenu.querySelector('.cancel-btn');

    const titleKey = `confirm_delete_title_${itemType}`;
    const messageKey = `confirm_delete_message_${itemType}`;

    if (titleElement) titleElement.textContent = getTranslation(titleKey, 'confirmation');
    if (messageElement) messageElement.innerHTML = getTranslation(messageKey, 'confirmation').replace('{name}', `<strong>${name}</strong>`);
    if (confirmButton) confirmButton.textContent = getTranslation('delete', 'confirmation');
    if (cancelButton) cancelButton.textContent = getTranslation('cancel', 'confirmation');
}

function populateSuggestionModal() {
    const modalMenu = document.querySelector('.menu-suggestions');
    if (!modalMenu) return;

    // (Opcional) Poblar cualquier texto dinámico si fuera necesario.
    // En este caso, la mayor parte del texto es estático y se maneja por data-translate.
}

function setupModalEventListeners() {
    const overlay = document.querySelector('.module-overlay');
    if (!overlay) return;

    // Listener para el modal de confirmación
    const deleteMenu = overlay.querySelector('.menu-delete');
    if (deleteMenu) {
        const confirmBtn = deleteMenu.querySelector('.confirm-btn');
        const cancelBtn = deleteMenu.querySelector('.cancel-btn');

        confirmBtn.onclick = () => {
            if (typeof onConfirmCallback === 'function') {
                onConfirmCallback();
            }
            hideModal();
        };
        cancelBtn.onclick = () => hideModal();
    }

    // Listener para el modal de sugerencias
    const suggestionsMenu = overlay.querySelector('.menu-suggestions');
    if (suggestionsMenu) {
        const form = suggestionsMenu.querySelector('#suggestion-form');
        const cancelBtn = suggestionsMenu.querySelector('.cancel-btn');

        form.onsubmit = (e) => {
            e.preventDefault();
            console.log('Suggestion submitted:', {
                type: form.elements['suggestion-type'].value,
                text: form.elements['suggestion-text'].value
            });
            hideModal();
        };

        cancelBtn.onclick = () => hideModal();
    }
}


export function showModal(type, data = {}, onConfirm = null) {
    activeModalType = type;

    if (type === 'confirmation') {
        populateConfirmationModal(data);
        onConfirmCallback = onConfirm;
        activateModule('toggleDeleteMenu'); // Necesitarás añadir esto a TOGGLE_TO_MODULE_MAP
    } else if (type === 'suggestion') {
        populateSuggestionModal();
        activateModule('toggleSuggestionMenu'); // Y esto también
    }
    
    // Los listeners se pueden configurar una vez en la inicialización de la app
    // o aquí si es necesario re-bindearlos. Para ser seguros:
    setupModalEventListeners();
}


export function hideModal() {
    if (activeModalType) {
        deactivateModule('overlayContainer', { source: `hide-modal-${activeModalType}` });
        activeModalType = null;
        onConfirmCallback = null;
    }
}