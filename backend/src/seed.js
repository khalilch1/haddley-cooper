const db = require('./models/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

console.log('🌱 Seeding database...');

// Admin user
const adminId = uuidv4();
const hashedPassword = bcrypt.hashSync('admin123', 10);
db.prepare(`INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)`)
  .run(adminId, 'admin@haddley-cooper.fr', hashedPassword, 'Admin', 'HC', 'admin');

// Test customer
const customerId = uuidv4();
const customerPwd = bcrypt.hashSync('client123', 10);
db.prepare(`INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)`)
  .run(customerId, 'client@test.fr', customerPwd, 'Jean', 'Dupont', 'customer');

// Categories
const categories = [
  { id: uuidv4(), name: 'Hygiène des sols', slug: 'hygiene-sols', description: 'Produits pour nettoyer et entretenir tous types de sols' },
  { id: uuidv4(), name: 'Hygiène des surfaces', slug: 'hygiene-surfaces', description: 'Détergents et désinfectants pour toutes surfaces' },
  { id: uuidv4(), name: 'Hygiène des mains', slug: 'hygiene-mains', description: 'Savons, gels et produits pour l\'hygiène des mains' },
  { id: uuidv4(), name: 'Hygiène des sanitaires', slug: 'hygiene-sanitaires', description: 'Produits spécialisés pour sanitaires' },
  { id: uuidv4(), name: 'Collecte des déchets', slug: 'collecte-dechets', description: 'Sacs poubelle, poubelles et accessoires' },
  { id: uuidv4(), name: 'Univers Piscine', slug: 'univers-piscine', description: 'Produits d\'entretien pour piscines et bassins' },
];

const catStmt = db.prepare(`INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)`);
categories.forEach(c => catStmt.run(c.id, c.name, c.slug, c.description));

const catRows = db.prepare('SELECT id, slug FROM categories').all();
const catMap = Object.fromEntries(catRows.map(c => [c.slug, c.id]));

// Products
const products = [
  // ── Hygiène des sols ──────────────────────────────────────────
  {
    name: 'Lavodor 2D Détergent Surodorant 5L', slug: 'lavodor-2d-5l',
    description: 'Détergent surodorant rémanent pour sols et surfaces. Formule professionnelle concentrée, parfum frais longue durée. Idéal pour les espaces à forte fréquentation.',
    short_description: 'Détergent surodorant concentré 5L',
    price: 18.90, pro_price: 14.50, compare_price: 24.90,
    stock: 150, sku: 'LAV-2D-5L', brand: 'Lavodor', unit: 'bidon 5L',
    is_featured: 1, is_new: 1, category_slug: 'hygiene-sols',
    images: ['https://images.unsplash.com/photo-1753952953352-db4c2f56dab7?w=600&h=600&fit=crop&q=80'],
    tags: ['sol', 'surodorant', 'concentré'],
  },
  {
    name: 'Nettoyant Sol Parquet Brillant 1L', slug: 'nettoyant-parquet-1l',
    description: 'Nettoyant spécialement formulé pour parquets vernis, stratifiés et sols en bois. Nettoie en profondeur sans laisser de traces, redonne de l\'éclat et protège la surface.',
    short_description: 'Nettoyant parquet sans traces 1L',
    price: 9.50, pro_price: 7.20, compare_price: 12.90,
    stock: 220, sku: 'NET-PAR-1L', brand: 'Haddley & Cooper', unit: 'flacon 1L',
    is_featured: 0, is_new: 1, category_slug: 'hygiene-sols',
    images: ['https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&h=600&fit=crop&q=80'],
    tags: ['parquet', 'bois', 'brillant'],
  },
  {
    name: 'Dégraissant Sol Cuisine Pro 5L', slug: 'degraissant-sol-cuisine-5l',
    description: 'Dégraissant alcalin concentré haute performance pour sols de cuisines professionnelles. Élimine les graisses les plus tenaces, compatible carrelage et béton.',
    short_description: 'Dégraissant cuisine concentré 5L',
    price: 24.90, pro_price: 18.50, compare_price: 31.00,
    stock: 90, sku: 'DEG-CUI-5L', brand: 'ProClean', unit: 'bidon 5L',
    is_featured: 1, is_new: 0, category_slug: 'hygiene-sols',
    images: ['https://plus.unsplash.com/premium_photo-1684407616442-87bf0d69e8b4?w=600&h=600&fit=crop&q=80'],
    tags: ['dégraissant', 'cuisine', 'professionnel'],
  },
  {
    name: 'Lavette Microfibre Sol 60x80cm x5', slug: 'lavette-microfibre-sol-x5',
    description: 'Lot de 5 lavettes microfibre haute absorption pour sols. Fibres ultrafines qui captent poussières et bactéries sans produit. Lavable jusqu\'à 60°C, réutilisable 500 fois.',
    short_description: 'Lavettes microfibre 60x80 lot de 5',
    price: 14.90, pro_price: 11.00, compare_price: 19.90,
    stock: 180, sku: 'LAV-MIC-60X5', brand: 'Haddley & Cooper', unit: 'lot de 5',
    is_featured: 0, is_new: 0, category_slug: 'hygiene-sols',
    images: ['https://plus.unsplash.com/premium_photo-1681284938563-852a6e4a45e7?w=600&h=600&fit=crop&q=80'],
    tags: ['microfibre', 'lavette', 'réutilisable'],
  },

  // ── Hygiène des surfaces ──────────────────────────────────────
  {
    name: 'ANIOS Surfa\'Safe Premium Spray 750ml', slug: 'anios-surfasafe-750ml',
    description: 'Détergent désinfectant PAE en spray 750ml. Élimine 99,9% des bactéries, virus et levures. Certifié pour usage en milieu médical et alimentaire.',
    short_description: 'Désinfectant surfaces toutes zones',
    price: 7.27, pro_price: 5.80, compare_price: 9.50,
    stock: 320, sku: 'ANI-SSP-750', brand: 'Anios', unit: 'spray 750ml',
    is_featured: 1, is_new: 0, category_slug: 'hygiene-surfaces',
    images: ['https://images.unsplash.com/photo-1639112389900-a858bf671be1?w=600&h=600&fit=crop&q=80'],
    tags: ['désinfectant', 'spray', 'médical'],
  },
  {
    name: 'Nettoyant Désinfectant Multi-Surfaces 1L', slug: 'nettoyant-multi-surfaces-1l',
    description: 'Nettoyant désinfectant polyvalent pour toutes surfaces dures. Action rapide en 5 minutes, senteur fraîche. Compatible inox, verre, plastique et mélaminé.',
    short_description: 'Désinfectant multi-surfaces 1L',
    price: 6.90, pro_price: 4.90, compare_price: 8.90,
    stock: 410, sku: 'NET-MUL-1L', brand: 'Haddley & Cooper', unit: 'flacon 1L',
    is_featured: 0, is_new: 1, category_slug: 'hygiene-surfaces',
    images: ['https://images.unsplash.com/photo-1586992953119-9d5d3ebf1da0?w=600&h=600&fit=crop&q=80'],
    tags: ['multi-surfaces', 'désinfectant', 'polyvalent'],
  },
  {
    name: 'Lingettes Désinfectantes Citron x72', slug: 'lingettes-desinfectantes-x72',
    description: 'Boîte de 72 lingettes désinfectantes imprégnées. Élimine 99,9% des germes. Idéales pour les surfaces fréquemment touchées : claviers, téléphones, poignées. Senteur citron frais.',
    short_description: 'Lingettes désinfectantes x72 citron',
    price: 5.49, pro_price: 3.90, compare_price: 7.20,
    stock: 550, sku: 'LIN-DES-72C', brand: 'CleanMax', unit: 'boîte 72 lingettes',
    is_featured: 0, is_new: 0, category_slug: 'hygiene-surfaces',
    images: ['https://plus.unsplash.com/premium_photo-1661591285003-9abbde56bf8a?w=600&h=600&fit=crop&q=80'],
    tags: ['lingettes', 'citron', 'pratique'],
  },
  {
    name: 'Produit Vitres & Miroirs Professionnel 1L', slug: 'produit-vitres-1l',
    description: 'Nettoyant vitres à base d\'alcool pour une brillance irréprochable. Sans traces, sèche instantanément. Professionnel qualité cristal pour vitres, miroirs et surfaces vitrées.',
    short_description: 'Nettoyant vitres sans traces 1L',
    price: 5.90, pro_price: 4.20, compare_price: 7.50,
    stock: 290, sku: 'VIT-PRO-1L', brand: 'ProClean', unit: 'flacon 1L',
    is_featured: 0, is_new: 0, category_slug: 'hygiene-surfaces',
    images: ['https://plus.unsplash.com/premium_photo-1676810459906-b269db9bd6e7?w=600&h=600&fit=crop&q=80'],
    tags: ['vitres', 'miroirs', 'sans traces'],
  },
  {
    name: '3M Post-it Traçabilité Alimentaire 6 blocs', slug: '3m-postit-tracabilite',
    description: 'Lot de 6 blocs de 50 feuilles Post-it pour la traçabilité alimentaire. Adhésif soluble dans l\'eau, ne laisse aucun résidu. Idéal pour restauration et industrie agroalimentaire.',
    short_description: 'Post-it traçabilité alimentaire x6',
    price: 31.42, pro_price: 24.00, compare_price: 38.00,
    stock: 200, sku: '3M-PTI-6B', brand: '3M', unit: 'lot de 6 blocs',
    is_featured: 1, is_new: 1, category_slug: 'hygiene-surfaces',
    images: ['https://plus.unsplash.com/premium_photo-1706191097326-cd317671d1fb?w=600&h=600&fit=crop&q=80'],
    tags: ['traçabilité', 'alimentaire', '3M'],
  },

  // ── Hygiène des mains ─────────────────────────────────────────
  {
    name: 'Gel Hydroalcoolique 500ml Pompe', slug: 'gel-hydro-500ml',
    description: 'Gel hydroalcoolique à 70% d\'alcool. Action bactéricide, virucide et fongicide. Formule douce avec aloe vera. Séchage rapide sans rinçage.',
    short_description: 'Gel hydro 70% alcool avec pompe',
    price: 4.99, pro_price: 3.50, compare_price: 6.99,
    stock: 500, sku: 'GEL-HA-500P', brand: 'Haddley & Cooper', unit: 'flacon 500ml',
    is_featured: 0, is_new: 1, category_slug: 'hygiene-mains',
    images: ['https://images.unsplash.com/photo-1583947582886-f40ec95dd752?w=600&h=600&fit=crop&q=80'],
    tags: ['gel', 'hydroalcoolique', 'mains'],
  },
  {
    name: 'Savon Liquide Mains Doux 5L', slug: 'savon-liquide-mains-5l',
    description: 'Savon liquide doux pour les mains en bidon de 5L. Ph neutre, enrichi en glycérine, idéal pour une utilisation fréquente. Compatible tous distributeurs. Parfum fleurs blanches.',
    short_description: 'Savon liquide mains 5L recharge',
    price: 12.50, pro_price: 9.00, compare_price: 16.90,
    stock: 380, sku: 'SAV-LIQ-5L', brand: 'Haddley & Cooper', unit: 'bidon 5L',
    is_featured: 1, is_new: 0, category_slug: 'hygiene-mains',
    images: ['https://plus.unsplash.com/premium_photo-1679064286720-9f28c0f012d8?w=600&h=600&fit=crop&q=80'],
    tags: ['savon', 'mains', 'recharge'],
  },
  {
    name: 'Distributeur Savon Mural Inox 1L', slug: 'distributeur-savon-mural',
    description: 'Distributeur de savon liquide en inox brossé, capacité 1L. Fixation murale, idéal vestiaires, toilettes et cuisines. Pompe à levier robuste, rechargeable facilement.',
    short_description: 'Distributeur inox 1L fixation murale',
    price: 28.90, pro_price: 22.00, compare_price: 36.00,
    stock: 75, sku: 'DIS-SAV-INX', brand: 'ProClean', unit: 'pièce',
    is_featured: 0, is_new: 1, category_slug: 'hygiene-mains',
    images: ['https://images.unsplash.com/photo-1645567455251-334ed4702f9b?w=600&h=600&fit=crop&q=80'],
    tags: ['distributeur', 'inox', 'mural'],
  },

  // ── Hygiène des sanitaires ────────────────────────────────────
  {
    name: 'Détartrant WC Professionnel 750ml', slug: 'detartrant-wc-750ml',
    description: 'Détartrant WC acide concentré à action gel épaissie. Adhère aux parois, élimine le calcaire, les dépôts et les taches jaunes. Parfum pin frais. Action en 5 minutes.',
    short_description: 'Détartrant WC gel concentré 750ml',
    price: 4.20, pro_price: 2.90, compare_price: 5.50,
    stock: 460, sku: 'DET-WC-750', brand: 'Haddley & Cooper', unit: 'flacon 750ml',
    is_featured: 0, is_new: 0, category_slug: 'hygiene-sanitaires',
    images: ['https://plus.unsplash.com/premium_photo-1664372899354-99e6d9f50f58?w=600&h=600&fit=crop&q=80'],
    tags: ['WC', 'détartrant', 'sanitaire'],
  },
  {
    name: 'Spray Désodorisant Sanitaires 400ml', slug: 'desodorisant-sanitaires-400ml',
    description: 'Spray désodorisant pour sanitaires et cabinets d\'aisance. Neutralise les mauvaises odeurs instantanément. Diffuse un parfum frais longue durée. 400ml environ 600 pulvérisations.',
    short_description: 'Désodorisant sanitaires 400ml spray',
    price: 3.90, pro_price: 2.70, compare_price: 5.20,
    stock: 620, sku: 'DES-SAN-400', brand: 'FreshPro', unit: 'aérosol 400ml',
    is_featured: 0, is_new: 1, category_slug: 'hygiene-sanitaires',
    images: ['https://plus.unsplash.com/premium_photo-1670445044667-3c24bd5330b4?w=600&h=600&fit=crop&q=80'],
    tags: ['désodorisant', 'sanitaires', 'spray'],
  },
  {
    name: 'Nettoyant Surpuissant Robinets & Douches 500ml', slug: 'nettoyant-robinets-500ml',
    description: 'Anti-calcaire spécial robinetterie, douches et baignoires. Gel à action prolongée, détartre et fait briller l\'inox et le chrome. Sans rayures, résultats visibles dès la première utilisation.',
    short_description: 'Anti-calcaire robinets & douches 500ml',
    price: 6.50, pro_price: 4.50, compare_price: 8.90,
    stock: 310, sku: 'NET-ROB-500', brand: 'ProClean', unit: 'flacon 500ml',
    is_featured: 1, is_new: 0, category_slug: 'hygiene-sanitaires',
    images: ['https://images.unsplash.com/photo-1773177930292-463ca3c5b86a?w=600&h=600&fit=crop&q=80'],
    tags: ['calcaire', 'robinets', 'chrome'],
  },

  // ── Collecte des déchets ──────────────────────────────────────
  {
    name: 'Sacs Poubelle 110L Noir x50', slug: 'sacs-poubelle-110l',
    description: 'Sacs poubelle haute résistance 110 litres en polyéthylène recyclé. Résistants aux déchirures et perforations. Lot de 50 sacs.',
    short_description: 'Sacs poubelle 110L résistants x50',
    price: 12.90, pro_price: 9.50, compare_price: 16.90,
    stock: 400, sku: 'SAC-110-N50', brand: 'Haddley & Cooper', unit: 'rouleau 50 sacs',
    is_featured: 0, is_new: 0, category_slug: 'collecte-dechets',
    images: ['https://images.unsplash.com/photo-1602262442764-c14f8db98045?w=600&h=600&fit=crop&q=80'],
    tags: ['sacs', 'poubelle', 'recyclé'],
  },
  {
    name: 'Sacs Poubelle 30L Blanc x100', slug: 'sacs-poubelle-30l-blanc',
    description: 'Sacs poubelle 30L blanc opaque, idéals pour corbeilles de bureau et petites poubelles. Résistants, format standard. Lot de 100 sacs en rouleau.',
    short_description: 'Sacs poubelle 30L blanc x100',
    price: 8.90, pro_price: 6.20, compare_price: 11.50,
    stock: 700, sku: 'SAC-30-B100', brand: 'Haddley & Cooper', unit: 'rouleau 100 sacs',
    is_featured: 0, is_new: 0, category_slug: 'collecte-dechets',
    images: ['https://images.unsplash.com/photo-1606037150583-fb842a55bae7?w=600&h=600&fit=crop&q=80'],
    tags: ['sacs', '30L', 'bureau'],
  },
  {
    name: 'Poubelle à Pédale Inox 60L', slug: 'poubelle-pedale-inox-60l',
    description: 'Poubelle à pédale en inox brossé capacité 60L. Couvercle à ouverture douce et silencieuse, seau intérieur amovible. Idéale cuisine professionnelle ou bureau. Résistante à la corrosion.',
    short_description: 'Poubelle pédale inox 60L avec seau',
    price: 59.90, pro_price: 45.00, compare_price: 75.00,
    stock: 35, sku: 'POB-INX-60L', brand: 'ProClean', unit: 'pièce',
    is_featured: 1, is_new: 1, category_slug: 'collecte-dechets',
    images: ['https://plus.unsplash.com/premium_photo-1664189121552-f6d1dbf2a45c?w=600&h=600&fit=crop&q=80'],
    tags: ['poubelle', 'inox', 'pédale'],
  },

  // ── Univers Piscine ───────────────────────────────────────────
  {
    name: 'Détartrant Bassin Purissimeau 5L', slug: 'detartrant-bassin-5l',
    description: 'Détartrant spécial bassins, filtres et électrodes. Formule acide concentrée pour éliminer le calcaire et les dépôts minéraux. Compatible liner et parois.',
    short_description: 'Détartrant piscine concentré 5L',
    price: 22.50, pro_price: 17.00, compare_price: 28.00,
    stock: 80, sku: 'DET-PUR-5L', brand: 'Purissimeau', unit: 'bidon 5L',
    is_featured: 1, is_new: 0, category_slug: 'univers-piscine',
    images: ['https://plus.unsplash.com/premium_photo-1672308016665-699aefbc5f40?w=600&h=600&fit=crop&q=80'],
    tags: ['piscine', 'détartrant', 'bassin'],
  },
  {
    name: 'Chlore Choc Granulés Piscine 1kg', slug: 'chlore-choc-1kg',
    description: 'Chlore choc en granulés à dissolution rapide pour traitement choc ou entretien régulier. Élimine algues, bactéries et micro-organismes. Teneur en chlore actif 56%. Conditionnement 1kg.',
    short_description: 'Chlore choc granulés 56% actif 1kg',
    price: 14.90, pro_price: 10.50, compare_price: 19.90,
    stock: 130, sku: 'CHL-CHC-1KG', brand: 'Purissimeau', unit: 'seau 1kg',
    is_featured: 1, is_new: 0, category_slug: 'univers-piscine',
    images: ['https://images.unsplash.com/photo-1558617320-e695f0d420de?w=600&h=600&fit=crop&q=80'],
    tags: ['chlore', 'choc', 'algues'],
  },
  {
    name: 'Régulateur pH+ Piscine 1kg', slug: 'regulateur-ph-plus-1kg',
    description: 'Correcteur de pH à la hausse en granulés pour piscine. Augmente le pH de l\'eau pour maintenir la plage idéale (7,2 – 7,6). Action rapide, sans impacter la qualité de l\'eau.',
    short_description: 'Régulateur pH+ granulés piscine 1kg',
    price: 11.90, pro_price: 8.20, compare_price: 15.50,
    stock: 110, sku: 'PH-PLUS-1KG', brand: 'Purissimeau', unit: 'seau 1kg',
    is_featured: 0, is_new: 1, category_slug: 'univers-piscine',
    images: ['https://plus.unsplash.com/premium_photo-1680646213100-29bfeca6d475?w=600&h=600&fit=crop&q=80'],
    tags: ['pH', 'piscine', 'correcteur'],
  },
];

const prodStmt = db.prepare(`
  INSERT OR IGNORE INTO products
  (id, name, slug, description, short_description, price, pro_price, compare_price, stock, sku, brand, unit, category_id, is_featured, is_new, images, tags)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

products.forEach(p => {
  prodStmt.run(
    uuidv4(), p.name, p.slug, p.description, p.short_description,
    p.price, p.pro_price, p.compare_price, p.stock, p.sku, p.brand, p.unit,
    catMap[p.category_slug] || null, p.is_featured ? 1 : 0, p.is_new ? 1 : 0,
    JSON.stringify(p.images), JSON.stringify(p.tags)
  );
});

// Sample order
const order1Id = uuidv4();
db.prepare(`INSERT OR IGNORE INTO orders (id, order_number, user_id, status, payment_status, subtotal, shipping_cost, total, shipping_address)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(order1Id, 'HC-2024-0001', customerId, 'delivered', 'paid', 26.17, 4.90, 31.07,
    JSON.stringify({ street: '12 rue de la Paix', city: 'Paris', postal_code: '75001', country: 'France' }));

console.log(`✅ Database seeded — ${products.length} produits, 6 catégories`);
console.log('👤 Admin: admin@haddley-cooper.fr / admin123');
console.log('👤 Client: client@test.fr / client123');
