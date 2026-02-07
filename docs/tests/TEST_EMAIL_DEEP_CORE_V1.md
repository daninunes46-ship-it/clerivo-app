# 🧪 TEST DEEP CORE - Email Complexe Multi-Intentions
**Date :** 2026-02-06  
**Objectif :** Valider le "Système Nerveux" de Clerivo (Messagerie 2.0)  
**Référence CDC :** Plan de Bataille 3 - Deep Core  

---

## 📧 CONTENU DE L'EMAIL À ENVOYER

### ✉️ Destinataire
```
À : clerivotest@gmail.com
```

### 📌 Sujet
```
Demande urgente : Visite appartement 3.5p Lausanne + Questions garantie
```

### 📝 Corps de l'email (copier-coller EXACTEMENT)

```
Bonjour,

Je m'appelle Sophie Martinez et je vous contacte avec mon conjoint Marc Dubois concernant votre appartement de 3.5 pièces à Lausanne (ref: LAU-2024-089 si c'est bien celui près du métro).

NOTRE SITUATION :
- Nous sommes un couple, tous les deux salariés CDI
- Moi : Sophie, infirmière à l'Hôpital Cantonal, 6'800 CHF net/mois
- Mon conjoint Marc : ingénieur chez Nestlé, 8'200 CHF net/mois
- Revenu total : 15'000 CHF net/mois
- Nous cherchons pour début avril maximum

Notre budget est de 2'400 CHF charges comprises. Est-ce que votre bien correspond ?

QUESTIONS URGENTES :
1. Est-ce qu'une visite serait possible CE SAMEDI (8 février) vers 14h-16h ?
2. Les animaux sont-ils acceptés ? (Nous avons un chat)
3. Pour la garantie de loyer : on a déjà un compte bloqué chez PostFinance de 7'500 CHF. Est-ce suffisant ou faut-il l'adapter ?

DOCUMENTS PRÊTS :
Je peux vous envoyer dès maintenant :
- Nos 3 dernières fiches de salaire (en pièces jointes)
- Nos extraits du registre des poursuites (datés du 28 janvier 2026, donc tout récents)
- Nos permis de séjour (Permis C tous les deux)
- Attestation assurance RC ménage

Mon numéro direct : +41 79 456 78 90 (disponible 7j/7)
Email perso : sophie.martinez@example.ch

GARANT DISPONIBLE :
Si besoin, mon père peut se porter garant. Il est propriétaire à Vevey et touche une retraite confortable (AVS + 2ème pilier = 5'200 CHF/mois). Je peux fournir ses coordonnées.

IMPORTANT - Coordonnées bancaires :
Notre compte commun pour les virements : CH93 0076 2011 6238 5295 7 (UBS)

On est vraiment motivés et on peut signer rapidement ! Le dossier est complet et on cherche depuis 3 mois déjà. Merci de me répondre vite, j'ai peur que le bien parte...

Bien cordialement,
Sophie Martinez
(pour nous deux : Sophie & Marc)

P.S. : Si la visite samedi n'est pas possible, nous sommes aussi dispos dimanche matin ou mardi soir après 18h.
```

---

## 📎 PIÈCES JOINTES À CRÉER (Simulées)

### Fichier 1 : `Fiche_Salaire_Sophie_Janv2026.pdf`
**Contenu suggéré :** Créer un PDF fictif avec :
```
FICHE DE SALAIRE - Janvier 2026
Employée : Sophie MARTINEZ
Employeur : Hôpital Cantonal Vaudois
Salaire brut : 8'500 CHF
Déductions sociales : -1'700 CHF
Salaire net : 6'800 CHF
```
*(Ou utiliser un document texte renommé en .pdf pour le test)*

### Fichier 2 : `Extrait_Poursuites_Sophie_28Jan2026.pdf`
**Contenu suggéré :**
```
EXTRAIT DU REGISTRE DES POURSUITES
Canton de Vaud - Office des poursuites
Personne concernée : MARTINEZ Sophie
Date d'émission : 28 janvier 2026
Validité : 3 mois (jusqu'au 28 avril 2026)

RÉSULTAT : AUCUNE POURSUITE EN COURS
Attestation conforme à l'original.
```

### Fichier 3 : `Attestation_RC_Couple.pdf`
**Contenu suggéré :**
```
ATTESTATION ASSURANCE RESPONSABILITÉ CIVILE
Assureur : Helvetia Assurances
Assurés : Sophie MARTINEZ & Marc DUBOIS
Police n° : RC-2024-789456
Couverture : 5'000'000 CHF
Validité : 01.01.2024 - 31.12.2026
```

---

## 🚀 PROCÉDURE D'ENVOI

### Option 1 : Depuis votre email personnel (RECOMMANDÉ)
1. Ouvrez votre client email (Gmail, Outlook, etc.)
2. Créez un nouveau message
3. **À :** `clerivotest@gmail.com`
4. **Sujet :** Copier exactement le sujet ci-dessus
5. **Corps :** Copier-coller le contenu complet
6. **Pièces jointes :** Attacher les 3 fichiers PDF simulés
7. **ENVOI** 🚀

