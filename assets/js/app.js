import {CodeJar} from 'https://cdn.jsdelivr.net/npm/codejar@4.3.0/+esm';

import {DSFR_HEADER_DEFAULT_TEMPLATE} from './templates/dsfr-header-default.js';
import {DSFR_FOOTER_DEFAULT_TEMPLATE} from './templates/dsfr-footer-default.js';
import {MARKDOWN_CONTENT_DEFAULT} from './templates/markdown-content-default.js';
import {TOCBOT_CONFIG_DEFAULT} from './templates/toc-config-default.js';
import {TOCBOT_COLORS_DEFAULT} from './templates/toc-colors-default.js'


/**
 * Initializes the Grist custom widget
 */
function initGristCustomWidget() {
    grist.ready({
        onEditOptions() {
            // Display the back-office configuration view for widget settings. It's triggered when the user opens the widget settings in Grist.
            showWidgetPanel('configuration');
        },
        requiredAccess: 'none'
    });

    grist.onOptions((customOptions) => {
        const isFirstLoad = !storeCustomOptions;

        // If Grist has not provided any saved widget options yet, stop here. The widget does not try to render with an empty configuration.
        if (!customOptions || Object.keys(customOptions).length === 0) {
            if (isFirstLoad && !isInitialWarningDisplayed) {
                displayAlert({
                    type: 'warning',
                    message: `Initialisez ce widget en cliquant sur "<i>Ouvrir la configuration</i>" dans le panneau latéral droit de Grist, puis cliquez sur "<i>Enregistrer</i>" pour valider vos modifications.`,
                    title: 'Widget Markdown-DSFR non initialisé',
                });
                isInitialWarningDisplayed = true;

                // Update the UI back-view with default values i.e., pre-fill the configuration form with default value (for first entry)
                updateBackUIwithDefaultValue();
            }

            showWidgetPanel('alert');
            return;
        }
        storeCustomOptions = customOptions;

        // Update all elements of the UI front-view i.e., rendering the main view with Markdown content and applying Handlebars templates
        updateFrontUI(customOptions);

        // Update the UI back-view i.e., pre-fill the configuration form with existing custom options
        updateBackUI(customOptions);

        // By default, display the front-view panel on the first load view in Grist
        if (isFirstLoad) {
            //showWidgetPanel('main');
            showWidgetPanel('configuration');
        }
    });
}

/**
 * Updates the front-end UI components by rendering Markdown content and applying Handlebars templates.
 */
