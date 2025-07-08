import { getTranslation } from './translations-controller.js';

let activeModal = null;
let onConfirmCallback = null;

// Mapeo para las traducciones de confirmación
const typeToTranslationKey = {
    'alarm': 'alarms',
    'timer': 'timer',
    'world-clock': 'world_clock',
    'audio': 'sounds'
};

function createModalDOM(modalType) {
    let modalHTML = '';

    if (modalType === 'confirmation') {
        modalHTML = `
            <div class="menu-delete">
                <h1></h1>
                <span></span>
                <div class="menu-delete-btns">
                    <button class="cancel-btn body-title"></button>
                    <button class="confirm-btn body-title"></button>
                </div>
            </div>
        `;
    } else if (modalType === 'suggestion') {
        modalHTML = `
            <div class="menu-suggestion">
                <h1>${getTranslation('suggest_improvements_title', 'menu')}</h1>
                <p>${getTranslation('suggest_improvements_desc', 'menu')}</p>
                <form id="suggestion-form">
                    <div class="form-group">
                        <label for="suggestion-type">${getTranslation('suggestion_type', 'menu')}</label>
                        <div class="custom-select-wrapper">
                            <input type="hidden" name="suggestion-type" id="suggestion-type-value" value="improvement">
                            <div class="custom-select-content" data-action="toggle-suggestion-type">
                                <div class="custom-select-content-left">
                                    <span id="suggestion-type-display">${getTranslation('suggestion_type_improvement', 'menu')}</span>
                                </div>
                                <div class="custom-select-content-right">
                                    <span class="material-symbols-rounded">expand_more</span>
                                </div>
                            </div>
                            <div class="dropdown-menu-container suggestion-type-dropdown disabled">
                                <div class="menu-list">
                                    <div class="menu-link" data-value="improvement">
                                        <div class="menu-link-icon"><span class="material-symbols-rounded">trending_up</span></div>
                                        <div class="menu-link-text"><span>${getTranslation('suggestion_type_improvement', 'menu')}</span></div>
                                    </div>
                                    <div class="menu-link" data-value="bug">
                                        <div class="menu-link-icon"><span class="material-symbols-rounded">bug_report</span></div>
                                        <div class="menu-link-text"><span>${getTranslation('suggestion_type_bug', 'menu')}</span></div>
                                    </div>
                                    <div class="menu-link" data-value="feature_request">
                                        <div class="menu-link-icon"><span class="material-symbols-rounded">star</span></div>
                                        <div class="menu-link-text"><span>${getTranslation('suggestion_type_feature', 'menu')}</span></div>
                                    </div>
                                    <div class="menu-link" data-value="other">
                                        <div class="menu-link-icon"><span class="material-symbols-rounded">help_outline</span></div>
                                        <div class="menu-link-text"><span>${getTranslation('suggestion_type_other', 'menu')}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="suggestion-text">${getTranslation('suggestion_message', 'menu')}</label>
                        <textarea id="suggestion-text" name="suggestion-text" rows="5" required></textarea>
                    </div>
                    <div class="menu-delete-btns">
                         <button type="button" class="cancel-btn body-title">${getTranslation('cancel', 'confirmation')}</button>
                         <button type="submit" class="confirm-btn body-title">${getTranslation('send_suggestion', 'menu')}</button>
                    </div>
                    <p class="privacy-note">Es posible que se envíe a Google información de la cuenta y del sistema para solucionar problemas y mejorar nuestros servicios.</p>
                </form>
            </div>
        `;
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.className = `module-overlay confirmation-overlay`;
    modalOverlay.innerHTML = modalHTML;
    document.body.appendChild(modalOverlay);

    return modalOverlay;
}

function destroyActiveModal() {
    if (activeModal) {
        // Limpia el listener global del documento para el dropdown
        document.removeEventListener('click', closeDropdownOnClickOutside);
        activeModal.remove();
        activeModal = null;
        onConfirmCallback = null;
    }
}

// --- NUEVA FUNCIÓN PARA CERRAR EL DROPDOWN ---
function closeDropdownOnClickOutside(e) {
    if (activeModal) {
        const dropdownMenu = activeModal.querySelector('.suggestion-type-dropdown');
        const dropdownToggle = activeModal.querySelector('[data-action="toggle-suggestion-type"]');
        
        if (dropdownMenu && !dropdownMenu.classList.contains('disabled') && !dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add('disabled');
        }
    }
}

export function showModal(type, data, onConfirm) {
    if (activeModal) {
        destroyActiveModal();
    }
    
    activeModal = createModalDOM(type);
    
    // --- LÓGICA DE CLIC AFUERA CORREGIDA ---
    activeModal.onclick = (e) => {
        // Solo cierra el modal si se hace clic en el fondo oscuro (el propio overlay)
        if (e.target === activeModal) {
            hideModal();
        }
    };

    if (type === 'confirmation') {
        const { type: itemType, name } = data;
        const titleElement = activeModal.querySelector('h1');
        const messageElement = activeModal.querySelector('span');
        const confirmButton = activeModal.querySelector('.confirm-btn');
        const translationKey = `confirm_delete_title_${itemType}`;
        const messageKey = `confirm_delete_message_${itemType}`;

        titleElement.textContent = getTranslation(translationKey, 'confirmation');
        messageElement.innerHTML = getTranslation(messageKey, 'confirmation').replace('{name}', `<strong>${name}</strong>`);
        confirmButton.textContent = getTranslation('delete', 'confirmation');
        
        activeModal.querySelector('.cancel-btn').onclick = hideModal;
        onConfirmCallback = onConfirm;
        confirmButton.onclick = () => {
            if (typeof onConfirmCallback === 'function') onConfirmCallback();
            hideModal();
        };

    } else if (type === 'suggestion') {
        const form = activeModal.querySelector('#suggestion-form');
        const confirmButton = activeModal.querySelector('.confirm-btn');
        const dropdownToggle = activeModal.querySelector('[data-action="toggle-suggestion-type"]');
        const dropdownMenu = activeModal.querySelector('.suggestion-type-dropdown');
        const displayElement = activeModal.querySelector('#suggestion-type-display');
        const hiddenInput = activeModal.querySelector('#suggestion-type-value');

        // Asigna listeners para el dropdown personalizado
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('disabled');
        });

        dropdownMenu.addEventListener('click', (e) => {
            const selectedOption = e.target.closest('.menu-link');
            if (selectedOption) {
                hiddenInput.value = selectedOption.dataset.value;
                displayElement.textContent = selectedOption.querySelector('span').textContent;
                dropdownMenu.classList.add('disabled');
            }
        });
        
        // Listener para cerrar el dropdown si se hace clic fuera
        document.addEventListener('click', closeDropdownOnClickOutside);
        
        activeModal.querySelector('.cancel-btn').onclick = hideModal;

        form.onsubmit = (e) => {
            e.preventDefault();
            console.log('Suggestion submitted:', {
                type: form.elements['suggestion-type'].value,
                text: form.elements['suggestion-text'].value
            });
            hideModal();
        };
        confirmButton.onclick = () => form.requestSubmit();
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            activeModal.classList.add('active');
        });
    });
}

export function hideModal() {
    if (!activeModal) return;
    activeModal.classList.remove('active');
    setTimeout(destroyActiveModal, 300);
}