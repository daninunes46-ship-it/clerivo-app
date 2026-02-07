# 🎨 GUIDE DE TEST - Responsive Pipeline

## ✅ DÉPLOIEMENT EFFECTUÉ

**Commit :** `d01d5e3` - "feat: Responsive Pipeline avec scroll horizontal fluide"
**Build :** ✅ Compilé (6.45s)
**Backend :** ✅ Redémarré (PM2)
**Statut :** 🟢 Prêt à tester

---

## 🧪 PROCÉDURE DE TEST

### ✅ TEST 1 : Split-Screen 50% (Problème initial)

**Avant :**
- ❌ Colonnes écrasées (~170px)
- ❌ Textes chevauchés
- ❌ Illisible

**Après (attendu) :**
1. **Videz le cache** : `Ctrl+Shift+R`
2. **Ouvrez** `https://app.clerivo.ch/pipeline`
3. **Réduisez la fenêtre** à 50% de l'écran (split-screen)
4. **Résultat attendu :**
   - ✅ Colonnes **280px minimum** (lisibles)
   - ✅ **Scroll horizontal** apparaît (discret, 8px)
   - ✅ **Ombre droite** visible (gradient blanc) → indique contenu masqué
   - ✅ Scrollez → **Ombre gauche** apparaît progressivement
   - ✅ Textes parfaitement lisibles

---

### ✅ TEST 2 : Desktop Large (≥1280px)

**Configuration :**
- Écran plein (1920px ou 1440px)

**Résultat attendu :**
- ✅ **Grid 5 colonnes** égales
- ✅ **Pas de scroll horizontal** (tout tient)
- ✅ **Pas d'ombres** latérales
- ✅ Layout classique préservé

---

### ✅ TEST 3 : Tablette (768-1024px)

**Configuration :**
- Fenêtre réduite à ~900px

**Résultat attendu :**
- ✅ **Flex layout** avec `min-width: 280px`
- ✅ **Scroll horizontal fluide**
- ✅ **Ombres latérales** actives
- ✅ Scrollbar discrète (8px, gris clair)

---

### ✅ TEST 4 : Mobile (<768px)

**Configuration :**
- Mode responsive navigateur (375px)

**Résultat attendu :**
- ✅ **Colonnes 90vw** (presque plein écran)
- ✅ **Snap scroll** (une colonne à la fois)
- ✅ Comportement préservé (déjà fonctionnel)

---

### ✅ TEST 5 : Drag & Drop en Split-Screen

**Configuration :**
- Split-screen 50%
- 2 candidats dans "Nouveaux"

**Test :**
1. **Glissez** un candidat de "Nouveaux" → "Visites"
2. **Scrollez** pour atteindre "Décision"
3. **Glissez** un candidat vers "Décision"

**Résultat attendu :**
- ✅ Drag & Drop fonctionne à travers le scroll
- ✅ Les cartes se déplacent visuellement
- ✅ Toast de confirmation apparaît

---

## 🎨 DÉTAILS VISUELS (Apple-like)

### **Scrollbar Custom**

**Apparence :**
- Hauteur : **8px** (ultra-fine)
- Couleur : **#d4d4d8** (zinc-300, gris clair)
- Hover : **#a1a1aa** (zinc-400, gris moyen)
- Track : **Transparent**
- Coins : **Arrondis** (4px)

**Comportement :**
- Disparaît automatiquement sur desktop large (≥1280px)
- Smooth scroll (animation fluide)
- Compatible Firefox (scrollbar-width: thin)

### **Ombres Latérales**

**Ombre gauche (scrolled) :**
- Gradient : `from-white via-white/50 to-transparent`
- Largeur : `48px` (w-12)
- Opacité : `0` → `1` (dynamique selon scroll)
- Transition : `300ms ease`

**Ombre droite (content hidden) :**
- Gradient : `from-white via-white/50 to-transparent`
- Opacité : `1` → `0` (quand on atteint la fin)
- Z-index : `10` (au-dessus du contenu)

---

## 📐 BREAKPOINTS DÉTAILLÉS

| Largeur Écran | Layout | Min-Width Colonne | Scroll | Ombres |
|---------------|--------|-------------------|--------|--------|
| **< 768px** | Flex | 90vw (~340px) | ✅ Snap | ❌ Non |
| **768-1279px** | Flex | 280px | ✅ Horizontal | ✅ Oui |
| **≥ 1280px** | Grid 5 cols | Auto (256px) | ❌ Non | ❌ Non |

**Calcul Desktop :**
- 1280px ÷ 5 colonnes = **256px** par colonne
- 1536px ÷ 5 colonnes = **307px** par colonne
- 1920px ÷ 5 colonnes = **384px** par colonne

---

## 🐛 TROUBLESHOOTING

### Problème : Le scroll ne fonctionne pas

**Solution :**
1. Videz le cache : `Ctrl+Shift+R`
2. Vérifiez la console (F12) pour erreurs JS
3. Testez en navigation privée

### Problème : Les ombres ne s'affichent pas

**Diagnostic :**
- Ouvrez Console (F12)
- Tapez : `document.querySelector('.scrollbar-thin').style.getPropertyValue('--shadow-right-opacity')`
- Doit retourner `"1"` si contenu masqué, `"0"` sinon

**Solution :**
- Vérifiez que `scrollContainerRef` est bien attaché
- Scrollez manuellement → Les ombres doivent apparaître

### Problème : Le drag & drop ne fonctionne plus

**Diagnostic :**
- Essayez de glisser une carte
- Regardez la console pour erreurs `@hello-pangea/dnd`

**Solution temporaire :**
- Retirez `overflow-x-auto` du container
- Ou ajustez `overflow: visible` sur les colonnes

---

## 🎯 CRITÈRES DE SUCCÈS

**Le test est réussi si :**

✅ En **split-screen 50%**, les colonnes sont **lisibles**
✅ Le **scroll horizontal** fonctionne sans saccades
✅ Les **ombres** apparaissent/disparaissent selon le scroll
✅ La **scrollbar** est discrète et Apple-like
✅ Le **drag & drop** fonctionne normalement
✅ En **plein écran**, pas de scroll (grid 5 colonnes)

---

## 📋 CHECKLIST RAPIDE

```
☐ Vider cache navigateur (Ctrl+Shift+R)
☐ Ouvrir https://app.clerivo.ch/pipeline
☐ Réduire fenêtre à 50% (split-screen)
☐ Vérifier colonnes 280px minimum
☐ Vérifier scroll horizontal fluide
☐ Vérifier ombres latérales
☐ Tester drag & drop
☐ Agrandir fenêtre à plein écran
☐ Vérifier grid 5 colonnes (pas de scroll)
```

---

**🎉 TOUT EST PRÊT ! Videz le cache et testez maintenant !**
