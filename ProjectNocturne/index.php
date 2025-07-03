<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.4.2/chroma.min.js"></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" />
    <link rel="stylesheet" type="text/css" href="assets/css/general/styles.css">
    <link rel="stylesheet" type="text/css" href="assets/css/general/dark-mode.css">
    <link rel="stylesheet" type="text/css" href="assets/css/tools/tools.css">
    <script src="assets/js/general/initial-theme.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <title>ProjectNocturne - Home</title>
</head>

<body>
    <div class="page-wrapper">
        <div class="main-content">
            <?php include 'includes/layouts/sidebar-desktop.php'; ?>
            <div class="general-content overflow-y">
                <div class="general-content-top">
                    <?php include 'includes/layouts/header.php'; ?>
                </div>
                <div class="general-content-scrolleable">
                    <?php include 'includes/layouts/sidebar-mobile.php'; ?>
                    <?php include 'includes/modules/module-overlays.php'; ?>
                    <div class="scrollable-content overflow-y">
                        <div class="general-content-bottom">
                            <div class="section-content">
                                <?php include 'includes/sections/everything.php'; ?>
                                <?php include 'includes/sections/alarm.php'; ?>
                                <?php include 'includes/sections/timer.php'; ?>
                                <?php include 'includes/sections/stopwatch.php'; ?>
                                <?php include 'includes/sections/worldClock.php'; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>



    <style>
    /* ====================================== */
/* ====== CONFIRMATION MODAL STYLES ===== */
/* ====================================== */
.confirmation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001; /* Un z-index alto para estar por encima de todo */
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.confirmation-overlay.active {
    opacity: 1;
    pointer-events: auto;
}

.menu-delete {
    max-width: 450px;
    width: calc(100% - 40px);
    padding: 24px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    transform: scale(0.95);
    transition: transform 0.3s ease;
}

.confirmation-overlay.active .menu-delete {
    transform: scale(1);
}

.menu-delete h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: #1d1d1f;
}

.menu-delete span {
    font-size: 0.95rem;
    color: #6e6e73;
    line-height: 1.5;
    display: block;
    margin-bottom: 24px;
}

.menu-delete span strong {
    font-weight: 600;
    color: #1d1d1f;
}

.menu-delete-btns {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    width: 100%;
}

.menu-delete-btns button {
    flex-grow: 0;
    padding: 12px 20px;
    border-radius: 8px;
    border: none;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
}

.menu-delete-btns button:active {
    transform: scale(0.98);
}

.menu-delete-btns .cancel-btn {
    background-color: transparent;
    border: 1px solid #00000020;
    color: #000000;
}

.menu-delete-btns .cancel-btn:hover {
    background-color: #f5f5fa;
}

.menu-delete-btns .confirm-btn {
    background-color: #d32f2f;
    color: #ffffff;
}

.menu-delete-btns .confirm-btn:hover {
    background-color: #b71c1c;
}

.dark-mode .menu-delete {
    background-color: #2c2c2e;
}

.dark-mode .menu-delete h1 {
    color: #f5f5f7;
}

.dark-mode .menu-delete span {
    color: #9a9a9f;
}

.dark-mode .menu-delete span strong {
    color: #f5f5f7;
}

.dark-mode .menu-delete-btns .cancel-btn {
    background-color: #48484a;
    color: #f5f5f7;
}

.dark-mode .menu-delete-btns .cancel-btn:hover {
    background-color: #58585a;
}

.dark-mode .menu-delete-btns .confirm-btn {
    background-color: #e57373;
    color: #1d1d1f;
}

.dark-mode .menu-delete-btns .confirm-btn:hover {
    background-color: #ef9a9a;
}
    </style>





    <!-- General scripts -->
    <script type="module" src="assets/js/general/init-app.js"></script>
    <script type="module" src="assets/js/general/main.js"></script>
    <script type="module" src="assets/js/general/translations-controller.js"></script>
    <script type="module" src="assets/js/general/location-manager.js"></script>
    <script type="module" src="assets/js/general/module-manager.js"></script>
    <script type="module" src="assets/js/general/theme-manager.js"></script>
    <script type="module" src="assets/js/general/language-manager.js"></script>
    <script type="module" src="assets/js/general/tooltip-controller.js"></script>
    <script type="module" src="assets/js/general/drag-controller.js"></script>
    <script type="module" src="assets/js/general/dynamic-island-controller.js"></script>
 <script type="module" src="assets/js/general/confirmation-modal-controller.js"></script>
    <!-- Tools scripts -->
    <script type="module" src="assets/js/tools/general-tools.js"></script>
    <script type="module" src="assets/js/tools/palette-colors.js"></script>
    <script type="module" src="assets/js/tools/color-search-system.js"></script>
    <script type="module" src="assets/js/tools/everything-controller.js"></script>
    <script type="module" src="assets/js/tools/alarm-controller.js"></script>
    <script type="module" src="assets/js/tools/timer-controller.js"></script>
    <script type="module" src="assets/js/tools/stopwatch-controller.js"></script>
    <script type="module" src="assets/js/tools/worldClock-controller.js"></script>
    <script type="module" src="assets/js/tools/menu-interactions.js"></script>
    <script type="module" src="assets/js/tools/zoneinfo-controller.js"></script>
    <script type="module" src="assets/js/tools/festivities-manager.js"></script>

</body>

</html>