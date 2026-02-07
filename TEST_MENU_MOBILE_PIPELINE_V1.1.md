# 📱 GUIDE DE TEST V1.1 : AUTO-SCROLL TACTILE + MENU MOBILE

**Date :** 2026-02-05 (Mise à jour V1.1)  
**Version :** V1.1 (Solution Hybride : Option A + Option B)  
**URL de test :** https://app.clerivo.ch/pipeline  

---

## 🎯 NOUVEAUTÉ V1.1 : DOUBLE UX MOBILE

Clerivo Pipeline offre maintenant **DEUX façons** de déplacer un candidat sur mobile :

### **Option A (Expert) : Drag & Drop avec Auto-Scroll Tactile** ⭐ NOUVEAU
- Long-press sur une carte → Drag vers le bord de l'écran
- **Le Pipeline scrolle automatiquement** pour révéler les colonnes suivantes
- UX fluide et naturelle (comme iOS Files)

### **Option B (Débutant/Accessibilité) : Menu Contextuel "⋮"**
- Tap sur le bouton "⋮" → Bottom Sheet avec liste des colonnes
- Sélection directe, pas besoin de drag
- Fiabilité 100% (pas de conflit avec scroll)

**Les deux coexistent** : L'utilisateur choisit naturellement ce qui lui convient.

---

## ✅ PRÉ-REQUIS

