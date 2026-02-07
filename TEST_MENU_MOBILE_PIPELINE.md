# 📱 GUIDE DE TEST : MENU MOBILE PIPELINE V1

**Date :** 2026-02-05  
**Version :** V1 (Option B validée)  
**URL de test :** https://app.clerivo.ch/pipeline  

---

## 🎯 OBJECTIF DU TEST

Valider que le nouveau **menu contextuel mobile** permet de déplacer et gérer les candidats du Pipeline **sans utiliser le drag & drop**, résolvant le problème de colonnes hors écran sur petits écrans.

---

## ✅ PRÉ-REQUIS

1. **Device mobile requis** : iPhone, iPad, ou Android (tablette/smartphone)
2. **Navigateur** : Safari iOS, Chrome Android (navigateurs tactiles)
3. **Connexion** : WiFi ou 4G stable vers `app.clerivo.ch`
4. **Compte de test** : Utilisateur avec accès au Pipeline
5. **Candidat de test** : Au moins 1 candidat visible (ex: "Sophie Martinez")

---

## 🧪 SCÉNARIOS DE TEST

### **TEST 1 : Affichage du bouton "⋮" (Mobile Only)**

**Objectif :** Vérifier que le bouton menu est visible uniquement sur mobile.

**Étapes :**
1. Ouvrir `app.clerivo.ch/pipeline` sur **mobile**
2. Trouver une carte candidat (ex: "Valérie Dupuis")
3. Observer le coin supérieur droit de la carte

**Résultat attendu :**
- ✅ Un bouton "**⋮**" (trois points verticaux) est **visible** en haut à droite de chaque carte
- ✅ Le bouton est tactile (zone de tap confortable, ~44x44px)

**Contre-test (Desktop) :**
- Ouvrir le même pipeline sur **desktop** (écran large)
- ❌ Le bouton "⋮" doit être **invisible** (remplacé par la date de création)

---

### **TEST 2 : Ouverture du Bottom Sheet**

**Objectif :** Valider l'animation et l'affichage du menu.

**Étapes :**
1. Sur mobile, taper sur le bouton "**⋮**" d'une carte candidat
2. Observer l'animation d'ouverture

**Résultat attendu :**
- ✅ Le fond de l'écran devient **gris semi-transparent** (backdrop)
- ✅ Un **Bottom Sheet blanc** glisse depuis le bas (animation ~300ms)
- ✅ Une **barre horizontale grise** (handle iOS) apparaît en haut du menu
- ✅ Le titre affiche : "**[Nom Prénom]**" du candidat sélectionné
- ✅ Le sous-titre indique : "Actuellement dans : **[Nom Colonne]**"

**Accessibilité :**
- Le reste de l'interface est **désactivé** (focus trap dans le menu)
- Le bouton "**X**" (fermer) est visible en haut à droite

---

### **TEST 3 : Déplacement vers une autre colonne**

**Objectif :** Déplacer un candidat entre colonnes via le menu.

**Candidat de test :** "Valérie Dupuis" (actuellement dans "Prêts")

**Étapes :**
1. Taper sur "**⋮**" de la carte "Valérie Dupuis"
2. Vérifier que "**Prêts**" est marqué avec un **checkmark (✓)** bleu
3. Taper sur la ligne "**Visites**" (colonne violette)
4. Observer la fermeture du menu et l'UI du Pipeline

**Résultat attendu :**
- ✅ Le menu se **ferme immédiatement**
- ✅ Un **toast** apparaît en haut : "Déplacement vers 'Visites' - Mise à jour en cours..."
- ✅ La carte "Valérie Dupuis" **disparaît de la colonne "Prêts"**
- ✅ La carte **réapparaît dans la colonne "Visites"** (scroll automatique si nécessaire)
- ✅ Un second toast de confirmation : "✅ Candidat déplacé ! Maintenant dans la colonne 'Visites'"

**Test de rollback (si échec API) :**
- Si le backend est arrêté (test destructif), la carte doit **revenir** dans "Prêts" avec un toast d'erreur rouge

---

### **TEST 4 : Action "Voir le dossier"**

**Objectif :** Redirection vers la page détaillée du candidat.

**Étapes :**
1. Ouvrir le menu "⋮" d'un candidat (ex: "Sophie Martinez")
2. Scroller vers le bas jusqu'à la section "**Actions rapides**"
3. Taper sur "**🔍 Voir le dossier complet**"

**Résultat attendu :**
- ✅ Le menu se ferme
- ✅ Redirection immédiate vers `/candidates/[ID]` (page CandidateDetailsPage)
- ✅ La page affiche le profil complet de "Sophie Martinez"

---

### **TEST 5 : Action "Supprimer le candidat"**

**Objectif :** Valider la suppression avec confirmation.

⚠️ **Attention :** Utiliser un candidat de test jetable (ex: "Test Mobile")

**Étapes :**
1. Ouvrir le menu "⋮" d'un candidat de test
2. Scroller vers le bas
3. Taper sur le bouton **rouge** "**🗑️ Supprimer le candidat**"
4. Une **popup native** apparaît (iOS/Android)

**Résultat attendu :**
- ✅ Message de confirmation : "Êtes-vous sûr de vouloir supprimer [Nom] ? Cette action est irréversible."
- ✅ Deux boutons : "**Annuler**" et "**Supprimer**"

**Si "Annuler" :**
- ❌ Rien ne se passe, menu reste ouvert

**Si "Supprimer" :**
- ✅ Menu se ferme
- ✅ La carte **disparaît du Pipeline**
- ✅ Toast : "✅ Candidat supprimé - Le candidat a été retiré du pipeline"

