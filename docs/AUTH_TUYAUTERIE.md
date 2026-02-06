# 🔐 Tuyauterie d'Authentification (Auth Context)

## Vue d'ensemble

Système d'authentification React complet avec gestion de session via cookies httpOnly.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       AuthProvider                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  useEffect(() => checkSession(), [])               │    │
│  │  GET /api/auth/me (credentials: 'include')         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Context Value:                                             │
│  - user: User | null                                        │
│  - loading: boolean                                         │
│  - isAuthenticated: boolean                                 │
│  - login(email, password)                                   │
│  - logout()                                                 │
│  - checkSession()                                           │
└─────────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────────┐
│                      PrivateRoute                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  const { user, loading } = useAuth()               │    │
│  │  if (loading) → Loading Screen                     │    │
│  │  if (!user) → Navigate to /login                   │    │
│  │  else → Render children                            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────────┐
│                      Protected Routes                       │
│  /                  → Dashboard (Protected)                 │
│  /inbox             → Inbox (Protected)                     │
│  /pipeline          → Pipeline (Protected)                  │
│  /candidates/:id    → Candidate Detail (Protected)          │
│  /contacts          → Contacts (Protected)                  │
│  /login             → Login (Public)                        │
└─────────────────────────────────────────────────────────────┘
```

## Fichiers créés

### 1. `src/contexts/AuthContext.jsx`
**Responsabilité :** Gestion globale de l'état d'authentification

**Fonctions exposées :**
```javascript
const {
  user,              // Utilisateur connecté (ou null)
  loading,           // true pendant la vérification de session
  error,             // Message d'erreur éventuel
  isAuthenticated,   // Raccourci pour !!user
  login,             // (email, password) => Promise<{success, user?, error?}>
  logout,            // () => Promise<void>
  checkSession       // () => Promise<void>
} = useAuth();
```

**Flow de vérification de session :**
```
1. App mount → AuthProvider mount
2. useEffect déclenche checkSession()
3. GET /api/auth/me avec credentials: 'include'
4. Si 200 + user → setUser(user)
5. Si 401/403/500 → setUser(null)
6. setLoading(false)
```

**⚠️ CRITIQUE - credentials: 'include' :**
```javascript
fetch('/api/auth/me', {
  credentials: 'include'  // Envoie les cookies httpOnly
})
```
Sans ce flag, les cookies ne sont PAS envoyés et la session ne fonctionne pas.

### 2. `src/components/PrivateRoute.jsx`
**Responsabilité :** Protéger les routes nécessitant une authentification

**Comportement :**
```javascript
if (loading) {
  // Afficher écran de chargement
  return <LoadingScreen />;
}

if (!user) {
  // Rediriger vers /login
  return <Navigate to="/login" replace />;
}