Identiques à V1, plus :
- **Device tactile obligatoire** pour tester Option A (iPad/iPhone/Android)
- **Gestes natifs activés** (pas d'émulation desktop Chrome DevTools)

---

## 🧪 NOUVEAUX SCÉNARIOS DE TEST (V1.1)

### **TEST 11 : Auto-Scroll Tactile - Drag Horizontal** ⭐ NOUVEAU

**Objectif :** Valider que le drag tactile déclenche l'auto-scroll.

**Pré-requis :**
- Pipeline avec au moins 3 colonnes visibles (ex: Nouveaux, Visites, En cours)
- Candidat dans la colonne "Nouveaux" (ex: "Valérie Dupuis")
- Écran assez étroit pour que "Décision" soit hors vue (split-screen ou iPhone)

**Étapes :**
1. Sur **iPad/iPhone**, ouvrir `app.clerivo.ch/pipeline`
2. **Long-press** (500ms) sur la carte "Valérie Dupuis"
3. Quand la carte se soulève (shadow + rotate), **commencer à la draguer** vers la droite
4. Continuer à draguer **jusqu'au bord droit de l'écran** (zone de 150px)
5. **Maintenir le doigt proche du bord** sans relâcher
6. Observer le comportement du Pipeline

**Résultat attendu :**
- ✅ Le Pipeline commence à **scroller horizontalement vers la droite** automatiquement
- ✅ La vitesse de scroll **augmente** plus le doigt est proche du bord (scrollAmount progressif)
- ✅ Les colonnes suivantes deviennent visibles ("En cours", "Prêts", "Décision")
- ✅ **Console logs** (F12 Mobile) : `→ Auto-scroll DROITE (15.2px)` répétés
- ✅ Quand le doigt est retiré du bord, le scroll **s'arrête**

**Test inverse (Scroll gauche) :**
- Draguer une carte de "Décision" vers la gauche
- Approcher du bord gauche
- ✅ Scroll automatique vers la gauche (`← Auto-scroll GAUCHE`)

---

### **TEST 12 : Auto-Scroll Tactile - Drop dans Colonne Hors-Écran** ⭐ NOUVEAU

**Objectif :** Valider le workflow complet : Drag → Auto-scroll → Drop → Update API.

**Scénario complet :**
1. Pipeline ouvert sur iPhone (petite largeur)
2. Candidat "Sophie Martinez" dans "Nouveaux" (colonne visible)
3. Colonne cible "Décision" hors-écran (scroll nécessaire)

**Étapes :**
1. Long-press sur "Sophie Martinez"
2. Draguer vers la droite jusqu'au bord
3. **Maintenir** → Le Pipeline scrolle automatiquement
4. Quand la colonne "Décision" devient visible, **relâcher le doigt sur cette colonne**

**Résultat attendu :**
- ✅ La carte se dépose dans "Décision" (survol de la colonne détecté)
- ✅ Menu se ferme (pas d'interférence)
- ✅ Toast : "Déplacement vers 'Décision' - Mise à jour en cours..."
- ✅ API `PUT /api/applications/:id` appelée (vérifier Network tab)
- ✅ Toast de confirmation : "✅ Candidat déplacé !"
- ✅ Carte apparaît dans la colonne "Décision"

---

### **TEST 13 : Coexistence Menu + Drag (Pas de Conflit)** ⭐ NOUVEAU

**Objectif :** Vérifier que le menu "⋮" et le drag tactile ne se gênent pas.

**Scénario A : Drag puis Menu**
1. Draguer une carte (déclenche auto-scroll)
2. Relâcher sans drop (revient à l'origine)
3. Taper immédiatement sur "⋮" de la même carte
4. ✅ Menu s'ouvre normalement (pas de state corrompu)

**Scénario B : Menu puis Drag**
1. Ouvrir menu "⋮" d'une carte
2. Fermer menu (bouton "Annuler")
3. Long-press + drag de la même carte
4. ✅ Drag fonctionne normalement (listeners bien attachés)

---

### **TEST 14 : Performance & Fluidité Tactile** ⭐ NOUVEAU

**Objectif :** Valider que l'auto-scroll tactile est fluide (60fps).

**Méthode :**
1. Activer `Show FPS` dans Chrome DevTools Mobile (ou Safari Web Inspector)
2. Draguer une carte et maintenir au bord pour déclencher auto-scroll
3. Observer le compteur FPS pendant 5 secondes

**Résultat attendu :**
- ✅ FPS reste entre **55-60** (smooth)
- ✅ Pas de jank (baisse brutale à 30fps)
- ✅ Scroll fluide visuellement (pas de saccades)

**Si FPS < 50 :**
- Acceptable sur Raspberry Pi (limites hardware)
- Le menu "⋮" reste une alternative fiable

---

### **TEST 15 : Scroll Natif vs Auto-Scroll (Pas de Conflit)** ⭐ NOUVEAU

**Objectif :** Vérifier que le scroll manuel du Pipeline fonctionne toujours.

**Étapes :**
1. Sur mobile, **swiper horizontalement** le Pipeline (sans draguer de carte)
2. Observer le scroll
3. Maintenant, **draguer une carte** (déclenche auto-scroll)
4. Relâcher
5. **Swiper à nouveau** manuellement

**Résultat attendu :**
- ✅ Le scroll manuel (swipe) fonctionne **avant** le drag
- ✅ Le scroll manuel fonctionne **après** le drag
- ✅ Pas de blocage du scroll natif (listeners `passive: true`)
- ✅ Auto-scroll ET scroll manuel peuvent coexister

---

### **TEST 16 : Fallback Menu si Drag Échoue** ⭐ NOUVEAU

**Objectif :** Valider que le menu reste accessible si l'auto-scroll tactile ne marche pas.

**Scénario (Cas d'échec volontaire) :**
1. Essayer de draguer une carte sur mobile
2. Si le drag ne se déclenche pas (bug éventuel, conflit OS, etc.)
3. **Taper sur "⋮"**

**Résultat attendu :**
- ✅ Le menu s'ouvre normalement
- ✅ Le déplacement par menu fonctionne (fallback)
- ✅ **L'utilisateur n'est jamais bloqué** (robustesse UX)

---

## 📊 COMPARAISON OPTION A vs OPTION B

| Critère | Option A (Drag Tactile) | Option B (Menu "⋮") |
|---------|-------------------------|---------------------|
| **Rapidité** | ⚡ Très rapide (1 geste) | 🐢 Moyen (2-3 taps) |
| **Précision requise** | 🎯 Élevée (maintenir doigt au bord) | ✅ Aucune (juste taper) |
| **Accessibilité** | ⚠️ Difficile (handicap moteur) | ✅ Parfaite (VoiceOver OK) |
| **Fiabilité** | 🔄 Dépend du device/OS | ✅ 100% fiable |
| **Découvrabilité** | 🤔 Pas évidente (apprentissage) | ✅ Bouton visible |
| **Coolness** | 😎 Très moderne | 😐 Classique |

**Recommandation :**
- **Utilisateurs experts** préféreront Option A (plus rapide)
- **Nouveaux utilisateurs** préféreront Option B (plus sûr)
- **Accessibilité** : Option B obligatoire (WCAG 2.1)

---

## 🐛 NOUVEAUX BUGS POTENTIELS V1.1

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Auto-scroll tactile ne se déclenche pas | `touchmove` listener pas attaché | Console logs : vérifier `trackTouch` appelé |
| Scroll trop rapide/lent | `MAX_SPEED` ou `EDGE_ZONE` inadaptés | Ajuster constantes (20px/frame, 150px zone) |
| Conflit avec scroll natif | `passive: false` au lieu de `true` | Vérifier code (doit être `passive: true`) |
| Menu + Drag se bloquent mutuellement | State `selectedCandidate` pas reset | F5 (recharger) |
| FPS < 30 sur mobile ancien | Raspberry Pi + device faible | Normal, utiliser menu "⋮" |

---

## ✅ CHECKLIST VALIDATION V1.1

**Tests V1 (Menu) :** (Déjà validés, à re-tester en non-régression)
- [x] TEST 1-10 : Menu "⋮" fonctionne toujours

**Tests V1.1 (Auto-scroll tactile) :** (NOUVEAUX)
- [ ] TEST 11 : Auto-scroll se déclenche au bord (droite + gauche)
- [ ] TEST 12 : Workflow complet Drag → Scroll → Drop → API OK
- [ ] TEST 13 : Menu + Drag coexistent sans conflit
- [ ] TEST 14 : Performance 55-60 FPS (ou acceptable sur RPi)
- [ ] TEST 15 : Scroll natif (swipe) fonctionne toujours
- [ ] TEST 16 : Menu reste accessible si drag échoue

---

## 🚀 VALIDATION FINALE

**Pour approuver V1.1, valider :**

1. ✅ **Option A fonctionne** (auto-scroll tactile détecté)
2. ✅ **Option B fonctionne toujours** (menu "⋮" intact)
3. ✅ **Pas de régression** (Tests V1 toujours OK)
4. ✅ **Pas de conflit** (Drag + Menu + Scroll natif coexistent)

**Remarque Manager :**
```
✅ V1.1 validée sur [Device] ([OS] [Version])
- Option A (Drag tactile) : [OK / KO / Limité]
- Option B (Menu) : [OK / KO]
- Performances : [Fluide / Acceptable / Lent]
- Recommandation : [Déployer / Ajuster / Rollback]
```

---

**Dernière mise à jour :** 2026-02-05 23:55 UTC (V1.1)  
**Auteur :** Daedalus (Expert UX/UI Clerivo)  
**Changelog V1.1 :**
- Ajout Tests 11-16 (Auto-scroll tactile)
- Tableau comparatif Option A vs B
- Checklist validation étendue
