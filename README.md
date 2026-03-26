# Stars Factory

Plateforme d'apprentissage immersive — monorepo npm workspaces.

## Stack

| Couche | Tech |
|---|---|
| Frontend | React 19, Vite 7, TailwindCSS 4, Three.js |
| Backend | Express 5, Prisma 7, PostgreSQL 16 |
| Partagé | TypeScript, Zod 4 |
| Auth | JWT (bcryptjs + jsonwebtoken) |

## Structure

```
stars-factory/
├── apps/
│   ├── api/          # Express REST API (port 3001)
│   └── web/          # React SPA (port 5173)
└── packages/
    └── shared/       # Types et schemas Zod partagés
```

## Prérequis

- Node.js 20+
- Docker Desktop (pour PostgreSQL)

## Démarrage

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer l'environnement

Créer `apps/api/.env` :

```env
PORT=3001
DATABASE_URL=postgresql://stars:stars@localhost:5432/stars_factory?schema=public
JWT_SECRET=change-me-in-production
```

### 3. Démarrer la base de données

```bash
npm run db:up
```

### 4. Lancer les migrations et le seed

```bash
cd apps/api
npm run db:migrate
npm run db:seed
```

### 5. Lancer le projet

```bash
# Depuis la racine — API + Web en parallèle
npm run dev

# Ou séparément
npm run dev:api   # http://localhost:3001
npm run dev:web   # http://localhost:5173
```

## API — Routes

### Auth
| Méthode | Route | Description |
|---|---|---|
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Se connecter → JWT |

### Courses
| Méthode | Route | Description |
|---|---|---|
| GET | `/courses` | Liste des cours |
| GET | `/courses/:id` | Détail complet (capsules → modules → chapitres) |

### Chapters
| Méthode | Route | Description |
|---|---|---|
| GET | `/chapters/:id` | Contenu markdown d'un chapitre |

### Progress *(authentifié — Bearer token)*
| Méthode | Route | Description |
|---|---|---|
| GET | `/progress` | Progression de l'utilisateur connecté |
| PUT | `/progress` | Upsert `{ chapterId, status, score? }` |

## Base de données

```bash
npm run db:up       # Démarrer PostgreSQL
npm run db:down     # Arrêter PostgreSQL
npm run db:logs     # Voir les logs

cd apps/api
npm run db:migrate  # Appliquer les migrations
npm run db:studio   # Ouvrir Prisma Studio
npm run db:seed     # Insérer les données de base
```

## Package partagé

`packages/shared` exporte les types TypeScript et les schemas Zod utilisés par l'API et le front :

```ts
import { loginSchema, registerSchema, progressUpsertSchema } from "@stars-factory/shared";
import type { CourseDetail, ProgressRecord, AuthResponse } from "@stars-factory/shared";
```
