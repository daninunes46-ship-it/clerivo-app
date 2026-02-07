# 🚀 GUIDE DE DÉPLOIEMENT - Corrections Clerivo

## ✅ CE QUI A ÉTÉ FAIT

### 📦 Commit Créé et Poussé
- **Commit ID:** `5746696`
- **Message:** "feat: Menu Action avec suppression + Fix parsing revenu suisse"
- **Statut Git:** ✅ Poussé vers `origin/main`

### 🔧 Modifications Incluses

**Frontend (`apps/frontend/`):**
- ✅ `src/pages/CandidateDetailPage.jsx` - Menu déroulant "Actions" avec suppression
- ✅ `src/components/EmailAnalysisCard.jsx` - Parsing revenu suisse amélioré

**Backend (`apps/backend/`):**
- ✅ `src/controllers/candidateController.js` - Suppression atomique + validation assouplie
- ✅ `src/controllers/adminController.js` - Routes de diagnostic
- ✅ `src/routes/admin.js` - Routes admin
- ✅ `src/server.js` - Montage routes admin

---

## 🔄 DÉPLOIEMENT AUTOMATIQUE VERCEL

Vercel va automatiquement détecter le nouveau commit et redéployer le Frontend.

### Vérifier le déploiement :

1. **Ouvrir le Dashboard Vercel**
   - URL: https://vercel.com/votre-projet/deployments
   
2. **Attendre le build** (2-3 minutes)
   - Status: "Building..." → "Ready"
   
3. **Tester sur `https://clerivo.ch` ou `https://www.clerivo.ch`**

---

## 🧪 TESTS À EFFECTUER

### ✅ Test 1 : Bouton Action sur Fiche Candidat

**Sur `https://app.clerivo.ch/candidates/94c0015b-3398-458f-af99-aeb4cdbba090`**

1. Cliquez sur le bouton **"Actions"** (en haut à droite)
2. **Résultat attendu :** Menu déroulant s'affiche avec :
   - 🗑️ "Supprimer le candidat" (rouge)
   - ⏰ "Archiver (V1.1)" (grisé)
   - 📄 "Exporter PDF (V1.1)" (grisé)

3. Cliquez sur **"Supprimer le candidat"**
4. **Résultat attendu :** Boîte de dialogue de confirmation
5. Cliquez **"Annuler"** → Menu se ferme
6. Re-cliquez "Actions" → "Supprimer" → **"OK"**
7. **Résultat attendu :**
   - Toast vert : "Candidat supprimé avec succès"
   - Redirection automatique vers `/pipeline`
   - Le candidat n'apparaît plus dans le Pipeline

### ✅ Test 2 : Ajout depuis Inbox

**Sur `https://www.clerivo.ch/inbox`**

1. Sélectionnez un email (ex: email de Kelvo Suisse)
2. Attendez l'analyse IA (panneau "Neural Inbox")
3. Cliquez sur **"Ajouter au Pipeline"**
4. **Résultat attendu :**
   - Toast vert : "✅ Candidat ajouté au Pipeline !"
   - Le bouton devient vert "Déjà ajouté"

5. Allez dans `/pipeline`
6. **Résultat attendu :** Le nouveau candidat apparaît dans la colonne "Nouveaux"

### ✅ Test 3 : Parsing Revenu Suisse

**Avec un email contenant "7'500 CHF"**

1. Ouvrir la **Console du navigateur** (F12)
2. Cliquer "Ajouter au Pipeline"
3. **Dans les logs, chercher :**
   ```
   🔍 Scanning income sources: ["7'500 CHF"]
      📊 Analysing: "7'500 CHF"
      → Montant brut capturé: "7'500"
      → Montant nettoyé: "7500"
      → Montant converti: 7500 CHF
      ✅ REVENU VALIDÉ: 7500 CHF
   ```

4. Aller dans Pipeline → Cliquer sur la fiche candidat
5. **Vérifier :** "Revenu Mensuel: CHF 7'500.-"

---

## 🐛 SI ÇA NE FONCTIONNE PAS

### Problème : Le bouton "Actions" ne fait rien

**Cause probable :** Cache navigateur

**Solution :**
1. Videz le cache : `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
2. Ou ouvrez en navigation privée
3. Ou attendez 5 minutes que le CDN Vercel se propage

### Problème : Les candidats n'apparaissent pas dans Pipeline

**Cause probable :** Candidats orphelins (sans Application)

**Solution :**
```bash
curl https://app.clerivo.ch/api/admin/fix-pipeline
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "X candidat(s) orphelin(s) réparé(s)",
  "data": {
    "orphanedCount": 2,
    "fixedCount": 2,
    "fixed": [
      { "name": "Marc Dupuis", "email": "...", "applicationId": "..." },
      { "name": "Alice Martin", "email": "...", "applicationId": "..." }
    ]
  }
}
```

### Problème : Erreur 500 lors de la suppression

**Diagnostic :**
1. Ouvrir la Console (F12)
2. Regarder l'erreur complète
3. Si "Transaction timeout" → Le Backend Raspberry Pi est lent
4. Si "P2002" → Contrainte unique violée (bug)

**Solution temporaire :**
- Recharger la page et réessayer
- Vérifier les logs Backend : `pm2 logs clerivo-backend`

---

## 📊 STATISTIQUES ACTUELLES

```bash
curl http://localhost:3010/api/admin/stats
```

**Résultat actuel :**
```json
{
  "totalCandidates": 2,
  "totalApplications": 2,
  "orphanedCandidates": 0,
  "applicationsByStatus": [
    { "status": "NEW", "count": 2 }
  ]
}
```

✅ Tout est **sain** : 0 candidats orphelins !

---

## 🎯 ACTIONS IMMÉDIATES

1. **Attendre le déploiement Vercel** (2-3 min)
2. **Tester le bouton Actions** sur `app.clerivo.ch/candidates/...`
3. **Tester l'ajout depuis Inbox**
4. **Vérifier les logs console** (F12) pour diagnostiquer

---

## 📞 SI BESOIN D'AIDE

**Commandes de diagnostic :**

```bash
# Stats système
curl http://localhost:3010/api/admin/stats

# Réparer les orphelins
curl http://localhost:3010/api/admin/fix-pipeline

# Logs Backend
pm2 logs clerivo-backend --lines 50

# Redémarrer Backend
pm2 restart clerivo-backend
```

**Logs Frontend :**
- Ouvrir Console navigateur (F12)
- Chercher les messages avec 🔍, 📊, ✅, ❌

---

**Tout est prêt ! Attendez le déploiement Vercel et testez. 🚀**
