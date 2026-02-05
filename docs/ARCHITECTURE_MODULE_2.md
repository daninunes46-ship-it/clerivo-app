# PLAN D'ARCHITECTURE - MODULE 2 : PIPELINE & GESTION CANDIDATS

**Projet :** Clerivo - Module 2 : PIPELINE & GESTION CANDIDATS  
**Architecte :** Hephaestus  
**Date :** 2026-02-05  
**Version :** 1.0 (Proposition pour validation)  
**Statut :** ⛔ EN ATTENTE DE VALIDATION - NE PAS CODER

---

## RÉSUMÉ EXÉCUTIF

Ce document définit l'architecture de base de données et la logique métier du Module 2 de Clerivo, qui intègre :

1. **Swiss Safe** : Système de gestion de la solvabilité selon les standards suisses (Poursuites, Garants, Documents sensibles)
2. **Deep Core** : Liaison profonde entre Inbox (Module 1) et Pipeline (Module 2)
3. **Timeline de Vérité** : Vue chronologique unifiée mêlant Emails, Documents et Événements

**Constat initial :** Le schéma Prisma existant (`apps/backend/prisma/schema.prisma`) contient déjà une architecture solide pour le Module 2. Ce document l'analyse, la valide et propose des ajustements mineurs avant migration.

---

## 1. RÉPONSE AU DÉFI #1 : MODÈLE "SWISS SAFE" & SOLVABILITÉ

### 1.1. Vision Architecturale

Le système doit refléter la rigueur suisse en matière de location immobilière. Contrairement à d'autres marchés, la Suisse impose :

- **Extrait du registre des poursuites** (validité : 3-6 mois maximum)
- **Garants** fréquemment requis (parents, employeurs)
- **Garantie de loyer** limitée à 3 mois de loyer (ASLOCA)
- **Permis de séjour** (B, C, G, L) avec dates d'expiration

L'architecture doit séparer clairement :
- L'**identité** (qui est la personne)
- Son **profil de solvabilité** (son historique financier)
- Ses **garants** (tiers se portant caution)

### 1.2. Modèles de Données (Schéma Prisma Validé)

#### 1.2.1. `Candidate` (Identité Centrale)

**Rôle :** Point d'ancrage unique pour toute personne physique dans le système.

```prisma
model Candidate {
  id          String   @id @default(uuid())
  
  // Identité civile
  firstName   String
  lastName    String
  email       String   @unique
  phone       String?
  dateOfBirth DateTime?
  
  // SPÉCIFICITÉ SUISSE : Statut de résidence
  residencyStatus  ResidencyStatus  @default(NOT_DECLARED)
  permitType       String?          // B, C, G, L, Citoyen CH
  permitExpiry     DateTime?        // Alerte si expiration proche
  
  // Profil applicant (impact checklist)
  applicantType    ApplicantType    @default(SINGLE)
  isStudent        Boolean          @default(false)
  isSelfEmployed   Boolean          @default(false)
  
  // Relations 1→N
  applications     Application[]
  documents        Document[]
  solvencyProfiles SolvencyProfile[]  // Historisation
  guarantors       Guarantor[]
  
  // DataVault (rétention)
  deletedAt        DateTime?
}
```

**Enums associés :**

```prisma
enum ResidencyStatus {
  NOT_DECLARED
  SWISS_CITIZEN
  PERMIT_B        // Autorisation de séjour
  PERMIT_C        // Autorisation d'établissement
  PERMIT_G        // Autorisation frontalier
  PERMIT_L        // Autorisation de courte durée
  OTHER
}

enum ApplicantType {
  SINGLE          // Personne seule
  COUPLE          // Couple (marié ou concubin)
  FLATSHARE       // Colocation
  WITH_GUARANTOR  // Avec garant obligatoire
}
```

**Validation :** ✅ Le modèle `Candidate` est complet et répond aux exigences du CDC Section 12.

---

#### 1.2.2. `SolvencyProfile` (Solvabilité Historisée)

**Rôle :** Profil financier **séparé** et **versionné** du candidat. Un candidat peut avoir plusieurs profils (historique, évolution).

```prisma
model SolvencyProfile {
  id              String   @id @default(uuid())
  candidateId     String
  candidate       Candidate @relation(...)
  
  // ========== SWISS SAFE : POURSUITES ==========
  pursuitsStatus       PursuitsStatus   @default(NOT_CHECKED)
  pursuitsDocumentId   String?          @unique
  pursuitsDocument     Document?        @relation("PursuitsDocument", ...)
  pursuitsIssuedDate   DateTime?        // Date d'émission extrait
  pursuitsExpiryDate   DateTime?        // Date limite validité (3-6 mois)
  pursuitsAmount       Float?           // Montant total poursuites
  pursuitsDetails      String?          // JSON détails (créanciers, dates)
  
  // ========== SWISS SAFE : EMPLOI & REVENUS ==========
  employmentType       EmploymentType   @default(NOT_DECLARED)
  employerName         String?
  employmentStartDate  DateTime?
  contractType         String?          // CDI, CDD
  
  salarySlipsReceived  Int              @default(0)
  salarySlipsRequired  Int              @default(3)  // Standard suisse
  averageMonthlyGross  Float?
  averageMonthlyNet    Float?
  
  // ========== SWISS SAFE : ASSURANCE RC ==========
  hasLiabilityInsurance Boolean         @default(false)
  liabilityDocumentId   String?         @unique
  liabilityDocument     Document?       @relation("LiabilityDocument", ...)
  liabilityInsurer      String?
  liabilityPolicyNumber String?
  
  // ========== SWISS SAFE : GARANTIE DE LOYER ==========
  guaranteeType         GuaranteeType?
  guaranteeAmount       Float?          // Max 3 mois (ASLOCA)
  guaranteeProofId      String?         @unique
  guaranteeProof        Document?       @relation("GuaranteeProof", ...)
  guaranteeInstitution  String?         // SwissCaution, FirstCaution, Banque
  
  // ========== SCORING (V1.1 SolvencyScore) ==========
  solvencyScore         Int?            // 0-100
  solvencyRating        SolvencyRating?
  scoreCalculatedAt     DateTime?
  scoreJustification    String?         // Explication humaine
}
```

