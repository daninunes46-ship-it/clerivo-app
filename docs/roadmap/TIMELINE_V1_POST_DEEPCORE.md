# 📅 TIMELINE OFFICIELLE V1 - POST DEEP CORE

**Établie par :** Elodie (QA Manager & Garante CDC)  
**Date :** 2026-02-06  
**Statut :** ALIGNÉ CDC v1.1.0 ✅  
**Références :** CDC Master Section 2.3 + Plans de Bataille 3, 4, 6

---

## 🎯 SITUATION ACTUELLE (2026-02-06)

### ✅ MODULES VALIDÉS

| Module | Status | Score | Date validation |
|--------|--------|-------|-----------------|
| **Messagerie 2.0 (Deep Core)** | ✅ VALIDÉ | 20/20 (100%) | 2026-02-06 |
| **Pipeline Location (partiel)** | 🟡 EN COURS | - | Intégration Supabase OK |

### 🔴 BLOCAGE ACTUEL : INFRASTRUCTURE

**Problème identifié :**
- Domaine `clerivo.ch` acheté ✅
- Frontend déployé (Vercel/Netlify) ✅  
- Backend local (Raspberry Pi) ✅
- **❌ Pas de communication Frontend ↔ Backend**

**Cause :** Frontend public ne peut pas atteindre le Backend local

**Solution CDC :** Plan de Bataille 4 - Cloudflare Tunnel (Section 3.1)

---

## 🚀 ROADMAP POST DEEP CORE (Référence CDC 2.3)

### PHASE 0 : OPÉRATION TUNNEL (CRITIQUE - BLOQUANT)

**Objectif :** Connecter clerivo.ch au Raspberry Pi de manière sécurisée

**Référence :** Plan de Bataille 4 - Section 3.1 "Cloudflare Tunnel"

```
┌────────────────────────────────────────────────────────────┐
│ OPÉRATION TUNNEL - INFRASTRUCTURE CRITIQUE                 │
├────────────────────────────────────────────────────────────┤
│ Responsable : BASTION (Infrastructure/Sécurité)            │
│ Durée estimée : 1-2 jours                                  │
│ Priorité : 🔴 BLOQUANT (tout dépend de ça)                │
└────────────────────────────────────────────────────────────┘
```

#### Étapes Techniques (Bastion)

| # | Tâche | Temps | Référence PB4 |
|---|-------|-------|---------------|
| 1 | Installation cloudflared sur Raspberry Pi | 1h | Section 3.1 |
| 2 | Configuration tunnel vers backend (port 3010) | 1h | Section 3.1 |
| 3 | Configuration DNS clerivo.ch → Cloudflare | 30min | Section 3.1 |
| 4 | Configuration reverse proxy local | 1h | Section 3.1 |
| 5 | Tests de connectivité Frontend ↔ Backend | 1h | - |
| 6 | Configuration SSL/TLS automatique | 30min | Section 3.1 |
| 7 | Configuration WAF Cloudflare (géolocalisation) | 1h | Section 3.1 |
| 8 | Tests de charge (3 clients simultanés) | 1h | - |
| 9 | Documentation procédure de maintenance | 1h | - |

**Total estimé :** 8h (1 journée de travail concentré)

**Critères de validation :**
- [ ] `https://clerivo.ch` accessible depuis Internet
- [ ] Inbox fonctionnelle (lecture emails)
- [ ] Pipeline fonctionnel (lecture + ajout contacts)
- [ ] Brouillon IA fonctionnel
- [ ] 3 clients peuvent se connecter simultanément
- [ ] Aucune erreur console Frontend
- [ ] Aucune erreur logs Backend
- [ ] Latence < 500ms (Suisse → Raspberry Pi)

---

### PHASE 1 : COMPLÉTION V1 - ADOPTION AGENCE (CDC 2.3)

**Modules V1 restants (selon CDC Section 2.3) :**

