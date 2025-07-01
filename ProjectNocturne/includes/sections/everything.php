<div class="section-everything active">

    <div class="everything-header">
        <h1 class="everything-title" data-translate="main_panel" data-translate-category="everything"></h1>
        <p class="everything-subtitle" id="current-date-subtitle"></p>
    </div>

    <div class="everything-main-container">

        <div class="widget widget-summary">
            <div class="summary-content">
                <div class="summary-item">
                    <div class="summary-value" id="main-clock-time-short">16:14</div>
                    <div class="summary-label" data-translate="local_time" data-translate-category="everything"></div>
                </div>
                <div class="summary-item">
                    <div class="summary-value" id="active-alarms-count">0</div>
                    <div class="summary-label" data-translate="active_alarms" data-translate-category="everything"></div>
                </div>
                <div class="summary-item">
                    <div class="summary-value" id="active-timers-count">0</div>
                    <div class="summary-label" data-translate="running_timers" data-translate-category="everything"></div>
                </div>
                <div class="summary-item">
                    <div class="summary-value" id="world-clocks-count">0</div>
                    <div class="summary-label" data-translate="world_clocks" data-translate-category="everything"></div>
                </div>
            </div>
        </div>

        <div class="widget-row">

            <div class="widget widget-upcoming">
                <div class="widget-header">
                    <div class="widget-icon bg-orange"><span class="material-symbols-rounded">notifications_active</span></div>
                    <h2 class="widget-title" data-translate="upcoming_events" data-translate-category="everything">Próximos Eventos</h2>
                </div>
                <div class="upcoming-list">
                    <div class="upcoming-item">
                        <div class="upcoming-item-icon-wrapper">
                            <span class="material-symbols-rounded upcoming-item-icon">alarm</span>
                        </div>
                        <div class="upcoming-item-details">
                            <div class="upcoming-item-title" data-translate="next_alarm" data-translate-category="everything">Próxima Alarma</div>
                            <div class="upcoming-item-time" id="next-alarm-details">--</div>
                        </div>
                    </div>
                    <div class="upcoming-item">
                        <div class="upcoming-item-icon-wrapper">
                            <span class="material-symbols-rounded upcoming-item-icon">hourglass_top</span>
                        </div>
                        <div class="upcoming-item-details">
                            <div class="upcoming-item-title" data-translate="active_timer" data-translate-category="everything">Temporizador Activo</div>
                            <div class="upcoming-item-time" id="active-timer-details">--</div>
                        </div>
                    </div>
                    <div class="upcoming-item">
                        <div class="upcoming-item-icon-wrapper">
                            <span class="material-symbols-rounded upcoming-item-icon">timer</span>
                        </div>
                        <div class="upcoming-item-details">
                            <div class="upcoming-item-title" data-translate="stopwatch" data-translate-category="everything">Cronómetro</div>
                            <div class="upcoming-item-time" id="stopwatch-details">--</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="widget widget-actions">
                <div class="widget-header">
                    <div class="widget-icon bg-blue"><span class="material-symbols-rounded">bolt</span></div>
                    <h2 class="widget-title" data-translate="quick_actions" data-translate-category="everything">Acciones Rápidas</h2>
                </div>
                <div class="actions-container">
                    <div class="action-card" data-module="toggleMenuAlarm">
                        <span class="material-symbols-rounded action-card-icon color-blue">add_alarm</span>
                        <span class="action-card-label" data-translate="new_alarm" data-translate-category="everything">Nueva Alarma</span>
                    </div>
                    <div class="action-card" data-module="toggleMenuTimer">
                        <span class="material-symbols-rounded action-card-icon color-orange">add_circle</span>
                        <span class="action-card-label" data-translate="new_timer" data-translate-category="everything">Nuevo Timer</span>
                    </div>
                    <div class="action-card" data-module="toggleMenuWorldClock">
                        <span class="material-symbols-rounded action-card-icon color-green">public</span>
                        <span class="action-card-label" data-translate="add_clock" data-translate-category="everything">Añadir Reloj</span>
                    </div>
                </div>
            </div>

        </div>

    </div>