function updateFrontUI(customOptions) {

    function _formatLogo(rawLogo) {
        const content = (rawLogo || '').trim();
        if (!content) return '';

        const isHtmlOrSvg = content.startsWith('<');
        const isUrl = /^(https?:\/\/|\/|data:image\/)/.test(content);

        if (isHtmlOrSvg) return content;
        if (isUrl) return `<img src="${content}" alt="Logo" />`;

        // Fallback DSFR
        return `<p class="fr-logo">${content.replace(/\n/g, '<br/>')}</p>`;
    }

    function _updateFrontUI_header(customOptions) {
        const headerContainer = document.getElementById('header-container');

        if (customOptions.header_enabled === false) {
            headerContainer.innerHTML = '';
            return;
        }

        try {
            const source = customOptions.header_custom_html || DSFR_HEADER_DEFAULT_TEMPLATE;
            const template = Handlebars.compile(source);
            const context = {
                header_title: customOptions.header_title,
                header_subtitle: customOptions.header_subtitle,
                header_logo: _formatLogo(customOptions.header_logo)
            };

            headerContainer.innerHTML = template(context);
        } catch (e) {
            console.error("[app-markdown-dsfr] Handlebars rendering header template error:", e);
        }
    }

    function _updateFrontUI_footer(customOptions) {
        const footerContainer = document.getElementById('footer-container');

        if (customOptions.footer_enabled === false) {
            footerContainer.innerHTML = '';
            return;
        }

        try {
            const footerSource = customOptions.footer_custom_html || DSFR_FOOTER_DEFAULT_TEMPLATE;
            const template = Handlebars.compile(footerSource);
            const context = {
                footer_logo: _formatLogo(customOptions.footer_logo),
                footer_description: customOptions.footer_description,
                footer_license: customOptions.footer_license,
                footer_copyright: customOptions.footer_copyright || 'Grist custom widget Markdown-DSFR — Version 0.1.0-alpha (avril 2026)'
            };

            footerContainer.innerHTML = template(context);
        } catch (e) {
            console.error("[app-markdown-dsfr] Handlebars rendering footer template error:", e);
        }
    }

    function _updateFrontUI_toc(customOptions) {
        const tocAside = document.getElementById('toc-aside');
        if (customOptions.toc_enabled === false) {
            if (tocAside) tocAside.style.display = 'none';
            document.getElementById('markdown-rendered').parentElement.classList.replace('fr-col-md-9', 'fr-col-12');
        } else {
            if (tocAside) tocAside.style.display = 'block';
            document.getElementById('markdown-rendered').parentElement.classList.replace('fr-col-12', 'fr-col-md-9');

        }
        const tocTitle = tocAside.querySelector('.toc-title');
        tocTitle.textContent = customOptions.toc_title;

        const tocWrapper = document.querySelector('.toc-wrapper');
        tocWrapper.style.setProperty('--toc-primary', customOptions.toc_color_primary);
        tocWrapper.style.setProperty('--toc-text-muted', customOptions.toc_color_text_muted);
        tocWrapper.style.setProperty('--toc-bg-hover', customOptions.toc_color_bg_hover);
        tocWrapper.style.setProperty('--toc-border', customOptions.toc_color_border);
    }

    function _updateFrontUI_syntax_highlighting(customOptions, nodeMarkdown) {
        if (typeof Prism !== 'undefined' && customOptions.syntax_highlighting_enabled !== false) {
            Prism.highlightAllUnder(nodeMarkdown);
        }

        // Handle soft wrap code
        if (customOptions.syntax_highlighting_soft_wrap) {
            nodeMarkdown.classList.add('syntax_highlighting_soft_wrap-active');
        } else {
            nodeMarkdown.classList.remove('syntax_highlighting_soft_wrap-active');
        }
    }

    function _updateFrontUI_markdown(customOptions) {
        const rawMarkdown = customOptions.markdown_content || '';
        const nodeMarkdown = document.getElementById('markdown-rendered');

        const md = window.markdownit({
            html: true,
            breaks: true,
            linkify: true
        }).use(window.markdownItAttrs);
        nodeMarkdown.innerHTML = md.render(rawMarkdown);

        _updateFrontUI_syntax_highlighting(customOptions, nodeMarkdown)
        initToc();
    }



    _updateFrontUI_header(customOptions);
    _updateFrontUI_footer(customOptions);
    _updateFrontUI_toc(customOptions);
    _updateFrontUI_markdown(customOptions);
}

