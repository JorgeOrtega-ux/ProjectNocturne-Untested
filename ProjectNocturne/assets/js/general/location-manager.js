// /assets/js/general/location-manager.js

// ========== CONSTANTS AND CONFIGURATION ==========

const TIMING_CONFIG = {
    LOCATION_CHANGE_DURATION: 1000,
    MIN_INTERVAL_BETWEEN_OPERATIONS: 500
};

const LOCATION_STATE = {
    current: { mode: 'auto', code: null, displayName: 'Automático' },
    isChanging: false,
    changeTimeout: null,
    pendingLocation: null,
    isCancellable: false
};

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', () => {
    initializeLocation();
});

function initializeLocation() {
    const savedSettings = JSON.parse(localStorage.getItem('user-location-settings'));

    if (!savedSettings || savedSettings.mode === 'auto') {
        LOCATION_STATE.current.mode = 'auto';
        setActiveLocationUI('auto', 'Automático...');
        detectLocationAutomatically().then(detectedResult => {
            const finalName = detectedResult.isApproximate 
                ? `Automático (Aprox. ${detectedResult.name})` 
                : `Automático (${detectedResult.name})`;
            
            LOCATION_STATE.current = { mode: 'auto', code: detectedResult.code, displayName: finalName };
            localStorage.setItem('user-location-settings', JSON.stringify(LOCATION_STATE.current));
            setActiveLocationUI('auto', finalName);
        });
    } else {
        LOCATION_STATE.current = savedSettings;
        const countryName = getCountryNameByCode(savedSettings.code);
        if (countryName) {
            setActiveLocationUI(savedSettings.code, countryName);
        } else {
            localStorage.removeItem('user-location-settings');
            initializeLocation();
        }
    }
    setupEventListeners();
}

function setupEventListeners() {
    const locationList = document.getElementById('location-menu-list');
    if (locationList) locationList.addEventListener('click', handleLocationSelection);
    const searchInput = document.getElementById('location-search-input');
    if (searchInput) searchInput.addEventListener('input', (e) => filterLocations(e.target.value));
}

// ========== CORE LOGIC ==========

function handleLocationSelection(e) {
    const targetLink = e.target.closest('.menu-link[data-location]');
    if (!targetLink) return;
    e.preventDefault();
    const locationCode = targetLink.dataset.location;
    if (LOCATION_STATE.isChanging || (LOCATION_STATE.current.mode === 'manual' && LOCATION_STATE.current.code === locationCode)) {
        return;
    }
    setNewLocation(locationCode);
}

function setNewLocation(locationCode) {
    LOCATION_STATE.isChanging = true;
    LOCATION_STATE.pendingLocation = locationCode;
    setupLocationLoadingUI(locationCode);

    if (locationCode !== 'auto') {
        const countryName = getCountryNameByCode(locationCode);
        if (countryName) {
            setTimeout(() => {
                LOCATION_STATE.current = { mode: 'manual', code: locationCode, displayName: countryName };
                localStorage.setItem('user-location-settings', JSON.stringify(LOCATION_STATE.current));
                completeLocationChange(locationCode);
                setActiveLocationUI(locationCode, countryName);
                LOCATION_STATE.isChanging = false;
            }, TIMING_CONFIG.LOCATION_CHANGE_DURATION);
        }
    } else {
        detectLocationAutomatically().then(detectedResult => {
            if (LOCATION_STATE.pendingLocation === 'auto') {
                const finalName = detectedResult.isApproximate ? `Automático (Aprox. ${detectedResult.name})` : `Automático (${detectedResult.name})`;
                LOCATION_STATE.current = { mode: 'auto', code: detectedResult.code, displayName: finalName };
                localStorage.setItem('user-location-settings', JSON.stringify(LOCATION_STATE.current));
                completeLocationChange('auto');
                setActiveLocationUI('auto', finalName);
            }
        }).finally(() => {
            LOCATION_STATE.isChanging = false;
        });
    }
}

async function detectLocationAutomatically() {
    try {
        const response = await fetch('https://ipwho.is/');
        if (!response.ok) throw new Error(`API response not OK: ${response.status}`);
        const data = await response.json();
        if (data && data.success) {
            const countryNameInList = getCountryNameByCode(data.country_code);
            if (countryNameInList) {
                return { name: countryNameInList, code: data.country_code, isApproximate: false };
            }
            const popularCountry = getMostPopularCountryForContinent(data.continent);
            if (popularCountry) {
                return { ...popularCountry, isApproximate: true };
            }
            return { name: data.country, code: data.country_code, isApproximate: false };
        }
        throw new Error(data.message || 'Unknown API error');
    } catch (error) {
        console.error('[DEBUG] 💥 Error en detectLocationAutomatically:', error);
        return { name: 'Automático', code: 'auto', isApproximate: false };
    }
}