**Enums associés :**

```prisma
enum PursuitsStatus {
  NOT_CHECKED
  PENDING_DOCUMENT
  CLEAN              // Pas de poursuites (vert)
  MINOR_ISSUES       // Poursuites mineures acceptables (orange)
  MAJOR_ISSUES       // Poursuites bloquantes (rouge)
  EXPIRED            // Document trop ancien
}

enum EmploymentType {
  NOT_DECLARED
  SALARIED_CDI       // CDI (contrat indéterminé)
  SALARIED_CDD       // CDD (contrat déterminé)
  SELF_EMPLOYED      // Indépendant
  STUDENT
  RETIRED
  UNEMPLOYED
  OTHER
}

enum GuaranteeType {
  BLOCKED_ACCOUNT    // Compte bloqué (standard)
  BANK_GUARANTEE     // Garantie bancaire
  CASH_DEPOSIT       // Dépôt en espèces
  GUARANTOR          // Personne garante
  INSURANCE          // Assurance cautionnement (SwissCaution, etc.)
}

enum SolvencyRating {
  EXCELLENT
  GOOD
  ACCEPTABLE
  RISKY
  REJECTED
}
```

**Validation :** ✅ Le modèle `SolvencyProfile` couvre exhaustivement les exigences du CDC (Sections 4.1, 6.3, 12). L'historisation est possible (relation 1→N avec Candidate).

**💡 Amélioration proposée :** Ajouter un champ `version` pour tracer explicitement les versions du profil :

```prisma
// À ajouter dans SolvencyProfile
version             Int              @default(1)
isActive            Boolean          @default(true)

@@index([candidateId, version])
```

---

#### 1.2.3. `Guarantor` (Garants Suisses)

**Rôle :** Tiers se portant garant (parent, employeur, ami). Peut lui-même avoir un profil de solvabilité.

```prisma
model Guarantor {
  id              String   @id @default(uuid())
  candidateId     String
  candidate       Candidate @relation(...)
  
  // Identité
  firstName       String
  lastName        String
  email           String?
  phone           String?
  relationship    String?  // Parent, Employeur, Ami
  
  // Adresse
  address         String?
  city            String?
  postalCode      String?
  
  // Solvabilité du garant
  monthlyIncome   Float?
  hasOwnPursuits  Boolean  @default(false)
  pursuitsDetails String?  // JSON si poursuites
  
  // Documents garant
  documents       Document[]
}
```

**Validation :** ✅ Le modèle `Guarantor` répond aux besoins du CDC Section 12.

**💡 Amélioration proposée :** Permettre au garant d'avoir son propre `SolvencyProfile` (lien optionnel) pour éviter la duplication de logique :

```prisma
// Option future (V1.2+)
guarantorSolvencyId  String?
guarantorSolvency    SolvencyProfile? @relation(...)
```

---

#### 1.2.4. `Document` (Coffre-Fort Swiss Safe)

**Rôle :** Stockage sécurisé et versionné des documents sensibles (chiffrement via DataVault).

```prisma
model Document {
  id              String   @id @default(uuid())
  candidateId     String?
  candidate       Candidate? @relation(...)
  guarantorId     String?
  guarantor       Guarantor? @relation(...)
  
  // Métadonnées fichier
  filename        String
  originalName    String
  mimeType        String
  size            Int
  checksum        String   @unique  // Déduplication
  
  // Stockage (chiffré)
  storagePath     String
  isEncrypted     Boolean  @default(true)
  
  // Classification
  documentType    DocumentType
  category        String?
  
  // Validation (Sherlock V1.1)
  validationStatus ValidationStatus @default(PENDING)
  validatedAt      DateTime?
  validatedById    String?
  validationNotes  String?
  
  // Validité temporelle (CDC 4.1)
  issueDate        DateTime?
  expiryDate       DateTime?
  isExpired        Boolean  @default(false)
  
  // OCR & Analyse IA
  extractedText    String?
  ocrConfidence    Float?
  hasQualityIssues Boolean  @default(false)
  qualityIssues    String?   // JSON alertes Sherlock
  
  // Relations inverses (liens vers SolvencyProfile)
  pursuitsProfiles    SolvencyProfile[] @relation("PursuitsDocument")
  liabilityProfiles   SolvencyProfile[] @relation("LiabilityDocument")
  guaranteeProfiles   SolvencyProfile[] @relation("GuaranteeProof")
}
```

**Enums associés :**

```prisma
enum DocumentType {
  IDENTITY              // Carte d'identité
  PERMIT                // Permis de séjour (B, C, G, L)
  SALARY_SLIP           // Fiche de salaire
  EMPLOYMENT_CONTRACT   // Contrat de travail
  PURSUITS_EXTRACT      // Extrait poursuites (CRITIQUE)
  LIABILITY_INSURANCE   // Attestation RC (obligatoire)
  GUARANTEE_PROOF       // Preuve garantie loyer
  REFERENCE_LETTER      // Lettre de recommandation
  MOTIVATION_LETTER     // Lettre de motivation
  APPLICATION_FORM      // Formulaire de demande
  TAX_RETURN            // Déclaration fiscale
  BANK_STATEMENT        // Relevé bancaire
  OTHER
}

enum ValidationStatus {
  PENDING
  VALID
  REJECTED
  EXPIRED
  REQUIRES_REPLACEMENT
}
```

