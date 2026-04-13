# backend-declic

Backend REST API pour une application mobile, construit avec **Node.js**, **Express** et **MongoDB**.

## Fonctionnalités

- **Authentification JWT** — inscription, connexion, rafraîchissement de token, déconnexion
- **Gestion du profil** — consultation, modification, changement de mot de passe, suppression de compte
- Validation des entrées avec `express-validator`
- Sécurité renforcée avec `helmet` et `cors`
- Gestion centralisée des erreurs

## Prérequis

- Node.js ≥ 18
- MongoDB (local ou [Atlas](https://www.mongodb.com/atlas))

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/DanielSOSSOU/backend-declic.git
cd backend-declic

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs
```

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `PORT` | Port du serveur | `3000` |
| `MONGODB_URI` | URI de connexion MongoDB | — |
| `JWT_SECRET` | Clé secrète pour les access tokens | — |
| `JWT_EXPIRES_IN` | Durée de validité de l'access token | `15m` |
| `JWT_REFRESH_SECRET` | Clé secrète pour les refresh tokens | — |
| `JWT_REFRESH_EXPIRES_IN` | Durée de validité du refresh token | `7d` |
| `CORS_ORIGIN` | Origines autorisées (CORS) | `*` |

## Démarrage

```bash
# Production
npm start

# Développement (rechargement automatique)
npm run dev
```

## Tests

```bash
npm test
```

## API

### Authentification

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Inscription | Non |
| POST | `/api/auth/login` | Connexion | Non |
| POST | `/api/auth/refresh` | Rafraîchir les tokens | Non |
| POST | `/api/auth/logout` | Déconnexion | Oui |

### Profil utilisateur

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me` | Récupérer son profil | Oui |
| PUT | `/api/users/me` | Modifier son profil | Oui |
| PUT | `/api/users/me/password` | Changer son mot de passe | Oui |
| DELETE | `/api/users/me` | Désactiver son compte | Oui |

### Santé

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/health` | Vérifier l'état du serveur |

### Exemples de requêtes

**Inscription**
```json
POST /api/auth/register
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "MotDePasse123"
}
```

**Connexion**
```json
POST /api/auth/login
{
  "email": "jean@example.com",
  "password": "MotDePasse123"
}
```

**Modifier son profil** *(Header: `Authorization: Bearer <accessToken>`)*
```json
PUT /api/users/me
{
  "name": "Jean-Pierre Dupont",
  "bio": "Développeur mobile passionné"
}
```

## Structure du projet

```
backend-declic/
├── src/
│   ├── config/
│   │   └── database.js       # Connexion MongoDB
│   ├── controllers/
│   │   ├── authController.js # Logique d'authentification
│   │   └── userController.js # Logique profil utilisateur
│   ├── middleware/
│   │   ├── auth.js           # Vérification JWT
│   │   ├── errorHandler.js   # Gestion globale des erreurs
│   │   └── validate.js       # Validation des entrées
│   ├── models/
│   │   └── User.js           # Schéma Mongoose utilisateur
│   ├── routes/
│   │   ├── auth.js           # Routes d'authentification
│   │   └── users.js          # Routes profil
│   ├── utils/
│   │   └── jwt.js            # Utilitaires JWT
│   └── app.js                # Configuration Express
├── tests/
│   ├── auth.test.js
│   └── users.test.js
├── .env.example
├── server.js                 # Point d'entrée
└── package.json
```

