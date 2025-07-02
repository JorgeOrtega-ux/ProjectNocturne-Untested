// /assets/js/general/location-manager.js

// ========== CONSTANTS AND CONFIGURATION ==========

const TIMING_CONFIG = {
    LOCATION_CHANGE_DURATION: 1000,
    MIN_INTERVAL_BETWEEN_OPERATIONS: 500
};

const LOCATION_STATE = {
    currentLocation: 'auto',
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
    const savedLocation = localStorage.getItem('user-location') || 'auto';
    LOCATION_STATE.currentLocation = savedLocation;

    if (savedLocation === 'auto') {
        setActiveLocationUI('auto', 'Automático...');
        
        // MODIFICADO: Ahora maneja el objeto de resultado con información de aproximación.
        detectLocationAutomatically().then(detectedResult => {
            const finalName = detectedResult.isApproximate 
                ? `Automático (Aprox. ${detectedResult.name})` 
                : `Automático (${detectedResult.name})`;

            const autoLinkText = document.querySelector('.menu-link[data-location="auto"] .menu-link-text span');
            if (autoLinkText) {
                autoLinkText.textContent = finalName;
            }

            if (LOCATION_STATE.currentLocation === 'auto') {
                const locationMenuText = document.querySelector('[data-toggle="location"] .menu-link-text span');
                if(locationMenuText) locationMenuText.textContent = `Ubicación: ${finalName}`;
            }
        });
    } else {
        const countryName = getCountryNameByCode(savedLocation);
        if (countryName) {
            setActiveLocationUI(savedLocation, countryName);
        } else {
            console.warn(`Invalid location code '${savedLocation}' found in storage. Falling back to 'auto'.`);
            localStorage.setItem('user-location', 'auto');
            initializeLocation();
        }
    }

    setupEventListeners();
}


function setupEventListeners() {
    const locationList = document.getElementById('location-menu-list');
    if (locationList) {
        locationList.addEventListener('click', handleLocationSelection);
    }

    const searchInput = document.getElementById('location-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterLocations(e.target.value));
    }
}

// ========== CORE LOGIC ==========

function handleLocationSelection(e) {
    const targetLink = e.target.closest('.menu-link[data-location]');
    if (!targetLink) return;
    e.preventDefault();
    const locationCode = targetLink.dataset.location;
    setNewLocation(locationCode);
}

function setNewLocation(locationCode) {
    if (LOCATION_STATE.isChanging || LOCATION_STATE.currentLocation === locationCode) {
        return;
    }

    const previousLocation = LOCATION_STATE.currentLocation;
    LOCATION_STATE.isChanging = true;
    LOCATION_STATE.pendingLocation = locationCode;
    LOCATION_STATE.isCancellable = true;

    console.log(`🌐 Setting location to: ${locationCode}`);
    setupLocationLoadingUI(locationCode, previousLocation);

    performLocationChange(locationCode)
        .then(newLocationData => {
            if (LOCATION_STATE.isChanging && LOCATION_STATE.pendingLocation === locationCode) {
                LOCATION_STATE.currentLocation = locationCode;
                localStorage.setItem('user-location', locationCode);

                setActiveLocationUI(locationCode, newLocationData.name);
                completeLocationChange(locationCode);

                const event = new CustomEvent('locationChanged', {
                    detail: { newLocation: newLocationData }
                });
                document.dispatchEvent(event);
            } else {
                console.log('🚫 Location change was cancelled.');
            }
        })
        .catch(error => {
            console.error('Error changing location:', error);
            revertLocationChange(previousLocation);
        })
        .finally(() => {
            LOCATION_STATE.isChanging = false;
            LOCATION_STATE.pendingLocation = null;
            LOCATION_STATE.isCancellable = false;
        });
}

function performLocationChange(locationCode) {
    return new Promise((resolve, reject) => {
        LOCATION_STATE.changeTimeout = setTimeout(() => {
            if (LOCATION_STATE.isChanging && LOCATION_STATE.pendingLocation === locationCode) {
                if (locationCode === 'auto') {
                    // MODIFICADO: Procesa el nuevo objeto de resultado para construir el nombre.
                    detectLocationAutomatically()
                        .then(detectedResult => {
                             const finalName = detectedResult.isApproximate 
                                ? `Automático (Aprox. ${detectedResult.name})` 
                                : `Automático (${detectedResult.name})`;
                            resolve({ code: 'auto', name: finalName });
                        })
                        .catch(reject);
                } else {
                    const countryName = getCountryNameByCode(locationCode);
                    if (countryName) {
                        resolve({ code: locationCode, name: countryName });
                    } else {
                        reject(new Error(`Invalid location code: ${locationCode}`));
                    }
                }
            } else {
                reject(new Error('Location change was cancelled'));
            }
        }, TIMING_CONFIG.LOCATION_CHANGE_DURATION);
    });
}