**Validation :** ✅ Le modèle `Document` répond aux exigences du CDC (Sections 4.1, 6.3) et Plan de Bataille 8 (Swiss Safe).

**💡 Amélioration proposée :** Ajouter un système de versioning explicite pour les documents remplacés :

```prisma
// À ajouter dans Document
replacesDocumentId  String?
replacedByDocumentId String?
```

---

### 1.3. Diagramme Conceptuel : Swiss Safe

```
┌──────────────────────────────────────────────────────────────┐
│                       CANDIDATE (Identité)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ id, firstName, lastName, email, phone                  │  │
│  │ residencyStatus, permitType, permitExpiry              │  │
│  │ applicantType (SINGLE, COUPLE, FLATSHARE, GUARANTOR)   │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────┬──────────────────┬──────────────────┬─────────┘
                │                  │                  │
                │ 1→N             │ 1→N             │ 1→N
                ▼                  ▼                  ▼
    ┌───────────────────┐  ┌──────────────┐  ┌──────────────┐
    │ SOLVENCY_PROFILE  │  │  GUARANTOR   │  │  DOCUMENT    │
    │ (Historisé)       │  │              │  │ (Swiss Safe) │
    ├───────────────────┤  ├──────────────┤  ├──────────────┤
    │ pursuitsStatus    │  │ relationship │  │ documentType │
    │ pursuitsDocument  │◄─┤ monthlyIncome│  │ checksum     │
    │ employmentType    │  │ hasOwnPursuits│ │ isEncrypted  │
    │ salarySlips       │  │              │  │ validationStatus│
    │ liabilityInsurance│◄─┤ documents[]  │◄─┤ expiryDate   │
    │ guaranteeType     │  │              │  │ extractedText│
    │ solvencyScore     │  └──────────────┘  │ qualityIssues│
    │ solvencyRating    │                     └──────────────┘
    └───────────────────┘
            │
            │ 1→3 (relations vers Document)
            ▼
    ┌───────────────────┐
    │ pursuitsDocument  │
    │ liabilityDocument │
    │ guaranteeProof    │
    └───────────────────┘
```

---

### 1.4. Règles Métier Swiss Safe

#### Règle #1 : Validité Temporelle des Poursuites
```
IF pursuitsIssuedDate < (NOW() - 3 mois)
  THEN pursuitsStatus = EXPIRED
  AND déclencher alerte "Document périmé"
```

#### Règle #2 : Garant Obligatoire
```
IF candidate.applicantType = WITH_GUARANTOR
  AND COUNT(guarantors) = 0
  THEN readinessStatus = INCOMPLETE
```

#### Règle #3 : Limite Garantie de Loyer (ASLOCA)
```
IF guaranteeAmount > (property.monthlyRent * 3)
  THEN déclencher alerte "Garantie excessive (max 3 mois)"
```

#### Règle #4 : Checklist Dynamique
```
Pièces OBLIGATOIRES (Suisse Standard) :
  - IDENTITY ou PERMIT (si étranger)
  - PURSUITS_EXTRACT (< 3-6 mois)
  - SALARY_SLIP (3 derniers mois si salarié)
  - LIABILITY_INSURANCE (RC)
  - GUARANTEE_PROOF (sauf si garant)
  
Pièces CONDITIONNELLES :
  - EMPLOYMENT_CONTRACT (si CDD)
  - TAX_RETURN (si indépendant)
  - REFERENCE_LETTER (selon régie)
```

---

## 2. RÉPONSE AU DÉFI #2 : INTÉGRATION "DEEP CORE" (INBOX ↔ PIPELINE)

### 2.1. Vision Architecturale

Le Module 1 (Inbox) a créé les entités `Thread` et `Message`. Le Module 2 (Pipeline) introduit `Application` (dossier de candidature).

**Problème :** Comment lier un fil de discussion email à un dossier sans casser l'existant ?

**Solution Deep Core :** Lien bidirectionnel entre `Thread` et `Application`.

### 2.2. Modification du Modèle Thread (Lien Deep Core)

**État actuel :** Le modèle `Thread` existe (voir schéma).

**Modification proposée :** ✅ **DÉJÀ IMPLÉMENTÉE** dans le schéma existant !

```prisma
model Thread {
  id              String   @id @default(uuid())
  subject         String
  participants    String    // JSON array
  lastMessageAt   DateTime
  
  // ========== DEEP CORE LINK ==========
  applicationId   String?
  application     Application? @relation(fields: [applicationId], references: [id], onDelete: SetNull)
  // ====================================
  
  status          ThreadStatus @default(NEW)
  assignedToId    String?
  assignedTo      User? @relation(...)
  messages        Message[]
  
  // Recherche vectorielle (Plan de Bataille 3)
  embeddingVector Bytes?
}
```

**Validation :** ✅ Le lien Deep Core est **DÉJÀ EN PLACE**. `Thread.applicationId` permet le rattachement.

**Comportement :** 
- Un `Thread` peut exister **sans** `Application` (email entrant non encore qualifié)
- Un `Thread` peut être rattaché à une `Application` (via `applicationId`)
- Une `Application` peut avoir **plusieurs** `Thread` (candidat envoie plusieurs emails, conversation avec régie, etc.)

### 2.3. Relation Inverse : Application → Threads

