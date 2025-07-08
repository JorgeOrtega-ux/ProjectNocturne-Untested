import { getTranslation } from './translations-controller.js';
import { activateModule, deactivateModule } from './module-manager.js';

let onConfirmCallback = null;
let activeModalType = null;

const typeToSingularTranslationKey = {
    'alarm': 'alarm',
    'timer': 'timer',
    'world-clock': 'world_clock',
    'audio': 'audio_singular'
};

const typeToCategoryMap = {
    'alarm': 'tooltips',
    'timer': 'tooltips',
    'world-clock': 'tooltips',
    'audio': 'sounds'
};

function populateConfirmationModal(data) {
    const modalMenu = document.querySelector('.menu-delete');
    if (!modalMenu) return;

    const { type: itemType, name } = data;

    // Elementos a actualizar usando data-attributes
    const headerTitleElement = modalMenu.querySelector('[data-delete-item="header-title"]');
    const itemTypeLabelElement = modalMenu.querySelector('[data-delete-item="item-type-label"]');
    const itemNameElement = modalMenu.querySelector('[data-delete-item="name"]');
    const messageElement = modalMenu.querySelector('[data-delete-item="confirmation-message"]');
    const confirmButton = modalMenu.querySelector('.confirm-btn');
    const cancelButton = modalMenu.querySelector('.cancel-btn');

    // Claves de traducción
    const headerTitleKey = `confirm_delete_title_${itemType}`;
    const messageKey = `confirm_delete_message_${itemType}`;
    const itemTypeLabelKey = `delete_${itemType}_title_prefix`;

    // Actualizar Textos
    if (headerTitleElement) headerTitleElement.textContent = getTranslation(headerTitleKey, 'confirmation');
    
    if (itemTypeLabelElement) {
        itemTypeLabelElement.textContent = getTranslation(itemTypeLabelKey, 'confirmation');
    }

    if (itemNameElement) itemNameElement.value = name;
    if (messageElement) messageElement.innerHTML = getTranslation(messageKey, 'confirmation').replace('{name}', `<strong>${name}</strong>`);
    if (confirmButton) confirmButton.textContent = getTranslation('delete', 'confirmation');
    if (cancelButton) cancelButton.textContent = getTranslation('cancel', 'confirmation');
}

function populateSuggestionModal() {
    const modalMenu = document.querySelector('.menu-suggestions');
    if (!modalMenu) return;
}

function setupModalEventListeners() {
    const overlay = document.querySelector('.module-overlay');
    if (!overlay) return;

    const deleteMenu = overlay.querySelector('.menu-delete');
    if (deleteMenu) {
        const confirmBtn = deleteMenu.querySelector('.confirm-btn');
        const cancelBtn = deleteMenu.querySelector('.cancel-btn');

        if(confirmBtn && !confirmBtn.onclick) {
            confirmBtn.onclick = () => {
                if (typeof onConfirmCallback === 'function') {
                    onConfirmCallback();
                }
                hideModal();
            };
        }

        if(cancelBtn && !cancelBtn.onclick) {
            cancelBtn.onclick = () => hideModal();
        }
    }

    const suggestionsMenu = overlay.querySelector('.menu-suggestions');
    if (suggestionsMenu) {
        const form = suggestionsMenu.querySelector('#suggestion-form');
        const cancelBtn = suggestionsMenu.querySelector('.cancel-btn');

        if(form && !form.onsubmit) {
            form.onsubmit = (e) => {
                e.preventDefault();
                hideModal();
            };
        }
        
        if(cancelBtn && !cancelBtn.onclick) {
             cancelBtn.onclick = () => hideModal();
        }
    }
}

export function showModal(type, data = {}, onConfirm = null) {
    activeModalType = type;

    if (type === 'confirmation') {
        populateConfirmationModal(data);
        onConfirmCallback = onConfirm;
        activateModule('toggleDeleteMenu'); 
    } else if (type === 'suggestion') {
        populateSuggestionModal();
        activateModule('toggleSuggestionMenu');
    }
    
    setupModalEventListeners();
}

export function hideModal() {
    if (activeModalType) {
        deactivateModule('overlayContainer', { source: `hide-modal-${activeModalType}` });
        activeModalType = null;
        onConfirmCallback = null;
    }
}