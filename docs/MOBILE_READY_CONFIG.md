# 🌐 Configuration Mobile Ready (Proxy Vite)

## Problème résolu
Le frontend tentait de contacter `http://localhost:3000` depuis un mobile, ce qui échouait avec "Failed to fetch".

## Solution appliquée

### 1. Proxy Vite (`apps/frontend/vite.config.js`)
```javascript
server: {
  host: true,
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

**Fonctionnement :**
- Le navigateur fait des requêtes vers `/api/...` (URL relative)
- Vite intercepte ces requêtes et les redirige vers `http://localhost:3000/api/...`
- Compatible avec le tunnel Cloudflare (`clerivo.ch`)

### 2. URLs relatives dans le Frontend

#### Avant (❌ Non mobile)
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
fetch(`${API_URL}/api/candidates`);
// Résultat: http://localhost:3000/api/candidates (inaccessible depuis mobile)
```

#### Après (✅ Mobile ready)
```javascript
const API_URL = ''; // URL relative
fetch(`${API_URL}/api/candidates`);
// Résultat: /api/candidates (utilise le domaine actuel: clerivo.ch)
```

### 3. Fichiers modifiés
- ✅ `apps/frontend/vite.config.js` - Proxy configuré
- ✅ `apps/frontend/src/pages/InboxPage.jsx` - API_URL en relatif
- ✅ `apps/frontend/src/pages/PipelinePage.jsx` - API_URL en relatif
- ✅ `apps/frontend/src/pages/CandidateDetailPage.jsx` - API_URL en relatif

## Test mobile
1. Lancer le tunnel Cloudflare : `cloudflared tunnel --url http://localhost:5173`
2. Accéder à l'URL générée depuis un mobile
3. Les requêtes API passent par le proxy Vite ✅

## Déploiement production
En production (Vercel), configurer les rewrites dans `vercel.json` :
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api-backend-url.com/api/:path*" }
  ]
}
```