```prisma
model Application {
  id              String   @id @default(uuid())
  candidateId     String
  candidate       Candidate @relation(...)
  propertyId      String?
  property        Property? @relation(...)
  
  // ========== DEEP CORE LINK ==========
  threads         Thread[]  // Relation inverse (1→N)
  // ====================================
  
  status          ApplicationStatus @default(NEW)
  events          ApplicationEvent[]  // Timeline de Vérité
  // ... autres champs
}
```

**Validation :** ✅ La relation inverse existe.

---

### 2.4. Timeline de Vérité : Fusion Emails + Documents + Événements

**Concept (Plan de Bataille 3) :** La "Timeline de Vérité" doit afficher **chronologiquement** tous les éléments liés à un dossier :

1. Emails (via `Thread` → `Message`)
2. Documents (via `Candidate` → `Document`)
3. Événements système (via `Application` → `ApplicationEvent`)

**Architecture :**

```prisma
model ApplicationEvent {
  id              String   @id @default(uuid())
  applicationId   String
  application     Application @relation(...)
  
  createdAt       DateTime @default(now())
  
  eventType       EventType
  title           String
  description     String?
  
  // Acteur
  userId          String?
  user            User? @relation(...)
  
  // Liens optionnels vers entités
  messageId       String?   // Lien vers Message (email)
  documentId      String?   // Lien vers Document (upload)
  
  metadata        String?   // JSON
}
```

**Enums EventType (complet) :**

```prisma
enum EventType {
  // Communication (emails via messageId)
  EMAIL_RECEIVED
  EMAIL_SENT
  CALL_LOGGED
  SMS_SENT
  
  // Documents (uploads via documentId)
  DOCUMENT_UPLOADED
  DOCUMENT_VALIDATED
  DOCUMENT_REJECTED
  DOCUMENT_EXPIRED
  DOCUMENT_REQUESTED
  
  // Workflow Pipeline
  STATUS_CHANGED
  ASSIGNED
  REASSIGNED
  PRIORITY_CHANGED
  
  // Visite (Chronos & Scheduler V1)
  VISIT_SCHEDULED
  VISIT_RESCHEDULED
  VISIT_CANCELLED
  VISIT_COMPLETED
  VISIT_NO_SHOW
  
  // Décisions (Swiss Safe)
  SOLVENCY_CALCULATED
  QUALITY_CHECK_PASSED
  QUALITY_CHECK_FAILED
  TRANSMITTED_TO_LANDLORD
  DECISION_RECEIVED
  
  // Système
  PACK_GENERATED      // DossierForge
  REMINDER_SENT
  ALERT_TRIGGERED
  NOTE_ADDED
}
```

**Validation :** ✅ Le modèle `ApplicationEvent` permet de construire la Timeline de Vérité.

---

### 2.5. Requête SQL pour Timeline de Vérité (Exemple)

Pour afficher la timeline complète d'une application :

```sql
-- Timeline unifiée (emails + documents + événements)
SELECT 
  'MESSAGE' as type,
  m.id,
  m.createdAt as timestamp,
  m.subject as title,
  m.from as actor,
  NULL as documentType
FROM Message m
JOIN Thread t ON m.threadId = t.id
WHERE t.applicationId = :applicationId

UNION ALL

SELECT 
  'DOCUMENT' as type,
  d.id,
  d.createdAt as timestamp,
  d.filename as title,
  d.validatedById as actor,
  d.documentType
FROM Document d
JOIN Candidate c ON d.candidateId = c.id
JOIN Application a ON c.id = a.candidateId
WHERE a.id = :applicationId

UNION ALL

SELECT 
  'EVENT' as type,
  e.id,
  e.createdAt as timestamp,
  e.title,
  e.userId as actor,
  NULL as documentType
FROM ApplicationEvent e
WHERE e.applicationId = :applicationId

ORDER BY timestamp DESC;
```

---

### 2.6. Diagramme Conceptuel : Deep Core

```
┌─────────────────────────────────────────────────────────────┐
│                        MODULE 1 : INBOX                     │
├─────────────────────────────────────────────────────────────┤
│  THREAD (Fil de discussion)                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ id, subject, participants, status                    │   │
│  │ applicationId  ◄────────────┐                        │   │
│  └─────┬────────────────────────┘                        │   │
│        │ 1→N                    │                            │
│        ▼                        │                            │
│  ┌──────────────────────┐      │                            │
│  │ MESSAGE (Emails)     │      │                            │
│  │ from, to, subject    │      │                            │
│  │ textBody, htmlBody   │      │                            │
│  └──────────────────────┘      │                            │
└────────────────────────────────┼────────────────────────────┘
                                 │
                  DEEP CORE LINK │
                                 │
┌────────────────────────────────┼────────────────────────────┐
│                        MODULE 2 : PIPELINE                  │
├────────────────────────────────┼────────────────────────────┤
│  APPLICATION (Dossier)         │                            │
│  ┌────────────────────────────┼─────────────────────────┐  │
│  │ id, candidateId, propertyId│                         │  │
│  │ status, readinessStatus    │                         │  │
│  │ threads[]  ◄───────────────┘                         │  │
│  └─────┬──────────────────────────────────────────────┬─┘  │
│        │ 1→N                                          │     │
│        ▼                                              ▼     │
│  ┌──────────────────────┐                ┌─────────────────┐│
│  │ APPLICATION_EVENT    │                │ CANDIDATE       ││
│  │ (Timeline)           │                │ (Identité)      ││
│  │                      │                │                 ││
│  │ eventType            │                │ → Documents[]   ││
│  │ messageId (→Message) │                │ → Solvency[]    ││
│  │ documentId (→Doc)    │                │ → Guarantors[]  ││
│  └──────────────────────┘                └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 3. RÉPONSE AU DÉFI #3 : WORKFLOW DU PIPELINE (ÉTATS & TRANSITIONS)

### 3.1. Enum ApplicationStatus (CDC Section 6.2)

Le CDC décrit le parcours locatif suisse complet. Voici l'Enum **exact** correspondant :

```prisma
enum ApplicationStatus {
  // ========== PHASE 1 : CONTACT INITIAL ==========
  NEW                  // Demande entrante (email/formulaire)
  TO_QUALIFY           // À qualifier (vérifier critères de base)
  