function updateBackUI(customOptions) {
    // --- Content editor --- //
    if (easyMDE) {
        easyMDE.value(customOptions.markdown_content || '');
    }

    // --- Header configuration --- //
    document.getElementById('textarea_header_logo').value = customOptions.header_logo || '';
    document.getElementById('input_header_title').value = customOptions.header_title || '';
    document.getElementById('input_header_subtitle').value = customOptions.header_subtitle || '';
    if (codejarHeaderCustomHtml) {
        const header_custom_html = customOptions.header_custom_html || DSFR_HEADER_DEFAULT_TEMPLATE;
        codejarHeaderCustomHtml.updateCode(header_custom_html);
    }
    const toggleHeader = document.getElementById('toggle_header_enabled');
    toggleHeader.checked = (customOptions.header_enabled !== false); // True by default if is undefined
    toggleHeader.dispatchEvent(new Event('change')); // Update toggle by dispatch event change

    // --- Footer configuration --- //
    document.getElementById('textarea_footer_logo').value = customOptions.footer_logo || '';
    document.getElementById('textarea_footer_description').value = customOptions.footer_description || '';
    document.getElementById('input_footer_license').value = customOptions.footer_license || '';
    document.getElementById('input_footer_copyright').value = customOptions.footer_copyright || '';
    if (codejarFooterCustomHtml) {
        const footer_html = customOptions.footer_custom_html || DSFR_FOOTER_DEFAULT_TEMPLATE;
        codejarFooterCustomHtml.updateCode(footer_html);
    }
    const toggleFooter = document.getElementById('toggle_footer_enabled');
    toggleFooter.checked = (customOptions.footer_enabled !== false);
    toggleFooter.dispatchEvent(new Event('change'));

    // --- TOC configuration --- //
    document.getElementById("input_toc_title").value = customOptions.toc_title || '';
    pickrInstances['color_toc_primary'].setColor(customOptions.toc_color_primary || TOCBOT_COLORS_DEFAULT.primary);
    pickrInstances['color_toc_text_muted'].setColor(customOptions.toc_color_text_muted || TOCBOT_COLORS_DEFAULT.text_muted);
    pickrInstances['color_toc_bg_hover'].setColor(customOptions.toc_color_bg_hover || TOCBOT_COLORS_DEFAULT.bg_hover);
    pickrInstances['color_toc_border'].setColor(customOptions.toc_color_border || TOCBOT_COLORS_DEFAULT.border);
    if (codejarTocConfig) {
        const toc_config = customOptions.toc_config || JSON.stringify(TOCBOT_CONFIG_DEFAULT, null, 2);
        codejarTocConfig.updateCode(toc_config);
    }
    const toggleToc = document.getElementById('toggle_toc_enabled');
    toggleToc.checked = (customOptions.toc_enabled !== false);
    toggleToc.dispatchEvent(new Event('change'));

    // --- Syntax Highlighting configuration --- //
    const toggleSyntax = document.getElementById('toggle_syntax_highlighting_enabled');
    toggleSyntax.checked = (customOptions.syntax_highlighting_enabled !== false);
    toggleSyntax.dispatchEvent(new Event('change'));

    const toggleWrap = document.getElementById('toggle_syntax_highlighting_soft_wrap');
    toggleWrap.checked = (customOptions.syntax_highlighting_soft_wrap !== false);
    toggleWrap.dispatchEvent(new Event('change'));
}

/**
 * Set the back‑office UI fields to their default values.
 */
function updateBackUIwithDefaultValue() {
    // --- Content editor --- //
    if (easyMDE) {
        easyMDE.value(MARKDOWN_CONTENT_DEFAULT);
    }

    // --- Header configuration --- //
    document.getElementById('textarea_header_logo').value = `Intitulé<br>officiel`;
    document.getElementById('input_header_title').value = `Nom du site / service`;
    document.getElementById('input_header_subtitle').value = `Baseline - précisions sur l'organisation`;
    if (codejarHeaderCustomHtml) {
        codejarHeaderCustomHtml.updateCode(DSFR_HEADER_DEFAULT_TEMPLATE);
    }

    // --- Footer configuration --- //
    document.getElementById('textarea_footer_logo').value = `Intitulé<br>officiel`;
    document.getElementById('textarea_footer_description').value = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.';
    document.getElementById('input_footer_license').value = 'Sauf mention explicite de propriété intellectuelle détenue par des tiers, les contenus de ce site sont proposés sous <a href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" target="_blank" rel="noopener external" title="Licence etalab - nouvelle fenêtre">licence etalab-2.0</a>';
    document.getElementById('input_footer_copyright').value = '';
    if (codejarFooterCustomHtml) {
        codejarFooterCustomHtml.updateCode(DSFR_FOOTER_DEFAULT_TEMPLATE);
    }

    // --- TOC configuration --- //
    if (codejarTocConfig) {
        const toc_config_default = JSON.stringify(TOCBOT_CONFIG_DEFAULT, null, 2);
        codejarTocConfig.updateCode(toc_config_default);
    }
    pickrInstances['color_toc_primary'].setColor(TOCBOT_COLORS_DEFAULT.primary);
    pickrInstances['color_toc_text_muted'].setColor(TOCBOT_COLORS_DEFAULT.text_muted);
    pickrInstances['color_toc_bg_hover'].setColor(TOCBOT_COLORS_DEFAULT.bg_hover);
    pickrInstances['color_toc_border'].setColor(TOCBOT_COLORS_DEFAULT.border);
}

