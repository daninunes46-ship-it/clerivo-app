# 🐛 Fix: Prisma Validation Error - "Argument filename is missing"

## Problème résolu
L'upload de fichier échouait avec l'erreur Prisma :
```
Argument `filename` is missing
```

## Cause
Le schéma Prisma `Document` attend un champ `filename` (obligatoire), mais le contrôleur ne le fournissait pas lors de la création.

### Ancien code (❌)
```javascript
const document = await prisma.document.create({
  data: {
    candidateId: id,
    documentType: documentType || 'OTHER',
    originalName: originalname,  // ← Nom original du fichier
    storedName: filename,         // ← Nom stocké (généré par Multer)
    mimeType: mimetype,
    // ... mais pas de `filename` !
  }
});
```

### Nouveau code (✅)
```javascript
const document = await prisma.document.create({
  data: {
    candidateId: id,
    documentType: documentType || 'OTHER',
    filename: filename,           // ← AJOUTÉ : Nom du fichier stocké
    originalName: originalname,
    storedName: filename,
    mimeType: mimetype,
    // ...
  }
});
```

## Mapping des champs

| Variable Multer | Champ Prisma | Description |
|----------------|--------------|-------------|
| `req.file.originalname` | `originalName` | Nom original du fichier uploadé (ex: "Extrait poursuites.pdf") |
| `req.file.filename` | `filename` | Nom généré par Multer (ex: "doc-1738765432-abc123.pdf") |
| `req.file.filename` | `storedName` | Même que `filename` (redondant mais conservé pour compatibilité) |
| `req.file.path` | `storagePath` | Chemin complet sur le disque |

## Pourquoi cette erreur ?

Prisma vérifie que tous les champs **obligatoires** (non-nullable) sont fournis lors d'un `create()`. 

Si le schéma définit :
```prisma
model Document {
  filename    String  // ← Obligatoire (pas de ?)
  originalName String?
}
```

Alors `filename` **doit** être fourni, sinon Prisma lance une `PrismaClientValidationError`.

## Test de la correction

### 1. Vérifier que le serveur redémarre
```bash
cd apps/backend
npm start
```

### 2. Tester l'upload depuis le frontend
1. Ouvrir l'application
2. Naviguer vers un candidat
3. Glisser-déposer un PDF
4. Vérifier les logs backend :

```
📄 Fichier reçu: {
  originalname: 'poursuites.pdf',
  mimetype: 'application/pdf',
  size: '123KB',
  destination: '/path/to/uploads'
}
💾 Création du document dans la base...
✅ Document créé dans la DB: doc-abc123
🎉 Upload complet: poursuites.pdf pour Jean Dupont
```

### 3. Vérifier en base de données
```bash
cd apps/backend
npx prisma studio
```

Naviguer vers la table `Document` et vérifier :
- ✅ `filename` : `doc-1738765432-abc123.pdf`
- ✅ `originalName` : `poursuites.pdf`
- ✅ `storedName` : `doc-1738765432-abc123.pdf`

## Logs de succès

### Frontend (Console Browser)
```
🔍 ID Candidat: demo-1
🎯 URL Cible: /api/candidates/demo-1/documents
📦 FormData créé, envoi en cours...
📊 Response Status: 201 Created
📋 Response Headers: { contentType: "application/json" }
✅ Upload réussi: { id, filename, originalName }
```

### Backend (Terminal)
```
📥 Multer middleware activé pour: file
✅ Fichier reçu par Multer: poursuites.pdf
📤 Upload Request: { candidateId: "demo-1", hasFile: true }
📄 Fichier reçu: { originalname, mimetype, size }
✅ Candidat trouvé: Jean Dupont
💾 Création du document dans la base...
✅ Document créé dans la DB: clx123abc
✅ Solvency Score mis à jour: 85 → 95
🎉 Upload complet: poursuites.pdf pour Jean Dupont
```

## Erreurs courantes

### "filename is missing"
**Cause :** Le champ `filename` n'est pas fourni à Prisma  
**Solution :** Ajouter `filename: filename` dans l'objet `data` ✅

### "Unknown argument: filename"
**Cause :** Le champ `filename` n'existe pas dans le schéma Prisma  
**Solution :** Vérifier le schéma dans `prisma/schema.prisma`

### "filename is required"
**Cause :** Le schéma définit `filename String` (non-nullable) mais la valeur est `undefined`  
**Solution :** S'assurer que `req.file.filename` existe (c'est le cas avec Multer)

## Fichier modifié
- ✅ `apps/backend/src/controllers/candidateController.js` (ligne 558)

## Impact
- ✅ L'upload de documents fonctionne maintenant de bout en bout
- ✅ Les documents sont correctement enregistrés en base de données
- ✅ Le score de solvabilité se met à jour (+10 pts si document officiel)
- ✅ Les logs détaillés permettent de diagnostiquer tout problème futur