  // ========== PHASE 2 : VISITE ==========
  VISIT_SCHEDULED      // Visite planifiée (via Chronos)
  VISIT_DONE           // Visite effectuée, attente dossier
  VISIT_NO_SHOW        // Candidat absent (alerte/relance)
  
  // ========== PHASE 3 : CONSTITUTION DOSSIER (SWISS SAFE) ==========
  DOSSIER_INCOMPLETE   // Dossier incomplet (attente pièces)
  DOSSIER_PENDING      // Pièces reçues, validation en cours
  DOSSIER_READY        // Dossier complet et validé (DossierForge OK)
  
  // ========== PHASE 4 : TRANSMISSION & DÉCISION ==========
  TRANSMITTED          // Transmis à la régie/bailleur
  UNDER_REVIEW         // En cours d'analyse par régie
  ADDITIONAL_INFO      // Informations complémentaires demandées
  
  // ========== PHASE 5 : DÉCISION FINALE ==========
  RETAINED             // Candidat retenu (pré-signature)
  REJECTED             // Candidat refusé
  
  // ========== PHASE 6 : CONTRACTUALISATION (V1.2 CAUTIONFLOW) ==========
  AWAITING_GUARANTEE   // Attente garantie de loyer
  GUARANTEE_RECEIVED   // Garantie reçue
  CONTRACT_SIGNED      // Bail signé ✅
  
  // ========== ÉTATS SPÉCIAUX ==========
  ON_HOLD              // En attente (candidat/régie)
  WITHDRAWN            // Candidature retirée par candidat
  ARCHIVED             // Archivé (DataVault)
}
```

**Total :** 19 statuts couvrant l'intégralité du cycle de vie.

---

### 3.2. Transitions Autorisées (Workflow FSM)

**Règles de transition (Finite State Machine) :**

```javascript
const ALLOWED_TRANSITIONS = {
  NEW: ['TO_QUALIFY', 'REJECTED', 'ARCHIVED'],
  TO_QUALIFY: ['VISIT_SCHEDULED', 'REJECTED', 'ON_HOLD'],
  
  VISIT_SCHEDULED: ['VISIT_DONE', 'VISIT_NO_SHOW', 'ON_HOLD'],
  VISIT_NO_SHOW: ['VISIT_SCHEDULED', 'WITHDRAWN', 'ARCHIVED'],
  VISIT_DONE: ['DOSSIER_INCOMPLETE', 'WITHDRAWN'],
  
  DOSSIER_INCOMPLETE: ['DOSSIER_PENDING', 'WITHDRAWN', 'ON_HOLD'],
  DOSSIER_PENDING: ['DOSSIER_READY', 'DOSSIER_INCOMPLETE'],
  DOSSIER_READY: ['TRANSMITTED', 'ON_HOLD'],
  
  TRANSMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['ADDITIONAL_INFO', 'RETAINED', 'REJECTED'],
  ADDITIONAL_INFO: ['UNDER_REVIEW'],
  
  RETAINED: ['AWAITING_GUARANTEE'],
  REJECTED: ['ARCHIVED'],
  
  AWAITING_GUARANTEE: ['GUARANTEE_RECEIVED', 'ON_HOLD'],
  GUARANTEE_RECEIVED: ['CONTRACT_SIGNED'],
  CONTRACT_SIGNED: ['ARCHIVED'],
  
  ON_HOLD: ['TO_QUALIFY', 'VISIT_SCHEDULED', 'DOSSIER_INCOMPLETE', 'TRANSMITTED'],
  WITHDRAWN: ['ARCHIVED'],
  ARCHIVED: []  // État terminal
};
```

---

### 3.3. Diagramme de Flux (Workflow Pipeline)

```
    START
      │
      ▼
   ┌─────┐
   │ NEW │──────────────────────────┐
   └──┬──┘                          │
      │                             │
      ▼                             ▼
 ┌────────────┐               ┌──────────┐
 │ TO_QUALIFY │               │ REJECTED │
 └─────┬──────┘               └────┬─────┘
       │                           │
       ▼                           ▼
 ┌──────────────────┐         ┌──────────┐
 │ VISIT_SCHEDULED  │         │ ARCHIVED │
 └────┬─────────────┘         └──────────┘
      │                            END
      ▼
 ┌───────────┐     ┌──────────────┐
 │VISIT_DONE │     │VISIT_NO_SHOW │
 └─────┬─────┘     └──────────────┘
       │
       ▼
 ┌────────────────────┐
 │ DOSSIER_INCOMPLETE │
 └──────┬─────────────┘
        │
        ▼
 ┌──────────────────┐
 │ DOSSIER_PENDING  │
 └──────┬───────────┘
        │
        ▼
 ┌──────────────┐
 │ DOSSIER_READY│
 └──────┬───────┘
        │
        ▼
 ┌─────────────┐
 │ TRANSMITTED │
 └──────┬──────┘
        │
        ▼
 ┌──────────────┐     ┌──────────────┐
 │ UNDER_REVIEW │────►│ RETAINED     │────► ... CONTRACT_SIGNED
 └──────┬───────┘     └──────────────┘
        │
        ▼
   ┌──────────┐
   │ REJECTED │
   └──────────┘
