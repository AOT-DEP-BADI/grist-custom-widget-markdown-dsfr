export const DSFR_HEADER_DEFAULT_TEMPLATE =
`<header role="banner" class="fr-header" id="header">
  <div class="fr-header__body">
    <div class="fr-container">
      <div class="fr-header__body-row">
        <div class="fr-header__brand fr-enlarge-link">
          {{#if header_logo}}
          <div class="fr-header__brand-top">
            <div class="fr-header__logo" id="view-header-logo">
              {{{ header_logo }}}
            </div>
          </div>
          {{/if}}
          <div class="fr-header__service">
            {{#if header_title}}
              <p class="fr-header__service-title" id="view-header-title">
                {{{ header_title }}}
              </p>
            {{/if}}
            {{#if header_subtitle}}
              <p class="fr-header__service-tagline" id="view-header-subtitle">
                {{{ header_subtitle }}}
              </p>
            {{/if}}
          </div>
        </div>
      </div>
    </div>
  </div>
</header>`;