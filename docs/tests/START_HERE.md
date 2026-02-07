# ▶️ COMMENCEZ ICI - TEST EMAIL DEEP CORE

**Temps total requis : 15 minutes**

---

## 🎯 VOUS ÊTES...

### 👔 Product Owner / Décideur
**→ Lisez ceci en 3 minutes :**

1. **Objectif :** Valider que le "cerveau" de Clerivo (l'IA qui lit les emails) fonctionne
2. **Action :** Envoyer UN email de test et vérifier qu'il est bien analysé
3. **Décision :** Si ça marche → on continue le développement

**Ouvrez :** `EXEC_SUMMARY.md` (5 minutes de lecture)

---

### 👨‍💻 Développeur / Testeur
**→ Exécutez le test maintenant :**

```bash
# Étape 1 : Vérification (30 secondes)
cd /home/clerivo2/projects/clerivo/docs/tests
./verify-test-results.sh

# Si score ≥ 70% → Continuez

# Étape 2 : Lisez le guide rapide
cat GUIDE_RAPIDE_TEST.md
# OU ouvrez-le dans votre éditeur

# Étape 3 : Suivez les 3 étapes du guide
# (Envoyer email + Vérifier résultats)

# Étape 4 : Remplissez la checklist
cat CHECKLIST_VISUELLE.md
```

**Documentation complète :** `README_TEST_DEEP_CORE.md`

---

## 📧 EN BREF : CE QU'IL FAUT FAIRE

### 1. Envoyer un email
- **À :** `clerivotest@gmail.com`
- **Sujet + Corps :** Copier depuis `GUIDE_RAPIDE_TEST.md`
- **Pièces jointes :** 3 PDFs dans le dossier `test-attachments/`

### 2. Ouvrir Clerivo
- **URL :** `http://localhost:5173/inbox`
- **Attendre :** 60 secondes max
- **Vérifier :** Email "Sophie Martinez" apparaît

### 3. Cliquer sur l'email
- **Vérifier :** 3 pièces jointes visibles
- **Attendre :** 5 secondes (analyse IA)
- **Vérifier :** Catégorie "Locataire", Priorité "Haute", Téléphone "+41 79 456 78 90"

### 4. Calculer le score
- **Utilisez :** `CHECKLIST_VISUELLE.md`
- **Score cible :** ≥ 20/28 (71%)

---

## ✅ RÉSULTAT ATTENDU

Si tout fonctionne, vous verrez :

```
┌─────────────────────────────────────────────────────┐
│ Email : Sophie Martinez                              │
│ Sujet : Demande urgente : Visite appartement...     │
│ 📎 3 pièces jointes                                 │
│                                                      │
│ 🤖 ANALYSE IA :                                      │
│   • Catégorie : Locataire                           │
│   • Priorité : Haute                                │
│   • Téléphone : +41 79 456 78 90                    │
│   • Budget : 2'400 CHF                              │
│   • Lieu : Lausanne                                 │
│   • Résumé : Couple salarié cherche 3.5p...         │
└─────────────────────────────────────────────────────┘
```

**Si vous voyez ça → Le système nerveux de Clerivo fonctionne ! ✅**

---

## 🆘 PROBLÈME ?

### Email n'arrive pas
```bash
# Vérifiez les logs
tail -f ../../apps/backend/logs/app.log

# Vérifiez que le backend tourne
curl http://localhost:3010/health
```

### Analyse IA ne fonctionne pas
```bash
# Vérifiez la clé OpenAI
cat ../../apps/backend/.env | grep OPENAI_API_KEY
```

### Score < 20/28
→ Consultez `TROUBLESHOOTING` dans `README_TEST_DEEP_CORE.md`

---

## 📚 TOUS LES DOCUMENTS DISPONIBLES

```
docs/tests/
├── START_HERE.md              ← VOUS ÊTES ICI
├── INDEX.md                   ← Table des matières complète
├── EXEC_SUMMARY.md            ← Résumé pour décideurs (5 min)
├── GUIDE_RAPIDE_TEST.md       ← Mode d'emploi rapide (3 min)
├── CHECKLIST_VISUELLE.md      ← Grille de validation
├── README_TEST_DEEP_CORE.md   ← Hub central (10 min)
├── TEST_EMAIL_DEEP_CORE_V1.md ← Spécifications complètes (30 min)
├── verify-test-results.sh     ← Script de vérification
└── test-attachments/          ← 3 fichiers PDF prêts
```

---

## ⏱️ TEMPS TOTAL PAR RÔLE

| Rôle | Lecture | Exécution | Total |
|------|---------|-----------|-------|
| **Product Owner** | 5 min | 10 min | **15 min** |
| **Développeur** | 10 min | 15 min | **25 min** |
| **QA Testeur** | 15 min | 30 min | **45 min** |

---

## 🚀 ACTION IMMÉDIATE

**Choisissez UN fichier selon votre besoin :**

- 🎯 **Je veux juste tester rapidement** → `GUIDE_RAPIDE_TEST.md`
- 📊 **Je veux décider si on continue** → `EXEC_SUMMARY.md`
- 📚 **Je veux tout comprendre** → `README_TEST_DEEP_CORE.md`
- ✅ **Je veux une checklist simple** → `CHECKLIST_VISUELLE.md`
- 📖 **Je veux voir tous les docs** → `INDEX.md`

---

**Version :** 1.0  
**Date :** 2026-02-06  
**Créé par :** Elodie (Experte QA Clerivo)

🧠⚡ **C'EST LE TEST LE PLUS IMPORTANT DE LA V1. FONCEZ !**
