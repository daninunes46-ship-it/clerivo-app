# 🔐 ÉTAPE 2 : AUTHENTIFICATION & SÉCURISATION SOCLE

## ✅ Statut : COMPLÉTÉ (06/02/2026)

---

## 📋 SOMMAIRE EXÉCUTIF

Ce document résume l'implémentation complète du système d'authentification de Clerivo (Étape 2), conforme au CDC v1.1.1 (Section 6.6 TeamOps + DataVault) et au Plan de Bataille 4 (Sécurité Pi).

**Technologies utilisées :**
- `bcrypt` : Hachage des mots de passe (10 rounds)
- `express-session` : Gestion des sessions (MemoryStore)
- `helmet` : Durcissement des headers HTTP
- `cors` : Gestion CORS avec `credentials: true`

---

## 🎯 OBJECTIFS ATTEINTS

### 1. Enum UserRole (Prisma)
✅ **Validé** - Déjà nettoyé dans `schema.prisma` (lignes 45-48) :
```prisma
enum UserRole {
  ADMIN
  AGENT
}
```

### 2. Routes d'authentification
✅ **Implémenté** - 3 routes dans `/api/auth/*` :
- `POST /api/auth/login` : Connexion avec email/password
- `POST /api/auth/logout` : Déconnexion avec destruction session
- `GET /api/auth/me` : Récupération du profil utilisateur authentifié

### 3. Sessions sécurisées
✅ **Configuré** dans `server.js` :
```javascript
session({
  name: 'clerivo.sid',
  secret: process.env.SESSION_SECRET,
  httpOnly: true,        // Protection XSS
  sameSite: 'lax',       // Protection CSRF
  secure: NODE_ENV === 'production'
})
```

### 4. Journalisation (AuditLog)
✅ **Actif** - Tous les événements sécurité sont loggés :
- `LOGIN_SUCCESS` : Connexion réussie (avec IP + User-Agent)
- `LOGIN_FAILED` : Tentative échouée (avec email tenté + raison)
- `LOGOUT` : Déconnexion utilisateur

### 5. Seed de test
✅ **Opérationnel** - 2 comptes créés via `npm run db:seed` :
- **Admin :** `admin@clerivo.ch` / `admin123`
- **Agent :** `agent@clerivo.ch` / `agent123`

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Structure des fichiers créés/modifiés

```
apps/backend/
├── src/
│   ├── server.js                   [MODIFIÉ] Configuration express-session
│   ├── routes/
│   │   └── auth.js                 [CRÉÉ] Routes d'authentification
│   └── scripts/
│       ├── test-auth.sh            [CRÉÉ] Tests automatisés
│       └── check-users.js          [CRÉÉ] Vérification DB
├── prisma/
│   └── seed.js                     [CRÉÉ] Initialisation utilisateurs
├── .env                            [MODIFIÉ] Ajout SESSION_SECRET + PORT=3010
└── docs/
    └── STEP-2-AUTH.md              [CE FICHIER]
```

### Flux d'authentification

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Frontend React)                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ POST /api/auth/login
                  │ { email, password }
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Express + Prisma)                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Recherche User dans Prisma (email)                 │ │
│  │ 2. bcrypt.compare(password, user.passwordHash)        │ │
│  │ 3. Si OK → req.session.userId = user.id               │ │
│  │ 4. Journaliser dans AuditLog (LOGIN_SUCCESS)          │ │
│  │ 5. Retourner { user: { id, email, role, ... } }       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Cookie: clerivo.sid=<session_id>
                  │ (httpOnly, sameSite: lax)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Session active)                                    │
│  → Peut appeler GET /api/auth/me pour récupérer le profil  │
│  → Peut appeler POST /api/auth/logout pour se déconnecter  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 TESTS & VALIDATION

### Tests automatisés (100% réussite)

Exécuter : `bash apps/backend/src/scripts/test-auth.sh`

**Résultats :**
```
✅ TEST 1 : Login Admin (HTTP 200)
✅ TEST 2 : Récupération profil (HTTP 200)
✅ TEST 3 : Logout (HTTP 200)
✅ TEST 4 : Session détruite après logout (HTTP 401)
✅ TEST 5 : Login échoué avec mauvais mot de passe (HTTP 401)
```

### Tests manuels (cURL)

```bash
# Login
curl -X POST http://127.0.0.1:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clerivo.ch","password":"admin123"}' \
  -c cookies.txt

# Récupérer le profil
curl -X GET http://127.0.0.1:3010/api/auth/me -b cookies.txt

# Logout
curl -X POST http://127.0.0.1:3010/api/auth/logout -b cookies.txt
```

---

## 🔒 SÉCURITÉ

### Headers HTTP (Helmet)

Le serveur renvoie automatiquement les headers de sécurité suivants :
- `Content-Security-Policy` : Bloque les scripts non autorisés
- `Strict-Transport-Security` : Force HTTPS en production
- `X-Content-Type-Options: nosniff` : Empêche le MIME sniffing
- `X-Frame-Options: SAMEORIGIN` : Protection clickjacking
- `Cross-Origin-Resource-Policy: cross-origin` : Upload autorisé

### Protection des mots de passe

