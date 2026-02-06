# 🐛 Guide de Debugging Upload (Tunnel Cloudflare)

## Problème résolu
"Unexpected end of JSON input" lors de l'upload de fichiers depuis mobile via tunnel.

## Solutions appliquées

### 1. ✅ BACKEND - CORS Permissif (`apps/backend/src/server.js`)

```javascript
const corsOptions = {
  origin: true, // Accepte toutes les origines en développement
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24h cache preflight
};

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pour multipart/form-data
```

**Pourquoi :**
- `origin: true` permet les requêtes depuis le tunnel Cloudflare
- `crossOriginResourcePolicy: cross-origin` permet les uploads cross-origin
- `express.urlencoded({ extended: true })` supporte multipart/form-data

### 2. ✅ FRONTEND - Debugging robuste (`CandidateDetailPage.jsx`)

```javascript
// Logs détaillés avant upload
console.log('📤 Upload:', {
  name: file.name,
  type: file.type,
  size: `${(file.size / 1024).toFixed(1)}KB`,
  url: `${API_URL}/api/candidates/${id}/documents`
});

// Gestion robuste de la réponse
const contentType = response.headers.get('content-type');

if (contentType && contentType.includes('application/json')) {
  data = await response.json();
} else {
  // Réponse non-JSON (HTML d'erreur)
  const textResponse = await response.text();
  console.error('❌ Réponse non-JSON:', textResponse);
  throw new Error(`Erreur serveur (${response.status}): ${textResponse.substring(0, 100)}`);
}
```

**Pourquoi :**
- Détecte si la réponse est JSON ou HTML
- Affiche le contenu HTML en cas d'erreur serveur
- Empêche l'erreur "Unexpected end of JSON input"

### 3. ✅ BACKEND - Logs détaillés (Controller + Middleware)

#### Controller (`candidateController.js`)
```javascript
console.log('📤 Upload Request:', {
  candidateId: id,
  hasFile: !!req.file,
  body: req.body
});

console.log('📄 Fichier reçu:', {
  originalname: req.file.originalname,
  mimetype: req.file.mimetype,
  size: `${(req.file.size / 1024).toFixed(1)}KB`
});
```

#### Middleware Multer (`upload.js`)
```javascript
const uploadWithLogging = (fieldName) => {
  return (req, res, next) => {
    console.log(`📥 Multer middleware activé pour: ${fieldName}`);
    
    multerMiddleware(req, res, (err) => {
      if (err) {
        console.error('❌ Erreur Multer:', err.message);
        return res.status(400).json({
          success: false,
          message: `Erreur d'upload: ${err.message}`
        });
      }
      
      if (req.file) {
        console.log('✅ Fichier reçu par Multer:', req.file.originalname);
      }
      
      next();
    });
  };
};
```

## 📊 Flow d'upload avec logs

### Côté Frontend
```
1. 📤 Upload: { name, type, size, url }
2. 📊 Response Status: 201 Created
3. 📋 Response Headers: { contentType, contentLength }
4. ✅ Upload réussi: { document data }
```

### Côté Backend
```
1. 📥 Multer middleware activé pour: file
2. ✅ Fichier reçu par Multer: extrait-poursuites.pdf
3. 📤 Upload Request: { candidateId, hasFile: true }
4. 📄 Fichier reçu: { originalname, mimetype, size }
5. ✅ Candidat trouvé: Jean Dupont
6. 💾 Création du document dans la base...
7. ✅ Document créé dans la DB: doc-123
8. 🎉 Upload complet: extrait-poursuites.pdf pour Jean Dupont
```

## 🧪 Test depuis mobile

### 1. Lancer le frontend avec proxy
```bash
cd apps/frontend
npm run dev
```

### 2. Lancer le backend
```bash
cd apps/backend
npm start
```

### 3. Créer le tunnel
```bash
cloudflared tunnel --url http://localhost:5173
```

### 4. Ouvrir depuis le mobile
- URL générée: `https://abc123.trycloudflare.com`
- Naviguer vers Pipeline → Fiche Candidat
- Glisser-déposer un PDF
- Vérifier les logs dans le terminal backend

## ⚠️ Erreurs courantes

### "Unexpected end of JSON input"
**Cause:** Le backend renvoie du HTML au lieu de JSON
**Solution:** Vérifier les logs backend, le middleware CORS est activé

### "Failed to fetch"
**Cause:** Le proxy Vite n'est pas configuré
**Solution:** Vérifier `vite.config.js` → `server.proxy['/api']`

### "Aucun fichier uploadé"
**Cause:** Multer ne reçoit pas le fichier
**Solution:** Vérifier que le FormData contient bien le champ 'file'

### "Candidat non trouvé"
**Cause:** ID candidat invalide ou inexistant
**Solution:** Vérifier que l'ID dans l'URL est correct

## 🔍 Debug checklist

- [ ] Backend démarre sans erreur
- [ ] Logs "✅ Candidate routes mounted"
- [ ] CORS configuré avec `origin: true`
- [ ] Proxy Vite configuré dans `vite.config.js`
- [ ] API_URL en relatif (`const API_URL = '';`)
- [ ] Tunnel Cloudflare actif
- [ ] Console browser ouverte (F12)
- [ ] Terminal backend visible pour les logs

## 📝 Notes production

En production, remplacer :
```javascript
// DEV
const corsOptions = {
  origin: true // Accepte tout
};

// PROD
const corsOptions = {
  origin: ['https://clerivo.ch', 'https://www.clerivo.ch'],
  credentials: true
};
```
