// /assets/js/general/dynamic-island-controller.js

let dynamicIslandElement = null;
let notificationTimeout = null;
let dismissCallback = null;
let currentRingingToolId = null;

const NOTIFICATION_DISPLAY_DURATION = 3000;

const ICONS = {
    'alarm': 'alarm',
    'timer': 'timer',
    'worldClock': 'schedule',
    'system_info': 'info',
    'system_error': 'error',
    'system_premium': 'workspace_premium',
    'system_success': 'check_circle',
    'default': 'info'
};

/**
 * Initializes the dynamic island DOM element and appends it to the body.
 */
export function initDynamicIsland() {
    if (dynamicIslandElement) return;

    dynamicIslandElement = document.createElement('div');
    dynamicIslandElement.id = 'dynamic-island';
    dynamicIslandElement.classList.remove('expanded', 'active-tool-ringing');

    // Estructura HTML mejorada
    dynamicIslandElement.innerHTML = `
        <div class="island-notification-content">
            <div class="island-left-group">
                <div class="island-circle">
                    <span class="material-symbols-rounded notification-icon-symbol"></span>
                </div>
                <div class="notification-text-info">
                    <p class="notification-title"></p>
                    <p class="notification-message"></p>
                </div>
            </div>
            <button class="island-dismiss-button" data-action="dismiss-active-tool">
                </button>
        </div>
    `;

    document.body.appendChild(dynamicIslandElement);

    const dismissButton = dynamicIslandElement.querySelector('.island-dismiss-button');
    if (dismissButton) {
        dismissButton.addEventListener('click', () => {
            if (dismissCallback && typeof dismissCallback === 'function') {
                dismissCallback(currentRingingToolId);
            }
            hideDynamicIsland();
        });
    }

    console.log('✨ Dynamic Island initialized and added to DOM.');
}

/**
 * Muestra una notificación en la isla dinámica.
 * @param {string} toolType - El tipo de herramienta ('alarm', 'timer', 'system').
 * @param {string} actionType - La acción ('created', 'updated', 'ringing', 'deleted', 'limit_reached').
 * @param {string} messageKey - La clave del mensaje principal.
 * @param {object} [data={}] - Datos para los marcadores de posición del mensaje (ej. {title: 'Mi Alarma'}).
 * @param {function} [onDismiss=null] - Callback para el botón de descarte.
 */
export function showDynamicIslandNotification(toolType, actionType, messageKey, category, data = {}, onDismiss = null) {
    if (!dynamicIslandElement) initDynamicIsland();
    if (!dynamicIslandElement) return;

    if (notificationTimeout) clearTimeout(notificationTimeout);

    dynamicIslandElement.classList.remove('active-tool-ringing');

    const iconSymbol = dynamicIslandElement.querySelector('.notification-icon-symbol');
    const titleP = dynamicIslandElement.querySelector('.notification-title');
    const messageP = dynamicIslandElement.querySelector('.notification-message');
    const dismissButton = dynamicIslandElement.querySelector('.island-dismiss-button');

    if (!iconSymbol || !titleP || !messageP || !dismissButton) return;

    // 1. Determinar el Icono
    let iconKey = toolType;
    if (toolType === 'system') {
        if (actionType.includes('error')) iconKey = 'system_error';
        else if (actionType.includes('premium')) iconKey = 'system_premium';
        else if (actionType.includes('success') || actionType.includes('deleted')) iconKey = 'system_success';
        else iconKey = 'system_info';
    }
    iconSymbol.textContent = ICONS[iconKey] || ICONS.default;
    
    // 2. Construir el Título
    const translatedTool = getTranslation(toolType, 'tooltips');
    let titleKey = `${actionType}_title`;
    if (toolType === 'system' && actionType === 'premium_required') {
        titleKey = 'premium_required_title';
    }
    const translatedAction = getTranslation(titleKey, 'notifications');
    titleP.textContent = translatedAction.replace('{type}', translatedTool);

    // 3. Construir el Mensaje
    messageP.textContent = formatMessage(messageKey, category, data);

    // 4. Configurar el botón de Descarte
    dismissButton.textContent = getTranslation('dismiss', 'notifications');

    // 5. Manejar el estado de 'sonando'
    if (actionType === 'ringing') {
        dynamicIslandElement.classList.add('active-tool-ringing');
        dismissCallback = onDismiss;
        currentRingingToolId = data.toolId;
    } else {
        dismissCallback = null;
        currentRingingToolId = null;
        notificationTimeout = setTimeout(hideDynamicIsland, NOTIFICATION_DISPLAY_DURATION);
    }

    dynamicIslandElement.classList.add('expanded');
    console.log(`Dynamic Island: ${toolType} ${actionType} - ${messageKey} - Data:`, data);
}


/**
 * Formats a message string with placeholders.
 * @param {string} key - The translation key.
 * @param {string} category - The translation category.
 * @param {object} [placeholders={}] - An object with placeholder key-value pairs (e.g., {limit: 5}).
 * @returns {string} The formatted message.
 */
function formatMessage(key, category, placeholders = {}) {
    let message = getTranslation(key, category);
    for (const placeholder in placeholders) {
        if (placeholders.hasOwnProperty(placeholder)) {
            message = message.replace(`{${placeholder}}`, placeholders[placeholder]);
        }
    }
    return message;
}


/**
 * Hides the dynamic island.
 */
export function hideDynamicIsland() {
    if (notificationTimeout) clearTimeout(notificationTimeout);
    notificationTimeout = null;
    
    dynamicIslandElement.classList.remove('expanded', 'active-tool-ringing');
    dismissCallback = null;
    currentRingingToolId = null;
}

/**
 * Retrieves a translation string. Assumes window.getTranslation is available.
 * @param {string} key - The translation key.
 * @param {string} category - The translation category.
 * @returns {string} The translated string or the key if not found.
 */
function getTranslation(key, category = 'general') {
    if (typeof window.getTranslation === 'function') {
        const translated = window.getTranslation(key, category);
        return (translated && translated !== key) ? translated : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

window.hideDynamicIsland = hideDynamicIsland;