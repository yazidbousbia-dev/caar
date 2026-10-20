// =====================================================================
// AutoWeex / Auto Marché — Backend statique simulé (MockAPI)
// ---------------------------------------------------------------------
// Remplace complètement l'API Laravel : toutes les requêtes passées par
// api() / apiForm() (voir utils.js) sont traitées ici, dans le navigateur.
// Les données sont persistées dans localStorage (clé aw_mock_db_v1).
//
// Comptes de démonstration :
//   admin        → admin@automarche.com      / admin123
//   secrétaire   → secretaire@automarche.com / secret123
//   client       → client@automarche.com     / client123
//
// MockAPI.reset() remet les données de démo à zéro (console du navigateur).
// =====================================================================
(function () {
  const DB_KEY = 'aw_mock_db_v2';
  const LATENCY = 150; // ms, pour simuler un vrai réseau

  // ------------------------------------------------------------------
  // Images : silhouettes SVG générées (aucune dépendance externe)
  // ------------------------------------------------------------------
  function carSvg(color, bg, label) {
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 400'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='" + bg[0] + "'/><stop offset='1' stop-color='" + bg[1] + "'/>" +
      "</linearGradient></defs>" +
      "<rect width='640' height='400' fill='url(#g)'/>" +
      "<ellipse cx='340' cy='312' rx='240' ry='16' fill='rgba(0,0,0,.28)'/>" +
      "<path d='M100 275 L125 218 Q137 192 170 186 L250 172 Q285 122 332 120 L425 122 " +
      "Q465 128 490 172 L545 186 Q580 196 586 232 L590 275 Z' fill='" + color + "'/>" +
      "<path d='M262 174 Q292 140 332 138 L420 140 Q450 144 468 174 Z' fill='rgba(210,235,255,.88)'/>" +
      "<line x1='358' y1='142' x2='355' y2='174' stroke='" + color + "' stroke-width='5'/>" +
      "<circle cx='198' cy='278' r='43' fill='#111'/><circle cx='198' cy='278' r='20' fill='#c8c8c8'/>" +
      "<circle cx='498' cy='278' r='43' fill='#111'/><circle cx='498' cy='278' r='20' fill='#c8c8c8'/>" +
      "<rect x='566' y='218' width='22' height='14' rx='4' fill='#ffe9a8'/>" +
      "<text x='320' y='374' text-anchor='middle' font-family='Arial,sans-serif' font-size='26' " +
      "font-weight='700' fill='rgba(255,255,255,.92)'>" + label + "</text></svg>";
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // ------------------------------------------------------------------
  // Données de démonstration
  // ------------------------------------------------------------------
  function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }
  function daysAhead(n) { return new Date(Date.now() + n * 86400000).toISOString(); }

  function seed() {
    const brandNames = ['Toyota', 'Hyundai', 'Renault', 'Peugeot', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Kia',
      'Dacia', 'Skoda', 'Ford', 'Audi', 'Nissan', 'Suzuki'];
    const brands = brandNames.map((name, i) => ({ id: i + 1, name, logo: null }));
    const B = (n) => brandNames.indexOf(n) + 1;

    const users = [
      { id: 1, name: 'Admin AutoWeex', email: 'admin@automarche.com', password: 'admin123', phone: '0555 00 00 01', wilaya: 'Jijel', role: 'admin', is_verified: true, created_at: daysAgo(200) },
      { id: 2, name: 'Samira Secrétaire', email: 'secretaire@automarche.com', password: 'secret123', phone: '0555 00 00 02', wilaya: 'Jijel', role: 'secretaire', is_verified: true, created_at: daysAgo(150) },
      { id: 3, name: 'Yazid Bousbia', email: 'client@automarche.com', password: 'client123', phone: '0661 12 34 56', wilaya: 'Jijel', role: 'user', is_verified: true, created_at: daysAgo(90) },
      { id: 4, name: 'Nadia Boudiaf', email: 'nadia@example.com', password: 'client123', phone: '0770 22 33 44', wilaya: 'Alger', role: 'user', is_verified: true, created_at: daysAgo(60) },
      { id: 5, name: 'Mohamed Haddad', email: 'mohamed@example.com', password: 'client123', phone: '0550 98 76 54', wilaya: 'Sétif', role: 'user', is_verified: true, created_at: daysAgo(45) },
      { id: 6, name: 'Lina Merabet', email: 'lina@example.com', password: 'client123', phone: '0699 11 22 33', wilaya: 'Jijel', role: 'user', is_verified: false, created_at: daysAgo(20) },
      { id: 7, name: 'Yacine Larbi', email: 'yacine@example.com', password: 'client123', phone: '0771 44 55 66', wilaya: 'Béjaïa', role: 'user', is_verified: true, created_at: daysAgo(10) },
      { id: 8, name: 'Amel Khelifi', email: 'amel@example.com', password: 'client123', phone: '0556 77 88 99', wilaya: 'Constantine', role: 'user', is_verified: true, created_at: daysAgo(5) },
    ];

    const EQ0 = ['Climatisation', 'Vitres électriques', 'Bluetooth', 'Radar de recul', 'Verrouillage centralisé'];
    const EQ1 = ['Caméra de recul', 'Écran tactile 10"', 'Apple CarPlay / Android Auto', 'Régulateur de vitesse', 'Jantes alliage', 'Phares LED'];
    const EQ2 = ['Sièges chauffants', 'Toit panoramique', 'Intérieur cuir', 'Régulateur adaptatif', 'Aide au maintien de voie', 'Hayon électrique', 'Démarrage sans clé', 'GPS intégré'];
    const equip = (tier, id) => {
      const rot = (a) => a.slice(id % a.length).concat(a.slice(0, id % a.length));
      return EQ0.concat(tier >= 1 ? rot(EQ1).slice(0, 4 + (id % 3)) : [], tier >= 2 ? rot(EQ2).slice(0, 4 + (id % 3)) : []);
    };

    // [marque, modèle, année, prix, km, carburant, boîte, état, couleur, wilaya, ville, portes,
    //  moteur, ch, transmission, conso, places, quantité, statut, vedette, vues, arrivée (jours), origine, niveau, description]
    const rows = [
      ['Toyota', 'Corolla Hybrid', 2023, 4650000, 12000, 'hybride', 'automatique', 'occasion', 'Blanc', 'Jijel', 'Taher', 4, '1.8L Hybride', 122, 'Traction', '4.3 L/100 km', 5, 1, 'approved', 1, 184, 4, 'Reprise client', 2, 'Corolla hybride première main, entretien complet en concession. Consommation très réduite, idéale pour la route comme pour la ville.'],
      ['Hyundai', 'Tucson', 2022, 5200000, 28000, 'diesel', 'automatique', 'occasion', 'Gris', 'Jijel', 'Taher', 5, '1.6L CRDi', 136, 'Traction', '5.6 L/100 km', 5, 1, 'approved', 0, 142, 9, 'Importation Europe', 2, 'SUV Tucson full options : toit panoramique, caméra de recul, sièges chauffants.'],
      ['Renault', 'Clio 5', 2025, 2850000, 0, 'essence', 'manuelle', 'neuve', 'Rouge', 'Jijel', 'Taher', 5, '1.0L TCe', 90, 'Traction', '5.2 L/100 km', 5, 3, 'approved', 1, 97, 2, 'Concessionnaire officiel', 1, 'Clio 5 neuve, 3 exemplaires disponibles. Garantie constructeur 3 ans.'],
      ['Peugeot', '208 GT Line', 2023, 3300000, 15000, 'essence', 'manuelle', 'occasion', 'Bleu', 'Constantine', 'Constantine', 5, '1.2L PureTech', 100, 'Traction', '5.4 L/100 km', 5, 1, 'approved', 0, 76, 14, 'Achat local', 1, '208 GT Line, finition sportive, i-Cockpit avec écran tactile 10 pouces.'],
      ['Volkswagen', 'Golf 8', 2022, 4100000, 34000, 'essence', 'automatique', 'occasion', 'Noir', 'Jijel', 'Taher', 5, '1.5L TSI', 130, 'Traction', '5.8 L/100 km', 5, 1, 'approved', 0, 121, 6, 'Importation Allemagne', 2, 'Golf 8 très bien entretenue, carnet à jour, pneus neufs.'],
      ['BMW', 'Série 3 320d', 2021, 7800000, 52000, 'diesel', 'automatique', 'occasion', 'Noir', 'Alger', 'Hydra', 4, '2.0L Diesel', 190, 'Propulsion', '5.0 L/100 km', 5, 1, 'approved', 1, 203, 11, 'Importation Allemagne', 2, 'Pack M, cuir, GPS, jantes 18 pouces. Historique d\'entretien complet.'],
      ['Mercedes-Benz', 'Classe C 220d', 2020, 8900000, 61000, 'diesel', 'automatique', 'occasion', 'Argent', 'Alger', 'Bab Ezzouar', 4, '2.0L Diesel', 194, 'Propulsion', '5.2 L/100 km', 5, 1, 'approved', 0, 88, 20, 'Importation Europe', 2, 'Intérieur cuir beige, toit ouvrant, aide au stationnement automatique.'],
      ['Kia', 'Picanto', 2023, 2150000, 9000, 'essence', 'automatique', 'occasion', 'Jaune', 'Jijel', 'Taher', 5, '1.0L MPI', 67, 'Traction', '4.9 L/100 km', 4, 1, 'approved', 0, 59, 3, 'Reprise client', 0, 'Citadine économique et facile à garer, parfaite pour la ville.'],
      ['Toyota', 'Hilux Double Cabine', 2022, 6300000, 40000, 'diesel', 'manuelle', 'occasion', 'Blanc', 'Jijel', 'Taher', 4, '2.4L D-4D', 150, '4x4', '7.8 L/100 km', 5, 1, 'pending', 0, 12, 1, 'Achat local', 1, 'Pick-up 4x4 en parfait état, boîte manuelle, benne protégée.'],
      ['Hyundai', 'i10', 2021, 1750000, 47000, 'essence', 'manuelle', 'occasion', 'Blanc', 'Sétif', 'Sétif', 5, '1.0L MPI', 67, 'Traction', '5.0 L/100 km', 4, 1, 'pending', 0, 8, 1, 'Reprise client', 0, 'Petite citadine fiable, climatisation, vitres électriques.'],
      ['Renault', 'Duster', 2019, 2400000, 92000, 'diesel', 'manuelle', 'occasion', 'Gris', 'Jijel', 'Taher', 5, '1.5L dCi', 110, '4x4', '5.3 L/100 km', 5, 1, 'sold', 0, 66, 40, 'Achat local', 0, 'Duster dCi, vendu.'],
      ['Peugeot', '3008 GT Line', 2018, 3150000, 110000, 'diesel', 'automatique', 'occasion', 'Noir', 'Jijel', 'Taher', 5, '2.0L BlueHDi', 150, 'Traction', '5.1 L/100 km', 5, 1, 'expired', 0, 31, 60, 'Importation Europe', 1, 'Annonce expirée à renouveler.'],
      ['Volkswagen', 'Tiguan', 2020, 5600000, 70000, 'diesel', 'automatique', 'occasion', 'Bleu', 'Jijel', 'Taher', 5, '2.0L TDI', 150, '4x4', '6.0 L/100 km', 5, 1, 'rejected', 0, 4, 25, 'Importation Allemagne', 2, 'Annonce refusée (photos insuffisantes).'],
      ['Dacia', 'Sandero Stepway', 2024, 2650000, 6000, 'essence', 'manuelle', 'occasion', 'Orange', 'Jijel', 'Taher', 5, '1.0L TCe', 90, 'Traction', '5.5 L/100 km', 5, 1, 'approved', 0, 73, 5, 'Concessionnaire officiel', 1, 'Sandero Stepway quasi neuve, garde au sol surélevée, barres de toit.'],
      ['Skoda', 'Octavia', 2022, 3900000, 38000, 'diesel', 'automatique', 'occasion', 'Gris', 'Constantine', 'Constantine', 5, '2.0L TDI', 150, 'Traction', '4.9 L/100 km', 5, 1, 'approved', 0, 64, 8, 'Importation Allemagne', 2, 'Octavia spacieuse, coffre de 600 L, très confortable pour les longs trajets.'],
      ['Ford', 'Ranger Wildtrak', 2023, 7100000, 22000, 'diesel', 'automatique', 'occasion', 'Orange', 'Jijel', 'Taher', 4, '2.0L Bi-Turbo', 210, '4x4', '8.0 L/100 km', 5, 1, 'approved', 1, 112, 7, 'Importation Europe', 2, 'Ranger Wildtrak full options, couvre-benne, crochet d\'attelage.'],
      ['Audi', 'A4 Avant', 2021, 6900000, 47000, 'diesel', 'automatique', 'occasion', 'Argent', 'Alger', 'Hydra', 5, '2.0L TDI', 163, 'Traction', '5.1 L/100 km', 5, 1, 'approved', 0, 91, 13, 'Importation Allemagne', 2, 'A4 Avant break, virtual cockpit, éclairage d\'ambiance, très bon état.'],
      ['Nissan', 'Qashqai', 2022, 4300000, 31000, 'essence', 'automatique', 'occasion', 'Blanc', 'Jijel', 'Taher', 5, '1.3L DIG-T', 140, 'Traction', '6.0 L/100 km', 5, 1, 'approved', 0, 69, 10, 'Achat local', 1, 'Qashqai mild-hybrid, caméras 360°, ProPILOT.'],
      ['Suzuki', 'Swift', 2024, 2450000, 4000, 'hybride', 'manuelle', 'occasion', 'Rouge', 'Jijel', 'Taher', 5, '1.2L Mild Hybrid', 83, 'Traction', '4.6 L/100 km', 5, 1, 'approved', 0, 48, 2, 'Concessionnaire officiel', 1, 'Swift mild-hybrid presque neuve, très économique.'],
      ['Kia', 'Sportage', 2023, 5400000, 18000, 'hybride', 'automatique', 'occasion', 'Vert', 'Sétif', 'Sétif', 5, '1.6L T-GDi HEV', 230, '4x4', '5.9 L/100 km', 5, 1, 'approved', 1, 128, 12, 'Importation Europe', 2, 'Sportage hybride, double écran incurvé, hayon électrique.'],
      ['Hyundai', 'Elantra', 2021, 3050000, 56000, 'essence', 'automatique', 'occasion', 'Argent', 'Jijel', 'Taher', 4, '1.6L MPI', 128, 'Traction', '6.2 L/100 km', 5, 1, 'approved', 0, 52, 18, 'Reprise client', 1, 'Elantra confortable, sièges chauffants, caméra de recul.'],
      ['Toyota', 'Yaris Cross', 2024, 4200000, 0, 'hybride', 'automatique', 'neuve', 'Bleu', 'Jijel', 'Taher', 5, '1.5L Hybride', 116, 'Traction', '4.4 L/100 km', 5, 2, 'approved', 0, 85, 1, 'Concessionnaire officiel', 2, 'Yaris Cross neuve, 2 exemplaires, garantie constructeur 5 ans.'],
      ['Mercedes-Benz', 'GLC 300', 2022, 12400000, 29000, 'essence', 'automatique', 'occasion', 'Noir', 'Alger', 'Hydra', 5, '2.0L Turbo', 258, '4x4', '8.3 L/100 km', 5, 1, 'approved', 1, 167, 15, 'Importation Europe', 2, 'GLC 300 pack AMG, suspension pneumatique, toit panoramique.'],
      ['Peugeot', '2008 Allure', 2023, 3600000, 17000, 'essence', 'automatique', 'occasion', 'Vert', 'Constantine', 'Constantine', 5, '1.2L PureTech', 130, 'Traction', '5.7 L/100 km', 5, 1, 'approved', 0, 57, 6, 'Achat local', 1, '2008 Allure, i-Cockpit 3D, feux full LED, très bon état.'],
    ];

    const CAR_COLORS = { Blanc: '#ecf0f1', Noir: '#1c1c1c', Gris: '#7f8c8d', Rouge: '#c0392b', Bleu: '#2471a3',
      Jaune: '#f1c40f', Vert: '#1e8449', Orange: '#d35400', Argent: '#bdc3c7', Marron: '#6e4b3a' };
    const cars = rows.map((r, i) => {
      const id = i + 1;
      const [brand, model, year, price, mileage, fuel, trans, cond, color, wilaya, city, doors,
        engine, hp, drive, cons, seats, qty, status, feat, views, arrive, origin, tier, desc] = r;
      return {
        id, brand_id: B(brand), model, year, price, mileage, quantity: qty,
        sold_count: status === 'sold' ? qty : (id === 3 ? 1 : 0),
        fuel_type: fuel, transmission: trans, condition: cond, color, wilaya, city, doors,
        description: desc, status, is_featured: !!feat, views_count: views,
        created_at: daysAgo(arrive), expires_at: status === 'expired' ? daysAgo(5) : daysAhead(30 - Math.min(arrive, 25)),
        // --- Informations d'arrivée à l'entreprise + fiche technique ---
        arrival_date: daysAgo(arrive).slice(0, 10),
        origin, engine, power_hp: hp, drivetrain: drive, consumption: cons, seats,
        warranty_months: cond === 'neuve' ? 36 : (tier >= 2 ? 12 : 6),
        owners: cond === 'neuve' ? 0 : 1 + (id % 3 === 0 ? 1 : 0),
        vin: 'VF' + String(1000000000000 + id * 7919317).slice(0, 15).replace(/0/g, 'A'),
        reference: 'AW-' + new Date().getFullYear() + '-' + String(id).padStart(4, '0'),
        features: equip(tier, id),
        images: [
          { id: id * 2 - 1, image_url: 'images/cars/car-' + id + '-1.jpg', color: CAR_COLORS[color] || '#888' },
          { id: id * 2, image_url: 'images/cars/car-' + id + '-2.jpg', color: CAR_COLORS[color] || '#888' },
        ],
      };
    });

    const requests = [
      { id: 1, user_id: 3, car_id: 1, phone: '0661 12 34 56', message: 'Bonjour, est-il possible de faire un essai samedi ?', status: 'pending', created_at: daysAgo(1) },
      { id: 2, user_id: 4, car_id: 6, phone: '0770 22 33 44', message: 'Je suis intéressée, quel est le dernier prix ?', status: 'contacted', created_at: daysAgo(3) },
      { id: 3, user_id: 5, car_id: 3, phone: '0550 98 76 54', message: 'Je souhaite réserver une Clio 5 rouge.', status: 'confirmed', created_at: daysAgo(6) },
      { id: 4, user_id: 7, car_id: 2, phone: '0771 44 55 66', message: 'Disponible pour un paiement échelonné ?', status: 'pending', created_at: daysAgo(2) },
      { id: 5, user_id: 3, car_id: 8, phone: '0661 12 34 56', message: '', status: 'cancelled', created_at: daysAgo(12) },
      { id: 6, user_id: 8, car_id: 20, phone: '0556 77 88 99', message: 'Le Sportage hybride est-il toujours disponible ?', status: 'pending', created_at: daysAgo(1) },
    ];
    const reports = [
      { id: 1, user_id: 4, car_id: 4, reason: 'Le kilométrage semble incorrect.', status: 'pending', created_at: daysAgo(2) },
      { id: 2, user_id: 5, car_id: 7, reason: 'Photos qui ne correspondent pas au véhicule.', status: 'pending', created_at: daysAgo(5) },
      { id: 3, user_id: 7, car_id: 12, reason: 'Annonce en double.', status: 'resolved', created_at: daysAgo(15) },
    ];

    return {
      brands, users, cars, requests, reports,
      favorites: { 3: [1, 6, 20], 4: [3] },
      messages: [],
      seq: { brand: brands.length + 1, user: users.length + 1, car: cars.length + 1, image: cars.length * 2 + 1, request: 7, report: 4 },
    };
  }

  // ------------------------------------------------------------------
  // Persistance
  // ------------------------------------------------------------------
  let db = null;
  function load() {
    if (db) return db;
    try { db = JSON.parse(localStorage.getItem(DB_KEY) || 'null'); } catch (_) { db = null; }
    if (!db) { db = seed(); save(); }
    return db;
  }
  function save() {
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
    catch (_) { /* quota dépassé (grosses photos) : on garde l'état en mémoire */ }
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function fail(message) { throw new Error(message); }

  function currentUser() {
    const token = localStorage.getItem('aw_token') || '';
    const m = /^demo-token-(\d+)$/.exec(token);
    if (!m) return null;
    return load().users.find(u => u.id === Number(m[1])) || null;
  }
  function requireUser() {
    const u = currentUser();
    if (!u) { const e = new Error('Non authentifié'); e.status = 401; throw e; }
    return u;
  }
  // Présentation client : toutes les pages sont accessibles quel que soit le rôle.
  const OPEN_ACCESS = true;
  function requireStaff() {
    const u = requireUser();
    if (!OPEN_ACCESS && u.role !== 'admin' && u.role !== 'secretaire') fail('Accès refusé.');
    return u;
  }
  function requireAdmin() {
    const u = requireUser();
    if (!OPEN_ACCESS && u.role !== 'admin') fail('Accès réservé à l\'administrateur.');
    return u;
  }

  function publicUser(u) {
    if (!u) return null;
    const { password, ...rest } = u;
    return rest;
  }
  function brandOf(id) { return load().brands.find(b => b.id === Number(id)) || null; }

  // Les photos sont cherchées dans images/cars/car-<id>-<n>.jpg ; si le fichier n'existe pas,
  // modern.js remplace automatiquement l'image par l'illustration SVG (fallbackFor).
  const BASE = () => (window.location.pathname.includes('/pages/') ? '../' : '');
  function fallbackFor(src) {
    let m = /car-(\d+)-(\d)\.jpg/.exec(src || '');
    if (!m) {
      const c = loadPhotos();
      for (const id in c) {
        const i = (c[id].list || []).findIndex(p => p.url === src);
        if (i >= 0) { m = [null, id, String(Math.min(i + 1, 2))]; break; }
      }
    }
    if (!m) return null;
    const car = load().cars.find(c => c.id === Number(m[1]));
    if (!car) return null;
    const b = brandOf(car.brand_id);
    const color = (car.images[0] && car.images[0].color) || '#888';
    const bg = m[2] === '1' ? ['#1f2a44', '#3b4a6b'] : ['#232526', '#414345'];
    return carSvg(color, bg, (b ? b.name + ' ' : '') + car.model);
  }


  // ------------------------------------------------------------------
  // Photos réelles depuis Internet (Wikimedia Commons, licences libres CC).
  // Recherche via l'API officielle (CORS ouvert), résultats gardés dans localStorage.
  // Si Internet est indisponible ou rien de pertinent n'est trouvé → illustration SVG.
  // ------------------------------------------------------------------
  const PHOTO_KEY = 'aw_photos_v1';
  const PHOTO_QUERY = [
    [/corolla/i, 'Toyota Corolla E210'], [/tucson/i, 'Hyundai Tucson NX4'], [/clio/i, 'Renault Clio V'],
    [/208/i, 'Peugeot 208 II'], [/golf/i, 'Volkswagen Golf VIII'], [/s[ée]rie 3|3 series/i, 'BMW 3 Series G20'],
    [/classe c|c-class/i, 'Mercedes-Benz C-Class W205'], [/picanto/i, 'Kia Picanto'], [/sandero/i, 'Dacia Sandero Stepway'],
    [/octavia/i, 'Skoda Octavia IV'], [/ranger/i, 'Ford Ranger Wildtrak'], [/a4/i, 'Audi A4 Avant B9'],
    [/qashqai/i, 'Nissan Qashqai J11'], [/swift/i, 'Suzuki Swift'], [/sportage/i, 'Kia Sportage NQ5'],
    [/elantra/i, 'Hyundai Elantra CN7'], [/yaris cross/i, 'Toyota Yaris Cross'], [/glc/i, 'Mercedes-Benz GLC X253'],
    [/2008/i, 'Peugeot 2008 II'],
  ];
  const BAD_WORDS = /interior|innenraum|int[ée]rieur|engine|motor|logo|badge|emblem|dashboard|cockpit|wheel|seat|trunk|boot|detail|cutaway|crash|police|taxi|rally|race|racing|museum|sketch|drawing|diagram|brochure|cabin|console|screen|steering|gear|headlight|taillight|tail light|camper|conversion|tuning|wrap|damaged|burn|fire|crashed|ambulance|army|military/i;
  let photoCache = null, photoJob = null;
  function loadPhotos() {
    if (photoCache) return photoCache;
    try { photoCache = JSON.parse(localStorage.getItem(PHOTO_KEY) || '{}'); } catch (_) { photoCache = {}; }
    return photoCache;
  }
  function savePhotos() { try { localStorage.setItem(PHOTO_KEY, JSON.stringify(photoCache)); } catch (_) {} }

  function photoQueryFor(brand, model) {
    const full = (brand + ' ' + model);
    const hit = PHOTO_QUERY.find(([re]) => re.test(full));
    return hit ? hit[1] : full;
  }

  async function fetchCommons(brand, model) {
    const q = photoQueryFor(brand, model) + ' filetype:bitmap';
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=30'
      + '&gsrsearch=' + encodeURIComponent(q)
      + '&prop=imageinfo&iiprop=url%7Cmime%7Csize%7Cextmetadata&iiurlwidth=1100&iiextmetadatafilter=LicenseShortName%7CArtist';
    const res = await fetch(url);
    if (!res.ok) throw new Error('commons ' + res.status);
    const json = await res.json();
    const pages = Object.values((json.query && json.query.pages) || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
    const brandKey = brand.toLowerCase().split(/[\s-]/)[0];
    const modelKey = (photoQueryFor(brand, model).toLowerCase().split(' ')[1] || '').replace(/[^a-z0-9]/g, '');
    const scored = pages.map(p => {
      const ii = (p.imageinfo || [])[0]; if (!ii) return null;
      const t = (p.title || '').toLowerCase();
      if (ii.mime !== 'image/jpeg' || BAD_WORDS.test(t) || (ii.width || 0) < 900 || (ii.width || 0) < (ii.height || 0) * 1.15) return null;
      const score = (t.includes(brandKey) ? 2 : 0) + (modelKey && t.replace(/[^a-z0-9]/g, '').includes(modelKey) ? 2 : 0);
      if (score < 4) return null;
      const md = ii.extmetadata || {};
      return { score, rank: p.index || 0, url: ii.thumburl || ii.url,
        credit: ((md.Artist && md.Artist.value) || '').replace(/<[^>]*>/g, '').trim().slice(0, 60),
        license: (md.LicenseShortName && md.LicenseShortName.value) || '' };
    }).filter(Boolean).sort((a, b) => (b.score - a.score) || (a.rank - b.rank));
    return scored.slice(0, 2).map(({ url, credit, license }) => ({ url, credit, license }));
  }

  // Charge (en parallèle) les photos manquantes. N'attend jamais plus de 3,5 s : la page s'affiche
  // avec les illustrations puis les photos apparaissent dès la visite suivante / au rechargement.
  function ensurePhotos() {
    const c = loadPhotos(), DAY = 86400000;
    const todo = load().cars.filter(car => {
      const e = c[car.id];
      return !e || (!e.list.length && Date.now() - e.t > DAY);
    });
    if (!todo.length) return Promise.resolve();
    if (!photoJob) {
      photoJob = Promise.all(todo.map(async car => {
        try {
          const list = await fetchCommons((brandOf(car.brand_id) || {}).name || '', car.model);
          c[car.id] = { t: Date.now(), list };
        } catch (_) { /* hors ligne : on réessaiera au prochain chargement */ }
      })).then(() => { savePhotos(); photoJob = null; });
    }
    return Promise.race([photoJob, new Promise(r => setTimeout(r, 3500))]);
  }
  function photoFor(carId, n) {
    const e = loadPhotos()[carId];
    return e && e.list && (e.list[n - 1] || e.list[0]) || null;
  }

  function carOut(car) {
    const out = clone(car);
    out.images = (out.images || []).map((im, i) => {
      if (!(im.image_url && im.image_url.startsWith('images/'))) return im;
      const ph = photoFor(car.id, i + 1);
      return ph ? Object.assign(im, { image_url: ph.url, credit: ph.credit, license: ph.license, remote: true })
                : Object.assign(im, { image_url: BASE() + im.image_url });
    });
    const arrived = car.arrival_date ? (Date.now() - new Date(car.arrival_date).getTime()) / 86400000 : null;
    out.days_since_arrival = arrived == null ? null : Math.max(0, Math.floor(arrived));
    out.is_new_arrival = arrived != null && arrived <= 14;
    out.brand = clone(brandOf(car.brand_id));
    out.primary_image = out.images && out.images.length ? out.images[0] : null;
    return out;
  }
  function requestOut(r) {
    const d = load();
    const out = clone(r);
    out.user = publicUser(d.users.find(u => u.id === r.user_id));
    const car = d.cars.find(c => c.id === r.car_id);
    out.car = car ? carOut(car) : null;
    return out;
  }
  function reportOut(r) {
    const d = load();
    const out = clone(r);
    out.user = publicUser(d.users.find(u => u.id === r.user_id));
    const car = d.cars.find(c => c.id === r.car_id);
    out.car = car ? carOut(car) : null;
    return out;
  }

  // Marque comme expirées les annonces approuvées dont la date est passée
  function refreshExpiry() {
    const d = load(); let changed = false;
    d.cars.forEach(c => {
      if (c.status === 'approved' && c.expires_at && new Date(c.expires_at) < new Date()) {
        c.status = 'expired'; changed = true;
      }
    });
    if (changed) save();
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error('Lecture de l\'image impossible.'));
      r.readAsDataURL(file);
    });
  }

  const CAR_FIELDS = ['brand_id', 'model', 'year', 'price', 'mileage', 'quantity', 'fuel_type',
    'transmission', 'condition', 'color', 'wilaya', 'city', 'doors', 'description',
    'arrival_date', 'origin', 'engine', 'power_hp', 'drivetrain', 'consumption', 'seats',
    'warranty_months', 'owners', 'vin', 'features'];
  const NUM_FIELDS = ['brand_id', 'year', 'price', 'mileage', 'quantity', 'doors', 'power_hp', 'seats',
    'warranty_months', 'owners'];

  function applyCarFields(car, src) {
    CAR_FIELDS.forEach(k => {
      if (src[k] === undefined) return;
      let v = src[k];
      if (k === 'features') v = Array.isArray(v) ? v : String(v || '').split(/[,;\n]/).map(x => x.trim()).filter(Boolean);
      else if (NUM_FIELDS.includes(k)) v = (v === null || v === '') ? null : Number(v);
      car[k] = v;
    });
  }

  function paginate(list, qs) {
    const per = Number(qs.get('per_page')) || list.length || 1;
    const page = Number(qs.get('page')) || 1;
    return { data: list.slice((page - 1) * per, page * per), total: list.length, current_page: page, per_page: per };
  }

  // ------------------------------------------------------------------
  // Routeur
  // ------------------------------------------------------------------
  async function route(method, endpoint, data) {
    const d = load();
    refreshExpiry();
    const [path, query] = endpoint.split('?');
    const qs = new URLSearchParams(query || '');
    let m;

    // ---------- Auth ----------
    if (method === 'POST' && path === '/login') {
      const email = String(data?.email || '').toLowerCase();
      const u = d.users.find(x => x.email.toLowerCase() === email && x.password === data?.password);
      if (!u) fail('Email ou mot de passe incorrect');
      if (!u.is_verified) fail('Ce compte est suspendu. Contactez l\'administrateur.');
      return { token: 'demo-token-' + u.id, user: publicUser(u) };
    }
    if (method === 'POST' && path === '/register') {
      if (!data?.name || !data?.email || !data?.password) fail('Champs obligatoires manquants.');
      if (d.users.some(x => x.email.toLowerCase() === String(data.email).toLowerCase())) fail('Cet email est déjà utilisé.');
      if (data.password !== data.password_confirmation) fail('Les mots de passe ne correspondent pas.');
      const u = { id: d.seq.user++, name: data.name, email: data.email, password: data.password,
        phone: data.phone || null, wilaya: data.wilaya || null, role: 'user', is_verified: true,
        created_at: new Date().toISOString() };
      d.users.push(u); save();
      return { token: 'demo-token-' + u.id, user: publicUser(u) };
    }
    if (method === 'POST' && path === '/logout') return { message: 'Déconnecté' };

    // ---------- Profil ----------
    if (method === 'PUT' && path === '/profile') {
      const u = requireUser();
      if (data?.name !== undefined) u.name = data.name;
      if (data?.phone !== undefined) u.phone = data.phone;
      if (data?.wilaya !== undefined) u.wilaya = data.wilaya;
      save();
      return { user: publicUser(u) };
    }
    if (method === 'PUT' && path === '/password') {
      const u = requireUser();
      if (u.password !== data?.current_password) fail('Mot de passe actuel incorrect.');
      if (!data?.password || data.password.length < 6) fail('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      if (data.password !== data.password_confirmation) fail('Les mots de passe ne correspondent pas.');
      u.password = data.password; save();
      return { message: 'Mot de passe mis à jour' };
    }

    // ---------- Public ----------
    if (method === 'GET' && path === '/public/brands') {
      return d.brands.map(b => Object.assign(clone(b), { cars_count: d.cars.filter(c => c.brand_id === b.id).length }));
    }
    if (method === 'GET' && path === '/public/cars') {
      const list = d.cars.filter(c => c.status === 'approved')
        .sort((a, b) => (b.is_featured - a.is_featured) || (new Date(b.arrival_date || b.created_at) - new Date(a.arrival_date || a.created_at)));
      return list.map(carOut);
    }
    if (method === 'GET' && (m = path.match(/^\/public\/cars\/(\d+)$/))) {
      const car = d.cars.find(c => c.id === Number(m[1]));
      if (!car) fail('Véhicule introuvable.');
      // Les pages d'administration lisent aussi cette route : on ne compte que les visiteurs "client"
      const u = currentUser();
      if (!u || u.role === 'user') { car.views_count = (car.views_count || 0) + 1; save(); }
      return carOut(car);
    }

    // ---------- Favoris ----------
    if (method === 'GET' && path === '/favorites') {
      const u = requireUser();
      const ids = d.favorites[u.id] || [];
      return ids.map(id => d.cars.find(c => c.id === id)).filter(Boolean).map(c => ({ car: carOut(c) }));
    }
    if (method === 'POST' && (m = path.match(/^\/favorites\/(\d+)\/toggle$/))) {
      const u = requireUser(); const id = Number(m[1]);
      const list = d.favorites[u.id] || (d.favorites[u.id] = []);
      const i = list.indexOf(id);
      if (i >= 0) list.splice(i, 1); else list.push(id);
      save();
      return { favorited: i < 0 };
    }

    // ---------- Demandes d'achat (client) ----------
    if (method === 'GET' && path === '/my-requests') {
      const u = requireUser();
      return d.requests.filter(r => r.user_id === u.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(requestOut);
    }
    if (method === 'POST' && (m = path.match(/^\/cars\/(\d+)\/request$/))) {
      const u = requireUser(); const id = Number(m[1]);
      if (!d.cars.find(c => c.id === id)) fail('Véhicule introuvable.');
      if (d.requests.some(r => r.user_id === u.id && r.car_id === id && (r.status === 'pending' || r.status === 'contacted')))
        fail('Vous avez déjà une demande en cours pour ce véhicule.');
      const r = { id: d.seq.request++, user_id: u.id, car_id: id, phone: data?.phone || u.phone || null,
        message: data?.message || '', status: 'pending', created_at: new Date().toISOString() };
      d.requests.push(r); save();
      return { message: 'Demande envoyée', request: requestOut(r) };
    }
    if (method === 'POST' && path === '/messages') {
      if (!data?.name || !data?.message) fail('Nom et message obligatoires.');
      d.messages.push(Object.assign({ id: d.messages.length + 1, created_at: new Date().toISOString() }, data));
      save();
      return { message: 'Message envoyé' };
    }

    // ---------- Admin : statistiques ----------
    if (method === 'GET' && path === '/admin/stats') {
      requireStaff();
      const monthAgo = Date.now() - 30 * 86400000;
      const by = (s) => d.cars.filter(c => c.status === s).length;
      return {
        total_cars: d.cars.length,
        cars_this_month: d.cars.filter(c => new Date(c.created_at) > monthAgo).length,
        approved_cars: by('approved'),
        sold_cars: by('sold'),
        featured_cars: d.cars.filter(c => c.is_featured).length,
        expired_cars: by('expired'),
        hidden_cars: by('rejected'),
        total_users: d.users.filter(u => u.role === 'user').length,
        pending_requests: d.requests.filter(r => r.status === 'pending').length,
        total_requests: d.requests.length,
        pending_reports: d.reports.filter(r => r.status === 'pending').length,
        most_viewed_cars: clone(d.cars).sort((a, b) => b.views_count - a.views_count).slice(0, 5)
          .map(c => ({ id: c.id, model: (brandOf(c.brand_id)?.name || '') + ' ' + c.model, views_count: c.views_count })),
        recent_requests: clone(d.requests).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5).map(requestOut),
      };
    }

    // ---------- Admin : voitures ----------
    if (method === 'GET' && path === '/admin/cars') {
      requireStaff();
      let list = d.cars.slice();
      if (qs.get('status')) list = list.filter(c => c.status === qs.get('status'));
      if (qs.get('brand_id')) list = list.filter(c => c.brand_id === Number(qs.get('brand_id')));
      const s = (qs.get('search') || '').trim().toLowerCase();
      if (s) list = list.filter(c => ((brandOf(c.brand_id)?.name || '') + ' ' + c.model).toLowerCase().includes(s));
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const p = paginate(list, qs);
      p.data = p.data.map(carOut);
      return p;
    }
    if (method === 'PUT' && (m = path.match(/^\/admin\/cars\/(\d+)$/))) {
      requireStaff();
      const car = d.cars.find(c => c.id === Number(m[1]));
      if (!car) fail('Véhicule introuvable.');
      applyCarFields(car, data || {}); save();
      return { message: 'Annonce mise à jour', car: carOut(car) };
    }
    if (method === 'DELETE' && (m = path.match(/^\/admin\/cars\/(\d+)$/))) {
      requireStaff();
      const i = d.cars.findIndex(c => c.id === Number(m[1]));
      if (i < 0) fail('Véhicule introuvable.');
      d.cars.splice(i, 1);
      d.requests = d.requests.filter(r => r.car_id !== Number(m[1]));
      d.reports = d.reports.filter(r => r.car_id !== Number(m[1]));
      save();
      return { message: 'Annonce supprimée' };
    }
    if (method === 'PATCH' && (m = path.match(/^\/admin\/cars\/(\d+)\/(approve|reject|sell-unit|renew|feature)$/))) {
      requireStaff();
      const car = d.cars.find(c => c.id === Number(m[1]));
      if (!car) fail('Véhicule introuvable.');
      switch (m[2]) {
        case 'approve': car.status = 'approved'; car.expires_at = daysAhead(30); break;
        case 'reject': car.status = 'rejected'; break;
        case 'feature': car.is_featured = !car.is_featured; break;
        case 'renew':
          car.expires_at = new Date(Math.max(Date.now(), new Date(car.expires_at || 0).getTime()) + 10 * 86400000).toISOString();
          if (car.status === 'expired') car.status = 'approved';
          break;
        case 'sell-unit':
          car.sold_count = (car.sold_count || 0) + 1;
          if (car.sold_count >= (car.quantity || 1)) { car.sold_count = car.quantity || 1; car.status = 'sold'; }
          break;
      }
      save();
      return { message: 'OK', car: carOut(car) };
    }

    // ---------- Admin : images ----------
    if (method === 'POST' && (m = path.match(/^\/admin\/cars\/(\d+)\/images$/))) {
      requireStaff();
      const car = d.cars.find(c => c.id === Number(m[1]));
      if (!car) fail('Véhicule introuvable.');
      const files = data.getAll('images[]');
      for (const f of files) car.images.push({ id: d.seq.image++, image_url: await readFileAsDataURL(f) });
      save();
      return { message: 'Images ajoutées', car: carOut(car) };
    }
    if (method === 'DELETE' && (m = path.match(/^\/admin\/cars\/(\d+)\/images\/(\d+)$/))) {
      requireStaff();
      const car = d.cars.find(c => c.id === Number(m[1]));
      if (!car) fail('Véhicule introuvable.');
      car.images = car.images.filter(im => im.id !== Number(m[2])); save();
      return { message: 'Image supprimée' };
    }
    if (method === 'POST' && path === '/admin/cars') {
      requireStaff();
      const src = {};
      CAR_FIELDS.forEach(k => { if (data.has(k)) src[k] = data.get(k); });
      const car = { id: d.seq.car++, quantity: 1, sold_count: 0, status: 'approved', is_featured: false,
        views_count: 0, created_at: new Date().toISOString(), expires_at: daysAhead(30), images: [],
        arrival_date: new Date().toISOString().slice(0, 10), features: [],
        reference: 'AW-' + new Date().getFullYear() + '-' + String(d.seq.car).padStart(4, '0') };
      applyCarFields(car, src);
      for (const f of data.getAll('images[]')) car.images.push({ id: d.seq.image++, image_url: await readFileAsDataURL(f) });
      d.cars.push(car); save();
      return { message: 'Annonce créée', car: carOut(car) };
    }

    // ---------- Admin : demandes ----------
    if (method === 'GET' && path === '/admin/requests') {
      requireStaff();
      let list = d.requests.slice();
      if (qs.get('status')) list = list.filter(r => r.status === qs.get('status'));
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const p = paginate(list, qs);
      p.data = p.data.map(requestOut);
      return p;
    }
    if (method === 'PATCH' && (m = path.match(/^\/admin\/requests\/(\d+)\/status$/))) {
      requireStaff();
      const r = d.requests.find(x => x.id === Number(m[1]));
      if (!r) fail('Demande introuvable.');
      if (!['pending', 'contacted', 'confirmed', 'cancelled'].includes(data?.status)) fail('Statut invalide.');
      r.status = data.status;
      if (r.status === 'confirmed') { // comme le backend : une demande confirmée = une unité vendue
        const car = d.cars.find(c => c.id === r.car_id);
        if (car && car.status !== 'sold') {
          car.sold_count = (car.sold_count || 0) + 1;
          if (car.sold_count >= (car.quantity || 1)) { car.sold_count = car.quantity || 1; car.status = 'sold'; }
        }
      }
      save();
      return { message: 'Statut mis à jour', request: requestOut(r) };
    }

    // ---------- Admin : utilisateurs ----------
    if (method === 'GET' && path === '/admin/users') {
      requireAdmin();
      let list = d.users.slice();
      if (qs.get('role')) list = list.filter(u => u.role === qs.get('role'));
      const s = (qs.get('search') || '').trim().toLowerCase();
      if (s) list = list.filter(u => (u.name + ' ' + u.email + ' ' + (u.phone || '')).toLowerCase().includes(s));
      return { data: list.map(publicUser), total: list.length };
    }
    if (method === 'PATCH' && (m = path.match(/^\/admin\/users\/(\d+)\/ban$/))) {
      requireAdmin();
      const u = d.users.find(x => x.id === Number(m[1]));
      if (!u) fail('Utilisateur introuvable.');
      if (u.role === 'admin') fail('Impossible de suspendre un administrateur.');
      u.is_verified = !u.is_verified; save();
      return { message: 'OK', user: publicUser(u) };
    }

    // ---------- Admin : signalements ----------
    if (method === 'GET' && path === '/admin/reports') {
      requireStaff();
      let list = d.reports.slice();
      if (qs.get('status')) list = list.filter(r => r.status === qs.get('status'));
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { data: list.map(reportOut), total: list.length };
    }
    if (method === 'PATCH' && (m = path.match(/^\/admin\/reports\/(\d+)\/resolve$/))) {
      requireStaff();
      const r = d.reports.find(x => x.id === Number(m[1]));
      if (!r) fail('Signalement introuvable.');
      r.status = 'resolved'; save();
      return { message: 'Signalement résolu' };
    }

    // ---------- Admin : marques ----------
    if (method === 'POST' && path === '/admin/brands') {
      requireStaff();
      const name = String(data?.name || '').trim();
      if (!name) fail('Le nom est obligatoire.');
      if (d.brands.some(b => b.name.toLowerCase() === name.toLowerCase())) fail('Cette marque existe déjà.');
      const b = { id: d.seq.brand++, name, logo: data.logo || null };
      d.brands.push(b); save();
      return { message: 'Marque créée', brand: b };
    }
    if (method === 'PUT' && (m = path.match(/^\/admin\/brands\/(\d+)$/))) {
      requireStaff();
      const b = d.brands.find(x => x.id === Number(m[1]));
      if (!b) fail('Marque introuvable.');
      const name = String(data?.name || '').trim();
      if (!name) fail('Le nom est obligatoire.');
      b.name = name; b.logo = data.logo || null; save();
      return { message: 'Marque mise à jour', brand: b };
    }
    if (method === 'DELETE' && (m = path.match(/^\/admin\/brands\/(\d+)$/))) {
      requireStaff();
      const id = Number(m[1]);
      if (d.cars.some(c => c.brand_id === id)) fail('Impossible : des annonces utilisent encore cette marque.');
      d.brands = d.brands.filter(b => b.id !== id); save();
      return { message: 'Marque supprimée' };
    }

    fail('Route non disponible en mode statique : ' + method + ' ' + path);
  }

  // ------------------------------------------------------------------
  // API publique
  // ------------------------------------------------------------------
  async function handle(method, endpoint, data) {
    await new Promise(r => setTimeout(r, LATENCY));
    await ensurePhotos();
    return route(String(method).toUpperCase(), endpoint, data);
  }

  const SESSION_USER = { admin: 1, secretaire: 2, client: 3 };
  // Ouvre une session de démonstration synchrone (utilisée par les gardes de pages et le menu de démo).
  function startSession(role) {
    const u = load().users.find(x => x.id === SESSION_USER[role]);
    if (!u) return null;
    Auth.save('demo-token-' + u.id, publicUser(u));
    return u;
  }

  window.MockAPI = {
    handle, startSession, fallbackFor,
    refreshPhotos() { localStorage.removeItem(PHOTO_KEY); photoCache = null; window.location.reload(); },
    reset() {
      localStorage.removeItem(DB_KEY); db = null; load();
      Auth.clear();
      window.location.reload();
    },
  };

  // ------------------------------------------------------------------
  // Encart "comptes de démo" sur la page de connexion
  // ------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('loginBtn');
    if (!btn) return;
    const box = document.createElement('div');
    box.style.cssText = 'margin-top:16px;padding:12px 14px;border-radius:10px;font-size:12.5px;line-height:1.7;' +
      'background:rgba(212,175,55,.10);border:1px dashed rgba(212,175,55,.55);color:inherit';
    box.innerHTML =
      '<strong>Mode démo (sans serveur)</strong><br>' +
      '<a href="#" data-demo="admin@automarche.com|admin123">Admin</a> · ' +
      '<a href="#" data-demo="secretaire@automarche.com|secret123">Secrétaire</a> · ' +
      '<a href="#" data-demo="client@automarche.com|client123">Client</a>' +
      ' — <a href="#" data-reset="1">réinitialiser les données</a>';
    btn.insertAdjacentElement('afterend', box);
    box.addEventListener('click', (e) => {
      const a = e.target.closest('a'); if (!a) return;
      e.preventDefault();
      if (a.dataset.reset) { if (confirm('Réinitialiser toutes les données de démo ?')) MockAPI.reset(); return; }
      const [em, pw] = a.dataset.demo.split('|');
      document.getElementById('email').value = em;
      document.getElementById('password').value = pw;
    });
  });
})();
