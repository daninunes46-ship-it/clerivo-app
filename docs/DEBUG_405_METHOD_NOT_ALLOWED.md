# 🐛 Diagnostic Erreur 405 (Method Not Allowed)

## Problème
L'upload de document échoue avec une erreur 405 "Method Not Allowed".

## Cause probable
L'URL d'upload est mal construite, souvent `/api/candidates/undefined/documents`, ce qui signifie que l'ID du candidat n'est pas correctement transmis.

## Solutions appliquées

### 1. ✅ Sécurisation de `handleFileUpload` (`CandidateDetailPage.jsx`)

```javascript
// 🛡️ SÉCURITÉ : Vérifier que l'ID candidat existe
console.log('🔍 ID Candidat:', id);
console.log('🔍 Type ID:', typeof id, 'Valeur:', id);

if (!id || id === 'undefined' || id === 'null') {
  toast.error("Erreur: ID candidat introuvable", {
    description: "Impossible d'uploader sans ID candidat valide"
  });
  console.error('❌ ID candidat manquant ou invalide:', id);
  return;
}

// Construction de l'URL en relatif (proxy Vite)
const uploadUrl = `/api/candidates/${id}/documents`;

console.log('🎯 URL Cible:', uploadUrl);
```

**Protection ajoutée :**
- ✅ Validation de l'ID avant toute opération
- ✅ Blocage si ID manquant ou invalide
- ✅ Log détaillé de l'ID et de l'URL
- ✅ Toast d'erreur explicite pour l'utilisateur

### 2. ✅ Debug au chargement du composant

```javascript
// 🔍 Debug: Log de l'ID au chargement
useEffect(() => {
  console.log('🆔 CandidateDetailPage - ID depuis URL:', id);
  console.log('🆔 Type:', typeof id, '| Valide:', !!id && id !== 'undefined');
}, [id]);

// Charger les données du candidat
useEffect(() => {
  if (id && id !== 'undefined') {
    fetchCandidate();
  } else {
    console.error('❌ ID invalide, impossible de charger le candidat');
    setError('ID candidat invalide');
    setLoading(false);
  }
}, [id]);
```

**Protection ajoutée :**
- ✅ Log de l'ID dès le chargement du composant
- ✅ Validation avant le fetch du candidat
- ✅ Affichage d'erreur si ID invalide

### 3. ✅ Sécurisation du clic sur la carte (`CandidateCard.jsx`)

```javascript
onClick={() => {
  console.log('🔗 Navigation vers candidat:', candidate.id);
  if (!candidate.id) {
    console.error('❌ ID candidat manquant dans la carte');
    return;
  }
  navigate(`/candidates/${candidate.id}`);
}}
```

**Protection ajoutée :**
- ✅ Log de l'ID avant navigation
- ✅ Blocage de navigation si ID manquant
- ✅ Message d'erreur console

## 📊 Flow de Debugging

### 1. Depuis le Pipeline
```
Pipeline → Clic sur carte candidat
  └─> Log: "🔗 Navigation vers candidat: demo-1"
  └─> Navigate: /candidates/demo-1
```

### 2. Chargement CandidateDetailPage
```
CandidateDetailPage mount
  └─> Log: "🆔 CandidateDetailPage - ID depuis URL: demo-1"
  └─> Log: "🆔 Type: string | Valide: true"
  └─> fetchCandidate()
```

### 3. Upload de document
```
Drag & Drop PDF
  └─> Log: "🔍 ID Candidat: demo-1"
  └─> Log: "🔍 Type ID: string Valeur: demo-1"
  └─> Log: "🎯 URL Cible: /api/candidates/demo-1/documents"
  └─> Log: "📦 FormData créé, envoi en cours..."
  └─> Log: "📊 Response Status: 201 Created"
```

## 🔍 Checklist de Diagnostic

### Si erreur 405

