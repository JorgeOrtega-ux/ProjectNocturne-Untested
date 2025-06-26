// /assets/js/tools/zoneinfo-controller.js

function updateZoneInfo(timezone = null) {
    const zoneInfoTools = document.querySelectorAll('.zoneInfoTool');

    if (zoneInfoTools.length === 0) {
        return;
    }

    try {
        const finalTimeZone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userFriendlyTimeZone = finalTimeZone.replace(/_/g, ' ');

        zoneInfoTools.forEach(tool => {
            tool.textContent = userFriendlyTimeZone;
            tool.setAttribute('data-tooltip', `Timezone: ${userFriendlyTimeZone}`);
        });

        // If the tooltip system is ready, refresh tooltips for these elements
        if (window.tooltipManager && typeof window.tooltipManager.attachTooltipsToNewElements === 'function') {
            zoneInfoTools.forEach(tool => {
                window.tooltipManager.attachTooltipsToNewElements(tool.parentElement);
            });
        }

    } catch (error) {
        console.error("Error getting user's time zone:", error);
        zoneInfoTools.forEach(tool => {
            tool.textContent = "Time Zone Unavailable";
        });
    }
}


function initializeZoneInfoTool() {
    updateZoneInfo();
}

// Export the function to be called from init-app.js and worldClock-controller.js
export { initializeZoneInfoTool, updateZoneInfo };