# 📐 PRISMA DATABASE - MODULE 2 (PIPELINE & CANDIDATS)

## 🎯 Vue d'ensemble

Ce dossier contient le schéma de base de données Prisma pour le Module 2 de Clerivo : **Pipeline & Candidats (Swiss Safe + Deep Core)**.

### Architecture mise en place

1. **Swiss Safe** : Gestion complète des candidats suisses avec solvabilité, poursuites, garanties
2. **Deep Core** : Liaison entre Inbox (messagerie) et Pipeline (dossiers)
3. **Timeline de Vérité** : Historique unifié (emails + documents + événements)
4. **TeamOps** : Multi-utilisateurs avec rôles et audit complet

## 📊 Données de test (Seed)

La base de données contient 3 candidats avec des profils réalistes :

### 🎯 Candidat 1 : Jean Dupont (DOSSIER COMPLET)
- **Email** : jean.dupont@example.ch
- **Statut** : DOSSIER_READY (Prêt à transmettre)
- **Score de solvabilité** : 95/100 (EXCELLENT)
- **Bien visé** : LAU-2024-001 (3.5 pièces Lausanne)
- **Documents** : 7/7 validés
  - Permis C
  - Extrait poursuites (NÉANT)
  - 3 fiches de salaire
  - Assurance RC
  - Garantie SwissCaution (CHF 6'300.-)
- **Thread email** : 3 messages (conversation complète)
- **Profil** : 
  - CDI chez Nestlé depuis 6 ans
  - Revenu mensuel brut : CHF 8'500.-
  - Ratio loyer/revenu : 24% (optimal)
  - Couple, Permis C

### 🆕 Candidat 2 : Marie Laurent (NOUVEAU)
- **Email** : marie.laurent@example.ch
- **Statut** : NEW (Premier contact)
- **Score de solvabilité** : Non calculé
- **Bien visé** : GLA-2024-002 (4.5 pièces Gland)
- **Documents** : 0/7
- **Thread email** : 1 message (non lu)
- **Profil** :
  - Consultante indépendante
  - Revenu mensuel : CHF 5'500.-
  - Citoyenne suisse

### ❌ Candidat 3 : Pierre Morel (REJETÉ)
- **Email** : pierre.morel@example.ch
- **Statut** : REJECTED
- **Score de solvabilité** : 25/100 (REJECTED)
- **Bien visé** : LAU-2024-001 (3.5 pièces Lausanne)
- **Documents** : 2/7
  - Permis B
  - Extrait poursuites ⚠️ **CHF 8'450.- de poursuites**
- **Thread email** : 2 messages (refus envoyé)
- **Profil** :
  - CDI depuis 2 ans
  - Revenu mensuel brut : CHF 4'200.-
  - Ratio loyer/revenu : 50% (trop élevé)
  - 3 poursuites actives

## 🔐 Utilisateurs de test

```
Admin : admin@clerivo.ch / admin123
Agent : agent@clerivo.ch / agent123
```

## 🛠️ Commandes utiles

### Initialisation (déjà fait)
```bash
# Générer le client Prisma
npm run db:generate

# Créer la migration initiale
npx prisma migrate dev --name init

# Lancer le seed (déjà exécuté automatiquement)
npm run db:seed
```

### Opérations courantes
```bash
# Ouvrir Prisma Studio (interface visuelle)
npm run db:studio

# Créer une nouvelle migration
npm run db:migrate

# Pousser le schéma sans migration (dev)
npm run db:push

# Réinitialiser complètement la DB + seed
npm run db:reset
```

### Développement
```bash
# Après modification du schema.prisma
npx prisma generate  # Régénérer le client
npx prisma migrate dev --name ma_modification  # Créer la migration
```

## 📁 Structure des fichiers

```
prisma/
├── schema.prisma          # Schéma complet (20+ modèles)
├── seed.js                # Script de seed avec données réalistes
├── migrations/            # Historique des migrations SQL
│   └── 20260205222034_init/
│       └── migration.sql
└── README.md              # Ce fichier
```

## 🗄️ Modèles principaux

### Core Business
- `Candidate` - Identité et profil de base
- `SolvencyProfile` - Solvabilité suisse (poursuites, emploi, garanties)
- `Guarantor` - Garants
- `Document` - Coffre-fort sécurisé (Swiss Safe)
- `Application` - Dossier de candidature (pivot pipeline)
- `Property` - Biens immobiliers

### Messaging (Deep Core)
- `Thread` - Fils de conversation email
- `Message` - Messages individuels
- `Attachment` - Pièces jointes
- `InternalComment` - Commentaires internes (Whispers)

### Workflow
- `ApplicationEvent` - Timeline de vérité (tous les événements)
- `User` - Utilisateurs (TeamOps)
- `AuditLog` - Journal d'audit complet
- `SecurityEvent` - Alertes de sécurité (IBAN, fraude)

## 🔗 Relations clés (Deep Core)

```
Thread ──> applicationId ──> Application ──> candidateId ──> Candidate
  │                            │                               │
  └─> messages[]              └─> events[]                   └─> solvencyProfiles[]
                                                              └─> documents[]
```

**Principe** : Un thread email peut être lié à un dossier (Application), qui lui-même est lié à un candidat et à un bien. La timeline unifiée (ApplicationEvent) trace tous les événements.

## 🇨🇭 Spécificités Suisses implémentées

### Champs SolvencyProfile
- ✅ Extrait du registre des poursuites (< 3-6 mois)
- ✅ Type de permis (B, C, G, L)
- ✅ Fiches de salaire (3 derniers mois)
- ✅ Assurance responsabilité civile
- ✅ Garantie de loyer (max 3 mois selon CDC)
- ✅ Types d'emploi (CDI, CDD, indépendant)
- ✅ Garants avec leurs documents

### Statuts Pipeline (18 états)
```
NEW → TO_QUALIFY
  → VISIT_SCHEDULED → VISIT_DONE
  → DOSSIER_INCOMPLETE → DOSSIER_PENDING → DOSSIER_READY
  → TRANSMITTED → UNDER_REVIEW
  → RETAINED / REJECTED
  → AWAITING_GUARANTEE → CONTRACT_SIGNED
```

## 🎓 Conseils d'utilisation

### 1. Explorer les données
```bash
npm run db:studio
# Ouvre http://localhost:5555
# Explorez les candidats, applications, threads
```

### 2. Tester les requêtes Prisma
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer un candidat avec son profil de solvabilité
const candidate = await prisma.candidate.findUnique({
  where: { email: 'jean.dupont@example.ch' },
  include: {
    solvencyProfiles: true,
    applications: {
      include: {
        property: true,
        threads: {
          include: { messages: true }
        }
      }
    }
  }
});
```

### 3. Créer un nouveau dossier
```javascript
const newApplication = await prisma.application.create({
  data: {
    candidateId: 'candidate-uuid',
    propertyId: 'property-uuid',
    status: 'NEW',
    assignedToId: 'user-uuid',
    completenessScore: 0,
    readinessStatus: 'INCOMPLETE',
    priority: 'MEDIUM'
  }
});
```

## 🚀 Prochaines étapes

1. **Créer les controllers API** pour CRUD des candidats/applications
2. **Migrer imapService** pour persister les emails dans `Thread` et `Message`
3. **Implémenter DossierForge** (génération pack candidature)
4. **Développer le frontend Pipeline** (vue Kanban par statut)
5. **Ajouter Sherlock** (contrôle qualité documents - V1.1)

## 📖 Références CDC

- **Section 6.2** : Pipeline Location (statuts et workflow)
- **Section 6.3** : Swiss Safe (checklist et documents)
- **Section 12** : Champs suisses spécifiques
- **Plan de Bataille 3** : Timeline de Vérité et Deep Core

---

**Version** : 1.0.0  
**Date** : 05/02/2026  
**Architecte** : Hephaestus (Module 2)  
**Statut** : ✅ Production-ready