/**
 * Toggles the visibility of the widget panels.
 *
 * All panels defined in the local scope are hidden except for the one specified.
 *
 * Note: When displaying the 'configuration' panel, a resize event is dispatched within a requestAnimationFrame. This
 * ensures that the DSFR (Design System French Government) component tab heights are correctly recalculated. Since the
 * panel is initially 'display: none', the DSFR API cannot accurately compute heights, which would otherwise lead to
 * truncated tab content.
 *
 * @param {string} name - The name of the panel to display. All other panels will be hidden.
 */
function showWidgetPanel(name) {

    /**
     * Workaround for cases where the DSFR tab system fails to calculate its internal CSS variable '--tabs-height' correctly,
     * usually due to the component being hidden during the first page load.
     *
     * @see https://github.com/GouvernementFR/dsfr/blob/main/src/dsfr/component/tab/script/tab/tabs-group.js
     */
    function _fixDsfrTabsHeight() {
        const tabs = document.querySelector('.fr-tabs');
        if (!tabs) return;

        const activePanel = tabs.querySelector('.fr-tabs__panel--selected');
        const tabsList = tabs.querySelector('.fr-tabs__list');
        if (activePanel && tabsList) {
            const newHeight = activePanel.offsetHeight + tabsList.offsetHeight;
            tabs.style.setProperty('--tabs-height', `${newHeight}px`);
        }
    }

    const panels = ['main', 'configuration', 'alert'];
    panels.forEach(p => {
        const el = document.getElementById(p);
        if (el) el.style.display = (p === name) ? 'block' : 'none';
    });

    if (name === 'configuration') {
        requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'));
            _fixDsfrTabsHeight();
        });

        requestAnimationFrame(() => {
            handleTextareaAutoGrow();
        });
    }
}

/**
 * Displays a DSFR alert within the 'alert' widget panel.
 *
 * @param {Object} options - Les options de l'alerte.
 * @param {('info'|'warning'|'error'|'success')} options.type - Le type d'alerte DSFR.
 * @param {string} options.message - Le message de contenu.
 * @param {string} [options.title] - Titre optionnel.
 * @param {boolean} [options.isDismissable=false] - Ajoute un bouton de fermeture.
 */
function displayAlert({type, message, title = "", isDismissable = false}) {
    let alertPanel = document.getElementById('alert');

    if (!alertPanel) {
        console.error("[app-markdown-dsfr] Required target '#alert' not found in DOM. DSFR alert injection aborted.");
        alertPanel = document.createElement('div');
        alertPanel.id = 'alert';
        alertPanel.className = 'fr-container fr-my-4w';
        document.body.prepend(alertPanel);

        type = 'error';
        title = 'Widget Markdown-DSFR &mdash; Conteneur #alert introuvable'
        message = `
            <b>Le conteneur cible <code>#alert</code> utilisé par <code>displayAlert()</code> pour l'affichage de 
            composant alerte DSFR est introuvable dans le DOM</b> ! Veuillez ajouter le conteneur suivant dans votre 
            code HTML.
            <pre><code>&lt;div id="alert" class="fr-container fr-my-4w"&gt;&lt;/div&gt;</code></pre>
        `;
        isDismissable = false;
    }

    if (!message) {
        console.error('[app-markdown-dsfr] displayAlert(): Missing required "message" argument.');
        return;
    }

    // Build the title HTML only if provided
    const titleHtml = title
        ? `<h3 class="fr-alert__title">${title}</h3>`
        : '';

    // Build the dismiss button HTML only if requested
    const closeButtonHtml = isDismissable
        ? `<button class="fr-link--close fr-link" title="Masquer le message" onclick="this.parentElement.remove()">
            Masquer le message
           </button>`
        : '';

    // Update the template alert inner HTML
    const alertHTML = `
        <div class="fr-alert fr-alert--${type} ${!title ? 'fr-alert--sm' : ''}">
            ${titleHtml}
            <p>${message}</p>
            ${closeButtonHtml}
        </div>
    `;

    alertPanel.insertAdjacentHTML('beforeend', alertHTML);
    alertPanel.style.display = 'block';
}

