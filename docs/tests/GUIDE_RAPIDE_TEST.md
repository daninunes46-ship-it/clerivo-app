# 🚀 GUIDE RAPIDE - TEST EMAIL DEEP CORE

## ⚡ EN 3 MINUTES

### 📧 ÉTAPE 1 : ENVOYER L'EMAIL

**1. Ouvrez votre client email** (Gmail, Outlook, etc.)

**2. Nouveau message à :** `clerivotest@gmail.com`

**3. SUJET (copier-coller) :**
```
Demande urgente : Visite appartement 3.5p Lausanne + Questions garantie
```

**4. CORPS (copier-coller) :**
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

**5. PIÈCES JOINTES :**
Attachez les 3 fichiers situés dans :
```
/home/clerivo2/projects/clerivo/docs/tests/test-attachments/
```
- `Fiche_Salaire_Sophie_Janv2026.pdf`
- `Extrait_Poursuites_Sophie_28Jan2026.pdf`
- `Attestation_RC_Couple.pdf`

**6. ENVOYEZ ! 🚀**

---

## 🔍 ÉTAPE 2 : VÉRIFIER DANS CLERIVO (dans les 60 secondes)

### A. Interface Inbox (`http://localhost:5173/inbox`)

**✅ Checklist visuelle :**
- [ ] Email apparaît en haut de la liste
- [ ] Point bleu "Non lu" visible
- [ ] Icône trombone 📎 (3 pièces jointes)
- [ ] Snippet commence par "Bonjour, Je m'appelle Sophie..."
- [ ] Date du jour affichée

### B. Cliquez sur l'email

**✅ Contenu affiché :**
- [ ] Sujet complet
- [ ] Corps lisible (pas de HTML brut)
- [ ] Section "3 pièces jointes" en bas

**✅ Analyse IA (EmailAnalysisCard) - Attendez 3-5 secondes :**
- [ ] **Catégorie :** "Locataire" ou "Candidat" 
- [ ] **Priorité :** "Haute" (urgence samedi)
- [ ] **Nom :** "Sophie Martinez" détecté
- [ ] **Téléphone :** "+41 79 456 78 90" extrait
- [ ] **Budget :** "2400 CHF" identifié
- [ ] **Lieu :** "Lausanne"
- [ ] **Résumé :** Phrase cohérente sur le couple + visite urgente

---

## 🐛 ÉTAPE 3 : VÉRIFIER LES LOGS

### Terminal Backend (où tourne `npm run dev`)

**Surveillez ces lignes :**
```bash
✅ Connecté au serveur IMAP !
✅ INBOX ouverte, recherche des messages...
📎 Extraction des métadonnées des pièces jointes (3 fichiers)
AI Analysis Called for email ID: [XXX]
```

**🚨 Si erreur :**
- `IMAP Authentication Failed` → Vérifiez `.env` ligne 4-5
- `OpenAI Error` → Vérifiez `OPENAI_API_KEY` ligne 10
- Timeout > 60s → Email pas encore arrivé, patientez

---

## 📊 ÉTAPE 4 : VÉRIFIER LA BASE DE DONNÉES (OPTIONNEL)

### Cache IA (fichier JSON)
```bash
cat /home/clerivo2/projects/clerivo/data/storage/ai_metadata.json | jq .
```
**✅ Attendu :** JSON avec l'analyse complète de l'email

---

## 🎯 CRITÈRES DE RÉUSSITE MINIMUM

| Test | Statut |
|------|--------|
| Email reçu < 60s | ☐ |
| 3 pièces jointes détectées | ☐ |
| IA retourne classification | ☐ |
| Téléphone extrait (+41 79...) | ☐ |
| IBAN détecté (CH93...) | ☐ |
| UI fluide, pas de crash | ☐ |

**Score :** ____ / 6

### ✅ Si 6/6 → SYSTÈME NERVEUX OPÉRATIONNEL ! 🧠⚡
### ⚠️ Si < 4/6 → Analyser les logs et relancer

---

## 🆘 PROBLÈMES FRÉQUENTS

**1. Email n'arrive pas :**
- Vérifiez que Gmail n'a pas bloqué l'envoi (Spam)
- Rafraîchissez l'inbox (F5)
- Attendez 2-3 minutes (Gmail peut avoir du délai)

**2. Analyse IA timeout :**
- Vérifiez `OPENAI_API_KEY` dans `.env`
- Testez manuellement : `curl -X POST http://localhost:3010/api/ai/analyze-full`

**3. Pièces jointes = 0 :**
- Vérifiez que les fichiers .pdf sont bien attachés
- Vérifiez les logs : `📎 Extraction des métadonnées`

---

## 📞 CONTACT

**Questions ?** Consultez le document complet :
```
/home/clerivo2/projects/clerivo/docs/tests/TEST_EMAIL_DEEP_CORE_V1.md
```

**Logs détaillés :**
```bash
# Backend
tail -f /home/clerivo2/projects/clerivo/apps/backend/logs/app.log

# Frontend
Ouvrir la console navigateur (F12)
```

---

**Créé par :** Elodie (Experte QA Clerivo)  
**Date :** 2026-02-06  
**Version :** 1.0  

🚀 **BON TEST !** 🧠
