// =============================================
// AutoWeex — Thème clair / sombre (dark / light mode)
// =============================================
// - Le thème CLAIR est le thème principal partout (site public + admin).
// - Le mode sombre reste disponible via le bouton soleil/lune.
// Le choix de l'utilisateur est mémorisé dans localStorage et prime
// toujours sur le défaut de la page.

const Theme = {
  KEY: 'aw_theme_v2', // v2 : le clair devient le thème principal (anciens choix ignorés)

  get() {
    return localStorage.getItem(this.KEY); // null si jamais choisi -> défaut de la page
  },

  set(theme) {
    localStorage.setItem(this.KEY, theme);
    document.body.setAttribute('data-theme', theme);
  },

  toggle() {
    const current = document.body.getAttribute('data-theme') || this.defaultFor();
    this.set(current === 'dark' ? 'light' : 'dark');
  },

  defaultFor() {
    return 'light'; // thème clair principal (site public + admin)
  },

  // À appeler au chargement de chaque page (fait automatiquement plus bas).
  init() {
    const saved = this.get();
    document.body.setAttribute('data-theme', saved || this.defaultFor());
  },
};

// Petit bouton soleil/lune à injecter dans la navbar / sidebar
function themeToggleHTML(extraClass = '') {
  return `<button type="button" class="aw-theme-toggle ${extraClass}" onclick="Theme.toggle()" aria-label="Changer de thème" title="Changer de thème">
    <i class="ti ti-sun"></i><i class="ti ti-moon"></i>
  </button>`;
}

document.addEventListener('DOMContentLoaded', () => Theme.init());
