# 🚀 QUICK START - Module 2 (Pipeline & Candidats)

## Démarrage Rapide (5 minutes)

### 1. Vérifier que tout est installé

```bash
cd apps/backend

# Vérifier les dépendances
npm list @prisma/client prisma

# Si pas installé :
npm install
```

### 2. Explorer les données

```bash
# Option A : Interface graphique (recommandé)
npm run db:studio
# ➡️ Ouvre http://localhost:5555

# Option B : CLI rapide
node prisma/inspect.js stats        # Statistiques
node prisma/inspect.js candidates   # Liste des candidats
node prisma/inspect.js all          # Tout afficher
```

### 3. Utiliser Prisma dans votre code

```javascript
// Dans n'importe quel fichier backend
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Exemple : Récupérer un candidat avec son profil
const candidate = await prisma.candidate.findUnique({
  where: { email: 'jean.dupont@example.ch' },
  include: {
    solvencyProfiles: true,
    documents: true,
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

console.log(candidate);
```

---

## 📋 Exemples de Requêtes Courantes

### Lister toutes les candidatures actives

```javascript
const activeApplications = await prisma.application.findMany({
  where: {
    status: {
      notIn: ['REJECTED', 'ARCHIVED', 'WITHDRAWN']
    }
  },
  include: {
    candidate: true,
    property: true,
    assignedTo: true
  },
  orderBy: {
    updatedAt: 'desc'
  }
});
```

### Récupérer le pipeline pour un bien

```javascript
const pipelineByProperty = await prisma.application.findMany({
  where: {
    propertyId: 'property-uuid-here'
  },
  include: {
    candidate: {
      include: {
        solvencyProfiles: true
      }
    }
  },
  orderBy: [
    { status: 'asc' },
    { createdAt: 'desc' }
  ]
});

// Grouper par statut (pour un Kanban)
const grouped = pipelineByProperty.reduce((acc, app) => {
  if (!acc[app.status]) acc[app.status] = [];
  acc[app.status].push(app);
  return acc;
}, {});
```

### Créer une nouvelle candidature

```javascript
const newApplication = await prisma.application.create({
  data: {
    candidate: {
      connect: { id: candidateId }
    },
    property: {
      connect: { id: propertyId }
    },
    assignedTo: {
      connect: { id: userId }
    },
    status: 'NEW',
    readinessStatus: 'INCOMPLETE',
    completenessScore: 0,
    priority: 'MEDIUM',
    source: 'Email',
    events: {
      create: {
        eventType: 'STATUS_CHANGED',
        title: 'Nouvelle candidature',
        description: 'Candidature créée suite à un contact email',
        userId: userId
      }
    }
  },
  include: {
    candidate: true,
    property: true
  }
});
```

### Changer le statut d'une candidature

```javascript
const updated = await prisma.application.update({
  where: { id: applicationId },
  data: {
    previousStatus: currentStatus,
    status: newStatus,
    statusChangedAt: new Date(),
    events: {
      create: {
        eventType: 'STATUS_CHANGED',
        title: `Statut changé : ${newStatus}`,
        description: `Passage de ${currentStatus} à ${newStatus}`,
        userId: userId,
        metadata: JSON.stringify({
          from: currentStatus,
          to: newStatus,
          reason: 'User action'
        })
      }
    }
  }
});

// Créer un log d'audit
await prisma.auditLog.create({
  data: {
    userId: userId,
    action: 'UPDATE',
    entityType: 'Application',
    entityId: applicationId,
    changes: JSON.stringify({
      status: { from: currentStatus, to: newStatus }
    })
  }
});
```

### Lier un thread email à une candidature (Deep Core)

```javascript
const linkedThread = await prisma.thread.update({
  where: { id: threadId },
  data: {
    applicationId: applicationId,
    status: 'IN_PROGRESS'
  }
});

// Créer un événement dans la timeline
await prisma.applicationEvent.create({
  data: {
    applicationId: applicationId,
    eventType: 'EMAIL_RECEIVED',
    title: 'Email lié au dossier',
    description: `Thread "${thread.subject}" lié à la candidature`,
    messageId: latestMessageId,
    userId: userId
  }
});
```

### Uploader un document Swiss Safe

```javascript
const newDocument = await prisma.document.create({
  data: {
    candidateId: candidateId,
    filename: `${documentType}_${candidateId}_${Date.now()}.pdf`,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    checksum: calculateChecksum(file.buffer),
    storagePath: `/srv/clerivo/data/documents/${candidateId}/${filename}`,
    isEncrypted: true,
    documentType: documentType, // PERMIT, PURSUITS_EXTRACT, etc.
    category: category,
    validationStatus: 'PENDING'
  }
});

// Créer un événement
await prisma.applicationEvent.create({
  data: {
    applicationId: applicationId,
    eventType: 'DOCUMENT_UPLOADED',
    title: `Document déposé : ${category}`,
    documentId: newDocument.id,
    userId: userId
  }
});

// Mettre à jour le score de complétude
const documentsCount = await prisma.document.count({
  where: {
    candidateId: candidateId,
    validationStatus: 'VALID'
  }
});

const requiredDocs = 7; // Exemple
const score = Math.round((documentsCount / requiredDocs) * 100);

await prisma.application.update({
  where: { id: applicationId },
  data: {
    completenessScore: score,
    readinessStatus: score === 100 ? 'READY' : score >= 70 ? 'ALMOST_READY' : 'INCOMPLETE'
  }
});
```

