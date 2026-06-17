# Haddley & Cooper — E-commerce Full Stack

Site e-commerce complet pour **Haddley & Cooper**, spécialiste des produits d'hygiène et d'entretien.

## 🏗️ Architecture

```
haddley-cooper/
├── backend/          # Node.js + Express + SQLite
├── frontend/         # React + Vite + TailwindCSS (Site vitrine)
└── admin/            # React + Vite + TailwindCSS (Back-office)
```

---

## ⚡ Installation rapide

### 1. Prérequis
- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **npm** v9+

### 2. Cloner / extraire le projet
```bash
cd haddley-cooper
```

### 3. Installer toutes les dépendances
```bash
npm run install:all
```

### 4. Configurer l'environnement
```bash
cd backend
cp .env.example .env
```

Édite `backend/.env` :
```env
PORT=5000
JWT_SECRET=change_this_to_a_secure_random_string
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_STRIPE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### 5. Configurer la clé Stripe publique (frontend)
Dans `frontend/src/pages/CheckoutPage.jsx`, ligne 10 :
```js
const stripePromise = loadStripe('pk_test_VOTRE_CLE_PUBLIQUE_STRIPE')
```

### 6. Initialiser la base de données avec les données de démo
```bash
cd backend
node src/seed.js
```

### 7. Démarrer tous les serveurs
```bash
# Depuis la racine du projet
npm run dev
```

Ou individuellement :
```bash
npm run dev:backend    # API → http://localhost:5000
npm run dev:frontend   # Site → http://localhost:5173
npm run dev:admin      # Admin → http://localhost:5174
```

---

## 🌐 URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Site vitrine** | http://localhost:5173 | E-commerce public |
| **Back-office** | http://localhost:5174/admin | Administration |
| **API REST** | http://localhost:5000/api | Backend |

---

## 👤 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@haddley-cooper.fr | admin123 |
| **Client** | client@test.fr | client123 |

---

## 💳 Stripe — Configuration

1. Crée un compte sur [stripe.com](https://stripe.com)
2. Récupère tes clés dans **Dashboard → Developers → API Keys**
3. Pour les **webhooks** en local, utilise [Stripe CLI](https://stripe.com/docs/stripe-cli) :
   ```bash
   stripe listen --forward-to localhost:5000/api/orders/webhook
   ```
4. Copie le `Webhook signing secret` dans ton `.env`

En mode test, utilise la carte : **4242 4242 4242 4242** (date future, CVC quelconque)

---

## 📦 Fonctionnalités

### Site vitrine (frontend)
- ✅ Hero slider animé
- ✅ Catalogue avec filtres (catégorie, nouveautés, offres)
- ✅ Fiche produit détaillée avec avis
- ✅ Panier persistant (localStorage)
- ✅ Checkout complet avec Stripe
- ✅ Compte client (inscription, connexion, historique commandes)
- ✅ Espace Pro (tarifs préférentiels)
- ✅ Design responsive mobile-first

### Back-office (admin)
- ✅ Dashboard avec KPIs et graphiques (Recharts)
- ✅ Gestion des produits (CRUD complet)
- ✅ Gestion des commandes + changement de statut
- ✅ Gestion des clients + toggle Pro
- ✅ Gestion des catégories
- ✅ Statistiques avancées (CA, top produits, répartition)

### API (backend)
- ✅ Auth JWT (register, login, refresh)
- ✅ CRUD produits avec pagination et filtres
- ✅ Gestion commandes + Stripe Payment Intents
- ✅ Webhook Stripe (confirmation de paiement)
- ✅ Gestion des stocks automatique
- ✅ Système de coupons
- ✅ Statistiques agrégées

---

## 🗂️ Structure base de données (SQLite)

```
users         — Clients et admins
products      — Catalogue produits
categories    — Catégories produits
orders        — Commandes
order_items   — Lignes de commande
reviews       — Avis produits
coupons       — Codes promo
addresses     — Adresses sauvegardées
```

---

## 🚀 Déploiement en production

### Backend
```bash
cd backend
npm start
```
Utilise un process manager comme **PM2** :
```bash
npm install -g pm2
pm2 start src/index.js --name hc-api
```

### Frontend & Admin
```bash
cd frontend && npm run build   # → frontend/dist/
cd admin && npm run build      # → admin/dist/
```
Sers les dossiers `dist/` avec **Nginx** ou **Caddy**.

---

## 🔧 Personnalisation

### Changer les couleurs
`frontend/tailwind.config.js` et `admin/tailwind.config.js` — modifie les valeurs `navy`, `mint`, `gold`.

### Ajouter des produits
Via le back-office admin ou directement en base :
```bash
cd backend && node src/seed.js
```

### Variables d'environnement production
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=votre_secret_ultra_long_et_complexe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://votre-domaine.fr
ADMIN_URL=https://admin.votre-domaine.fr
```