// Afficher le contenu protégé
return children;
```

**Usage :**
```jsx
<Route path="/inbox" element={
  <PrivateRoute>
    <InboxPage />
  </PrivateRoute>
} />
```

### 3. `src/pages/LoginPage.jsx`
**Responsabilité :** Interface de connexion (design basique fonctionnel)

**Fonctionnalités :**
- Formulaire email/password
- Validation côté client
- Appel à `login()` du contexte
- Redirection automatique après succès
- Affichage des erreurs
- Redirection si déjà connecté

**Flow de connexion :**
```
1. Utilisateur tape /inbox sans être connecté
2. PrivateRoute redirige vers /login
3. Utilisateur remplit le formulaire
4. Submit → login(email, password)
5. POST /api/auth/login avec credentials: 'include'
6. Si succès → setUser(user) + redirect vers /inbox
7. Si échec → Afficher erreur
```

### 4. `src/App.jsx` (modifié)
**Modifications :**
```jsx
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      {isLoginPage ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/inbox" element={<PrivateRoute><Inbox /></PrivateRoute>} />
            {/* ... autres routes protégées */}
          </Routes>
        </Layout>
      )}
    </AuthProvider>
  );
}
```

## Configuration Proxy Vite

Le proxy Vite redirige automatiquement `/api/*` vers `http://127.0.0.1:3000` :

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

**Important :** Les routes `/api/auth/*` sont automatiquement incluses.

## Routes Backend attendues

Le frontend attend ces routes backend :

### GET /api/auth/me
**Description :** Vérifier la session active

**Request :**
```http
GET /api/auth/me HTTP/1.1
Cookie: session=abc123...
```

**Response (succès) :**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "agent@clerivo.ch",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "AGENT"
  }
}
```

**Response (non connecté) :**
```json
{
  "success": false,
  "message": "Non authentifié"
}
```

### POST /api/auth/login
**Description :** Connexion utilisateur

**Request :**
```json
{
  "email": "agent@clerivo.ch",
  "password": "Password123!"
}
```

**Response (succès) :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": "user-123",
    "email": "agent@clerivo.ch",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "AGENT"
  }
}
```

**Cookies (httpOnly) :**
```http
Set-Cookie: session=abc123...; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

**Response (échec) :**
```json
{
  "success": false,
  "message": "Identifiants incorrects"
}
```

### POST /api/auth/logout
**Description :** Déconnexion utilisateur

**Request :**
```http
POST /api/auth/logout HTTP/1.1
Cookie: session=abc123...
```

**Response :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

**Cookies (suppression) :**
```http
Set-Cookie: session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

## Test du système

### 1. Test sans backend
Si le backend n'a pas encore les routes `/api/auth/*`, le comportement sera :

```
1. App charge → checkSession() appelle GET /api/auth/me
2. Backend répond 404 ou 500
3. Frontend → setUser(null) + setLoading(false)
4. Utilisateur tente d'accéder à /inbox
5. PrivateRoute → Redirect /login
6. Page de login s'affiche
7. Utilisateur submit le formulaire
8. POST /api/auth/login → 404
9. Message d'erreur s'affiche
```

**Résultat :** Le système de protection fonctionne, mais la connexion échoue (normal).

### 2. Test avec backend complet

```bash
# Terminal 1: Backend
cd apps/backend
npm start

# Terminal 2: Frontend
cd apps/frontend
npm run dev

# Terminal 3: Test curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  -c cookies.txt

curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### 3. Test navigateur

1. Ouvrir `http://localhost:5173`
2. Essayer d'accéder à `/inbox` → Redirection vers `/login`
3. Se connecter avec des identifiants valides
4. Redirection automatique vers `/inbox`
5. Rafraîchir la page → Toujours connecté (session persistante)
6. Fermer le navigateur et rouvrir → Session expirée (selon durée cookie)

## Console logs de debug

Le système log chaque étape dans la console :

```javascript
// Au chargement
"🔐 Vérification de la session..."
"✅ Session valide: agent@clerivo.ch"
// ou
"⚠️ Pas de session active"

// Lors de la connexion
"🔐 Tentative de connexion: agent@clerivo.ch"
"✅ Connexion réussie: agent@clerivo.ch"
// ou
"❌ Échec connexion: Identifiants incorrects"

// Lors de l'accès à une route protégée
"✅ Accès autorisé pour: agent@clerivo.ch"
// ou
"🔒 Accès refusé, redirection vers /login"

// Lors de la déconnexion
"🚪 Déconnexion..."
"✅ Déconnexion réussie"
```

## Sécurité

### Cookies httpOnly
Les cookies sont marqués `HttpOnly`, donc :
- ✅ Inaccessibles via JavaScript (`document.cookie`)
- ✅ Protégés contre les attaques XSS
- ✅ Envoyés automatiquement par le navigateur
- ⚠️ Nécessitent `credentials: 'include'` dans les fetch

### SameSite
Les cookies doivent être marqués `SameSite=Strict` ou `SameSite=Lax` pour :
- ✅ Protéger contre les attaques CSRF
- ✅ Limiter l'envoi aux requêtes same-site

### Secure
En production, les cookies doivent être marqués `Secure` :
- ✅ Transmis uniquement via HTTPS
- ⚠️ En dev (HTTP), ne pas activer `Secure`

## État actuel

### ✅ Fonctionnel
- AuthContext avec gestion de session
- PrivateRoute pour protéger les routes
- LoginPage avec formulaire basique
- Redirection automatique si non connecté
- Vérification de session au chargement
- Logs de debug complets

### ⚠️ En attente (Backend)
- Routes `/api/auth/me`, `/api/auth/login`, `/api/auth/logout`
- Génération et validation des cookies httpOnly
- Hashage des mots de passe (bcrypt)
- Gestion des sessions (express-session ou JWT)

### 🎨 À améliorer (Design)
- Design de la page de login (actuellement basique mais fonctionnel)
- Animations de transition
- Messages d'erreur plus riches
- Page "Mot de passe oublié"

## Prochaines étapes

1. **Backend Auth Routes** :
   - Créer `apps/backend/src/routes/auth.js`
   - Créer `apps/backend/src/controllers/authController.js`
   - Implémenter login/logout/session check
   - Configurer express-session avec cookies httpOnly

2. **Améliorer le design de LoginPage** :
   - Ajouter le logo Clerivo
   - Animations d'entrée
   - Background plus élégant

3. **Gestion des rôles** :
   - Ajouter `user.role` dans le contexte
   - Créer un `RoleGuard` pour restreindre certaines routes
   - Ex: Admin peut gérer les utilisateurs, Agent non

4. **Persistance avancée** :
   - "Remember me" option
   - Refresh token system
   - Session expiry notification

## Commandes de test

```bash
# Vérifier les lints
npm run lint

# Lancer le frontend
cd apps/frontend && npm run dev

# Tester la route protégée
curl http://localhost:5173/inbox
# → Redirige vers /login

# Vérifier le proxy
curl http://localhost:5173/api/auth/me
# → Proxie vers http://localhost:3000/api/auth/me
```

## Résumé

✅ **Système d'authentification complet et fonctionnel**
✅ **Protection de toutes les routes critiques**
✅ **Gestion de session avec cookies httpOnly**
✅ **Redirection automatique si non connecté**
✅ **Logs de debug détaillés**

⏳ **En attente du backend pour être 100% opérationnel**
