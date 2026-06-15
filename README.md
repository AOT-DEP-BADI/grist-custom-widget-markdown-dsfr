Grist widget Markdown DSFR
==========================



### 📦 Widget **Markdown‑DSFR** – version améliorée

---

#### 🎯 Objectif du widget

Le widget **Markdown‑DSFR** a été imaginé pour simplifier la création d’une page d’atterrissage unique, sans passer par du HTML brut.  
Il permet :

* de saisir le contenu directement en **Markdown** grâce à un éditeur **WYSIWYG** ;
* de configurer, en quelques clics, les éléments récurrents d’une page conforme au **Design System du Gouvernement Français (DSFR)** ;
* d’obtenir un rendu final full‑DSFR (header, footer, sommaire, coloration du code) en un seul clic.

---

#### ✍️ Rédaction du contenu Markdown

Dans le panneau de configuration du widget, un éditeur *What‑You‑See‑Is‑What‑You‑Get* vous invite à écrire votre texte en Markdown.  
Le texte est instantanément converti en HTML via **markdown-it** ; les balises HTML personnalisées sont autorisées (`html: true`) et les sauts de ligne sont respectés (`breaks: true`).

> **Astuce :** utilisez la syntaxe native de Markdown (titres, listes, tableaux, blocs de code…) ; le rendu s’ajustera automatiquement aux styles DSFR.

---

#### ⚙️ Options de configuration

| Option | Description | Exemple d’utilisation |
|--------|------------|-----------------------|
| **Header DSFR** | Active ou désactive l’en‑tête officielle ; vous pouvez personnaliser le logo, le titre du service, le slogan et même remplacer entièrement le HTML via un mini‑éditeur Handlebars. | `{{{ header_logo }}}`, `{{{ header_title }}}` |
| **Footer DSFR** | Idem pour le pied de page ; variables disponibles pour le logo, la description, la licence, le copyright, ou un HTML complet. | `{{{ footer_logo }}}`, `{{{ footer_license }}}` |
| **TOC (Table des matières)** | Génère automatiquement un sommaire à partir des titres Markdown ; vous pouvez choisir le texte du titre du sommaire, son affichage, et la palette de couleurs via **tocbot.js**. | `{{{ toc_title }}}` |
| **Coloration syntaxique** | Applique le thème Prism‑Tomorrow aux blocs de code, garantissant une lecture claire et un aspect conforme aux standards DSFR. | `<pre><code class="language-js">…</code></pre>` |

> Chaque option possède un **bouton d’aide** (icône « i ») qui ouvre un tooltip détaillant le rôle de la variable et les bonnes pratiques.

---

#### 🖼️ Rendu final

Une fois la configuration enregistrée et le bouton **Prévisualiser** activé, le widget produit une page HTML intégrant :

* le **header** DSFR (ou sa version personnalisée) ;
* le **contenu** Markdown transformé, avec titres, listes, images et blocs de code stylisés ;
* la **table des matières** collante sur le côté gauche (ou en haut ; réglable) ;
* le **footer** DSFR (ou sa variante sur‑mesure).

> Le design reste 100 % compatible avec les exigences d’accessibilité et de responsive design du DSFR.

---

#### 📌 Points forts à retenir

* **Gain de temps** – plus besoin d’écrire du HTML/CSS ; le widget se charge de la mise en forme DSFR.
* **Flexibilité** – activez ou désactivez chaque section (header, footer, TOC, coloration) selon vos besoins.
* **Personnalisation avancée** – grâce aux champs Handlebars, vous pouvez injecter du HTML complet tout en conservant les classes DSFR.
* **Simplicité d’utilisation** – tout se configure depuis l’interface WYSIWYG, sans toucher au code source.

---

#### 📚 Documentation et support

* **Code source** : `@badi/grist-widget-markdown-dsfr-vanilla` (npm).
* **Guide d’utilisation** : voir le fichier `README.md` du dépôt.
* **Issues & demandes de fonctionnalité** : ouvrez une *issue* sur le repository GitHub.

---

> **En résumé**, le widget **Markdown‑DSFR** vous offre une solution clé‑en‑main pour créer rapidement des pages d’atterrissage élégantes, accessibles et pleinement intégrées au Design System du gouvernement français.

---  

*Vincent BLAIN* – développeur du widget.  