export const DSFR_FOOTER_DEFAULT_TEMPLATE =
`<footer class="fr-footer" role="contentinfo" id="footer">
  <div class="fr-container">
    <div class="fr-footer__body">
      {{#if footer_logo}}
      <div class="fr-footer__brand fr-enlarge-link">
        {{{ footer_logo }}}
      </div>
      {{/if}}
      <div class="fr-footer__content">
        {{#if footer_description}}
        <p class="fr-footer__content-desc">
          {{{ footer_description }}}
        </p>
        {{/if}}
        <ul class="fr-footer__content-list">
          <li class="fr-footer__content-item">
            <a title="info.gouv.fr - nouvelle fenêtre" id="footer__content-link-0" href="https://info.gouv.fr" target="_blank" rel="noopener external" class="fr-footer__content-link">info.gouv.fr</a>
          </li>
          <li class="fr-footer__content-item">
            <a title="data.gouv.fr - nouvelle fenêtre" id="footer__content-link-3" href="https://data.gouv.fr" target="_blank" rel="noopener external" class="fr-footer__content-link">data.gouv.fr</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="fr-footer__bottom">
      <div class="fr-footer__bottom-copy">
        {{#if footer_license}}<p class="fr-mb-0">{{{ footer_license }}}</p>{{/if}}
        {{#if footer_copyright}}<p>{{{ footer_copyright }}}</p>{{/if}}
      </div>
    </div>
  </div>
</footer>`;


