# 🔐 ÉTAPE 1 : Infrastructure d'Authentification JWT
## CLERIVO - Raspberry Pi 5 - V1.0

**Date d'implémentation :** 6 février 2026  
**Status :** ✅ **INFRASTRUCTURE COMPLÈTE**

---

## 📋 Résumé des Changements

### 1️⃣ Dépendances Ajoutées

**Fichier modifié :** `apps/backend/package.json`

```json
"jsonwebtoken": "^9.0.2",    // Génération/vérification tokens JWT
"cookie-parser": "^1.4.6"    // Lecture cookies httpOnly (req.cookies)
```

### 2️⃣ Middleware d'Authentification Créé

**Fichier créé :** `apps/backend/src/middleware/auth.js`

#### Fonctions Exportées

| Fonction | Type | Description |
|----------|------|-------------|
| `generateToken(user)` | Fonction | Génère un JWT signé (exp: 8h) |
| `verifyToken(req, res, next)` | Middleware Express | Vérifie cookie `authToken`, peuple `req.user` |
| `requireRole(['ADMIN'])` | Middleware Express | Contrôle d'accès par rôle (403 si refusé) |

#### Caractéristiques de Sécurité

- ✅ **Rôles V1 stricts** : `ADMIN` et `AGENT` uniquement (pas de `MANAGER`)
- ✅ **Expiration** : 8 heures (configurable via `JWT_EXPIRY`)
- ✅ **Signature HMAC** : Utilise `JWT_SECRET` (.env)
- ✅ **Validation payload** : Vérifie `userId`, `email`, `role`
- ✅ **Gestion erreurs** : Codes d'erreur clairs (`AUTH_TOKEN_EXPIRED`, `AUTH_FORBIDDEN`, etc.)
- ✅ **Issuer/Audience** : Protection contre réutilisation cross-app

### 3️⃣ Configuration Environnement

**Fichier créé :** `apps/backend/.env.example`

Ajout de la variable **obligatoire** :

```bash
JWT_SECRET=your_secret_jwt_key_here_generate_with_command_above
```

**Génération sécurisée (64 octets) :**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**OU avec OpenSSL :**
```bash
openssl rand -hex 64
```

### 4️⃣ Script de Test

**Fichier créé :** `apps/backend/test-auth.js`

Script autonome pour vérifier :
- Génération de tokens ADMIN/AGENT
- Rejet des rôles invalides (MANAGER, READONLY)
- Vérification de signature JWT
- Décodage du payload
- Validation de l'expiration

---

## 🚀 Commandes de Vérification

### 1. Installation des Dépendances

```bash
cd ~/projects/clerivo/apps/backend
npm install
```

**Vérification attendue :**
```
+ jsonwebtoken@9.0.2
+ cookie-parser@1.4.6
```

### 2. Génération de JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Exemple de sortie :**
```
3f7a8d9b2c1e5f6a4b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

**📝 Copier cette valeur dans `.env` :**
```bash
# Dans apps/backend/.env
JWT_SECRET=<valeur_générée_ci-dessus>
```

### 3. Test du Middleware Auth

```bash
cd ~/projects/clerivo/apps/backend
node test-auth.js
```

**Sortie attendue :**
```
🧪 [Test Auth] Démarrage des tests...

📝 TEST 1: Génération de token
──────────────────────────────────────────────────
✅ Token ADMIN généré avec succès
   Token (début): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQ...
   Longueur: 200+ caractères
✅ Token AGENT généré avec succès

🧪 Test avec rôle MANAGER (doit échouer en V1):
✅ Rejet attendu: generateToken: rôle invalide "MANAGER"...

🔍 TEST 2: Vérification et décodage de token
──────────────────────────────────────────────────
✅ Token vérifié et décodé avec succès
   Payload décodé:
   - userId: test-admin-123
   - email: admin@clerivo.ch
   - role: ADMIN
   - Expire dans: ~8h

🛡️  TEST 3: Validation des rôles (V1)
──────────────────────────────────────────────────
Rôles autorisés V1: ADMIN, AGENT