```

---

### 3.4. Règles Métier de Transition

#### Règle #1 : Blocage DOSSIER_READY
```
IF status = DOSSIER_READY
  AND readinessStatus != READY
  THEN BLOQUER transition vers TRANSMITTED
  ET déclencher alerte "Dossier marqué prêt mais incomplet"
```

#### Règle #2 : Visite obligatoire
```
IF status < VISIT_DONE
  AND tentative de passage à DOSSIER_INCOMPLETE
  THEN BLOQUER
  ET message "Visite non effectuée"
```

#### Règle #3 : Audit de changement
```
À CHAQUE changement de status :
  - Enregistrer dans AuditLog
  - Créer ApplicationEvent (type: STATUS_CHANGED)
  - Stocker previousStatus
  - Horodater statusChangedAt
```

---

## 4. SYNTHÈSE : LISTE DES MODÈLES & ENUMS

### 4.1. Modèles Prisma à Créer/Modifier

**✅ DÉJÀ PRÉSENTS dans le schéma (validation OK) :**

1. `Candidate` (identité centrale)
2. `SolvencyProfile` (solvabilité historisée)
3. `Guarantor` (garants)
4. `Document` (coffre-fort Swiss Safe)
5. `Application` (dossier candidature)
6. `ApplicationEvent` (timeline de vérité)
7. `Thread` (lien Deep Core)
8. `Message` (emails)
9. `Property` (biens)
10. `User` (TeamOps)
11. `AuditLog` (traçabilité)
12. `SecurityEvent` (alertes sécurité)
13. `Attachment` (pièces jointes email)
14. `InternalComment` (collaboration)

**💡 MODIFICATIONS MINEURES PROPOSÉES :**

| Modèle | Ajout | Raison |
|--------|-------|--------|
| `SolvencyProfile` | `version Int`, `isActive Boolean` | Traçabilité versions |
| `Document` | `replacesDocumentId String?`, `replacedByDocumentId String?` | Versioning documents |
| `Guarantor` | `guarantorSolvencyId String?` (optionnel) | Lien vers SolvencyProfile (V1.2+) |

---

### 4.2. Liste Complète des Enums

#### Swiss Safe & Candidats
```prisma
enum ResidencyStatus {
  NOT_DECLARED, SWISS_CITIZEN, PERMIT_B, PERMIT_C, 
  PERMIT_G, PERMIT_L, OTHER
}

enum ApplicantType {
  SINGLE, COUPLE, FLATSHARE, WITH_GUARANTOR
}

enum PursuitsStatus {
  NOT_CHECKED, PENDING_DOCUMENT, CLEAN, 
  MINOR_ISSUES, MAJOR_ISSUES, EXPIRED
}

enum EmploymentType {
  NOT_DECLARED, SALARIED_CDI, SALARIED_CDD,
  SELF_EMPLOYED, STUDENT, RETIRED, UNEMPLOYED, OTHER
}

enum GuaranteeType {
  BLOCKED_ACCOUNT, BANK_GUARANTEE, CASH_DEPOSIT,
  GUARANTOR, INSURANCE
}

enum SolvencyRating {
  EXCELLENT, GOOD, ACCEPTABLE, RISKY, REJECTED
}
```

#### Documents
```prisma
enum DocumentType {
  IDENTITY, PERMIT, SALARY_SLIP, EMPLOYMENT_CONTRACT,
  PURSUITS_EXTRACT, LIABILITY_INSURANCE, GUARANTEE_PROOF,
  REFERENCE_LETTER, MOTIVATION_LETTER, APPLICATION_FORM,
  TAX_RETURN, BANK_STATEMENT, OTHER
}

enum ValidationStatus {
  PENDING, VALID, REJECTED, EXPIRED, REQUIRES_REPLACEMENT
}
```

#### Pipeline
```prisma
enum ApplicationStatus {
  NEW, TO_QUALIFY,
  VISIT_SCHEDULED, VISIT_DONE, VISIT_NO_SHOW,
  DOSSIER_INCOMPLETE, DOSSIER_PENDING, DOSSIER_READY,
  TRANSMITTED, UNDER_REVIEW, ADDITIONAL_INFO,
  RETAINED, REJECTED,
  AWAITING_GUARANTEE, GUARANTEE_RECEIVED, CONTRACT_SIGNED,
  ON_HOLD, WITHDRAWN, ARCHIVED
}

enum ReadinessStatus {
  INCOMPLETE, ALMOST_READY, READY, BLOCKED
}

enum Priority {
  LOW, MEDIUM, HIGH, CRITICAL
}

enum EventType {
  EMAIL_RECEIVED, EMAIL_SENT, CALL_LOGGED, SMS_SENT,
  DOCUMENT_UPLOADED, DOCUMENT_VALIDATED, DOCUMENT_REJECTED,
  DOCUMENT_EXPIRED, DOCUMENT_REQUESTED,
  STATUS_CHANGED, ASSIGNED, REASSIGNED, PRIORITY_CHANGED,
  VISIT_SCHEDULED, VISIT_RESCHEDULED, VISIT_CANCELLED,
  VISIT_COMPLETED, VISIT_NO_SHOW,
  SOLVENCY_CALCULATED, QUALITY_CHECK_PASSED, QUALITY_CHECK_FAILED,
  TRANSMITTED_TO_LANDLORD, DECISION_RECEIVED,
  PACK_GENERATED, REMINDER_SENT, ALERT_TRIGGERED, NOTE_ADDED
}
```

#### Messaging
```prisma
enum ThreadStatus {
  NEW, TO_QUALIFY, AWAITING_DOCUMENTS, READY,
  IN_PROGRESS, AWAITING_RESPONSE, CLOSED, ARCHIVED
}