---

### **TEST 6 : Fermeture du menu (3 méthodes)**

**Objectif :** Valider les différentes façons de fermer le menu.

**Méthode 1 : Bouton "X"**
1. Ouvrir menu, taper sur le "**X**" en haut à droite
2. ✅ Menu se ferme avec animation slide-out

**Méthode 2 : Backdrop (fond gris)**
1. Ouvrir menu, taper sur le **fond gris** (hors du Bottom Sheet)
2. ✅ Menu se ferme

**Méthode 3 : Bouton "Annuler"**
1. Ouvrir menu, scroller tout en bas
2. Taper sur "**Annuler**"
3. ✅ Menu se ferme

---

### **TEST 7 : Colonne actuelle non déplaçable**

**Objectif :** Vérifier qu'on ne peut pas "déplacer" un candidat vers sa propre colonne.

**Étapes :**
1. Ouvrir menu d'un candidat dans "Nouveaux"
2. Observer la ligne "**Nouveaux**"

**Résultat attendu :**
- ✅ La ligne "Nouveaux" a un **fond bleu clair** (bg-indigo-50)
- ✅ Un **checkmark (✓)** est visible à droite
- ✅ La ligne est **inactive** (cursor: default, pas de hover)

**Si on tape dessus quand même :**
- ✅ Toast info : "⚠️ Le candidat est déjà dans cette colonne"
- ✅ Menu se ferme sans action

---

### **TEST 8 : Indicateur visuel des colonnes**

**Objectif :** Vérifier que chaque colonne a sa couleur distinctive.

**Étapes :**
1. Ouvrir un menu
2. Observer les lignes de colonnes

**Résultat attendu :**
- ✅ **Nouveaux** : Bordure verticale **bleue** (indigo)
- ✅ **Visites** : Bordure verticale **violette** (purple)
- ✅ **En cours** : Bordure verticale **orange** (amber)
- ✅ **Prêts** : Bordure verticale **verte** (emerald)
- ✅ **Décision** : Bordure verticale **cyan** (cyan)

---

### **TEST 9 : Responsive & Scrollabilité**

**Objectif :** Valider le comportement sur très petits écrans.

**Étapes :**
1. Ouvrir le menu sur un iPhone SE (320px de largeur)
2. Scroller le contenu du Bottom Sheet

**Résultat attendu :**
- ✅ Le Bottom Sheet occupe **maximum 80vh** de hauteur
- ✅ Le contenu est **scrollable** verticalement si nécessaire
- ✅ Le handle (barre horizontale) reste **fixe en haut**
- ✅ Pas de scroll horizontal (tout tient dans la largeur)

---

### **TEST 10 : Accessibilité (Screen Reader)**

**Objectif :** Valider la compatibilité VoiceOver (iOS) / TalkBack (Android).

**Étapes (iOS + VoiceOver) :**
1. Activer VoiceOver : Réglages > Accessibilité > VoiceOver
2. Ouvrir le Pipeline
3. Swiper vers une carte candidat
4. Double-taper sur le bouton "⋮"

**Résultat attendu :**
- ✅ VoiceOver annonce : "Ouvrir le menu d'actions, bouton"
- ✅ Le menu s'ouvre
- ✅ VoiceOver lit le titre : "[Nom Prénom], titre"
- ✅ Chaque ligne de colonne est annoncée : "Déplacer vers Visites, bouton"
- ✅ Le bouton "X" est annoncé : "Fermer le menu, bouton"

---

## 🐛 BUGS POTENTIELS À SURVEILLER

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Bouton "⋮" invisible sur mobile | CSS `md:hidden` non appliqué | Vider cache navigateur |
| Menu ne s'ouvre pas | Event `stopPropagation` manquant | Console logs JS, vérifier errors |
| Carte ne bouge pas après déplacement | API call échoue (409, 404, 500) | Vérifier Network tab (DevTools mobile) |
| Animation saccadée | GPU non activé (translate3d) | Normal sur Raspberry Pi, acceptable |
| Menu reste bloqué ouvert | State `selectedCandidate` non réinitialisé | F5 (recharger) |

---

## 📊 CRITÈRES DE VALIDATION

Pour valider le déploiement, **tous** les tests suivants doivent passer :

- [x] TEST 1 : Bouton "⋮" visible mobile, invisible desktop
- [x] TEST 2 : Bottom Sheet s'ouvre avec animation
- [x] TEST 3 : Déplacement fonctionne + Toasts OK
- [x] TEST 4 : Redirection vers dossier détaillé
- [x] TEST 5 : Suppression avec confirmation
- [x] TEST 6 : Fermeture par X, backdrop, ou "Annuler"
- [x] TEST 7 : Colonne actuelle non cliquable
- [x] TEST 8 : Couleurs des colonnes distinctes
- [x] TEST 9 : Scrollabilité sur petit écran
- [x] TEST 10 : Accessibilité VoiceOver/TalkBack

---

## 🚀 APRÈS VALIDATION

Si tous les tests passent, **confirmer au développeur** :

```
✅ Menu Mobile validé sur [Device] ([OS] [Version])
Tous les tests passés, déploiement V1 approuvé.
Prêt pour User Acceptance Testing (UAT) avec agents terrain.
```

**Remarques/Bugs éventuels :** (lister ici)

---

**Dernière mise à jour :** 2026-02-05 23:45 UTC  
**Auteur :** Daedalus (Expert UX/UI Clerivo)  
**Référence :** Plan de Bataille 6 (Zero Learning Curve), CDC 7.2 (Mobile-First)
