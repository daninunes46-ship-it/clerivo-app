# 🌐 Configuration Réseau Local (PC → Raspberry Pi)

## Problème résolu
Le frontend sur PC Windows ne pouvait pas contacter le backend sur Raspberry Pi via l'IP locale.

## Configuration appliquée

### Frontend `.env`
```env
VITE_API_URL=http://192.168.1.212:3010
```

**Effet :**
- Toutes les requêtes API pointent directement vers `http://192.168.1.212:3010/api/*`
- Contourne le proxy Vite (qui ne fonctionne que en local)
- Permet l'accès depuis n'importe quel appareil du réseau local

### Backend (déjà configuré)
```javascript
// server.js
const HOST = process.env.HOST || '0.0.0.0'; // Écoute sur toutes les interfaces
const PORT = process.env.PORT || 3000; // Port 3010 dans .env

const corsOptions = {
  origin: true, // Accepte toutes les origines
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
```

**Effet :**
- Backend écoute sur `0.0.0.0:3010` (toutes les interfaces réseau)
- CORS accepte les requêtes depuis n'importe quelle origine
- Compatible avec accès local ET réseau

## Pages modifiées

Toutes les pages utilisent maintenant la variable d'environnement :

```javascript
// Avant (URL relative - proxy Vite)
const API_URL = '';

// Après (Variable d'environnement avec fallback)
const API_URL = import.meta.env.VITE_API_URL || '';
```

**Fichiers modifiés :**
- ✅ `src/pages/InboxPage.jsx`
- ✅ `src/pages/PipelinePage.jsx`
- ✅ `src/pages/CandidateDetailPage.jsx`
- ✅ `src/pages/LoginPage.jsx` (déjà configuré)

## Test de connexion

### 1. Vérifier que le backend est accessible
```bash
# Depuis le PC Windows
curl http://192.168.1.212:3010/api/emails

# Devrait renvoyer JSON (pas d'erreur CORS)
```

### 2. Accéder au frontend
```
http://192.168.1.212:5173
```

### 3. Console Browser (F12)
```javascript
// Vérifier l'URL utilisée
console.log('API_URL:', import.meta.env.VITE_API_URL);
// → http://192.168.1.212:3010

// Les requêtes devraient pointer vers
fetch('http://192.168.1.212:3010/api/emails')
// → 200 OK (pas d'erreur réseau)
```

## Architecture Réseau

```
┌─────────────────────────────────────────────────────────┐
│                    PC Windows                           │
│                                                          │
│  Browser → http://192.168.1.212:5173 (Frontend Vite)   │
│      ↓                                                   │
│  Fetch → http://192.168.1.212:3010/api/emails          │
└─────────────────────────────────────────────────────────┘
                         ↓
              Réseau Local (LAN)
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Raspberry Pi (192.168.1.212)               │
│                                                          │
│  Backend (Express) → 0.0.0.0:3010                       │
│  Frontend (Vite) → 0.0.0.0:5173                         │
└─────────────────────────────────────────────────────────┘
```

## Modes de déploiement

### Mode Local (sur le Raspberry)
```env
# .env
VITE_API_URL=
# → Utilise le proxy Vite (localhost)
```

**Avantage :** Pas de problème de CORS, tout passe par le proxy

### Mode Réseau Local
```env
# .env
VITE_API_URL=http://192.168.1.212:3010
# → Requêtes directes vers l'IP du Raspberry
```

**Avantage :** Accès depuis n'importe quel appareil du réseau

### Mode Production (Tunnel Cloudflare)
```env
# .env
VITE_API_URL=https://clerivo.ch
# → Backend servi sur le même domaine
```

**Avantage :** Pas de problème CORS, domaine unique

## Logs de debug

### Frontend (Console)
```javascript
// InboxPage.jsx
console.log('📤 Fetching emails from:', `${API_URL}/api/emails`);
// → http://192.168.1.212:3010/api/emails
```

### Backend (Terminal)
```
[Backend] GET /api/emails
✅ Email routes mounted
📊 Response: 200 OK
```

## Troubleshooting

### Erreur "Failed to fetch"
**Cause :** Backend non accessible à l'IP spécifiée

**Solution :**
```bash
# Vérifier l'IP du Raspberry
hostname -I
# → 192.168.1.212

# Vérifier que le backend écoute sur 0.0.0.0
netstat -tuln | grep 3010
# → 0.0.0.0:3010

# Tester depuis le PC
curl http://192.168.1.212:3010/api/emails
```

### Erreur CORS
**Cause :** Backend refuse les requêtes cross-origin

**Solution :** Déjà configuré avec `origin: true`

### Firewall bloque le port
**Solution :**
```bash
# Sur Raspberry Pi
sudo ufw allow 3010/tcp
sudo ufw allow 5173/tcp
```

## Redémarrage nécessaire

⚠️ **IMPORTANT :** Après modification du `.env`, redémarrer Vite :

```bash
# Arrêter Vite (Ctrl+C)
# Relancer
cd apps/frontend
npm run dev
```

Le serveur Vite doit recharger les variables d'environnement.

## Vérification finale

```bash
# Terminal 1: Backend
cd apps/backend
npm start
# → Server running on http://0.0.0.0:3010

# Terminal 2: Frontend
cd apps/frontend
npm run dev
# → Local: http://192.168.1.212:5173

# PC Windows: Ouvrir
http://192.168.1.212:5173
# → Inbox doit charger les emails depuis l'API ✅
```