### Option 2 : Via un compte de test
Si vous avez un autre compte Gmail :
- Utilisez-le pour envoyer à `clerivotest@gmail.com`
- Cela simule mieux un vrai candidat externe

---

## 🔍 CE QUE VOUS DEVEZ SURVEILLER

### A) LOGS BACKEND (Terminal où tourne le serveur)

#### 1️⃣ **Ingestion IMAP** (dans les 60 secondes)
Surveillez ces lignes dans les logs :
```bash
📡 Tentative de connexion IMAP...
✅ Connecté au serveur !
📂 Ouverture de la boite INBOX...
✅ INBOX ouverte, recherche des messages...
```
**✅ SUCCESS :** Le message apparaît dans la liste récupérée  
**❌ FAIL :** Erreur de connexion ou timeout

#### 2️⃣ **Détection des pièces jointes**
Cherchez :
```bash
📎 Extraction des métadonnées des pièces jointes
```
**✅ SUCCESS :** 3 fichiers détectés avec checksum MD5  
**❌ FAIL :** Aucune pièce jointe ou erreur de parsing

#### 3️⃣ **Analyse IA** (quand vous ouvrez l'email dans l'UI)
Cherchez :
```bash
AI Analysis Called for email ID: [XXX]
```
**✅ SUCCESS :** L'IA retourne un JSON structuré  
**❌ FAIL :** Erreur OpenAI ou timeout

---

### B) FRONTEND (Interface Clerivo)

#### 1️⃣ **Liste Inbox** (`http://localhost:5173/inbox`)
**À vérifier :**
- ✅ L'email apparaît en haut de la liste
- ✅ Badge "Non lu" (point bleu)
- ✅ Icône trombone 📎 visible (3 pièces jointes)
- ✅ Snippet : "Bonjour, Je m'appelle Sophie Martinez..."
- ✅ Date du jour affichée

#### 2️⃣ **Vue détaillée de l'email**
**Cliquez sur l'email, puis vérifiez :**

**A. Affichage du contenu :**
- ✅ Sujet complet visible
- ✅ Expéditeur : votre email
- ✅ Corps de l'email formaté et lisible
- ✅ Aucun code HTML brut (sécurité DOMPurify)

**B. Section Pièces Jointes :**
- ✅ "3 pièces jointes" affiché
- ✅ Nom des fichiers corrects
- ✅ Taille en Ko affichée
- ✅ Type MIME (application/pdf)
- ✅ Message "Non téléchargeable en v1" visible

**C. Analyse IA (EmailAnalysisCard) :**
**Attendez 3-5 secondes que l'IA traite, puis vérifiez :**

```javascript
✅ Classification.category = "Locataire" (ou "Candidat")
✅ Classification.priority = "Haute" 
   (car urgence + visite samedi + dossier prêt)

✅ Sentiment = "Positif" 
   (motivation, courtoisie, mais légère anxiété "j'ai peur que le bien parte")

✅ Entities extraites :
   - client_name: "Sophie Martinez" ou "Sophie Martinez & Marc Dubois"
   - phone: "+41 79 456 78 90"
   - budget: "2400 CHF" ou "2'400 CHF charges comprises"
   - location: "Lausanne"
   - intent: "Demande de visite + questions garantie + dossier prêt"

✅ Summary: 
   "Couple salarié cherche 3.5p Lausanne, visite urgente samedi, 
    dossier complet avec garantie existante"
```

---

### C) BASE DE DONNÉES SQLite

#### 📂 Emplacement DB
```bash
/home/clerivo2/projects/clerivo/data/clerivo.db
```

#### 🔍 Requêtes SQL à exécuter

**1. Vérifier que l'email est dans le cache IA :**
```bash
# Via CLI SQLite
cd /home/clerivo2/projects/clerivo/data/storage
cat ai_metadata.json | jq .
```
**✅ SUCCESS :** Un objet JSON avec l'ID de l'email et l'analyse complète

**Alternative : Interface DB Browser**
Si vous avez DB Browser for SQLite, ouvrez `clerivo.db` et vérifiez :

**2. Table `Message` (si implémentée en V1) :**
```sql
SELECT 
  id, 
  subject, 
  from, 
  snippet, 
  hasIbanDetected, 
  detectedIntent, 
  urgencyLevel,
  sentimentScore
FROM Message
WHERE subject LIKE '%Visite appartement%'
ORDER BY receivedAt DESC
LIMIT 1;
```

**Résultats attendus :**
- ✅ `hasIbanDetected` = `true` (IBAN CH93... détecté)
- ✅ `detectedIntent` = "VISIT" ou "DOSSIER" 
- ✅ `urgencyLevel` = "HIGH" ou "CRITICAL"
- ✅ `sentimentScore` ≈ 0.6 à 0.8 (positif avec urgence)

**3. Table `Attachment` (si implémentée) :**
```sql
SELECT 
  filename, 
  mimeType, 
  size, 
  checksum,
  detectedType
FROM Attachment
WHERE messageId IN (
  SELECT id FROM Message 
  WHERE subject LIKE '%Visite appartement%'
)
ORDER BY filename;
```

