<div class="section-everything active">
    <div class="everything-header">
        <h1 class="everything-title" data-translate="main_panel" data-translate-category="everything"></h1>
    </div>
    <div class="everything-main-container">
        </div>
</div>
<style>
    /* /assets/css/sections/everything.css - REDISEÑO COMPLETO */
    .section-everything {
        padding: 24px;
        display: flex;
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

    /* --- Contenedor Principal en Grid --- */
    .everything-main-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-auto-rows: minmax(150px, auto);
        gap: 24px;
    }

    /* --- Estilos Generales de Widget --- */
    .widget {
        border-radius: 20px;
        padding: 24px;
        border: 1px solid #0000001a;
        display: flex;
        flex-direction: column;
        background-color: #fff;
    }

    .widget-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1d1d1f;
    }

    .widget-header .material-symbols-rounded {
        font-size: 28px;
    }

    /* --- Tamaños de Widget --- */
    .widget--large {
        grid-column: span 2;
        grid-row: span 2;
    }

    .widget--medium {
        grid-column: span 1;
        grid-row: span 2;
    }

    .widget--small {
        grid-column: span 1;
        grid-row: span 1;
    }

    .widget--full-width {
        grid-column: span 3;
        grid-row: span 1;
    }

    /* --- Widget de Reloj (Grande) --- */
    .local-time-widget {
        justify-content: center;
        align-items: center;
        text-align: center;
        gap: 10px;
    }

    #main-clock-time {
        font-size: 6rem;
        font-weight: 600;
        line-height: 1;
    }

    #current-date-subtitle {
        font-size: 1.25rem;
        color: #6e6e73;
    }

    /* --- Widget de Agenda (Medio) --- */
    .agenda-widget .widget-content {
        flex-grow: 1;
        overflow-y: auto;
    }

    .agenda-list {
        display: flex;
        flex-direction: column;
        gap: 18px;
    }

    .agenda-item {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .agenda-item-icon {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: #f5f5fa;
    }

    .agenda-item-icon .material-symbols-rounded {
        font-size: 24px;
        color: #1d1d1f;
    }

    .agenda-item-details {
        flex-grow: 1;
    }

    .agenda-item-title {
        font-weight: 500;
        color: #1d1d1f;
    }

    .agenda-item-subtitle {
        font-size: 0.9rem;
        color: #6e6e73;
    }

    /* --- Widget de Acciones Rápidas (Pequeño) --- */
    .actions-widget .widget-content {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        height: 100%;
        gap: 16px;
    }

    .action-button {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px;
        border-radius: 12px;
        background-color: #f5f5fa;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .action-button:hover {
        background-color: #e8e8ed;
    }

    .action-button-icon {
        color: #1d1d1f;
    }

    .action-button-label {
        font-weight: 500;
        color: #1d1d1f;
    }

    /* --- Widget de Resumen (Ancho Completo) --- */
    .summary-widget .widget-content {
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;
    }

    .summary-item {
        text-align: center;
    }

    .summary-value {
        font-size: 2rem;
        font-weight: 600;
    }

    .summary-label {
        font-size: 0.9rem;
        color: #6e6e73;
        margin-top: 4px;
    }

    /* --- Dark Mode --- */
    .dark-mode .widget {
        background-color: #252627;
        border-color: #ffffff1a;
    }
    .dark-mode .everything-title,
    .dark-mode .widget-header,
    .dark-mode #main-clock-time,
    .dark-mode .summary-value {
        color: #f5f5f7;
    }
    .dark-mode #current-date-subtitle,
    .dark-mode .summary-label {
        color: #8d8d92;
    }
    .dark-mode .agenda-item-icon {
        background-color: #3a3a3c;
    }
    .dark-mode .agenda-item-icon .material-symbols-rounded,
    .dark-mode .agenda-item-title,
    .dark-mode .action-button-icon,
    .dark-mode .action-button-label {
        color: #f5f5f7;
    }
    .dark-mode .agenda-item-subtitle {
        color: #8d8d92;
    }
    .dark-mode .action-button {
        background-color: #3a3a3c;
    }
    .dark-mode .action-button:hover {
        background-color: #48484a;
    }

    /* --- Responsive --- */
    @media (max-width: 1200px) {
        .everything-main-container {
            grid-template-columns: repeat(2, 1fr);
        }
        .widget--full-width {
            grid-column: span 2;
        }
    }

    @media (max-width: 768px) {
        .everything-main-container {
            grid-template-columns: 1fr;
        }
        .widget--large, .widget--medium, .widget--small, .widget--full-width {
            grid-column: span 1;
            grid-row: span 1; /* Reset row span */
        }
        #main-clock-time {
            font-size: 4rem;
        }
    }
</style>