```
┌────────────────────────────────────────────────────────────┐
│ V1 - ADOPTION AGENCE (Modules visibles)                    │
├────────────────────────────────────────────────────────────┤
│ 1. ✅ Messagerie 2.0 - Portier de Nuit                    │
│ 2. 🟡 Pipeline Location                                   │
│ 3. ⏳ Swiss Safe (Portail dépôt sécurisé)                 │
│ 4. ⏳ Chronos & Scheduler (Planification visites)         │
└────────────────────────────────────────────────────────────┘
```

#### 1.1 Pipeline Location - Complétion (Atlas + Daedalus)

**Statut :** Intégration Supabase OK, fonctionnalités manquantes

| Fonctionnalité | CDC Ref | Responsable | Temps | Priorité |
|----------------|---------|-------------|-------|----------|
| Vue par bien | 6.2 | Daedalus | 3h | 🟠 HIGH |
| Timeline actions | 6.2 | Daedalus | 2h | 🟠 HIGH |
| Attribution agent | 6.2 | Atlas | 2h | 🟠 HIGH |
| Alertes 'dossier bloqué' | 6.2 | Atlas | 3h | 🟡 MEDIUM |
| Audit trail complet | 6.2 | Atlas | 2h | 🟡 MEDIUM |

**Total estimé :** 12h (1.5 jours)

**Critères de validation CDC 6.2 :**
- [ ] Changement de statut depuis Inbox et depuis Pipeline ✅
- [ ] Attribution + audit ✅
- [ ] Alertes 'dossier bloqué' ✅

---

#### 1.2 Swiss Safe - Portail de dépôt sécurisé (Atlas + Bastion)

**Référence :** CDC Section 6.3

**Objectif :** Collecte sécurisée et centralisée des documents sensibles

| Tâche | Responsable | Temps | Priorité |
|-------|-------------|-------|----------|
| Architecture sécurité (chiffrement) | Bastion | 4h | 🔴 CRITICAL |
| API upload fichiers | Atlas | 4h | 🔴 CRITICAL |
| Checklist dynamique Suisse | Atlas | 3h | 🟠 HIGH |
| Interface portail candidat | Daedalus | 5h | 🟠 HIGH |
| Validation & versions documents | Atlas | 3h | 🟡 MEDIUM |
| Tests sécurité upload | Bastion | 2h | 🔴 CRITICAL |

**Total estimé :** 21h (2.5 jours)

**Critères de validation CDC 6.3 :**
- [ ] Lien portail généré avec token sécurisé
- [ ] Upload documents (PDF, JPG, PNG)
- [ ] Checklist dynamique (permis, salaire, poursuites)
- [ ] Versioning & remplacement documents
- [ ] Agent peut valider checklist → dossier prêt

---

#### 1.3 Chronos & Scheduler - Planification visites (Atlas + Daedalus)

**Référence :** CDC Section 6.4

**Objectif :** Réduire les no-show et friction planification

| Tâche | Responsable | Temps | Priorité |
|-------|-------------|-------|----------|
| Synchronisation calendrier (OAuth2) | Atlas | 6h | 🟠 HIGH |
| Interface proposition créneaux | Daedalus | 4h | 🟠 HIGH |
| Relances automatiques (J-1, H-2) | Atlas | 3h | 🟡 MEDIUM |
| Notes de visite | Daedalus | 2h | 🟡 MEDIUM |
| Tests intégration Google Calendar | Atlas | 2h | 🟠 HIGH |

**Total estimé :** 17h (2 jours)

**Critères de validation CDC 6.4 :**
- [ ] RDV confirmé apparaît dans Clerivo + calendrier externe
- [ ] Relances envoyées selon règles
- [ ] Notes de visite visibles dans dossier candidat

---

### PHASE 2 : AUTOMATIONS INVISIBLES V1 (CDC 2.3)

**Modules back-office (selon CDC Section 2.3) :**

```
┌────────────────────────────────────────────────────────────┐
│ V1 - AUTOMATIONS INVISIBLES                                │
├────────────────────────────────────────────────────────────┤
│ 1. DossierForge (Pack candidature 1-clic)                  │
│ 2. Moteur tâches (création auto depuis messages)           │
│ 3. Relances basiques (timers configurables)                │
└────────────────────────────────────────────────────────────┘
```