**Résultats attendus :**
- ✅ 3 lignes retournées
- ✅ Noms de fichiers : 
  - `Fiche_Salaire_Sophie_Janv2026.pdf`
  - `Extrait_Poursuites_Sophie_28Jan2026.pdf`
  - `Attestation_RC_Couple.pdf`
- ✅ `detectedType` pré-classifié (optionnel V1) :
  - `SALARY_SLIP`
  - `PURSUITS_EXTRACT`
  - `LIABILITY_INSURANCE`

---

## 🎯 CRITÈRES DE RÉUSSITE GLOBAUX

### ✅ NIVEAU 1 : INGESTION (Critical)
- [ ] Email reçu dans Clerivo sous 60 secondes
- [ ] Sujet, expéditeur, corps affichés correctement
- [ ] 3 pièces jointes détectées et affichées
- [ ] Aucune erreur dans les logs backend

### ✅ NIVEAU 2 : SÉCURITÉ (Critical)
- [ ] HTML sanitisé (pas de balises `<script>`)
- [ ] IBAN détecté : `CH93 0076 2011 6238 5295 7`
- [ ] Alerte sécurité potentielle (si implémentée)

### ✅ NIVEAU 3 : INTELLIGENCE IA (High Priority)
- [ ] Classification = `Locataire` ou `Candidat`
- [ ] Priority = `Haute` (visite urgente samedi)
- [ ] Entities.phone = `+41 79 456 78 90`
- [ ] Entities.budget = `2400 CHF` (environ)
- [ ] Entities.location = `Lausanne`
- [ ] Summary cohérent en 1-2 phrases

### ✅ NIVEAU 4 : EXPÉRIENCE UTILISATEUR (Medium)
- [ ] Interface fluide (pas de freeze lors de l'analyse)
- [ ] Skeleton loader pendant analyse IA
- [ ] Badges SmartBadge affichés (catégorie, priorité)
- [ ] Bouton "Générer réponse IA" fonctionnel

### ✅ NIVEAU 5 : DONNÉES STRUCTURÉES (Nice to have V1)
- [ ] Détection type documents pièces jointes
- [ ] Pré-remplissage candidat (si pipeline activé)
- [ ] Création automatique Application (si flux complet)

---

## 🔥 CAS DE TEST AVANCÉS (si vous avez le temps)

### Test 2 : Email en ALLEMAND
Envoyez un email similaire en allemand pour tester la détection multilingue :
```
Betreff: Dringende Anfrage - Besichtigung 3.5 Zimmer Zürich

Guten Tag,

Ich heisse Thomas Müller und suche dringend...
```

### Test 3 : Email SPAM
Envoyez un email type arnaque :
```
Sujet: GAGNEZ 10'000 CHF MAINTENANT !!!

Félicitations ! Vous avez gagné...
Cliquez ici : http://suspicious-link.com
```
**Attendu :** Classification = "Spam" ou "Autre", Priority = "Basse"

### Test 4 : Email avec IBAN différent
Modifiez l'IBAN dans le corps et réenvoyez.
**Attendu :** Alerte fraude IBAN (si changement détecté)

---

## 📊 RAPPORT DE TEST

**À remplir après le test :**

| Critère | Statut | Notes |
|---------|--------|-------|
| Ingestion IMAP | ✅ / ❌ |  |
| Pièces jointes (3) | ✅ / ❌ |  |
| Analyse IA déclenchée | ✅ / ❌ |  |
| Classification correcte | ✅ / ❌ |  |
| Extraction entities | ✅ / ❌ |  |
| IBAN détecté | ✅ / ❌ |  |
| UI responsive | ✅ / ❌ |  |
| Aucune erreur critique | ✅ / ❌ |  |

**Score final : ___ / 8**

---

## 🆘 TROUBLESHOOTING

### Problème : L'email n'apparaît pas
1. Vérifiez que le backend est démarré (`npm run dev`)
2. Vérifiez les credentials IMAP dans `.env`
3. Rafraîchissez manuellement l'inbox (bouton F5)
4. Consultez les logs : `tail -f logs/backend.log`

### Problème : Analyse IA timeout
1. Vérifiez `OPENAI_API_KEY` dans `.env`
2. Testez l'API : `curl -X POST http://localhost:3010/api/ai/analyze-full`
3. Augmentez le timeout frontend (si nécessaire)

### Problème : Pièces jointes non détectées
1. Vérifiez que les fichiers sont bien au format `.pdf`
2. Vérifiez la taille (< 10 Mo recommandé)
3. Consultez `imapService.js` ligne 130 (extraction metadata)

---

## 📚 RÉFÉRENCES

- **CDC Master :** `/docs/cdc/CDC_Clerivo_Master_FINAL_v1.1.1.md`
- **Plan de Bataille 3 :** Deep Core Messagerie 2.0
- **Architecture :** `apps/backend/src/services/imapService.js`
- **Analyse IA :** `apps/backend/src/services/aiAnalysisService.js`

---

**Date de création :** 2026-02-06  
**Auteur :** Elodie (Experte QA Clerivo)  
**Statut :** PRÊT POUR EXÉCUTION 🚀