// MODIFICADO: La función ahora es asíncrona y devuelve un objeto con el estado de la detección.
async function detectLocationAutomatically() {
    try {
        const response = await fetch('https://ipwho.is/');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data && data.success) {
            console.log(`País detectado por IP: ${data.country} (${data.country_code})`);
            const countryNameInList = getCountryNameByCode(data.country_code);

            // Si el país detectado está en nuestra lista, lo usamos directamente.
            if (countryNameInList) {
                console.log("El país detectado está en la lista. Asignación directa.");
                return { name: countryNameInList, code: data.country_code, isApproximate: false };
            }
            
            // Si no está en la lista, encontramos el más cercano.
            console.log("El país no está en la lista. Buscando el más cercano...");
            const closest = findClosestCountry(data.latitude, data.longitude);
            if (closest) {
                 console.log(`País más cercano encontrado: ${closest.name} (${closest.code})`);
                return { ...closest, isApproximate: true };
            }

            // Si no se encuentra un país cercano, se usa el nombre de la API como último recurso.
            return { name: data.country, code: data.country_code, isApproximate: false };
        }
        throw new Error('Failed to detect location from API');
    } catch (error) {
        console.error('Error detecting location automatically:', error);
        return { name: 'Desconocido', code: null, isApproximate: false };
    }
}

// ========== UI MANAGEMENT ==========

function setActiveLocationUI(code, name) {
    const locationMenuText = document.querySelector('[data-toggle="location"] .menu-link-text span');
    if (locationMenuText) {
        locationMenuText.textContent = `Ubicación: ${name}`;
    }

    const locationLinks = document.querySelectorAll('#location-menu-list .menu-link');
    locationLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.location === code) {
            link.classList.add('active');
        }
    });
}

function setupLocationLoadingUI(newLocationCode, previousLocationCode) {
    const locationLinks = document.querySelectorAll('#location-menu-list .menu-link');
    locationLinks.forEach(link => {
        const linkLocation = link.dataset.location;
        if (linkLocation === newLocationCode) {
            link.classList.add('preview-active');
            addSpinnerToLink(link);
        } else {
            link.classList.remove('active');
            link.classList.add('disabled-interactive');
        }
    });
}

function completeLocationChange(locationCode) {
    const locationLinks = document.querySelectorAll('#location-menu-list .menu-link');
    locationLinks.forEach(link => {
        const linkLocation = link.dataset.location;
        link.classList.remove('preview-active', 'disabled-interactive');
        removeSpinnerFromLink(link);

        if (linkLocation === locationCode) {
            link.classList.add('active');
        }
    });
}

function revertLocationChange(previousLocation) {
    const locationLinks = document.querySelectorAll('#location-menu-list .menu-link');
    locationLinks.forEach(link => {
        const linkLocation = link.dataset.location;
        link.classList.remove('preview-active', 'disabled-interactive');
        removeSpinnerFromLink(link);

        if (linkLocation === previousLocation) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    // Revert main label
    const name = getCountryNameByCode(previousLocation) || `Automático`;
    setActiveLocationUI(previousLocation, name);
}

function filterLocations(searchTerm) {
    const term = searchTerm.toLowerCase();
    const locationLinks = document.querySelectorAll('#location-menu-list .menu-link');

    locationLinks.forEach(link => {
        const locationName = link.querySelector('.menu-link-text span').textContent.toLowerCase();
        if (link.dataset.location === "auto" || locationName.includes(term)) {
            link.style.display = 'flex';
        } else {
            link.style.display = 'none';
        }
    });
}

// ========== HELPER FUNCTIONS ==========

function getCountryNameByCode(code) {
    if (code === 'auto') return 'Automático';
    const link = document.querySelector(`#location-menu-list .menu-link[data-location="${code}"]`);
    return link ? link.querySelector('.menu-link-text span').textContent : null;
}

// NUEVO: Función para encontrar el país más cercano de la lista.
function findClosestCountry(userLat, userLon) {
    const locationLinks = document.querySelectorAll('#location-menu-list .menu-link[data-location]');
    let minDistance = Infinity;
    let closestCountry = null;

    locationLinks.forEach(link => {
        const code = link.dataset.location;
        if (code === 'auto') return; // Ignorar el link de 'auto'

        const lat = parseFloat(link.dataset.lat);
        const lon = parseFloat(link.dataset.lng);
        const name = link.querySelector('.menu-link-text span').textContent;
        
        // Asegurarse de que el link tiene coordenadas válidas
        if (!isNaN(lat) && !isNaN(lon)) {
            const distance = haversineDistance({ lat: userLat, lon: userLon }, { lat, lon });
            if (distance < minDistance) {
                minDistance = distance;
                closestCountry = { code, name, lat, lon };
            }
        }
    });

    return closestCountry;
}

// NUEVO: Implementación de la fórmula de Haversine para calcular distancias.
function haversineDistance(coords1, coords2) {
    const toRad = (x) => x * Math.PI / 180;
    const R = 6371; // Radio de la Tierra en km

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distancia en km
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
    if (loaderDiv) {
        loaderDiv.remove();
    }
}

// ========== EXPORTS FOR MODULE MANAGER INTEGRATION ==========

function isLocationChanging() {
    return LOCATION_STATE.isChanging;
}

function cleanLocationChangeStates() {
    if (LOCATION_STATE.changeTimeout) {
        clearTimeout(LOCATION_STATE.changeTimeout);
    }
    revertLocationChange(LOCATION_STATE.currentLocation);
    LOCATION_STATE.isChanging = false;
    LOCATION_STATE.pendingLocation = null;
    LOCATION_STATE.isCancellable = false;
}

// Attach to window object for global access if not using modules
window.isLocationChanging = isLocationChanging;
window.cleanLocationChangeStates = cleanLocationChangeStates;