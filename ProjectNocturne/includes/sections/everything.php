<div class="section-everything active">
    <div class="everything-grid-container">
        </div>
</div>
<style>
    /* /assets/css/sections/everything.css - Versión Final */
    .section-everything {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .everything-grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
    }

    .widget {
        border-radius: 12px;
        padding: 24px;
        border: 1px solid #00000020;
        background-color: #ffffff;
        cursor: grab; /* Indica que los widgets son movibles */
    }

    .widget.sortable-chosen {
        cursor: grabbing;
    }

    .dark-mode .widget {
        border: 1px solid #ffffff20;
        background-color: #2e2f31;
    }

    .widget-clock {
        grid-column: span 2;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        min-height: 250px;
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
    .dark-mode .widget-icon {
        border-color: #ffffff20;
        color: #fff;
    }

    .widget-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1d1d1f;
    }
    .dark-mode .widget-title {
        color: #f5f5f7;
    }

    .clock-content { text-align: center; }
    .clock-time { font-size: 4rem; font-weight: 700; color: #1d1d1f; }
    .clock-date { font-size: 1.2rem; color: #6e6e73; margin-top: 8px; }
    .dark-mode .clock-time { color: #f5f5f7; }
    .dark-mode .clock-date { color: #8d8d92; }

    .widget-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .widget-list-item {
        display: flex;
        align-items: center;
        height: 50px;
        gap: 12px;
        border-radius: 8px;
        transition: background-color 0.2s ease;
    }
    
    .widget-list-item:hover {
        background-color: #f5f5fa;
    }
    
    .dark-mode .widget-list-item:hover {
        background-color: #3a3a3c;
    }

    .widget-list-item-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 24px;
        color: #6e6e73;
    }
    
    .dark-mode .widget-list-item-icon {
        color: #8d8d92;
    }

    .widget-list-item-details {
        flex-grow: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .widget-list-item-title {
        font-weight: 500;
        color: #1d1d1f;
    }
    
    .dark-mode .widget-list-item-title {
        color: #f5f5f7;
    }

    .widget-list-item-value {
        font-size: 1rem;
        font-weight: 500;
        color: #6e6e73;
    }
    .dark-mode .widget-list-item-value {
        color: #8d8d92;
    }

    .actions-container {
        display: flex;
        flex-direction: column; 
        gap: 12px;
    }

    .action-card {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        padding: 0 16px;
        border-radius: 12px;
        background-color: transparent;
        border: 1px solid #00000020;
        cursor: pointer;
        transition: background-color 0.2s ease;
        height: 50px;
    }

    .dark-mode .action-card { border-color: #ffffff20; }
    .action-card:hover { background-color: #f5f5fa; }
    .dark-mode .action-card:hover { background-color: #3a3a3c; }
    .action-card-icon { font-size: 24px; margin-right: 12px; margin-bottom: 0; }
    .action-card-label { font-weight: 500; font-size: 0.9rem; color: #1d1d1f; }
    .dark-mode .action-card-label { color: #f5f5f7; }

    @media (max-width: 1024px) {
        .widget-clock { grid-column: span 1; }
    }
    
    @media (max-width: 768px) {
        .everything-grid-container { grid-template-columns: 1fr; }
        .widget-clock { grid-column: span 1; }
    }
</style>