1. **Vérifier les logs console (F12)** :
   ```
   🔗 Navigation vers candidat: ???
   🆔 CandidateDetailPage - ID depuis URL: ???
   🔍 ID Candidat: ???
   🎯 URL Cible: ???
   ```

2. **Identifier le problème** :
   - ❌ `undefined` → L'ID n'est pas dans l'URL ou les données API
   - ❌ `null` → Le candidat n'existe pas dans la DB
   - ❌ `"demo-1"` mais 405 → Problème backend (route ou CORS)

3. **Solutions selon le cas** :

   **A. ID = undefined depuis Pipeline**
   ```javascript
   // Vérifier que candidate.id existe dans la réponse API
   console.log('Candidat:', candidate);
   console.log('ID:', candidate.id);
   ```
   → Fix: S'assurer que l'API `/api/candidates` renvoie bien `id` pour chaque candidat

   **B. ID = undefined au chargement de la page**
   ```javascript
   // Vérifier l'URL dans la barre d'adresse
   console.log('URL:', window.location.pathname);
   // Devrait être: /candidates/demo-1
   ```
   → Fix: Vérifier la route React Router dans `App.jsx`

   **C. ID valide mais 405**
   ```javascript
   // Vérifier l'URL construite
   console.log('🎯 URL Cible:', uploadUrl);
   // Devrait être: /api/candidates/demo-1/documents
   ```
   → Fix: Vérifier la route backend dans `routes/candidates.js`

## 🧪 Test manuel

### 1. Depuis le Pipeline
1. Ouvrir la console (F12)
2. Cliquer sur une carte candidat
3. Vérifier les logs :
   ```
   ✅ "🔗 Navigation vers candidat: demo-1"
   ✅ "🆔 CandidateDetailPage - ID depuis URL: demo-1"
   ✅ "🆔 Type: string | Valide: true"
   ```

### 2. Upload de document
1. Glisser-déposer un PDF
2. Vérifier les logs :
   ```
   ✅ "🔍 ID Candidat: demo-1"
   ✅ "🎯 URL Cible: /api/candidates/demo-1/documents"
   ✅ "📊 Response Status: 201 Created"
   ```

### 3. Si erreur
```
❌ "🔍 ID Candidat: undefined"
❌ Toast: "Erreur: ID candidat introuvable"
→ L'upload est bloqué AVANT l'appel API (protection activée)
```

## 🔧 Commandes de test

### Backend
```bash
cd apps/backend
npm start
# Vérifier: "✅ Candidate routes mounted (including upload endpoint)"
```

### Frontend
```bash
cd apps/frontend
npm run dev
# Vérifier: "Local: http://localhost:5173"
```

### Tunnel
```bash
cloudflared tunnel --url http://localhost:5173
# Copier l'URL générée
```

### Test API direct (curl)
```bash
# Vérifier que la route existe
curl -X POST http://localhost:3000/api/candidates/demo-1/documents
# Devrait renvoyer: {"success":false,"message":"Aucun fichier uploadé"}
# (pas 404 ou 405)
```

## 📝 Notes

- L'erreur 405 signifie "Method Not Allowed"
- Causes possibles :
  1. URL mal construite (`/undefined/documents`)
  2. Route backend manquante
  3. Méthode HTTP incorrecte (GET au lieu de POST)
- La protection ajoutée empêche les appels avec ID invalide
- Les logs permettent d'identifier exactement où le problème se produit

## 🚀 Prochaines étapes si le problème persiste

1. Vérifier la réponse API `/api/candidates` :
   ```javascript
   fetch('/api/candidates')
     .then(r => r.json())
     .then(data => console.log('Candidats:', data));
   ```

2. Vérifier que chaque candidat a un `id` :
   ```javascript
   data.data.forEach(c => {
     if (!c.id) console.error('Candidat sans ID:', c);
   });
   ```

3. Vérifier la route backend :
   ```bash
   grep -r "router.post.*documents" apps/backend/src/routes/
   # Devrait afficher: router.post('/:id/documents', ...)
   ```
