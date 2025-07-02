<div class="section-everything active">
    <div class="everything-header">
        <h1 class="everything-title" data-translate="main_panel" data-translate-category="everything"></h1>
        <p class="everything-subtitle" id="current-date-subtitle"></p>
    </div>

    <div class="everything-main-container">
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
        border-radius: 12px;
        padding: 24px;
        transition: box-shadow 0.3s ease;
        border: 1px solid #00000020;
        width: 100%;
    }

    .widget-row>.widget {
        flex: 1 1 300px; /* Adjusted: allows a base size of 300px before wrapping, while still growing/shrinking */
        max-width: 100%; /* Ensures it doesn't overflow its container if it's the only item */
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
        border: 1px solid #00000020;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        color: #000;
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
        min-height: 50px;
        /* Changed from 120px to 50px */
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

    /* Styles for new Festivities Widget */
    .festivities-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .festivity-item {
        display: flex;
        align-items: center;
        height: 50px;
        gap: 12px;
        border-radius: 8px;
        cursor: default;
        /* Not interactive */
    }

    .festivity-item-icon {
        font-size: 24px;
        color: #6e6e73;
        width: 40px;
        /* Align with other icons */
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .festivity-details {
        flex-grow: 1;
    }

    .festivity-title {
        font-weight: 500;
        color: #1d1d1f;
    }

    .festivity-date {
        font-size: 0.9rem;
        color: #6e6e73;
    }

    .dark-mode .festivity-item-icon {
        color: #8d8d92;
    }

    .dark-mode .festivity-title {
        color: #f5f5f7;
    }

    .dark-mode .festivity-date {
        color: #8d8d92;
    }
    @media (max-width: 768px) {
        .widget-row>.widget {
            flex: 1 1 100%; /* Ensures full width on smaller screens, forcing a single column layout */
        }
    }
</style>