enum UrgencyLevel {
  LOW, MEDIUM, HIGH, CRITICAL
}
```

#### Biens
```prisma
enum PropertyType {
  APARTMENT, HOUSE, STUDIO, LOFT, 
  COMMERCIAL, PARKING, OTHER
}

enum PropertyStatus {
  AVAILABLE, RESERVED, RENTED, UNAVAILABLE, MAINTENANCE
}
```

#### Sécurité
```prisma
enum SecurityEventType {
  IBAN_ALERT, SUSPICIOUS_LOGIN, MULTIPLE_FAILED_LOGINS,
  DOCUMENT_ACCESS_VIOLATION, BULK_EXPORT,
  UNAUTHORIZED_ACCESS, DATA_LEAK_ATTEMPT,
  SUSPICIOUS_DOCUMENT, FRAUDULENT_DOCUMENT_DETECTED, OTHER
}

enum SecuritySeverity {
  INFO, WARNING, HIGH, CRITICAL
}
```

#### TeamOps
```prisma
enum UserRole {
  ADMIN, MANAGER, AGENT, READONLY
}
```

---

## 5. DIAGRAMME RELATIONNEL GLOBAL (ER DIAGRAM)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLERIVO MODULE 2                              │
│                   Architecture Relationnelle Complète                   │
└─────────────────────────────────────────────────────────────────────────┘

         ┌──────────────┐
         │     USER     │
         │  (TeamOps)   │
         └───────┬──────┘
                 │
                 │ assignedTo (1→N)
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌─────────┐  ┌─────────┐  ┌──────────────┐
│ THREAD  │  │APPLICA- │  │   PROPERTY   │
│(Inbox)  │  │  TION   │  │   (Bien)     │
└────┬────┘  └────┬────┘  └──────┬───────┘
     │            │              │
     │            │ candidateId  │ propertyId
     │            │              │
     │applicationId (Deep Core)  │
     │            ▼              ▼
     └───────►┌──────────────────┐◄──────┐
              │    CANDIDATE     │       │
              │   (Identité)     │       │
              └────┬──────┬──────┘       │
                   │      │              │
           ┌───────┘      └───────┐      │
           │                      │      │
           ▼                      ▼      │
    ┌─────────────┐        ┌──────────┐ │
    │  SOLVENCY   │        │ GUARANTOR│ │
    │   PROFILE   │        └─────┬────┘ │
    │             │              │      │
    │ ┌─────────┐ │              │      │
    │ │pursuits │◄┼──┐           │      │
    │ │liability│◄┼──┼───┐       │      │
    │ │guarantee│◄┼──┼───┼───┐   │      │
    │ └─────────┘ │  │   │   │   │      │
    └─────────────┘  │   │   │   │      │
                     │   │   │   │      │
                  ┌──┴───┴───┴───┴──────┘
                  ▼
            ┌──────────────┐
            │   DOCUMENT   │
            │ (Swiss Safe) │
            │              │
            │ documentType │
            │ checksum     │
            │ isEncrypted  │
            │ expiryDate   │
            └──────────────┘
                  ▲
                  │
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
    ┌──────────┐    ┌──────────────┐
    │ATTACHMENT│    │ APPLICATION  │
    │ (Email)  │    │    EVENT     │
    └────┬─────┘    │ (Timeline)   │
         │          └──────────────┘
         │                 ▲
         ▼                 │
    ┌──────────┐           │
    │ MESSAGE  │───────────┘
    │ (Email)  │ messageId
    └──────────┘

┌──────────────────────────────────────┐
│      AUDIT & SECURITY (DataVault)    │
├──────────────────────────────────────┤
│  • AUDIT_LOG                         │
│  • SECURITY_EVENT                    │
│  • INTERNAL_COMMENT (Collaboration)  │
└──────────────────────────────────────┘
```

---

## 6. PLAN D'IMPLÉMENTATION (ROADMAP)

### Phase 1 : Validation & Migration DB (Semaines 1-2)
- [ ] **Validation finale du schéma** par l'équipe
- [ ] **Migration Prisma** :
  ```bash
  npx prisma migrate dev --name module_2_pipeline_swiss_safe
  ```
- [ ] **Tests d'intégrité** des relations
- [ ] **Seed data** (candidats de test, documents fictifs)

### Phase 2 : Backend API (Semaines 3-5)
- [ ] **CRUD Candidates** (`candidateController.js`) ✅ DÉJÀ CRÉÉ
- [ ] **CRUD SolvencyProfile** (gestion profils)
- [ ] **CRUD Guarantors** (gestion garants)
- [ ] **CRUD Applications** (workflow pipeline)
- [ ] **Document Upload Service** (Swiss Safe avec chiffrement)
- [ ] **Timeline Service** (agrégation Events + Messages + Documents)