/**
 * Initializes UI event listeners
 *
 * - The Preview button triggers an asynchronous save process of options widget.
 * - The Cancel button switches the displayed widget panel back to the main UI front-view.
 */
function handleUIEvents() {
    const btnPreview = document.getElementById('btn-preview');
    btnPreview.addEventListener('click', async () => {
        btnPreview.disabled = true;
        try {
            await saveCustomOptions();
        } catch (error) {
            console.error("[Widget-Markdown-DSFR] Error on save custom options widget", error);
        } finally {
            btnPreview.disabled = false;
        }
    });

    const btnCancel = document.getElementById('btn-cancel');
    btnCancel.addEventListener('click', () => {
        showWidgetPanel('main');
    });

    const toggleHeader = document.getElementById('toggle_header_enabled');
    toggleHeader.addEventListener('change', (e) => {
        const headerLabel = document.querySelector('label[for="toggle_header_enabled"]');
        const headerSection = document.getElementById('section-configuration-body-header-options');
        headerSection.style.display = e.target.checked ? "block" : "none";
        headerSection.style.pointerEvents = e.target.checked ? "auto" : "none";
        headerLabel.textContent = e.target.checked ? "Désactiver l'en-tête dans la page" : "Activer l'en-tête dans la page";
    });

    const toggleFooter = document.getElementById('toggle_footer_enabled');
    toggleFooter.addEventListener('change', (e) => {
        const footerLabel = document.querySelector('label[for="toggle_footer_enabled"]');
        const footerSection = document.getElementById('section-configuration-body-footer-options');
        footerSection.style.display = e.target.checked ? "block" : "none";
        footerSection.style.pointerEvents = e.target.checked ? "auto" : "none";
        footerLabel.textContent = e.target.checked ? "Désactiver le pied de page" : "Activer le pied de page";
    });

    const toggleToc = document.getElementById('toggle_toc_enabled');
    toggleToc.addEventListener('change', (event) => {
        const isChecked = event.target.checked;
        const tocLabel = document.querySelector('label[for="toggle_toc_enabled"]');
        const tocSection = document.getElementById('section-configuration-body-toc-options');

        tocSection.style.opacity = isChecked ? "1" : "0.5";
        tocSection.style.pointerEvents = isChecked ? "auto" : "none";
        tocSection.style.transition = "all 0.3s ease";
        tocLabel.textContent = isChecked ? "Désactiver la table des matières" : "Afficher la table des matières";
    });

    const toggleSyntax = document.getElementById('toggle_syntax_highlighting_enabled');
    toggleSyntax.addEventListener('change', (e) => {
        const syntaxLabel = document.querySelector('label[for="toggle_syntax_highlighting_enabled"]');
        syntaxLabel.textContent = e.target.checked ? "Désactiver la prise en charge de la coloration syntaxique du code" : "Activer la prise en charge de la coloration syntaxique du code";
    });

    const toggleWrap = document.getElementById('toggle_syntax_highlighting_soft_wrap');
    toggleWrap.addEventListener('change', (e) => {
        const wrapLabel = document.querySelector('label[for="toggle_syntax_highlighting_soft_wrap"]');
        wrapLabel.innerHTML = e.target.checked ? "Désactiver le retour à la ligne automatique du code (<i>soft-wrap</i>)" : "Activer le retour à la ligne automatique du code (<i>soft-wrap</i>)";
    });

    const btnConfirmResetHeaderTemplate = document.getElementById('btn_confirm_reset_header_custom_html');
    if (btnConfirmResetHeaderTemplate) {
        btnConfirmResetHeaderTemplate.addEventListener('click', () => {
            if (codejarHeaderCustomHtml) {
                codejarHeaderCustomHtml.updateCode(DSFR_HEADER_DEFAULT_TEMPLATE);
                if (window.dsfr) {
                    window.dsfr(document.getElementById('modal_reset_header_custom_html')).modal.conceal();
                }
            }
        });
    }

    const btnConfirmResetFooterTemplate = document.getElementById('btn_confirm_reset_footer_custom_html');
    if (btnConfirmResetFooterTemplate) {
        btnConfirmResetFooterTemplate.addEventListener('click', () => {
            if (codejarFooterCustomHtml) {
                codejarFooterCustomHtml.updateCode(DSFR_FOOTER_DEFAULT_TEMPLATE);
                if (window.dsfr) {
                    window.dsfr(document.getElementById('modal_reset_footer_custom_html')).modal.conceal();
                }
            }
        });
    }

    const btnConfirmResetToc = document.getElementById('btn_confirm_reset_toc_config');
    if (btnConfirmResetToc) {
        btnConfirmResetToc.addEventListener('click', () => {
            if (codejarTocConfig) {
                codejarTocConfig.updateCode(JSON.stringify(TOCBOT_CONFIG_DEFAULT, null, 2));
                if (window.dsfr) {
                    window.dsfr(document.getElementById('modal_reset_toc_config')).modal.conceal();
                }
            }
            document.getElementById("input_toc_title").value = "Sommaire";
            pickrInstances['color_toc_primary'].setColor(TOCBOT_COLORS_DEFAULT.primary);
            pickrInstances['color_toc_text_muted'].setColor(TOCBOT_COLORS_DEFAULT.text_muted);
            pickrInstances['color_toc_bg_hover'].setColor(TOCBOT_COLORS_DEFAULT.bg_hover);
            pickrInstances['color_toc_border'].setColor(TOCBOT_COLORS_DEFAULT.border);
        });
    }

    handleTextareaAutoGrow();
}