- **Algorithme :** bcrypt (10 rounds)
- **Stockage :** Jamais en clair, uniquement `passwordHash` en DB
- **Comparaison :** Utilisation de `bcrypt.compare()` (résistant timing attacks)

### Journalisation des tentatives échouées

Chaque échec de connexion est tracé dans `AuditLog` avec :
- Email tenté
- Raison de l'échec (`User not found` ou `Invalid password`)
- IP de l'attaquant
- User-Agent

**→ Prêt pour l'intégration future de Fail2ban (Plan de Bataille 4, Section 3.2)**

---

## 📊 DONNÉES DE TEST

### Utilisateurs disponibles

| Email              | Mot de passe | Rôle  | Permissions                          |
|--------------------|--------------|-------|--------------------------------------|
| admin@clerivo.ch   | admin123     | ADMIN | Accès total + paramètres sécurité    |
| agent@clerivo.ch   | agent123     | AGENT | Accès dossiers assignés + messagerie |

### Exemples d'AuditLog

```sql
SELECT action, entityType, userId, ipAddress, createdAt 
FROM AuditLog 
WHERE action LIKE 'LOGIN%' 
ORDER BY createdAt DESC 
LIMIT 5;
```

Résultat attendu :
```
LOGIN_SUCCESS | User | 8648570e-... | 127.0.0.1 | 2026-02-06 02:06:50
LOGIN_FAILED  | User | NULL         | 127.0.0.1 | 2026-02-06 02:06:18
LOGOUT        | User | 8648570e-... | 127.0.0.1 | 2026-02-06 02:06:51
```

---

## 🚀 COMMANDES UTILES

### Démarrage du serveur

```bash
cd apps/backend
npm start             # Production
npm run dev           # Développement (nodemon)
```

### Base de données

```bash
npm run db:migrate    # Créer/appliquer migrations
npm run db:seed       # Réinitialiser utilisateurs de test
npm run db:studio     # Ouvrir Prisma Studio (GUI)
npm run db:push       # Synchroniser schema sans migration
```

### Tests

```bash
# Tests automatisés
bash src/scripts/test-auth.sh

# Vérifier utilisateurs dans la DB
node src/scripts/check-users.js
```

---

## 🔧 VARIABLES D'ENVIRONNEMENT

**Fichier : `apps/backend/.env`**

```ini
# Server
PORT=3010
NODE_ENV=development

# Database
DATABASE_URL="file:../data/clerivo.db"

# Session (CHANGER EN PRODUCTION)
SESSION_SECRET=clerivo-session-secret-2026-raspberry-pi-secure

# Email (IMAP)
IMAP_USER=clerivotest@gmail.com
IMAP_PASSWORD=pvxz foeb hzob hysz
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_TLS=true

# OpenAI
OPENAI_API_KEY=sk-proj-...
```

⚠️ **IMPORTANT :** En production, générer un `SESSION_SECRET` robuste :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📈 PROCHAINES ÉTAPES (Hors Périmètre Étape 2)

### V1.1 - Améliorations sécurité
- [ ] 2FA TOTP (Plan de Bataille 4, Section 4.1)
- [ ] Limite de 3 connexions simultanées (Section 4.3)
- [ ] JWT avec Fingerprint navigateur (Section 4.2)
- [ ] Fail2ban intégration (Section 3.2)

### Frontend (à implémenter)
- [ ] Page `/login` avec formulaire
- [ ] Hook `useAuth()` pour Context React
- [ ] Redirection automatique si non authentifié
- [ ] Affichage du rôle utilisateur dans l'interface

---

## ✅ CRITÈRES D'ACCEPTATION (DoD)

| Critère                                      | Statut | Validé le     |
|----------------------------------------------|--------|---------------|
| Enum UserRole nettoyé (ADMIN, AGENT)        | ✅     | 06/02/2026    |
| Routes POST /login, POST /logout, GET /me   | ✅     | 06/02/2026    |
| Sessions avec httpOnly + sameSite: lax      | ✅     | 06/02/2026    |
| CORS credentials: true configuré            | ✅     | 06/02/2026    |
| AuditLog pour LOGIN_SUCCESS/FAILED/LOGOUT   | ✅     | 06/02/2026    |
| Seed avec admin@clerivo.ch créé             | ✅     | 06/02/2026    |
| Tests automatisés passent (5/5)             | ✅     | 06/02/2026    |
| Proxy Vite IPv4 non cassé                   | ✅     | 06/02/2026    |
| Stockage uploads intact                     | ✅     | 06/02/2026    |

---

## 📞 SUPPORT

**En cas de problème :**

1. Vérifier que le serveur tourne sur le bon port :
   ```bash
   ps aux | grep "node src/server.js"
   lsof -i:3010
   ```

2. Vérifier les logs du serveur :
   ```bash
   cd apps/backend
   npm run dev  # Mode verbose avec nodemon
   ```

3. Vérifier les utilisateurs dans la DB :
   ```bash
   node src/scripts/check-users.js
   ```

4. Re-seeder si nécessaire :
   ```bash
   npm run db:seed
   ```

---

**Document généré automatiquement par Hermès (Expert Backend Senior)**  
*Conforme au CDC Clerivo v1.1.1 et Plan de Bataille 4 (Sécurité Pi)*
