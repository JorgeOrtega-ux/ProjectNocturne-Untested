   document.addEventListener('DOMContentLoaded', () => {
    initializeLocation();
});

function initializeLocation() {
    const savedLocation = localStorage.getItem('user-location');

    // Si el usuario ya ha seleccionado un país manualmente, lo respetamos.
    if (savedLocation && savedLocation !== 'auto') {
        const countryName = getCountryNameByCode(savedLocation);
        if (countryName) {
            setActiveLocation(savedLocation, countryName);
        }
    } else {
        // Si no hay selección o está en automático, detectamos la ubicación.
        detectLocationAutomatically();
    }

    // Event listener para el clic en la lista de países
    document.getElementById('location-menu-list').addEventListener('click', (e) => {
        const targetLink = e.target.closest('.menu-link[data-location]');
        if (targetLink) {
            const locationCode = targetLink.dataset.location;
            // Guardamos la selección del usuario para futuras visitas.
            localStorage.setItem('user-location', locationCode);

            if (locationCode === 'auto') {
                // Si selecciona "Automático", volvemos a detectar.
                detectLocationAutomatically();
            } else {
                const locationName = targetLink.querySelector('.menu-link-text span').textContent;
                setActiveLocation(locationCode, locationName);
            }
        }
    });

    // Event listener para el input de búsqueda
    const searchInput = document.getElementById('location-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterLocations(e.target.value);
        });
    }
}

function detectLocationAutomatically() {
    fetch('https://ipwho.is/')
        .then(response => response.json())
        .then(data => {
            let detectedCountryCode = null;
            let detectedCountryName = null;

            if (data && data.success) {
                detectedCountryCode = data.country_code;
                detectedCountryName = getCountryNameByCode(detectedCountryCode);
                console.log(`País detectado: ${data.country} (${detectedCountryCode})`);
            }

            // Actualizamos el texto del enlace "Automático"
            const autoLinkText = document.querySelector('.menu-link[data-location="auto"] .menu-link-text span');
            if (autoLinkText) {
                if (detectedCountryName) {
                    autoLinkText.textContent = `Automático (${detectedCountryName})`;
                } else {
                    autoLinkText.textContent = 'Automático';
                }
            }
            
            // Activamos el modo automático en la UI.
            setActiveLocation('auto', `Automático`);
        })
        .catch(error => {
            console.error('Error al contactar la API de ipwho.is:', error);
            // Si falla, simplemente activamos "Automático" sin país.
            setActiveLocation('auto', 'Automático');
        });
}

function setActiveLocation(code, name) {
    // Actualiza el texto del menú principal
    const locationMenuText = document.querySelector('[data-toggle="location"] .menu-link-text span');
    if (locationMenuText) {
        // Si el código es 'auto', el nombre ya viene formateado.
        // Si es un país, usamos el nombre del país.
        locationMenuText.textContent = `Ubicación: ${name}`;
    }

    // Marca la opción activa en el submenú
    const locationLinks = document.querySelectorAll('#location-menu-list .menu-link');
    locationLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.location === code) {
            link.classList.add('active');
        }
    });
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

function getCountryNameByCode(code) {
    const link = document.querySelector(`#location-menu-list .menu-link[data-location="${code}"]`);
    if (link) {
        return link.querySelector('.menu-link-text span').textContent;
    }
    return null;
}