// ========== UI MANAGEMENT ==========

/**
 * Nueva función para actualizar la etiqueta de ubicación. Es llamada por el gestor de módulos.
 */
function updateLocationLabel() {
    try {
        const savedSettings = JSON.parse(localStorage.getItem('user-location-settings'));
        const locationMenuText = document.querySelector('[data-toggle="location"] .menu-link-text span');
        if (!locationMenuText) return;

        if (savedSettings && savedSettings.displayName) {
            locationMenuText.textContent = `Ubicación: ${savedSettings.displayName}`;
        } else {
            // Texto por defecto si no hay nada guardado
            locationMenuText.textContent = `Ubicación: Automático`;
        }
    } catch (error) {
        console.error('❌ Error updating location label:', error);
    }
}

function setActiveLocationUI(activeCode, displayText) {
    updateLocationLabel(); // Usamos la nueva función centralizada

    const autoLinkText = document.querySelector('.menu-link[data-location="auto"] .menu-link-text span');
    if (autoLinkText) {
        autoLinkText.textContent = LOCATION_STATE.current.mode === 'auto' ? displayText : 'Automático';
    }

    const locationLinks = document.querySelectorAll('#location-menu-list .menu-link');
    locationLinks.forEach(link => {
        link.classList.remove('active');
        if (LOCATION_STATE.current.mode === 'auto' && link.dataset.location === 'auto') {
            link.classList.add('active');
        } else if (LOCATION_STATE.current.mode === 'manual' && link.dataset.location === activeCode) {
            link.classList.add('active');
        }
    });
}

function setupLocationLoadingUI(newLocationCode) {
    const locationLinks = document.querySelectorAll('#location-menu-list .menu-link');
    locationLinks.forEach(link => {
        link.classList.remove('active');
        link.classList.add('disabled-interactive');
        if (link.dataset.location === newLocationCode) {
            addSpinnerToLink(link);
        }
    });
}

function completeLocationChange(locationCode) {
    const locationLinks = document.querySelectorAll('#location-menu-list .menu-link');
    locationLinks.forEach(link => {
        link.classList.remove('disabled-interactive');
        removeSpinnerFromLink(link);
    });
}

function filterLocations(searchTerm) {
    const term = searchTerm.toLowerCase();
    document.querySelectorAll('#location-menu-list .menu-link').forEach(link => {
        const locationName = link.querySelector('.menu-link-text span').textContent.toLowerCase();
        link.style.display = (link.dataset.location === "auto" || locationName.includes(term)) ? 'flex' : 'none';
    });
    document.querySelectorAll('[data-collapsible-section]').forEach(section => {
        const isAnyLinkVisible = Array.from(section.querySelectorAll('.menu-link')).some(link => link.style.display !== 'none');
        section.style.display = isAnyLinkVisible ? 'block' : 'none';
    });
}

// ========== HELPER FUNCTIONS ==========

function getCountryNameByCode(code) {
    if (!code || code === 'auto') return 'Automático';
    const link = document.querySelector(`#location-menu-list .menu-link[data-location="${code}"]`);
    return link ? link.querySelector('.menu-link-text span').textContent : null;
}

function getMostPopularCountryForContinent(continent) {
    const popularCountries = {
        "North America": { code: "US", name: "Estados Unidos" },
        "South America": { code: "BR", name: "Brasil" },
        "Europe": { code: "DE", name: "Alemania" },
        "Asia": { code: "CN", name: "China" },
        "Africa": { code: "ZA", name: "Sudáfrica" },
        "Oceania": { code: "AU", name: "Australia" }
    };
    return popularCountries[continent] || null;
}

function addSpinnerToLink(link) {
    removeSpinnerFromLink(link);
    const loaderDiv = document.createElement('div');
    loaderDiv.className = 'menu-link-icon menu-link-loader';
    loaderDiv.innerHTML = '<span class="material-symbols-rounded spinning">progress_activity</span>';
    link.appendChild(loaderDiv);
}

function removeSpinnerFromLink(link) {
    const loaderDiv = link.querySelector('.menu-link-loader');
    if (loaderDiv) loaderDiv.remove();
}

// ========== EXPORTS FOR MODULE MANAGER INTEGRATION ==========

function isLocationChanging() {
    return LOCATION_STATE.isChanging;
}

// Exportamos la nueva función para que pueda ser llamada desde fuera
window.updateLocationLabel = updateLocationLabel;
window.isLocationChanging = isLocationChanging;