### Calculer le score de solvabilité (Swiss Safe)

```javascript
// Récupérer le profil avec tous les documents
const profile = await prisma.solvencyProfile.findFirst({
  where: { candidateId: candidateId },
  include: {
    candidate: true,
    pursuitsDocument: true,
    liabilityDocument: true,
    guaranteeProof: true
  }
});

// Logique de scoring (exemple simplifié)
let score = 100;
let justification = [];

// Poursuites (-50 points si majeures)
if (profile.pursuitsStatus === 'MAJOR_ISSUES') {
  score -= 50;
  justification.push(`Poursuites importantes (CHF ${profile.pursuitsAmount}.-)`);
} else if (profile.pursuitsStatus === 'MINOR_ISSUES') {
  score -= 20;
  justification.push(`Poursuites mineures détectées`);
}

// Ratio loyer/revenu (-30 points si > 33%)
const application = await prisma.application.findFirst({
  where: { candidateId: candidateId },
  include: { property: true }
});

if (application && profile.averageMonthlyNet) {
  const ratio = (application.property.monthlyRent / profile.averageMonthlyNet) * 100;
  if (ratio > 40) {
    score -= 30;
    justification.push(`Ratio loyer/revenu trop élevé (${ratio.toFixed(0)}%)`);
  } else if (ratio > 33) {
    score -= 10;
    justification.push(`Ratio loyer/revenu limite (${ratio.toFixed(0)}%)`);
  }
}

// Assurance RC manquante (-10 points)
if (!profile.hasLiabilityInsurance) {
  score -= 10;
  justification.push('Pas d\'assurance responsabilité civile');
}

// Garantie manquante (-10 points)
if (!profile.guaranteeType) {
  score -= 10;
  justification.push('Pas de garantie de loyer');
}

// Déterminer le rating
let rating = 'REJECTED';
if (score >= 80) rating = 'EXCELLENT';
else if (score >= 65) rating = 'GOOD';
else if (score >= 50) rating = 'ACCEPTABLE';
else if (score >= 35) rating = 'RISKY';

// Mettre à jour le profil
await prisma.solvencyProfile.update({
  where: { id: profile.id },
  data: {
    solvencyScore: score,
    solvencyRating: rating,
    scoreCalculatedAt: new Date(),
    scoreJustification: justification.join('. ')
  }
});

// Créer un événement
await prisma.applicationEvent.create({
  data: {
    applicationId: application.id,
    eventType: 'SOLVENCY_CALCULATED',
    title: `Score de solvabilité : ${score}/100`,
    description: `Rating : ${rating}. ${justification.join('. ')}`,
    metadata: JSON.stringify({ score, rating, details: justification })
  }
});
```

---

## 🔄 Réinitialiser la DB

```bash
# Attention : supprime toutes les données et recrée le seed
npm run db:reset
```

---

## 📚 Documentation Complète

- **Schema complet** : `prisma/schema.prisma`
- **Seed détaillé** : `prisma/seed.js`
- **Documentation** : `prisma/README.md`
- **Mission accomplie** : `../MISSION_MODULE_2_COMPLETE.md`

---

## 🎯 Données de Test Disponibles

### Candidats
```javascript
// Dossier complet prêt à signer
'jean.dupont@example.ch'     // Score 95/100, DOSSIER_READY

// Nouveau contact
'marie.laurent@example.ch'   // Score N/A, NEW

// Rejeté pour poursuites
'pierre.morel@example.ch'    // Score 25/100, REJECTED
```

### Utilisateurs
```javascript
'admin@clerivo.ch'   // Role: ADMIN
'agent@clerivo.ch'   // Role: AGENT
```

### Biens
```javascript
'LAU-2024-001'  // 3.5 pièces Lausanne
'GLA-2024-002'  // 4.5 pièces Gland
```

---

## 🐛 Debugging

### Voir les requêtes SQL
```javascript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
```

### Transactions
```javascript
const result = await prisma.$transaction(async (tx) => {
  // Créer le candidat
  const candidate = await tx.candidate.create({ data: {...} });
  
  // Créer le profil de solvabilité
  const profile = await tx.solvencyProfile.create({
    data: {
      candidateId: candidate.id,
      ...
    }
  });
  
  return { candidate, profile };
});
```

---

**Bon développement ! 🚀**

*En cas de problème, consultez la documentation Prisma : https://www.prisma.io/docs*