#### 2.1 DossierForge - Pack candidature (Atlas)

**Référence :** CDC Section 6.5

| Tâche | Temps | Priorité |
|-------|-------|----------|
| Génération PDF récapitulatif | 4h | 🟠 HIGH |
| Assemblage pièces en ZIP/PDF | 3h | 🟠 HIGH |
| Indicateur dossier prêt (vert/orange/rouge) | 2h | 🟡 MEDIUM |
| Relances pièces manquantes | 3h | 🟡 MEDIUM |

**Total estimé :** 12h (1.5 jours)

**Critères de validation CDC 6.5 :**
- [ ] Pack généré < 10 secondes
- [ ] Export inclut toutes pièces validées
- [ ] Email candidature auto-proposé

---

### PHASE 3 : SOCLE AGENCE V1 (CDC 2.3)

**Exigences non négociables (selon CDC Section 2.3) :**

```
┌────────────────────────────────────────────────────────────┐
│ V1 - SOCLE AGENCE (Non négociable)                         │
├────────────────────────────────────────────────────────────┤
│ 1. TeamOps (Multi-utilisateurs, rôles, audit)              │
│ 2. DataVault (Chiffrement, sauvegardes, rétention)         │
└────────────────────────────────────────────────────────────┘
```

#### 3.1 TeamOps - Collaboration agence (Atlas)

**Référence :** CDC Section 6.6 + Plan de Bataille 4 (2FA)

| Tâche | Temps | Priorité |
|-------|-------|----------|
| Authentification 2FA (TOTP) | 6h | 🔴 CRITICAL |
| Gestion rôles (ADMIN, AGENT) | 3h | 🔴 CRITICAL |
| Assignation dossiers | 2h | 🟠 HIGH |
| Commentaires internes | 3h | 🟡 MEDIUM |
| Audit log complet | 4h | 🔴 CRITICAL |

**Total estimé :** 18h (2 jours)

**Critères de validation CDC 6.6 :**
- [ ] 2 utilisateurs simultanés fonctionnels
- [ ] Audit consultable (qui a fait quoi, quand)
- [ ] Permissions respectées par rôle

---

#### 3.2 DataVault - Sécurité & conformité (Bastion)

**Référence :** CDC Section 6.6 + Plan de Bataille 4

| Tâche | Temps | Priorité |
|-------|-------|----------|
| Chiffrement LUKS (clé USB) | 6h | 🔴 CRITICAL |
| Scripts sauvegarde Rclone | 4h | 🔴 CRITICAL |
| Procédure restauration | 3h | 🔴 CRITICAL |
| Politique rétention/purge | 2h | 🟠 HIGH |
| Test disaster recovery | 4h | 🔴 CRITICAL |

**Total estimé :** 19h (2.5 jours)

**Critères de validation CDC 6.6 :**
- [ ] Chiffrement data-at-rest opérationnel
- [ ] Sauvegarde automatique fonctionnelle
- [ ] Restauration testée avec succès
- [ ] Purge dossiers refusés opérationnelle

---

## 📊 SYNTHÈSE TEMPS ESTIMÉS V1 COMPLET

| Phase | Modules | Temps total | Jours (8h/j) |
|-------|---------|-------------|--------------|
| **Phase 0** | Tunnel Cloudflare | 8h | 1 jour |
| **Phase 1.1** | Pipeline complétion | 12h | 1.5 jours |
| **Phase 1.2** | Swiss Safe | 21h | 2.5 jours |
| **Phase 1.3** | Chronos & Scheduler | 17h | 2 jours |
| **Phase 2** | DossierForge | 12h | 1.5 jours |
| **Phase 3.1** | TeamOps (2FA, rôles) | 18h | 2 jours |
| **Phase 3.2** | DataVault (chiffrement) | 19h | 2.5 jours |
| **Tests intégration** | QA complète V1 | 16h | 2 jours |

**TOTAL ESTIMÉ V1 COMPLET :** 123h (≈ **15 jours de travail**)

**Avec parallélisation (3 personnes) :** ≈ **2-3 semaines**

---

