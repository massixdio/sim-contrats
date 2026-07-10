# Suivi de Contrats d'Assurance

Application fullstack de gestion et suivi de contrats d'assurance : clients, compagnies d'assurance, contrats, échéances de paiement, et tableau de bord.

## Stack technique

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router
- **Infra**: Docker, Docker Compose

## Structure du projet

```
MonApp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Modèle de données (User, Client, Insurer, Contract, Payment, Document)
│   │   └── seed.ts            # Données de démo
│   ├── src/
│   │   ├── config/            # Variables d'environnement
│   │   ├── lib/                # Client Prisma
│   │   ├── middlewares/        # Auth JWT, gestion des erreurs
│   │   ├── modules/            # auth, clients, insurers, contracts, payments, dashboard
│   │   ├── utils/               # JWT, hash mots de passe, ApiError
│   │   ├── app.ts
│   │   └── index.ts
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                # Appels HTTP (axios)
│   │   ├── components/         # Layout, Modal, Card, StatusBadge...
│   │   ├── context/             # AuthContext
│   │   ├── pages/                # Dashboard, Clients, Insurers, Contracts, Payments, Auth
│   │   └── types/
│   └── Dockerfile
└── docker-compose.yml
```

## Démarrage rapide (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Backend : http://localhost:4000/api/health
- Frontend : http://localhost:5173

Au premier démarrage, appliquez les migrations puis les données de démo :

```bash
docker compose exec backend npx prisma migrate dev --name init
docker compose exec backend npm run prisma:seed
```

Compte de démo : `admin@insurance.local` / `password123`

## Démarrage sans Docker

### Backend

```bash
cd backend
cp .env.example .env   # adapter DATABASE_URL si besoin
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Fonctionnalités

- Authentification JWT (login/register), rôles ADMIN / AGENT
- CRUD Clients et Compagnies d'assurance
- CRUD Contrats avec génération automatique de l'échéancier de paiement selon la fréquence choisie (mensuelle, trimestrielle, annuelle, unique)
- Suivi des paiements (en attente, payé, en retard, annulé) avec marquage manuel
- Tableau de bord : contrats actifs, contrats expirant sous 30 jours, paiements en attente/retard, revenus encaissés

## Déploiement en production

Fichiers dédiés à la production (VPS + Dokploy) :

- `docker-compose.prod.yml` — stack de production (images multi-stage optimisées, pas de bind-mount du code, PostgreSQL non exposé publiquement)
- `.env.production.example` — variables d'environnement requises
- `backend/Dockerfile.prod` / `frontend/Dockerfile.prod` — builds de production (backend compilé, frontend servi par Nginx)
- [DEPLOY.md](DEPLOY.md) — guide pas-à-pas pour déployer sur un VPS Hostinger avec Dokploy

### Alternative : Railway

Chaque service (backend, frontend) a son propre fichier de config Railway, car sans ça un service hérite du `railway.json` racine et build le mauvais Dockerfile :

- **backend** : `railway.json` (racine) → `backend/Dockerfile.railway`
- **frontend** : `frontend/railway.json` (à définir comme "Config-as-code path" du service dans le dashboard) → `frontend/Dockerfile.railway` (sert les fichiers statiques via `serve`, pas Nginx)

Variables à configurer sur le service **backend** (dashboard Railway → Variables) :

- `DATABASE_URL` — fournie automatiquement si vous liez un plugin PostgreSQL Railway
- `JWT_SECRET` — secret fort, généré par ex. avec `openssl rand -base64 32`
- `CORS_ORIGIN` — **l'URL exacte du service frontend telle qu'assignée par Railway**, ex. `https://adequate-miracle-production-6878.up.railway.app` (sans slash final). Railway attribue cette URL dynamiquement à chaque service : ne pas recopier l'exemple `https://app.votredomaine.com` du guide Dokploy ci-dessus, qui suppose un nom de domaine personnalisé — sur Railway il n'y en a pas par défaut.
- Ne pas définir `PORT` manuellement : Railway l'injecte lui-même et l'app l'utilise déjà (`backend/src/config/env.ts`).

Si `CORS_ORIGIN` ne correspond pas exactement à l'origine du frontend (protocole + domaine, sans chemin), le navigateur bloque les requêtes du frontend vers l'API avec une erreur CORS.

## Modèle de données

- **User** — comptes internes (admin/agent)
- **Client** — assurés
- **Insurer** — compagnies d'assurance
- **Contract** — contrat liant un client à une compagnie
- **Payment** — échéances générées automatiquement à la création du contrat
- **Document** — pièces jointes liées à un contrat (structure prête, à brancher sur un stockage de fichiers)

## Prochaines étapes suggérées

- Upload de documents (S3 / stockage local)
- Notifications d'échéances à venir (email/cron)
- Export PDF/Excel des contrats et paiements
- Tests automatisés (Jest/Vitest, Supertest, Playwright)