function handleTextareaAutoGrow() {
    function _textareaAutoGrow(nodeTextarea) {
        if (!nodeTextarea) return;
        nodeTextarea.style.height = "auto";
        nodeTextarea.style.height = (nodeTextarea.scrollHeight) + "px";
    }

    const textareaAutoGrowNodes = document.querySelectorAll('.textarea-auto-grow');
    textareaAutoGrowNodes.forEach(node => {
        // Initial adjust height
        _textareaAutoGrow(node);

        // Adjust height foreach keyboard input
        node.addEventListener('input', function () {
            _textareaAutoGrow(this);
        });
    });

    // Adjust height on resize
    window.addEventListener('resize', () => {
        window.requestAnimationFrame(() => {
            textareaAutoGrowNodes.forEach(node => _textareaAutoGrow(node));
        });
    });
}

/**
 * Saves the widget's custom options to the Grist document.
 */
async function saveCustomOptions() {
    const currentCustomOptions = {
        markdown_content: easyMDE ? easyMDE.value() : document.getElementById("textarea_markdown_content").value,

        header_enabled: document.getElementById("toggle_header_enabled").checked,
        header_logo: document.getElementById("textarea_header_logo").value,
        header_title: document.getElementById("input_header_title").value,
        header_subtitle: document.getElementById("input_header_subtitle").value,
        header_custom_html: codejarHeaderCustomHtml ? codejarHeaderCustomHtml.toString() : "",

        footer_enabled: document.getElementById("toggle_footer_enabled").checked,
        footer_logo: document.getElementById("textarea_footer_logo").value,
        footer_description: document.getElementById("textarea_footer_description").value,
        footer_license: document.getElementById("input_footer_license").value,
        footer_copyright: document.getElementById("input_footer_copyright").value,
        footer_custom_html: codejarFooterCustomHtml ? codejarFooterCustomHtml.toString() : "",

        toc_enabled: document.getElementById("toggle_toc_enabled").checked,
        toc_title: document.getElementById("input_toc_title").value,
        toc_color_primary: pickrInstances['color_toc_primary']?.getColor().toRGBA().toString(3),
        toc_color_text_muted: pickrInstances['color_toc_text_muted']?.getColor().toRGBA().toString(3),
        toc_color_bg_hover: pickrInstances['color_toc_bg_hover']?.getColor().toRGBA().toString(3),
        toc_color_border: pickrInstances['color_toc_border']?.getColor().toRGBA().toString(3),
        toc_config: codejarTocConfig ? codejarTocConfig.toString() : "",

        syntax_highlighting_enabled: document.getElementById('toggle_syntax_highlighting_enabled').checked,
        syntax_highlighting_soft_wrap: document.getElementById('toggle_syntax_highlighting_soft_wrap').checked,
    };

    // Only save options in Grist's document if options have changed to avoid redundant API calls
    if (JSON.stringify(currentCustomOptions) !== JSON.stringify(storeCustomOptions)) {
        await grist.setOptions(currentCustomOptions);

        // Update the local store reference after save
        storeCustomOptions = currentCustomOptions;
    }

    // Return the user to the main front-view
    showWidgetPanel('main');
}

