# 🧠 TEST EMAIL DEEP CORE - PACK COMPLET

**Date :** 2026-02-06  
**Créé par :** Elodie (Experte QA Clerivo)  
**Status :** ✅ PRÊT POUR EXÉCUTION

---

## 📦 CONTENU DU PACK

Ce dossier contient TOUT ce dont vous avez besoin pour tester le "Système Nerveux" de Clerivo.

### 📄 Fichiers disponibles

| Fichier | Description | Utilisation |
|---------|-------------|-------------|
| **GUIDE_RAPIDE_TEST.md** | 🚀 Guide ultra-rapide (3 min) | **COMMENCEZ ICI** |
| **TEST_EMAIL_DEEP_CORE_V1.md** | 📖 Documentation complète (technique) | Référence détaillée |
| **verify-test-results.sh** | 🔍 Script de vérification automatique | `./verify-test-results.sh` |
| **generate-test-attachments.sh** | 📎 Générateur de pièces jointes | Déjà exécuté ✅ |
| **test-attachments/** | 📁 3 fichiers PDF de test | Prêts à attacher |

---

## ⚡ DÉMARRAGE RAPIDE (3 MINUTES)

### 1️⃣ Vérifier que tout est prêt

```bash
cd /home/clerivo2/projects/clerivo/docs/tests
./verify-test-results.sh
```

**✅ Si score ≥ 70% → Continuez**  
**❌ Si score < 70% → Corrigez les erreurs affichées**

---

### 2️⃣ Envoyer l'email de test

**A. Ouvrez votre client email** (Gmail, Outlook, etc.)

**B. Créez un nouveau message :**
- **À :** `clerivotest@gmail.com`
- **Sujet :** (copier depuis `GUIDE_RAPIDE_TEST.md`)
- **Corps :** (copier depuis `GUIDE_RAPIDE_TEST.md`)

**C. Attachez les 3 fichiers PDF :**
```bash
/home/clerivo2/projects/clerivo/docs/tests/test-attachments/
├── Fiche_Salaire_Sophie_Janv2026.pdf
├── Extrait_Poursuites_Sophie_28Jan2026.pdf
└── Attestation_RC_Couple.pdf
```

**D. ENVOYEZ ! 🚀**

---

### 3️⃣ Surveiller les résultats (dans les 60 secondes)

#### Terminal Backend
```bash
# Surveillez les logs en temps réel
cd /home/clerivo2/projects/clerivo/apps/backend
npm run dev
```

**Cherchez :**
```
✅ Connecté au serveur IMAP !
📎 Extraction des métadonnées des pièces jointes
AI Analysis Called for email ID: [XXX]
```

#### Interface Clerivo
```bash
# Ouvrez dans votre navigateur
http://localhost:5173/inbox
```

**Vérifiez :**
1. Email "Sophie Martinez" en haut de la liste
2. Icône 📎 (3 pièces jointes)
3. Badge "Haute priorité" (si IA déclenchée)
4. Cliquez → Analyse IA complète affichée

---

## 🎯 CE QUE CE TEST VALIDE

### ✅ Fonctionnalités Deep Core testées

#### 1. **Ingestion IMAP** (Plan de Bataille 3)
- Connexion sécurisée Gmail
- Récupération emails < 60s
- Threading conversations
- Flags "Non lu" synchronisés

#### 2. **Sécurité (Bouclier)** (Plan de Bataille 3)
- HTML sanitisé (DOMPurify)
- Détection IBAN : `CH93 0076 2011 6238 5295 7`
- Extraction pièces jointes sécurisée
- Checksum MD5 pour unicité

#### 3. **Intelligence IA** (Neural Inbox)
- Classification automatique : "Locataire"
- Détection priorité : "Haute" (urgence samedi)
- Extraction entités :
  - Nom : "Sophie Martinez & Marc Dubois"
  - Téléphone : "+41 79 456 78 90"
  - Budget : "2'400 CHF"
  - Lieu : "Lausanne"
  - Intention : "Visite + Questions + Dossier"
- Résumé en 1-2 phrases
- Analyse sentiment : Positif avec anxiété

#### 4. **Gestion Pièces Jointes**
- Détection 3 fichiers
- Métadonnées (nom, taille, type MIME)
- Pré-classification types :
  - Fiche de salaire
  - Extrait poursuites
  - Attestation RC

#### 5. **Expérience Utilisateur**
- Interface fluide (pas de freeze)
- Skeleton loader pendant analyse
- SmartBadges affichés
- Brouillon IA fonctionnel

---

## 📊 SCORECARD DE TEST

Remplissez après le test :

### NIVEAU 1 : INGESTION (Critical) - Score : __ / 4
- [ ] Email reçu < 60 secondes
- [ ] Sujet, expéditeur, corps corrects
- [ ] 3 pièces jointes détectées
- [ ] Aucune erreur backend

### NIVEAU 2 : SÉCURITÉ (Critical) - Score : __ / 3
- [ ] HTML sanitisé (pas de `<script>`)
- [ ] IBAN détecté : CH93...
- [ ] Pièces jointes checksumées

### NIVEAU 3 : INTELLIGENCE IA (High) - Score : __ / 6
- [ ] Classification = "Locataire"
- [ ] Priorité = "Haute"
- [ ] Téléphone extrait : +41 79 456 78 90
- [ ] Budget extrait : 2400 CHF
- [ ] Lieu extrait : Lausanne
- [ ] Résumé cohérent

### NIVEAU 4 : UX (Medium) - Score : __ / 4
- [ ] UI fluide, pas de crash
- [ ] Skeleton loader visible
- [ ] Badges affichés
- [ ] Brouillon IA fonctionnel

---

## 🏆 INTERPRÉTATION DES RÉSULTATS

| Score Total | Status | Action |
|-------------|--------|--------|
| **17/17** | 🎉 PARFAIT | Système nerveux 100% opérationnel ! |
| **14-16** | ✅ EXCELLENT | Validé pour V1, corrections mineures |
| **10-13** | ⚠️ ACCEPTABLE | Système utilisable, optimisations nécessaires |
| **< 10** | ❌ CRITIQUE | Corrections majeures requises |

---

## 📈 PROCHAINES ÉTAPES (si test réussi)

### Phase 1 : Optimisations Deep Core
1. Améliorer précision extraction entités
2. Ajouter détection multilingue (DE)
3. Implémenter alerte IBAN fraude
4. Optimiser temps d'analyse IA (< 3s)

### Phase 2 : Intégration Pipeline
5. Auto-création candidat depuis email
6. Auto-rattachement bien (si ref détectée)
7. Génération tâches automatiques
8. Timeline de vérité unifiée

### Phase 3 : Collaboration
9. Commentaires internes (Whispers)
10. Assignation automatique par règles
11. Smart Drafts contextuels
12. Command Palette (Cmd+K)

---

## 🐛 TROUBLESHOOTING

### Problème : Score < 10/17

**1. Backend ne démarre pas :**
```bash
cd /home/clerivo2/projects/clerivo/apps/backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**2. IMAP timeout :**
```bash
# Vérifiez les credentials
cat /home/clerivo2/projects/clerivo/apps/backend/.env | grep IMAP
```

**3. OpenAI erreur :**
```bash
# Testez la clé API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $(grep OPENAI_API_KEY /home/clerivo2/projects/clerivo/apps/backend/.env | cut -d'=' -f2)"
```

**4. Cache IA vide :**
```bash
# Créez le dossier manuellement
mkdir -p /home/clerivo2/projects/clerivo/data/storage
echo '{}' > /home/clerivo2/projects/clerivo/data/storage/ai_metadata.json
```

---

## 📞 SUPPORT

### Documentation complète
- **CDC Master :** `/docs/cdc/CDC_Clerivo_Master_FINAL_v1.1.1.md`
- **Plan Deep Core :** `/docs/plans/Plan de Bataille 3_ Messagerie Clerivo 2.0.MD`

### Logs à consulter
```bash
# Backend
tail -f /home/clerivo2/projects/clerivo/apps/backend/logs/app.log

# Frontend (console navigateur)
Ouvrez : http://localhost:5173/inbox
Appuyez sur F12 → Console
```

### Contact
**Créé par :** Elodie (Experte QA Clerivo)  
**Référence CDC :** Section 6.1 - Messagerie 2.0 Portier de Nuit  
**Plan de Bataille :** PB3 - Deep Core Neural Inbox

---

## 🎬 CONCLUSION

Ce test est le **plus important** de la V1 de Clerivo.

**Pourquoi ?**
- La messagerie est le **point d'entrée** de tous les flux
- L'IA doit être **fiable à 95%+** pour générer confiance
- Les **pièces jointes** sont critiques (documents sensibles)
- La **sécurité** (IBAN, HTML) est non-négociable

**Si ce test réussit (≥ 14/17) :**
→ Le "Système Nerveux" de Clerivo est **accroché** 🧠⚡  
→ Vous pouvez passer aux modules suivants (Pipeline, Swiss Safe)  
→ L'architecture Deep Core est **validée**

**Si ce test échoue (< 10/17) :**
→ STOP immédiatement  
→ Analysez les logs en détail  
→ Corrigez avant d'avancer

---

**Date de création :** 2026-02-06  
**Version :** 1.0  
**Status :** ✅ PRÊT POUR EXÉCUTION

🚀 **BON TEST, ET QUE LE DEEP CORE SOIT AVEC VOUS !** 🧠⚡
