# Déploiement en production avec Dokploy (VPS Hostinger)

Ce guide décrit le déploiement de l'application (backend + frontend + PostgreSQL) sur un VPS Hostinger via [Dokploy](https://dokploy.com), en utilisant `docker-compose.prod.yml`.

## Vue d'ensemble

- **2 sous-domaines** : un pour le frontend (ex. `app.votredomaine.com`), un pour l'API (ex. `api.votredomaine.com`). Cela évite les soucis de routage par chemin et simplifie la configuration CORS.
- Dokploy gère automatiquement Traefik (reverse proxy) et les certificats HTTPS (Let's Encrypt) — aucune configuration Nginx/SSL manuelle nécessaire côté VPS.
- Les migrations Prisma s'exécutent automatiquement à chaque démarrage du conteneur backend (`prisma migrate deploy`).

## 1. Prérequis

- Un VPS Hostinger sous Ubuntu 22.04+ (2 vCPU / 4 Go RAM minimum recommandé).
- Un nom de domaine, avec deux enregistrements DNS de type `A` pointant vers l'IP du VPS :
  - `app.votredomaine.com` → IP du VPS
  - `api.votredomaine.com` → IP du VPS
- Un accès SSH root (ou sudo) au VPS.
- Le code poussé sur GitHub (déjà fait : `https://github.com/massixdio/sim-contrats`).

## 2. Installer Dokploy sur le VPS

Connectez-vous en SSH au VPS puis lancez le script d'installation officiel :

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

À la fin de l'installation, Dokploy affiche l'URL du dashboard, généralement :

```
http://<IP_DU_VPS>:3000
```

Ouvrez cette URL dans un navigateur et créez le compte administrateur lors du premier accès.

**Sécurité** : configurez un pare-feu (`ufw`) pour n'autoriser que les ports nécessaires :

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (redirigé vers HTTPS par Traefik)
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Dashboard Dokploy (à restreindre à votre IP si possible)
ufw enable
```

## 3. Créer le projet dans Dokploy

1. Dans le dashboard Dokploy, cliquez sur **Create Project** (ex. nom : `sim-contrats`).
2. Dans le projet, cliquez sur **Create Service → Compose**.
3. Nommez l'application (ex. `sim-contrats-app`).

## 4. Connecter le dépôt GitHub

1. Dans les paramètres de l'application, section **General** / **Source**, choisissez **GitHub**.
2. Si ce n'est pas déjà fait, autorisez Dokploy à accéder à votre compte GitHub (OAuth) depuis **Settings → Git Providers** du dashboard Dokploy.
3. Sélectionnez le dépôt `massixdio/sim-contrats` et la branche `main`.
4. Dans **Compose Path**, indiquez :
   ```
   docker-compose.prod.yml
   ```
5. (Optionnel mais recommandé) Activez **Auto Deploy** pour que chaque `git push` sur `main` déclenche un redéploiement automatique via webhook.

## 5. Configurer les variables d'environnement

Dans l'onglet **Environment** de l'application, collez les variables suivantes (voir `.env.production.example` à la racine du repo) en remplaçant les valeurs par défaut :

```env
POSTGRES_USER=insurance_prod
POSTGRES_PASSWORD=<mot_de_passe_fort>
POSTGRES_DB=insurance_db

JWT_SECRET=<secret_fort>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://app.votredomaine.com

VITE_API_URL=https://api.votredomaine.com
```

`VITE_API_URL` est l'origine du backend, **sans** `/api` à la fin — le préfixe `/api` est ajouté par le code frontend (`frontend/src/api/client.ts`), pas par cette variable.

Générez des secrets forts localement avec :

```bash
openssl rand -base64 32
```

Utilisez une valeur différente pour `POSTGRES_PASSWORD` et `JWT_SECRET`. **Ne réutilisez jamais** les valeurs de démo du dépôt (`insurance`/`insurance`, `change_me_super_secret`).

## 6. Configurer les domaines

Dokploy détecte les services définis dans `docker-compose.prod.yml`. Pour chacun, allez dans l'onglet **Domains** de l'application et ajoutez :

| Service    | Port conteneur | Domaine                     | HTTPS               |
|------------|-----------------|------------------------------|----------------------|
| `backend`  | `4000`          | `api.votredomaine.com`       | Activé (Let's Encrypt) |
| `frontend` | `80`            | `app.votredomaine.com`       | Activé (Let's Encrypt) |

Dokploy configure automatiquement Traefik et génère les certificats SSL dès que le DNS pointe correctement vers le VPS.

## 7. Déployer

Cliquez sur **Deploy**. Dokploy va :

1. Cloner le dépôt.
2. Builder les images `backend/Dockerfile.prod` et `frontend/Dockerfile.prod` (le build du frontend reçoit `VITE_API_URL` en argument de build, donc l'URL de l'API est figée dans le bundle statique — toute modification de `VITE_API_URL` nécessite un rebuild, pas seulement un redémarrage).
3. Démarrer PostgreSQL, attendre qu'il soit `healthy`.
4. Démarrer le backend, qui exécute automatiquement `prisma migrate deploy` avant de lancer le serveur.
5. Démarrer le frontend (Nginx servant les fichiers statiques buildés).

Suivez la progression dans l'onglet **Deployments** / **Logs** de Dokploy.

## 8. Vérifier le déploiement

```bash
curl https://api.votredomaine.com/api/health
# {"status":"ok"}
```

Puis ouvrez `https://app.votredomaine.com` dans un navigateur.

## 9. Créer le premier compte / données de démo (optionnel)

Pour peupler la base avec un compte admin de démonstration, ouvrez un terminal dans le conteneur backend (onglet **Terminal** de l'application dans Dokploy, ou via SSH) :

```bash
docker exec -it <nom_du_conteneur_backend> npm run prisma:seed
```

Le nom exact du conteneur est visible dans l'onglet **Containers** de Dokploy ou via `docker ps` sur le VPS. En production, il est recommandé de créer un compte admin dédié plutôt que d'utiliser le seed de démo — adaptez `backend/prisma/seed.ts` ou créez le compte via `POST /api/auth/register`.

## 10. Mises à jour futures

Avec **Auto Deploy** activé (étape 4), chaque `git push` sur `main` redéploie automatiquement :

```bash
git push origin main
```

Dokploy rebuild les images et remplace les conteneurs (rolling restart), sans intervention manuelle.

## 11. Sauvegardes de la base de données

Le volume `postgres_data` persiste les données entre les redéploiements, mais **n'est pas sauvegardé automatiquement**. Pour un dump manuel :

```bash
docker exec <nom_du_conteneur_postgres> pg_dump -U insurance_prod insurance_db > backup_$(date +%Y%m%d).sql
```

Pour des sauvegardes automatisées et planifiées, deux options :

- Ajouter une tâche `cron` sur le VPS qui exécute la commande ci-dessus régulièrement et copie le résultat vers un stockage externe (S3, etc.).
- Migrer PostgreSQL vers une base de données **native Dokploy** (fonctionnalité "Databases" du dashboard), qui propose des sauvegardes planifiées intégrées. Dans ce cas, retirez le service `postgres` de `docker-compose.prod.yml` et pointez `DATABASE_URL` vers la base gérée par Dokploy.

## 12. Points de sécurité à ne pas oublier

- `JWT_SECRET` et `POSTGRES_PASSWORD` doivent être uniques et forts (jamais les valeurs d'exemple).
- Le service `postgres` n'expose aucun port sur l'hôte dans `docker-compose.prod.yml` (accessible uniquement via le réseau Docker interne) — ne pas ajouter de `ports:` dessus.
- Restreindre l'accès au dashboard Dokploy (port 3000) à votre IP si possible (pare-feu ou VPN).
- `CORS_ORIGIN` doit correspondre exactement au domaine du frontend (avec `https://`), sinon les requêtes du frontend vers l'API seront bloquées par le navigateur.