/**
 * Initializes the EasyMDE markdown editor.
 *
 * The editor is attached to the element whose id is `textarea_markdown_content`.
 * A custom preview renderer converts the markdown to HTML using `marked.parse`
 * and then applies syntax highlighting with `Prism.highlightAllUnder` once the
 * preview element is available.
 *
 * The created EasyMDE instance is stored in the global `easyMDE` variable.
 *
 * @see https://www.jsdelivr.com/package/npm/easymde
 */
function initEasyMDE() {
    return new EasyMDE({
        element: document.getElementById('textarea_markdown_content'),
        minHeight: "400px",
        autofocus: true,
        spellChecker: false,
        status: true,
        toolbar: [
            "bold", "italic", "heading",
            "|",
            "quote", "unordered-list", "ordered-list",
            "|",
            "link", "image",
            "code",
            "|",
            "side-by-side", "fullscreen", "guide"
        ],
        placeholder: "Ecrire le contenu de votre page ici en markdown & HTML...",
        renderingConfig: {
            singleLineBreaks: false,
            codeSyntaxHighlighting: false,
        },
        previewRender: function (plainText, preview) {
            const md = window.markdownit({
                html: true,
                breaks: true,
                linkify: true
            }).use(window.markdownItAttrs);
            const html = md.render(plainText);

            setTimeout(() => {
                if (preview) {
                    Prism.highlightAllUnder(preview);
                }
            }, 50);

            return html;
        },
    });
}

function initToc() {

    /**
     * Generates unique slugs and assigns them as IDs to header elements and prevents duplicate IDs by appending a numeric counter.
     */
    function _generateMarkdownHeadersID({container = document, headingSelector = 'h2, h3'} = {}) {
        const headers = container.querySelectorAll(headingSelector);
        const usedIds = new Set();

        headers.forEach(header => {
            // Create slug
            let baseId = header.textContent
                .trim()
                .toLowerCase()
                .normalize("NFD") // Decompose accented characters
                .replace(/[\u0300-\u036f]/g, "") // Remove accents
                .replace(/[^\w\s-]/g, "") // Remove non-alphanumeric characters (except spaces/hyphens)
                .replace(/\s+/g, "-") // Replace spaces with hyphens
                .replace(/-+/g, "-"); // Avoid multiple consecutive hyphens

            // Skip duplicate entries when an item with the same id already exists.
            let uniqueId = baseId;
            let counter = 1;
            while (usedIds.has(uniqueId)) {
                uniqueId = `${baseId}-${counter}`;
                counter++;
            }

            // Set the id to the header and save it into collection usedIDS
            header.id = uniqueId;
            usedIds.add(uniqueId);
        });
    }

    if (typeof tocbot !== 'undefined') {
        // Load Tocbot configuration from user-defined or defaults
        let userConfig = {};
        try {
            if (storeCustomOptions && storeCustomOptions.toc_config) {
                userConfig = JSON.parse(storeCustomOptions.toc_config);
            } else {
                userConfig = TOCBOT_CONFIG_DEFAULT;
            }
        } catch (e) {
            console.warn("[app-markdown-dsfr] Tocbot error configuration, falling back to default settings.", e);
            userConfig = TOCBOT_CONFIG_DEFAULT;
        }

        // Generate IDs for headers based on the chosen selector
        const activeHeadingSelector = userConfig.headingSelector || 'h2, h3';
        _generateMarkdownHeadersID({
            container: document.getElementById('markdown-rendered'),
            headingSelector: activeHeadingSelector
        });

        // Define system-required selectors that should not be overridden
        const systemConfig = {
            tocSelector: '.js-toc',
            contentSelector: '.js-toc-content',
        };

        // Merge user options with system requirements
        const finalConfig = {...userConfig, ...systemConfig};

        tocbot.init(finalConfig);
    }
}