✅ Tous les tests sont passés avec succès!

🎯 Middleware auth.js prêt pour intégration!
```

---

## 📐 Architecture et Utilisation

### Chaînage des Middlewares

```javascript
const { verifyToken, requireRole } = require('./middleware/auth');

// Route accessible à tous les utilisateurs authentifiés
router.get('/profile', verifyToken, getUserProfile);

// Route accessible uniquement aux ADMIN
router.delete('/users/:id', verifyToken, requireRole(['ADMIN']), deleteUser);

// Route accessible aux ADMIN et AGENT
router.get('/candidates', verifyToken, requireRole(['ADMIN', 'AGENT']), listCandidates);
```

### Génération de Token lors du Login

```javascript
const { generateToken } = require('./middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Exemple : Route de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Vérifier identifiants (à implémenter : bcrypt hash)
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
  }
  
  // TODO Étape 2: Vérifier passwordHash avec bcrypt
  
  // 2. Générer token JWT
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });
  
  // 3. Définir cookie httpOnly
  res.cookie('authToken', token, {
    httpOnly: true,      // Inaccessible depuis JavaScript (protection XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en prod
    sameSite: 'lax',     // Protection CSRF
    maxAge: 8 * 60 * 60 * 1000 // 8 heures en millisecondes
  });
  
  res.json({ 
    success: true, 
    message: 'Connexion réussie',
    user: { id: user.id, email: user.email, role: user.role }
  });
});
```

### Lecture de `req.user` dans les Handlers

Après `verifyToken`, l'objet `req.user` contient :

```javascript
{
  id: "uuid-de-l-utilisateur",
  email: "user@clerivo.ch",
  role: "ADMIN" // ou "AGENT"
}
```

**Exemple d'utilisation :**
```javascript
router.get('/me', verifyToken, (req, res) => {
  // req.user est disponible ici
  res.json({
    success: true,
    user: req.user
  });
});
```

---

## ⚠️ CORRECTIONS INTÉGRÉES

### 1. Prisma n'a pas de `.backup()`
✅ **Action :** Noté pour plus tard. Backup manuel via `sqlite3` ou scripts externes.  
✅ **Statut :** Aucun code de backup généré dans cette étape.

### 2. Rôles V1 Stricts
✅ **Action :** Seuls `ADMIN` et `AGENT` sont autorisés.  
✅ **Code :** Validation dans `generateToken()` et `verifyToken()`.  
⚠️  **Note :** Le schema Prisma contient encore `MANAGER` et `READONLY` dans l'enum `UserRole` (lignes 45-50). **À nettoyer lors de la migration Étape 2.**

### 3. Cookies httpOnly + CORS
✅ **Action :** Infrastructure préparée pour cross-origin (Cloudflare tunnel).  
✅ **Code :** `verifyToken` lit `req.cookies.authToken`.  
📝 **Prérequis :** Ajouter `cookie-parser` dans `server.js` (voir Étape 2).

### 4. Tous les Paths Sensibles en `.env`
✅ **Action :** Variables placeholders ajoutées dans `.env.example` :
   - `SWISS_SAFE_DIR` (futur stockage documents)
   - `UPLOAD_TEMP_DIR` (uploads temporaires)
   - `BACKUP_DIR` (backups chiffrés)
   
✅ **Statut :** Prêt pour Étape 2 (DataVault).

---

## 🔄 ÉTAPE 2 : Préparation Requise

### Modifications à Apporter dans `server.js`

```javascript
const express = require('express');
const cookieParser = require('cookie-parser'); // ← AJOUTER
const cors = require('cors');

const app = express();

// ⚠️  AJOUTER AVANT les routes :
app.use(cookieParser());