</div>
<style>
    /* /assets/css/sections/everything.css - Versión con alineación de iconos corregida */
    .section-everything {
        padding: 24px;

        flex-direction: column;
        gap: 24px;
    }

    .everything-header {
        padding-bottom: 16px;
    }

    .everything-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1d1d1f;
        margin: 0;
    }

    .everything-subtitle {
        font-size: 1.1rem;
        color: #6e6e73;
        margin-top: 4px;
    }

    .dark-mode .everything-title {
        color: #f5f5f7;
    }

    .dark-mode .everything-subtitle {
        color: #8d8d92;
    }

    .everything-main-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .widget-row {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
    }

    .widget {
        border-radius: 20px;
        padding: 24px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: 1px solid #00000020;
        width: 100%;
    }

    .widget-row>.widget {
        flex: 1 1 300px;
    }

    .dark-mode .widget {
        border: 1px solid #ffffff20;
    }

    .widget-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
    }

    .widget-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        color: #ffffff;
        flex-shrink: 0;
    }

    .widget-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1d1d1f;
    }

    .dark-mode .widget-title {
        color: #f5f5f7;
    }

    .summary-content {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    }

    .summary-item {
        flex: 1 1 150px;
        text-align: center;
    }

    .summary-value {
        font-size: 2rem;
        font-weight: 600;
        color: #1d1d1f;
    }

    .summary-label {
        font-size: 0.9rem;
        color: #6e6e73;
        margin-top: 4px;
    }

    .dark-mode .summary-value {
        color: #f5f5f7;
    }

    .dark-mode .summary-label {
        color: #8d8d92;
    }

    .upcoming-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .upcoming-item {
        display: flex;
        align-items: center;
        height: 50px;
        gap: 12px;
        border-radius: 8px;
        cursor: pointer;
    }

    .upcoming-item:hover {
        background-color: #f5f5fa;
    }

    .upcoming-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .dark-mode .upcoming-item {
        border-color: rgba(255, 255, 255, 0.12);
    }

    /* --- CORRECCIÓN CLAVE --- */
    .upcoming-item-icon-wrapper {
        width: 40px;
        /* Ancho fijo igual al del widget-icon */
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        /* Evita que el contenedor se encoja */
    }

    .upcoming-item-icon {
        font-size: 24px;
        color: #6e6e73;
    }

    .upcoming-item-details {
        flex-grow: 1;
    }

    .upcoming-item-title {
        font-weight: 500;
        color: #1d1d1f;
    }

    .upcoming-item-time {
        font-size: 0.9rem;
        color: #6e6e73;
    }

    .dark-mode .upcoming-item-icon {
        color: #8d8d92;
    }

    .dark-mode .upcoming-item-title {
        color: #f5f5f7;
    }

    .dark-mode .upcoming-item-time {
        color: #8d8d92;
    }

    .actions-container {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .action-card {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        border-radius: 16px;
        background-color: transparent;
        border: 1px solid #00000020;
        cursor: pointer;
        transition: transform 0.2s ease, background-color 0.2s ease;
        min-height: 120px;
    }

    .dark-mode .action-card {
        background-color: #3a3a3c;
    }

    .action-card:hover {
        background-color: #f5f5fa;
    }

    .dark-mode .action-card:hover {
        background-color: #48484a;
    }

    .action-card-icon {
        font-size: 28px;
        margin-bottom: 8px;
    }

    .action-card-label {
        font-weight: 500;
        font-size: 0.9rem;
        text-align: center;
        color: #1d1d1f;
    }

    .dark-mode .action-card-label {
        color: #f5f5f7;
    }

    /* --- Colores de iconos --- */
    .widget-icon.bg-blue {
        background-color: #0A84FF;
    }

    .widget-icon.bg-green {
        background-color: #30D158;
    }

    .widget-icon.bg-orange {
        background-color: #FF9F0A;
    }

    .action-card-icon.color-blue {
        color: #0A84FF;
    }

    .action-card-icon.color-green {
        color: #30D158;
    }

    .action-card-icon.color-orange {
        color: #FF9F0A;
    }
</style>