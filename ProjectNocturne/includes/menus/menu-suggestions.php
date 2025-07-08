<div class="menu-suggestions disabled body-title" data-menu="suggestions">
    <div class="pill-container">
        <div class="drag-handle"></div>
    </div>
    <div class="menu-section">
         <div class="menu-section-top">
            <div class="menu-header-fixed">
                <button class="menu-back-btn" data-action="back-to-previous-menu">
                    <span class="material-symbols-rounded">arrow_left</span>
                </button>
                <div class="search-content">
                    <div class="search-content-icon">
                        <span class="material-symbols-rounded">emoji_objects</span>
                    </div>
                    <div class="search-content-text">
                        <span data-translate="suggest_improvements_title" data-translate-category="menu"></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="menu-content-scrolleable overflow-y">
             <div class="menu-section-center">
                <p class="suggestions-description" data-translate="suggest_improvements_desc" data-translate-category="menu"></p>
                <form id="suggestion-form">
                    <div class="form-group">
                        <div class="field-label" data-translate="suggestion_type" data-translate-category="menu"></div>
                        <div class="custom-select-wrapper">
                            <div class="custom-select-content" data-action="open-suggestion-types-menu" role="button" tabindex="0" aria-label="Select suggestion type">
                                <div class="custom-select-content-left">
                                    <span id="suggestion-type-display" data-translate="suggestion_type_improvement" data-translate-category="menu"></span>
                                </div>
                                <div class="custom-select-content-right">
                                    <span class="material-symbols-rounded">arrow_right</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="suggestion-text" data-translate="suggestion_message" data-translate-category="menu"></label>
                        <textarea id="suggestion-text" name="suggestion-text" rows="5" required></textarea>
                    </div>
                </form>
             </div>
        </div>
        <div class="menu-section-bottom">
            <div class="menu-delete-btns">
                 <button type="button" class="cancel-btn body-title" data-action="cancel-suggestion" data-translate="cancel" data-translate-category="confirmation"></button>
                 <button type="submit" class="confirm-btn body-title" form="suggestion-form" data-translate="send_suggestion" data-translate-category="menu"></button>
            </div>
        </div>
    </div>
</div>