### Phase 3 : Logique Métier (Semaines 6-7)
- [ ] **Checklist Dynamique** (pièces obligatoires selon profil)
- [ ] **Moteur de Validation** (dates d'expiration, alertes)
- [ ] **FSM Workflow** (transitions ApplicationStatus)
- [ ] **Deep Core Linking** (rattachement Thread ↔ Application)

### Phase 4 : Frontend (Semaines 8-10)
- [ ] **Page Pipeline** (Kanban par statut)
- [ ] **Page Détail Candidat** (fiche + timeline)
- [ ] **Page Détail Dossier** (Application + Swiss Safe)
- [ ] **Composant Timeline de Vérité** (fusion events/emails/docs)
- [ ] **Formulaire Upload Documents** (drag & drop)

### Phase 5 : Tests & Sécurité (Semaines 11-12)
- [ ] **Tests unitaires** (services métier)
- [ ] **Tests d'intégration** (workflow complet)
- [ ] **Audit de sécurité** (chiffrement, permissions)
- [ ] **Tests DataVault** (rétention, purge)

---

## 7. RISQUES & MITIGATIONS

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Migration DB complexe** | Haut | Moyen | Backup complet avant migration + rollback plan |
| **Performance Timeline** | Moyen | Moyen | Indexes optimisés + pagination + cache |
| **Volumétrie Documents** | Haut | Haut | Compression + stockage externe + LUKS chiffré |
| **Complexité Workflow** | Moyen | Haut | Tests FSM exhaustifs + validation UI |
| **Dates d'expiration** | Moyen | Moyen | Cron job quotidien + alertes proactives |

---

## 8. VALIDATION REQUISE

**⛔ STOP - NE PAS CODER AVANT VALIDATION**

Ce plan d'architecture doit être validé sur les points suivants :

### 8.1. Questions à Valider

1. **SolvencyProfile Versioning** : Confirmer l'ajout des champs `version` et `isActive` ?
2. **Document Versioning** : Confirmer l'ajout de `replacesDocumentId` / `replacedByDocumentId` ?
3. **Guarantor SolvencyProfile** : Faut-il permettre un lien vers SolvencyProfile dès V1 ou reporter à V1.2 ?
4. **ApplicationStatus** : Les 19 statuts couvrent-ils tous les cas métiers réels ? Manque-t-il un statut ?
5. **Deep Core** : Le lien actuel `Thread.applicationId` (optionnel) est-il suffisant ou faut-il une table de jonction ?

### 8.2. Décisions Attendues

- [ ] **Approuver** le schéma tel quel (migration immédiate)
- [ ] **Approuver avec modifications mineures** (préciser lesquelles)
- [ ] **Revoir** l'architecture (identifier les points bloquants)

---

## 9. CONCLUSION

L'architecture proposée pour le Module 2 répond exhaustivement aux trois défis :

1. ✅ **Swiss Safe & Solvabilité** : Modèles `Candidate`, `SolvencyProfile`, `Guarantor`, `Document` couvrent 100% des spécificités suisses (Poursuites, Permis, Garants, RC, Garantie 3 mois)

2. ✅ **Deep Core** : Lien bidirectionnel `Thread ↔ Application` opérationnel + `ApplicationEvent` pour Timeline de Vérité

3. ✅ **Workflow Pipeline** : 19 statuts couvrant le cycle complet (NEW → CONTRACT_SIGNED) avec FSM strict

**L'architecture est prête pour la migration DB.**

---

**Hephaestus - Architecte Technique Principal**  
*"Forge d'abord l'architecture, le code coulera ensuite."*

---

## ANNEXE A : Checklist de Pré-Migration

```bash
# 1. Backup DB existante
cp apps/backend/prisma/dev.db apps/backend/prisma/dev.db.backup_$(date +%Y%m%d_%H%M%S)

# 2. Vérifier schéma Prisma
npx prisma format
npx prisma validate

# 3. Générer migration (DRY RUN)
npx prisma migrate dev --create-only --name module_2_swiss_safe

# 4. Inspecter SQL généré
cat apps/backend/prisma/migrations/XXX_module_2_swiss_safe/migration.sql

# 5. Exécuter migration
npx prisma migrate dev

# 6. Vérifier intégrité
npx prisma studio

# 7. Seed data test
node apps/backend/prisma/seed.js
```

---

## ANNEXE B : Exemples de Requêtes Prisma

### Créer un candidat complet (Swiss Safe)

```javascript
const candidate = await prisma.candidate.create({
  data: {
    firstName: "Jean",
    lastName: "Martin",
    email: "j.martin@example.ch",
    phone: "+41791234567",
    residencyStatus: "PERMIT_B",
    permitType: "B",
    permitExpiry: new Date("2027-12-31"),
    applicantType: "SINGLE",
    
    solvencyProfiles: {
      create: {
        pursuitsStatus: "PENDING_DOCUMENT",
        employmentType: "SALARIED_CDI",
        employerName: "Acme SA",
        salarySlipsRequired: 3,
        salarySlipsReceived: 0,
      }
    }
  },
  include: {
    solvencyProfiles: true
  }
});
```

### Lier un Thread à une Application (Deep Core)

```javascript
await prisma.thread.update({
  where: { id: threadId },
  data: {
    applicationId: applicationId,
    status: "IN_PROGRESS"
  }
});

// Créer événement Timeline
await prisma.applicationEvent.create({
  data: {
    applicationId: applicationId,
    eventType: "EMAIL_RECEIVED",
    title: "Candidat a envoyé son dossier",
    messageId: messageId,
    userId: currentUserId
  }
});
```

### Récupérer Timeline de Vérité

```javascript
const timeline = await prisma.applicationEvent.findMany({
  where: { applicationId },
  include: {
    user: { select: { firstName: true, lastName: true } }
  },
  orderBy: { createdAt: 'desc' }
});

// Fusionner avec messages
const messages = await prisma.message.findMany({
  where: { 
    thread: { applicationId } 
  },
  orderBy: { receivedAt: 'desc' }
});

// Fusionner avec documents
const documents = await prisma.document.findMany({
  where: { 
    candidate: { 
      applications: { some: { id: applicationId } } 
    } 
  },
  orderBy: { createdAt: 'desc' }
});

const unifiedTimeline = [...timeline, ...messages, ...documents]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
```

---

**FIN DU PLAN D'ARCHITECTURE MODULE 2**