## 🎯 PLANNING RECOMMANDÉ (Équipe 3 personnes)

### Semaine 1 : Infrastructure + Fondations

| Jour | Bastion | Atlas | Daedalus |
|------|---------|-------|----------|
| **Lundi** | 🔴 Tunnel Cloudflare | Pipeline API | Pipeline UI |
| **Mardi** | 🔴 Tunnel tests | Pipeline completion | Pipeline completion |
| **Mercredi** | Swiss Safe sécurité | Swiss Safe API | Swiss Safe UI portail |
| **Jeudi** | Swiss Safe tests | Swiss Safe API | Swiss Safe UI portail |
| **Vendredi** | DataVault chiffrement | DossierForge | Swiss Safe finition |

### Semaine 2 : Modules + Automations

| Jour | Bastion | Atlas | Daedalus |
|------|---------|-------|----------|
| **Lundi** | DataVault sauvegardes | Chronos OAuth2 | Chronos UI |
| **Mardi** | DataVault tests | Chronos relances | Chronos UI |
| **Mercredi** | Sécurité 2FA (support) | TeamOps 2FA | TeamOps UI |
| **Jeudi** | Tests sécurité | TeamOps rôles | TeamOps UI |
| **Vendredi** | Tests infrastructure | Tests API | Tests UI |

### Semaine 3 : Tests & Déploiement

| Jour | Équipe complète |
|------|-----------------|
| **Lundi** | Tests intégration E2E |
| **Mardi** | Corrections bugs critiques |
| **Mercredi** | Tests de charge (3 clients) |
| **Jeudi** | Documentation utilisateur |
| **Vendredi** | Déploiement production + Formation client |

---

## 🔄 VERSIONS SUIVANTES (Après V1)

### V1.1 - Productivité et standardisation (CDC 2.3)

**Modules :**
- Sherlock (Contrôle qualité)
- SolvencyScore (Aide décision)
- DocuDrop (Modèles versionnés)
- Dashboard opérationnel

**Temps estimé :** +40h (1 semaine)

### V1.2 - Exploitation du bail (CDC 2.3)

**Modules :**
- CautionFlow (Suivi garantie)
- EDL SnapBook (États des lieux)
- TenantPulse (Tickets locataires)

**Temps estimé :** +60h (1.5 semaines)

### V1.3 - Sortie et relocation (CDC 2.3)

**Modules :**
- ExitNavigator (Workflow sortie)

**Temps estimé :** +30h (4 jours)

---

## 📋 DÉPENDANCES CRITIQUES

```
┌─────────────────────────────────────────────────────────┐
│ DÉPENDANCES (Impossible de continuer sans) │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Phase 0 (Tunnel) ──────┐                              │
│                         │                               │
│                         ├──> Phase 1 (Swiss Safe)       │
│                         │                               │
│  Phase 1 (Pipeline) ────┤                               │
│                         │                               │
│                         ├──> Phase 2 (DossierForge)     │
│                         │                               │
│  Phase 1 (Chronos) ─────┘                               │
│                                                         │
│  Phase 3 (DataVault) ──> INDÉPENDANT (peut paralléliser)│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Chemin critique :** Tunnel → Pipeline → Swiss Safe → DossierForge

---

## ✅ DÉCISION QA - PROCHAINE ACTION IMMÉDIATE

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚨 ACTION IMMÉDIATE REQUISE : OPÉRATION TUNNEL             ║
║                                                               ║
║   Responsable : BASTION                                       ║
║   Priorité : 🔴 BLOQUANT CRITIQUE                            ║
║   Temps estimé : 1 jour (8h)                                  ║
║   Date cible : 2026-02-07 (demain)                            ║
║                                                               ║
║   SANS le tunnel, clerivo.ch reste inutilisable.             ║
║   TOUT LE RESTE dépend de cette étape.                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

**Établi par :** Elodie (QA Manager)  
**Date :** 2026-02-06  
**Version :** 1.0  
**Alignement CDC :** ✅ CONFORME v1.1.0

🧠⚡ **NEXT STOP: OPERATION TUNNEL !**