function initCodejar(elementId) {
    const editorElement = document.getElementById(elementId);
    if (!editorElement) {
        displayAlert({
            type: 'error',
            message: `L'éditeur de code HTML basé sur la librairie CodeJar n'a pas pu s'initialiser, car le conteneur avec l'ID suivant <code>#${elementId}</code> est absent du DOM.`,
            title: '<code>initCodejar(elementId)</code>',
        });
        console.error(`[app-markdown-dsfr] Required target '#${elementId}' not found in DOM. CodeJar initialization aborted.`);

        return null;
    }

    return CodeJar(editorElement, (element) => {
        if (!element.classList.contains('language-html')) {
            element.classList.add('language-html');
        }

        if (typeof Prism !== 'undefined') {
            Prism.highlightElement(element);
        }
    });
}

function initColorPicker(elementId, inputId, defaultColor) {
    const picker = Pickr.create({
        el: `#${elementId}`,
        theme: 'monolith',
        default: defaultColor,
        components: {
            preview: true,
            opacity: true,
            hue: true,
            interaction: {
                input: true,
                save: true,
                rgba: true,
                hex: true,
            }
        },
        i18n: {'ui:dialog': 'Sélecteur de couleur', 'btn:save': 'Ok'}
    });

    picker.on('save', (color) => {
        // toString(3) permet de garder l'opacité dans la chaîne de caractère
        const colorString = color.toRGBA().toString(3);
        document.getElementById(inputId).value = colorString;
        picker.hide();
    });

    // On stocke l'instance pour y accéder plus tard (ex: reset)
    pickrInstances[inputId] = picker;

    return picker;
}

function initBackUI() {
    // Initializes the EasyMDE markdown editor.
    easyMDE = initEasyMDE();

    // Initialize the CodeJar editor.
    codejarHeaderCustomHtml = initCodejar('textarea_header_custom_html');
    codejarFooterCustomHtml = initCodejar('textarea_footer_custom_html');
    codejarTocConfig = initCodejar('textarea_toc_config')

    // Initialize color picker
    initColorPicker('picker_toc_primary', 'color_toc_primary', TOCBOT_COLORS_DEFAULT.primary);
    initColorPicker('picker_toc_text_muted', 'color_toc_text_muted', TOCBOT_COLORS_DEFAULT.text_muted);
    initColorPicker('picker_toc_bg_hover', 'color_toc_bg_hover', TOCBOT_COLORS_DEFAULT.bg_hover);
    initColorPicker('picker_toc_border', 'color_toc_border', TOCBOT_COLORS_DEFAULT.border);
}


let isInitialWarningDisplayed = false;
let easyMDE = null;
let codejarHeaderCustomHtml = null;
let codejarFooterCustomHtml = null;
let codejarTocConfig = null;
let storeCustomOptions = null;
let pickrInstances = {};

document.addEventListener('DOMContentLoaded', () => {
    // Initializes custom elements in configuration view (EasyMDE markdown editor, codejar editors, colors picker...)
    initBackUI();

    // Initializes the Grist custom widget Markdown-DSFR
    initGristCustomWidget();

    // Initializes UI event listeners (Cancel & Preview click listeners)
    handleUIEvents();
});