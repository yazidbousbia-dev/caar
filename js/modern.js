// =====================================================================
// AutoWeex — couche "2026" : navigateur de pages (Ctrl+K), session démo,
// effets d'interface légers et textes FR / AR / EN des nouveaux blocs.
// Chargé après i18n.js et theme.js sur toutes les pages.
// =====================================================================
(function () {
  const lang = () => (window.Lang ? Lang.get() : 'fr');
  const IN_PAGES = window.location.pathname.includes('/pages/');
  const SITE = IN_PAGES ? '../' : '';
  const ADMIN = IN_PAGES ? '' : 'pages/';

  // ---------------------------------------------------------------
  // Textes (FR / AR / EN)
  // ---------------------------------------------------------------
  const D = {
    fr: {
      'hub.open': 'Pages', 'hub.title': 'Toutes les pages', 'hub.ph': 'Chercher une page ou une voiture…',
      'hub.site': 'Site public', 'hub.admin': 'Administration', 'hub.session': 'Session de démonstration',
      'hub.cars': 'Voitures', 'hub.arrivals': 'Derniers arrivages', 'hub.none': 'Aucun résultat',
      'role.visitor': 'Visiteur', 'role.client': 'Client', 'role.secretaire': 'Secrétaire', 'role.admin': 'Admin',
      'p.home': 'Accueil', 'p.cars': 'Catalogue véhicules', 'p.detail': 'Fiche véhicule', 'p.favs': 'Favoris',
      'p.account': 'Espace client', 'p.about': 'À propos & contact', 'p.login': 'Connexion', 'p.register': 'Inscription',
      'p.dash': 'Tableau de bord', 'p.adminCars': 'Annonces', 'p.requests': 'Demandes d\'achat', 'p.brands': 'Marques',
      'p.users': 'Utilisateurs', 'p.reports': 'Signalements', 'p.adminProfile': 'Profil admin',
      'car.newArrival': 'Nouvel arrivage', 'car.arrival': 'Arrivée chez AutoWeex', 'car.techSheet': 'Fiche technique',
      'car.equipment': 'Équipements', 'car.engine': 'Moteur', 'car.power': 'Puissance', 'car.drive': 'Entraînement',
      'car.consumption': 'Consommation', 'car.seats': 'Places', 'car.doors': 'Portes', 'car.color': 'Couleur',
      'car.vin': 'N° de châssis (VIN)', 'car.warranty': 'Garantie', 'car.owners': 'Propriétaires précédents',
      'car.origin': 'Provenance', 'car.reference': 'Référence', 'car.location': 'Localisation',
      'car.hp': 'ch', 'car.months': 'mois', 'car.none': 'aucun (neuf)',
      'tl.title': 'Parcours du véhicule chez nous', 'tl.arrived': 'Arrivée à l\'entreprise', 'tl.inspection': 'Contrôle 120 points',
      'tl.prep': 'Remise en état & nettoyage', 'tl.sale': 'Mise en vente', 'tl.done': 'Terminé', 'tl.doing': 'En cours',
      'home.arrivals.title': 'Derniers arrivages', 'home.arrivals.sub': 'Les véhicules qui viennent d\'entrer chez AutoWeex, déjà contrôlés et prêts à être vus en showroom.',
      'sort.arrival': 'Dernier arrivage', 'sort.label': 'Tri', 'sort.priceAsc': 'Prix croissant', 'sort.priceDesc': 'Prix décroissant', 'sort.yearDesc': 'Plus récentes',
      'ad.arrival': 'Date d\'arrivée à l\'entreprise', 'ad.origin': 'Provenance', 'ad.engine': 'Moteur', 'ad.power': 'Puissance (ch)',
      'ad.drive': 'Entraînement', 'ad.cons': 'Consommation', 'ad.seats': 'Places', 'ad.warranty': 'Garantie (mois)',
      'ad.owners': 'Propriétaires précédents', 'ad.vin': 'N° de châssis (VIN)', 'ad.features': 'Équipements (séparés par une virgule)',
      'ad.section': 'Arrivée & fiche technique',
      'ago.0': 'aujourd\'hui', 'ago.1': 'hier', 'ago.n': 'il y a {n} jours',
    },
    ar: {
      'hub.open': 'الصفحات', 'hub.title': 'كل صفحات الموقع', 'hub.ph': 'ابحث عن صفحة أو سيارة…',
      'hub.site': 'الموقع العام', 'hub.admin': 'لوحة الإدارة', 'hub.session': 'جلسة العرض التجريبي',
      'hub.cars': 'السيارات', 'hub.arrivals': 'أحدث الوصولات', 'hub.none': 'لا توجد نتائج',
      'role.visitor': 'زائر', 'role.client': 'عميل', 'role.secretaire': 'سكرتير', 'role.admin': 'مدير',
      'p.home': 'الرئيسية', 'p.cars': 'كتالوج السيارات', 'p.detail': 'صفحة سيارة', 'p.favs': 'المفضلة',
      'p.account': 'حساب العميل', 'p.about': 'من نحن واتصل بنا', 'p.login': 'تسجيل الدخول', 'p.register': 'إنشاء حساب',
      'p.dash': 'لوحة التحكم', 'p.adminCars': 'الإعلانات', 'p.requests': 'طلبات الشراء', 'p.brands': 'الماركات',
      'p.users': 'المستخدمون', 'p.reports': 'البلاغات', 'p.adminProfile': 'ملف المدير',
      'car.newArrival': 'وصلت حديثاً', 'car.arrival': 'الوصول إلى AutoWeex', 'car.techSheet': 'البطاقة التقنية',
      'car.equipment': 'التجهيزات', 'car.engine': 'المحرك', 'car.power': 'القوة', 'car.drive': 'الدفع',
      'car.consumption': 'الاستهلاك', 'car.seats': 'المقاعد', 'car.doors': 'الأبواب', 'car.color': 'اللون',
      'car.vin': 'رقم الهيكل (VIN)', 'car.warranty': 'الضمان', 'car.owners': 'الملاك السابقون',
      'car.origin': 'المصدر', 'car.reference': 'المرجع', 'car.location': 'الموقع',
      'car.hp': 'حصان', 'car.months': 'شهراً', 'car.none': 'لا أحد (جديدة)',
      'tl.title': 'رحلة السيارة عندنا', 'tl.arrived': 'الوصول إلى المؤسسة', 'tl.inspection': 'فحص من 120 نقطة',
      'tl.prep': 'الإصلاح والتنظيف', 'tl.sale': 'العرض للبيع', 'tl.done': 'مكتمل', 'tl.doing': 'قيد التنفيذ',
      'home.arrivals.title': 'أحدث الوصولات', 'home.arrivals.sub': 'سيارات وصلت للتو إلى AutoWeex، تم فحصها وهي جاهزة للمعاينة في المعرض.',
      'sort.arrival': 'الأحدث وصولاً', 'sort.label': 'الترتيب', 'sort.priceAsc': 'السعر تصاعدياً', 'sort.priceDesc': 'السعر تنازلياً', 'sort.yearDesc': 'الأحدث موديلاً',
      'ad.arrival': 'تاريخ الوصول إلى المؤسسة', 'ad.origin': 'المصدر', 'ad.engine': 'المحرك', 'ad.power': 'القوة (حصان)',
      'ad.drive': 'نوع الدفع', 'ad.cons': 'الاستهلاك', 'ad.seats': 'عدد المقاعد', 'ad.warranty': 'الضمان (أشهر)',
      'ad.owners': 'الملاك السابقون', 'ad.vin': 'رقم الهيكل (VIN)', 'ad.features': 'التجهيزات (مفصولة بفاصلة)',
      'ad.section': 'الوصول والبطاقة التقنية',
      'ago.0': 'اليوم', 'ago.1': 'أمس', 'ago.n': 'منذ {n} أيام',
    },
    en: {
      'hub.open': 'Pages', 'hub.title': 'All pages', 'hub.ph': 'Search a page or a car…',
      'hub.site': 'Public site', 'hub.admin': 'Administration', 'hub.session': 'Demo session',
      'hub.cars': 'Cars', 'hub.arrivals': 'Latest arrivals', 'hub.none': 'No results',
      'role.visitor': 'Visitor', 'role.client': 'Client', 'role.secretaire': 'Secretary', 'role.admin': 'Admin',
      'p.home': 'Home', 'p.cars': 'Vehicle catalogue', 'p.detail': 'Vehicle page', 'p.favs': 'Favourites',
      'p.account': 'Client area', 'p.about': 'About & contact', 'p.login': 'Sign in', 'p.register': 'Sign up',
      'p.dash': 'Dashboard', 'p.adminCars': 'Listings', 'p.requests': 'Purchase requests', 'p.brands': 'Brands',
      'p.users': 'Users', 'p.reports': 'Reports', 'p.adminProfile': 'Admin profile',
      'car.newArrival': 'New arrival', 'car.arrival': 'Arrived at AutoWeex', 'car.techSheet': 'Technical sheet',
      'car.equipment': 'Equipment', 'car.engine': 'Engine', 'car.power': 'Power', 'car.drive': 'Drivetrain',
      'car.consumption': 'Consumption', 'car.seats': 'Seats', 'car.doors': 'Doors', 'car.color': 'Colour',
      'car.vin': 'Chassis no. (VIN)', 'car.warranty': 'Warranty', 'car.owners': 'Previous owners',
      'car.origin': 'Origin', 'car.reference': 'Reference', 'car.location': 'Location',
      'car.hp': 'hp', 'car.months': 'months', 'car.none': 'none (new)',
      'tl.title': 'The car\'s journey with us', 'tl.arrived': 'Arrival at the company', 'tl.inspection': '120-point inspection',
      'tl.prep': 'Reconditioning & cleaning', 'tl.sale': 'On sale', 'tl.done': 'Done', 'tl.doing': 'In progress',
      'home.arrivals.title': 'Latest arrivals', 'home.arrivals.sub': 'Cars that just arrived at AutoWeex, already inspected and ready to see in the showroom.',
      'sort.arrival': 'Latest arrival', 'sort.label': 'Sort', 'sort.priceAsc': 'Price: low to high', 'sort.priceDesc': 'Price: high to low', 'sort.yearDesc': 'Newest models',
      'ad.arrival': 'Arrival date at the company', 'ad.origin': 'Origin', 'ad.engine': 'Engine', 'ad.power': 'Power (hp)',
      'ad.drive': 'Drivetrain', 'ad.cons': 'Consumption', 'ad.seats': 'Seats', 'ad.warranty': 'Warranty (months)',
      'ad.owners': 'Previous owners', 'ad.vin': 'Chassis no. (VIN)', 'ad.features': 'Equipment (comma-separated)',
      'ad.section': 'Arrival & technical sheet',
      'ago.0': 'today', 'ago.1': 'yesterday', 'ago.n': '{n} days ago',
    },
  };
  Object.assign(D.fr, { 'calc.title': 'Simulateur de mensualité', 'calc.down': 'Apport', 'calc.months': 'Durée (mois)', 'calc.monthly': 'Mensualité estimée', 'calc.note': 'Estimation indicative sans intérêts — contactez-nous pour une offre de financement.' });
  Object.assign(D.ar, { 'calc.title': 'حاسبة القسط الشهري', 'calc.down': 'الدفعة الأولى', 'calc.months': 'المدة (أشهر)', 'calc.monthly': 'القسط الشهري التقديري', 'calc.note': 'تقدير تقريبي بدون فوائد — تواصل معنا للحصول على عرض تمويل.' });
  if (D.en) Object.assign(D.en, { 'calc.title': 'Monthly payment simulator', 'calc.down': 'Down payment', 'calc.months': 'Term (months)', 'calc.monthly': 'Estimated monthly payment', 'calc.note': 'Indicative estimate without interest — contact us for a financing offer.' });
  window.MX = (k, vars) => {
    let s = (D[lang()] && D[lang()][k]) || D.fr[k] || k;
    if (vars) Object.keys(vars).forEach(v => { s = s.replace('{' + v + '}', vars[v]); });
    return s;
  };
  MX.ago = (n) => n <= 0 ? MX('ago.0') : n === 1 ? MX('ago.1') : MX('ago.n', { n });
  MX.date = (iso) => iso ? new Date(iso).toLocaleDateString({ fr: 'fr-DZ', ar: 'ar-DZ', en: 'en-GB' }[lang()],
    { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  function fillStatic() {
    document.querySelectorAll('[data-mx]').forEach(el => { el.textContent = MX(el.dataset.mx); });
    document.querySelectorAll('[data-mx-ph]').forEach(el => { el.placeholder = MX(el.dataset.mxPh); });
  }

  // ---------------------------------------------------------------
  // Navigateur de pages (Ctrl/⌘+K) — accès à TOUT le projet
  // ---------------------------------------------------------------
  const PAGES = () => ({
    site: [
      ['ti-home', 'p.home', SITE + 'index.html'], ['ti-car', 'p.cars', SITE + 'vehicules.html'],
      ['ti-file-description', 'p.detail', SITE + 'vehicule-detail.html?id=1'], ['ti-heart', 'p.favs', SITE + 'favoris.html'],
      ['ti-user-circle', 'p.account', SITE + 'profile.html'], ['ti-info-circle', 'p.about', SITE + 'a-propos.html'],
      ['ti-login', 'p.login', SITE + 'login.html'], ['ti-user-plus', 'p.register', SITE + 'register.html'],
    ],
    admin: [
      ['ti-dashboard', 'p.dash', ADMIN + 'dashboard.html'], ['ti-car', 'p.adminCars', ADMIN + 'cars.html'],
      ['ti-clipboard-list', 'p.requests', ADMIN + 'requests.html'], ['ti-tag', 'p.brands', ADMIN + 'brands.html'],
      ['ti-users-group', 'p.users', ADMIN + 'users.html'], ['ti-flag', 'p.reports', ADMIN + 'reports.html'],
      ['ti-user-circle', 'p.adminProfile', ADMIN + 'profile.html'],
    ],
  });

  let pal, carsCache = null;
  function buildHub() {
    const fab = document.createElement('button');
    fab.className = 'mx-fab'; fab.type = 'button';
    fab.innerHTML = '<i class="ti ti-layout-grid"></i><span>' + MX('hub.open') + '</span><kbd>Ctrl K</kbd>';
    fab.addEventListener('click', openHub);
    document.body.appendChild(fab);

    pal = document.createElement('div');
    pal.className = 'mx-pal'; pal.hidden = true;
    pal.innerHTML = `
      <div class="mx-pal-panel" role="dialog" aria-modal="true" aria-label="${MX('hub.title')}">
        <div class="mx-pal-search"><i class="ti ti-search"></i>
          <input id="mxQ" type="search" autocomplete="off" placeholder="${MX('hub.ph')}">
          <button type="button" class="mx-x" aria-label="Fermer"><i class="ti ti-x"></i></button></div>
        <div class="mx-pal-body" id="mxBody"></div>
        <div class="mx-pal-foot"><span>${MX('hub.session')}</span>
          <div class="mx-roles" id="mxRoles"></div></div>
      </div>`;
    document.body.appendChild(pal);
    pal.addEventListener('click', (e) => { if (e.target === pal || e.target.closest('.mx-x')) closeHub(); });
    pal.querySelector('#mxQ').addEventListener('input', renderHub);
    pal.querySelector('#mxQ').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { const a = pal.querySelector('.mx-item'); if (a) window.location.href = a.getAttribute('href'); }
    });
  }

  async function loadCars() {
    if (carsCache) return carsCache;
    try {
      const list = await api('GET', '/public/cars');
      carsCache = (Array.isArray(list) ? list : []).sort((a, b) =>
        new Date(b.arrival_date || 0) - new Date(a.arrival_date || 0));
    } catch (_) { carsCache = []; }
    return carsCache;
  }

  async function renderHub() {
    const q = pal.querySelector('#mxQ').value.trim().toLowerCase();
    const P = PAGES();
    const match = (arr) => arr.filter(([, k]) => !q || MX(k).toLowerCase().includes(q));
    const item = ([ic, k, href]) => `<a class="mx-item" href="${href}"><i class="ti ${ic}"></i><span>${MX(k)}</span></a>`;
    const site = match(P.site), admin = match(P.admin);
    const cars = (await loadCars()).filter(c => !q || ((c.brand?.name || '') + ' ' + c.model).toLowerCase().includes(q))
      .slice(0, q ? 6 : 4);
    const carItem = (c) => `<a class="mx-item" href="${SITE}vehicule-detail.html?id=${c.id}"><i class="ti ti-car"></i>
      <span>${c.brand?.name || ''} ${c.model} <small>${c.year}</small></span>
      ${c.is_new_arrival ? '<em>' + MX('car.newArrival') + '</em>' : ''}</a>`;
    const sec = (title, html) => html ? `<div class="mx-sec"><h4>${title}</h4>${html}</div>` : '';
    const body = sec(MX('hub.site'), site.map(item).join('')) + sec(MX('hub.admin'), admin.map(item).join('')) +
      sec(q ? MX('hub.cars') : MX('hub.arrivals'), cars.map(carItem).join(''));
    pal.querySelector('#mxBody').innerHTML = body || `<p class="mx-empty">${MX('hub.none')}</p>`;

    const cur = Auth.getUser();
    const roles = [['visitor', null], ['client', 'user'], ['secretaire', 'secretaire'], ['admin', 'admin']];
    pal.querySelector('#mxRoles').innerHTML = roles.map(([key, r]) =>
      `<button type="button" data-role="${key}" class="${(Auth.isLoggedIn() ? cur?.role : null) === r ? 'on' : ''}">${MX('role.' + key)}</button>`).join('');
    pal.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.role === 'visitor') Auth.clear(); else MockAPI.startSession(b.dataset.role);
      window.location.reload();
    }));
  }

  function openHub() { pal.hidden = false; document.body.classList.add('mx-lock'); renderHub(); setTimeout(() => pal.querySelector('#mxQ').focus(), 30); }
  function closeHub() { pal.hidden = true; document.body.classList.remove('mx-lock'); }

  document.addEventListener('keydown', (e) => {
    if (!pal) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openHub() : closeHub(); }
    else if (e.key === 'Escape' && !pal.hidden) closeHub();
  });

  // ---------------------------------------------------------------
  // Effets : progression de scroll, projecteur sur les cartes, tilt du hero, compteurs
  // ---------------------------------------------------------------
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function progress() {
    const bar = document.createElement('div');
    bar.id = 'mxProgress'; document.body.appendChild(bar);
    const on = () => {
      const h = document.documentElement;
      bar.style.setProperty('--p', Math.min(1, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)));
    };
    window.addEventListener('scroll', on, { passive: true }); on();
  }

  const SPOT = '.aw-card, .aw-feature, .aw-testi, .aw-price-card, .stat-card, .card';
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest && e.target.closest(SPOT);
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  function tilt() {
    const card = document.getElementById('heroShowcard');
    if (!card || reduce) return;
    const box = card.parentElement;
    box.addEventListener('pointermove', (e) => {
      const r = box.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
    });
    box.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }

  function counters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = Number(el.dataset.count), suffix = el.textContent.replace(/[\d\s.,]/g, '');
      if (!target || reduce) return;
      const io = new IntersectionObserver((en) => {
        if (!en[0].isIntersecting) return; io.disconnect();
        const t0 = performance.now();
        const step = (t) => {
          const k = Math.min(1, (t - t0) / 1300);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      io.observe(el);
    });
  }

  // Photo introuvable (images/cars/car-<id>-<n>.jpg) → illustration SVG générée
  window.addEventListener('error', (e) => {
    const el = e.target;
    if (!el || el.tagName !== 'IMG' || el.dataset.fb || !window.MockAPI) return;
    const fb = MockAPI.fallbackFor(el.getAttribute('src'));
    if (fb) { el.dataset.fb = '1'; el.src = fb; }
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    fillStatic(); buildHub(); progress(); tilt(); counters();
  });
})();