// CORS avec credentials (pour cookies cross-origin)
const corsOptions = {
  origin: true,
  credentials: true, // ← OBLIGATOIRE pour req.cookies
  // ... reste de la config
};
app.use(cors(corsOptions));
```

### Routes d'Authentification à Créer (Étape 2)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/auth/register` | POST | Inscription utilisateur (bcrypt hash) |
| `/api/auth/login` | POST | Connexion (génère JWT, set cookie) |
| `/api/auth/logout` | POST | Déconnexion (clear cookie) |
| `/api/auth/me` | GET | Profil utilisateur (verifyToken) |
| `/api/auth/refresh` | POST | Refresh token (si exp proche) |

### Migration Prisma (Étape 2)

**Nettoyer l'enum `UserRole` pour V1 :**

```prisma
enum UserRole {
  ADMIN
  AGENT
  // SUPPRIMER : MANAGER, READONLY (V1 strict)
}
```

**Commande :**
```bash
npx prisma migrate dev --name remove-manager-readonly-roles
```

### Hashage des Mots de Passe (Étape 2)

**Ajouter bcrypt :**
```bash
npm install bcrypt
```

**Exemple de hashage :**
```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Lors de l'inscription
const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Lors du login
const isValid = await bcrypt.compare(plainPassword, user.passwordHash);
```

---

## 📊 Tests de Sécurité (Étape 2)

### 1. Test de Token Expiré
```bash
# Modifier JWT_EXPIRY à '5s' dans auth.js
# Générer un token, attendre 6s, vérifier rejet
```

### 2. Test de Cookie httpOnly
```javascript
// Dans DevTools navigateur, vérifier :
// - Cookie "authToken" présent
// - Flag HttpOnly = true
// - document.cookie ne contient PAS authToken (protection XSS)
```

### 3. Test de Rôle MANAGER
```bash
# Dans Prisma Studio, créer user avec role="MANAGER"
# Tenter login → doit rejeter avec erreur
```

### 4. Test de CSRF
```bash
# Tentative de requête depuis origine différente sans credentials
# Doit échouer (cookie non envoyé)
```

---

## 📦 Fichiers Modifiés/Créés

```
apps/backend/
├── package.json                           [MODIFIÉ] ← jsonwebtoken, cookie-parser
├── .env.example                           [CRÉÉ]    ← JWT_SECRET + paths
├── src/
│   └── middleware/
│       └── auth.js                        [CRÉÉ]    ← generateToken, verifyToken, requireRole
├── test-auth.js                           [CRÉÉ]    ← Script de validation
└── docs/
    └── ETAPE_1_AUTH_INFRA.md              [CRÉÉ]    ← Ce fichier
```

---

## ✅ Checklist de Validation

- [x] Dépendance `jsonwebtoken` ajoutée
- [x] Dépendance `cookie-parser` ajoutée
- [x] Middleware `auth.js` créé avec 3 fonctions
- [x] Validation rôles V1 (ADMIN/AGENT uniquement)
- [x] `.env.example` avec `JWT_SECRET` + commande génération
- [x] Script de test `test-auth.js` fonctionnel
- [x] Documentation complète (ce fichier)
- [x] Chemins sensibles en `.env` (SWISS_SAFE_DIR, etc.)
- [x] Aucune modification d'autres modules

---

## 🎯 Prochaines Étapes (Étape 2)

1. **Intégration dans `server.js`**
   - Ajouter `cookie-parser`
   - Configurer CORS avec `credentials: true`

2. **Routes d'authentification**
   - POST `/api/auth/register`
   - POST `/api/auth/login`
   - POST `/api/auth/logout`
   - GET `/api/auth/me`

3. **Hashage bcrypt**
   - Ajouter dépendance `bcrypt`
   - Implémenter hash/compare

4. **Migration Prisma**
   - Nettoyer enum `UserRole` (supprimer MANAGER/READONLY)
   - Créer seed avec users ADMIN/AGENT

5. **Tests de sécurité**
   - Vérifier cookies httpOnly
   - Tester expiration tokens
   - Valider CORS avec credentials

---

**🔐 Infrastructure d'authentification prête pour Étape 2!**

---

_CLERIVO - Swiss Real Estate Pipeline Management_  
_Raspberry Pi 5 - V1.0 - Février 2026_
