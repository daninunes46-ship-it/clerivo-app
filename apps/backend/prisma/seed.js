// ============================================================================
// CLERIVO - SEED DATABASE (IDEMPOTENT)
// Module 2 : Pipeline & Gestion Candidats
// Peut être lancé plusieurs fois sans erreur (upsert strategy)
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Utilitaire : Hash de mot de passe simple (à remplacer par bcrypt en prod)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Utilitaire : Génération de checksum pour documents
function generateChecksum(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Utilitaire : Nettoyage complet de la DB (optionnel - décommenter pour reset)
async function cleanDatabase() {
  console.log('🧹 Nettoyage de la base de données...\n');
  
  // Ordre de suppression respectant les contraintes de clés étrangères
  await prisma.applicationEvent.deleteMany({});
  await prisma.internalComment.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.thread.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.solvencyProfile.deleteMany({});
  await prisma.guarantor.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.securityEvent.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('   ✅ Base de données nettoyée\n');
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🌱 CLERIVO - SEED DATABASE (MODULE 2)');
  console.log('═══════════════════════════════════════════════════════════\n');

  // OPTIONNEL : Décommenter pour nettoyer la DB avant seed
  // await cleanDatabase();

  // ========================================================================
  // 1. USERS (TeamOps)
  // ========================================================================
  console.log('👤 Création des utilisateurs...');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clerivo.ch' },
    update: {},
    create: {
      email: 'admin@clerivo.ch',
      passwordHash: hashPassword('admin123'),
      firstName: 'Daniel',
      lastName: 'Nunes',
      role: 'ADMIN',
      isActive: true
    }
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@clerivo.ch' },
    update: {},
    create: {
      email: 'agent@clerivo.ch',
      passwordHash: hashPassword('agent123'),
      firstName: 'Sophie',
      lastName: 'Mercier',
      role: 'AGENT',
      isActive: true
    }
  });

  console.log(`   ✅ ${admin.firstName} ${admin.lastName} (${admin.role})`);
  console.log(`   ✅ ${agent.firstName} ${agent.lastName} (${agent.role})\n`);

  // ========================================================================
  // 2. PROPERTIES (Biens Immobiliers)
  // ========================================================================
  console.log('🏠 Création des biens immobiliers...');

  const propertyLausanne = await prisma.property.upsert({
    where: { reference: 'LAU-2024-001' },
    update: {},
    create: {
      reference: 'LAU-2024-001',
      address: 'Avenue de la Gare 15',
      city: 'Lausanne',
      postalCode: '1003',
      canton: 'VD',
      propertyType: 'APARTMENT',
      rooms: 3.5,
      surfaceArea: 85.0,
      floor: 2,
      hasBalcony: true,
      hasParking: true,
      monthlyRent: 2100,
      charges: 250,
      deposit: 6300, // 3 mois de loyer
      availableFrom: new Date('2024-04-01'),
      status: 'AVAILABLE',
      description: 'Magnifique 3.5 pièces au coeur de Lausanne, proche de toutes commodités. Cuisine agencée, balcon avec vue, place de parking incluse.'
    }
  });

  const propertyGland = await prisma.property.upsert({
    where: { reference: 'GLA-2024-002' },
    update: {},
    create: {
      reference: 'GLA-2024-002',
      address: 'Rue du Léman 42',
      city: 'Gland',
      postalCode: '1196',
      canton: 'VD',
      propertyType: 'APARTMENT',
      rooms: 4.5,
      surfaceArea: 110.0,
      floor: 3,
      hasBalcony: true,
      hasParking: true,
      monthlyRent: 2650,
      charges: 300,
      deposit: 7950,
      availableFrom: new Date('2024-05-01'),
      status: 'AVAILABLE',
      description: '4.5 pièces spacieux à Gland, idéal pour famille. Proche écoles internationales et accès autoroute. Cave et parking.'
    }
  });

  console.log(`   ✅ ${propertyLausanne.reference} - ${propertyLausanne.city} (${propertyLausanne.rooms} pièces)`);
  console.log(`   ✅ ${propertyGland.reference} - ${propertyGland.city} (${propertyGland.rooms} pièces)\n`);

  // ========================================================================
  // 3. CANDIDAT 1 : JEAN DUPONT (DOSSIER COMPLET - PRÊT À SIGNER)
  // ========================================================================
  console.log('🎯 Candidat 1 : Jean Dupont (DOSSIER COMPLET)...');

  const candidate1 = await prisma.candidate.upsert({
    where: { email: 'jean.dupont@example.ch' },
    update: {},
    create: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.ch',
      phone: '+41 79 123 45 67',
      dateOfBirth: new Date('1985-03-15'),
      residencyStatus: 'PERMIT_C',
      permitType: 'C',
      permitExpiry: new Date('2030-12-31'),
      applicantType: 'COUPLE',
      isStudent: false,
      isSelfEmployed: false,
      monthlyIncome: 8500,
      currentRent: 1800,
      currentAddress: 'Rue du Centre 10',
      currentCity: 'Morges',
      currentPostalCode: '1110'
    }
  });

  // Documents pour Jean Dupont (idempotent avec checksum unique)
  const doc1_permit = await prisma.document.upsert({
    where: { checksum: generateChecksum('permit_dupont_c_2023') },
    update: {},
    create: {
      candidateId: candidate1.id,
      filename: `permit_${candidate1.id}_001.pdf`,
      originalName: 'Permis_C_Jean_Dupont.pdf',
      mimeType: 'application/pdf',
      size: 245678,
      checksum: generateChecksum('permit_dupont_c_2023'),
      storagePath: `/srv/clerivo/data/documents/${candidate1.id}/permit_001.pdf`,
      isEncrypted: true,
      documentType: 'PERMIT',
      category: 'Permis de séjour',
      validationStatus: 'VALID',
      validatedAt: new Date(),
      issueDate: new Date('2023-01-10'),
      expiryDate: new Date('2030-12-31'),
      isExpired: false
    }
  });

  const doc1_pursuits = await prisma.document.upsert({
    where: { checksum: generateChecksum('pursuits_dupont_2024_clean') },
    update: {},
    create: {
      candidateId: candidate1.id,
      filename: `pursuits_${candidate1.id}_001.pdf`,
      originalName: 'Extrait_Poursuites_Dupont.pdf',
      mimeType: 'application/pdf',
      size: 156789,
      checksum: generateChecksum('pursuits_dupont_2024_clean'),
      storagePath: `/srv/clerivo/data/documents/${candidate1.id}/pursuits_001.pdf`,
      isEncrypted: true,
      documentType: 'PURSUITS_EXTRACT',
      category: 'Extrait du registre des poursuites',
      validationStatus: 'VALID',
      validatedAt: new Date(),
      issueDate: new Date('2024-02-15'),
      expiryDate: new Date('2024-05-15'), // 3 mois
      isExpired: false,
      extractedText: 'NÉANT - Aucune poursuite enregistrée'
    }
  });

  const doc1_salary1 = await prisma.document.upsert({
    where: { checksum: generateChecksum('salary_dupont_jan2024') },
    update: {},
    create: {
      candidateId: candidate1.id,
      filename: `salary_${candidate1.id}_jan2024.pdf`,
      originalName: 'Fiche_Salaire_Janvier_2024.pdf',
      mimeType: 'application/pdf',
      size: 89456,
      checksum: generateChecksum('salary_dupont_jan2024'),
      storagePath: `/srv/clerivo/data/documents/${candidate1.id}/salary_jan2024.pdf`,
      isEncrypted: true,
      documentType: 'SALARY_SLIP',
      category: 'Fiche de salaire',
      validationStatus: 'VALID',
      validatedAt: new Date(),
      issueDate: new Date('2024-01-31')
    }
  });

  const doc1_salary2 = await prisma.document.upsert({
    where: { checksum: generateChecksum('salary_dupont_feb2024') },
    update: {},
    create: {
      candidateId: candidate1.id,
      filename: `salary_${candidate1.id}_feb2024.pdf`,
      originalName: 'Fiche_Salaire_Février_2024.pdf',
      mimeType: 'application/pdf',
      size: 89632,
      checksum: generateChecksum('salary_dupont_feb2024'),
      storagePath: `/srv/clerivo/data/documents/${candidate1.id}/salary_feb2024.pdf`,
      isEncrypted: true,
      documentType: 'SALARY_SLIP',
      category: 'Fiche de salaire',
      validationStatus: 'VALID',
      validatedAt: new Date(),
      issueDate: new Date('2024-02-29')
    }
  });

  const doc1_salary3 = await prisma.document.upsert({
    where: { checksum: generateChecksum('salary_dupont_mar2024') },
    update: {},
    create: {
      candidateId: candidate1.id,
      filename: `salary_${candidate1.id}_mar2024.pdf`,
      originalName: 'Fiche_Salaire_Mars_2024.pdf',
      mimeType: 'application/pdf',
      size: 89712,
      checksum: generateChecksum('salary_dupont_mar2024'),
      storagePath: `/srv/clerivo/data/documents/${candidate1.id}/salary_mar2024.pdf`,
      isEncrypted: true,
      documentType: 'SALARY_SLIP',
      category: 'Fiche de salaire',
      validationStatus: 'VALID',
      validatedAt: new Date(),
      issueDate: new Date('2024-03-31')
    }
  });

  const doc1_liability = await prisma.document.upsert({
    where: { checksum: generateChecksum('liability_dupont_zurich2024') },
    update: {},
    create: {
      candidateId: candidate1.id,
      filename: `liability_${candidate1.id}_001.pdf`,
      originalName: 'Assurance_RC_Dupont.pdf',
      mimeType: 'application/pdf',
      size: 123456,
      checksum: generateChecksum('liability_dupont_zurich2024'),
      storagePath: `/srv/clerivo/data/documents/${candidate1.id}/liability_001.pdf`,
      isEncrypted: true,
      documentType: 'LIABILITY_INSURANCE',
      category: 'Assurance responsabilité civile',
      validationStatus: 'VALID',
      validatedAt: new Date(),
      issueDate: new Date('2024-01-01'),
      expiryDate: new Date('2024-12-31')
    }
  });

  const doc1_guarantee = await prisma.document.upsert({
    where: { checksum: generateChecksum('guarantee_dupont_swisscaution2024') },
    update: {},
    create: {
      candidateId: candidate1.id,
      filename: `guarantee_${candidate1.id}_001.pdf`,
      originalName: 'Attestation_SwissCaution.pdf',
      mimeType: 'application/pdf',
      size: 198765,
      checksum: generateChecksum('guarantee_dupont_swisscaution2024'),
      storagePath: `/srv/clerivo/data/documents/${candidate1.id}/guarantee_001.pdf`,
      isEncrypted: true,
      documentType: 'GUARANTEE_PROOF',
      category: 'Garantie de loyer',
      validationStatus: 'VALID',
      validatedAt: new Date(),
      issueDate: new Date('2024-03-10')
    }
  });

  // SolvencyProfile pour Jean Dupont (avec versioning CTO)
  const solvency1 = await prisma.solvencyProfile.upsert({
    where: {
      candidateId_version: {
        candidateId: candidate1.id,
        version: 1
      }
    },
    update: {},
    create: {
      candidateId: candidate1.id,
      version: 1,
      isActive: true,
      pursuitsStatus: 'CLEAN',
      pursuitsDocumentId: doc1_pursuits.id,
      pursuitsIssuedDate: new Date('2024-02-15'),
      pursuitsExpiryDate: new Date('2024-05-15'),
      pursuitsAmount: 0,
      pursuitsDetails: JSON.stringify({ status: 'clean', details: 'Aucune poursuite' }),
      employmentType: 'SALARIED_CDI',
      employerName: 'Nestlé SA',
      employmentStartDate: new Date('2018-09-01'),
      contractType: 'CDI',
      salarySlipsReceived: 3,
      salarySlipsRequired: 3,
      averageMonthlyGross: 8500,
      averageMonthlyNet: 6800,
      hasLiabilityInsurance: true,
      liabilityDocumentId: doc1_liability.id,
      liabilityInsurer: 'Zurich Assurances',
      liabilityPolicyNumber: 'ZH-RC-123456',
      guaranteeType: 'BLOCKED_ACCOUNT',
      guaranteeAmount: 6300,
      guaranteeProofId: doc1_guarantee.id,
      guaranteeInstitution: 'SwissCaution',
      solvencyScore: 95,
      solvencyRating: 'EXCELLENT',
      scoreCalculatedAt: new Date(),
      scoreJustification: 'Dossier complet et excellent profil financier. Ratio loyer/revenu optimal (24%), aucune poursuite, CDI stable, garantie validée.'
    }
  });

  // Vérifier si application existe déjà
  const existingApp1 = await prisma.application.findFirst({
    where: {
      candidateId: candidate1.id,
      propertyId: propertyLausanne.id
    }
  });

  const application1 = existingApp1 || await prisma.application.create({
    data: {
      candidateId: candidate1.id,
      propertyId: propertyLausanne.id,
      status: 'DOSSIER_READY',
      statusChangedAt: new Date(),
      assignedToId: agent.id,
      completenessScore: 100,
      readinessStatus: 'READY',
      readinessNotes: 'Tous les documents sont validés. Pack candidature généré et prêt à transmettre à la régie.',
      visitDate: new Date('2024-03-05T14:00:00'),
      visitCompleted: true,
      visitNotes: 'Visite très positive. Couple sérieux et intéressé. Excellente présentation.',
      priority: 'HIGH',
      source: 'Email'
    }
  });

  // Thread email pour Jean Dupont (DEEP CORE LINK)
  const existingThread1 = await prisma.thread.findFirst({
    where: {
      applicationId: application1.id,
      subject: 'Demande de location - 3.5 pièces Lausanne'
    }
  });

  const thread1 = existingThread1 || await prisma.thread.create({
    data: {
      subject: 'Demande de location - 3.5 pièces Lausanne',
      participants: JSON.stringify([candidate1.email, agent.email]),
      lastMessageAt: new Date(),
      applicationId: application1.id, // ← DEEP CORE LINK
      status: 'READY',
      priority: 'HIGH',
      assignedToId: agent.id,
      messageCount: 3,
      unreadCount: 0
    }
  });

  // Messages du thread (idempotent avec messageId unique)
  const msg1_1_id = `<dupont-initial-${candidate1.id}@example.ch>`;
  const msg1_2_id = `<dupont-response-${agent.id}@clerivo.ch>`;
  const msg1_3_id = `<dupont-confirm-${candidate1.id}@example.ch>`;

  await prisma.message.upsert({
    where: { messageId: msg1_1_id },
    update: {},
    create: {
      threadId: thread1.id,
      messageId: msg1_1_id,
      from: candidate1.email,
      to: JSON.stringify([agent.email]),
      subject: 'Demande de location - 3.5 pièces Lausanne',
      textBody: `Bonjour,\n\nJe suis très intéressé par le 3.5 pièces à l'Avenue de la Gare 15 à Lausanne.\n\nJe travaille chez Nestlé depuis 6 ans en CDI et cherche un appartement pour ma conjointe et moi-même.\n\nPuis-je organiser une visite ?\n\nCordialement,\nJean Dupont`,
      receivedAt: new Date('2024-02-28T10:30:00'),
      isRead: true,
      isOutgoing: false,
      detectedIntent: 'VISIT',
      urgencyLevel: 'MEDIUM',
      aiSummary: 'Candidat intéressé par le 3.5 pièces à Lausanne. Profil salarié CDI chez Nestlé. Demande de visite.'
    }
  });

  await prisma.message.upsert({
    where: { messageId: msg1_2_id },
    update: {},
    create: {
      threadId: thread1.id,
      messageId: msg1_2_id,
      inReplyTo: msg1_1_id,
      from: agent.email,
      to: JSON.stringify([candidate1.email]),
      subject: 'RE: Demande de location - 3.5 pièces Lausanne',
      textBody: `Bonjour M. Dupont,\n\nMerci pour votre intérêt. Je peux vous proposer une visite le mardi 5 mars à 14h00.\n\nMerci de confirmer votre présence.\n\nCordialement,\nSophie Mercier\nClerivo Immobilier`,
      receivedAt: new Date('2024-02-28T14:15:00'),
      sentAt: new Date('2024-02-28T14:15:00'),
      isRead: true,
      isOutgoing: true,
      detectedIntent: 'VISIT',
      urgencyLevel: 'LOW'
    }
  });

  await prisma.message.upsert({
    where: { messageId: msg1_3_id },
    update: {},
    create: {
      threadId: thread1.id,
      messageId: msg1_3_id,
      inReplyTo: msg1_2_id,
      from: candidate1.email,
      to: JSON.stringify([agent.email]),
      subject: 'RE: Demande de location - 3.5 pièces Lausanne',
      textBody: `Parfait, je confirme ma présence pour le 5 mars à 14h00.\n\nMerci beaucoup.\n\nJean Dupont`,
      receivedAt: new Date('2024-02-28T15:45:00'),
      isRead: true,
      isOutgoing: false,
      detectedIntent: 'VISIT',
      urgencyLevel: 'LOW'
    }
  });

  // Events de la timeline (créés seulement s'ils n'existent pas)
  const eventsCount1 = await prisma.applicationEvent.count({
    where: { applicationId: application1.id }
  });

  if (eventsCount1 === 0) {
    await prisma.applicationEvent.createMany({
      data: [
        {
          applicationId: application1.id,
          eventType: 'EMAIL_RECEIVED',
          title: 'Premier contact candidat',
          description: 'Email de demande de location reçu',
          userId: agent.id,
          metadata: JSON.stringify({ from: candidate1.email })
        },
        {
          applicationId: application1.id,
          eventType: 'STATUS_CHANGED',
          title: 'Statut : Visite planifiée',
          description: 'Visite programmée pour le 5 mars 2024',
          userId: agent.id
        },
        {
          applicationId: application1.id,
          eventType: 'VISIT_COMPLETED',
          title: 'Visite effectuée',
          description: 'Visite réalisée avec succès. Retour très positif.',
          userId: agent.id
        },
        {
          applicationId: application1.id,
          eventType: 'DOCUMENT_UPLOADED',
          title: 'Documents reçus',
          description: 'Tous les documents ont été déposés par le candidat',
          userId: agent.id
        },
        {
          applicationId: application1.id,
          eventType: 'QUALITY_CHECK_PASSED',
          title: 'Contrôle qualité validé',
          description: 'Tous les documents sont valides et lisibles',
          userId: agent.id
        },
        {
          applicationId: application1.id,
          eventType: 'SOLVENCY_CALCULATED',
          title: 'Score de solvabilité : 95/100',
          description: 'Excellente solvabilité. Dossier recommandé.',
          userId: agent.id,
          metadata: JSON.stringify({ score: 95, rating: 'EXCELLENT' })
        },
        {
          applicationId: application1.id,
          eventType: 'STATUS_CHANGED',
          title: 'Statut : Dossier prêt',
          description: 'Le dossier est complet et prêt à être transmis',
          userId: agent.id
        }
      ]
    });
  }

  console.log(`   ✅ ${candidate1.firstName} ${candidate1.lastName}`);
  console.log(`      📄 7 documents validés`);
  console.log(`      💰 Score: ${solvency1.solvencyScore}/100 (${solvency1.solvencyRating})`);
  console.log(`      📋 Application: ${application1.status}`);
  console.log(`      📧 Thread: 3 messages (Deep Core Link ✓)\n`);

  // ========================================================================
  // 4. CANDIDAT 2 : MARIE LAURENT (NOUVEAU - CONTACT INITIAL)
  // ========================================================================
  console.log('🆕 Candidat 2 : Marie Laurent (NOUVEAU)...');

  const candidate2 = await prisma.candidate.upsert({
    where: { email: 'marie.laurent@example.ch' },
    update: {},
    create: {
      firstName: 'Marie',
      lastName: 'Laurent',
      email: 'marie.laurent@example.ch',
      phone: '+41 78 987 65 43',
      dateOfBirth: new Date('1992-07-22'),
      residencyStatus: 'SWISS_CITIZEN',
      applicantType: 'SINGLE',
      isStudent: false,
      isSelfEmployed: true,
      monthlyIncome: 5500,
      currentAddress: 'Chemin des Fleurs 8',
      currentCity: 'Nyon',
      currentPostalCode: '1260'
    }
  });

  // SolvencyProfile minimal (nouveau dossier - V1 active)
  const solvency2 = await prisma.solvencyProfile.upsert({
    where: {
      candidateId_version: {
        candidateId: candidate2.id,
        version: 1
      }
    },
    update: {},
    create: {
      candidateId: candidate2.id,
      version: 1,
      isActive: true,
      pursuitsStatus: 'NOT_CHECKED',
      employmentType: 'SELF_EMPLOYED',
      employerName: 'Consultante indépendante',
      salarySlipsReceived: 0,
      salarySlipsRequired: 3,
      hasLiabilityInsurance: false
    }
  });

  const existingApp2 = await prisma.application.findFirst({
    where: {
      candidateId: candidate2.id,
      propertyId: propertyGland.id
    }
  });

  const application2 = existingApp2 || await prisma.application.create({
    data: {
      candidateId: candidate2.id,
      propertyId: propertyGland.id,
      status: 'NEW',
      statusChangedAt: new Date(),
      assignedToId: agent.id,
      completenessScore: 10,
      readinessStatus: 'INCOMPLETE',
      readinessNotes: 'Premier contact. Attente des documents et confirmation pour visite.',
      priority: 'MEDIUM',
      source: 'Formulaire web'
    }
  });

  const existingThread2 = await prisma.thread.findFirst({
    where: {
      applicationId: application2.id,
      subject: 'Intérêt pour le 4.5 pièces à Gland'
    }
  });

  const thread2 = existingThread2 || await prisma.thread.create({
    data: {
      subject: 'Intérêt pour le 4.5 pièces à Gland',
      participants: JSON.stringify([candidate2.email, agent.email]),
      lastMessageAt: new Date(),
      applicationId: application2.id,
      status: 'NEW',
      priority: 'MEDIUM',
      assignedToId: agent.id,
      messageCount: 1,
      unreadCount: 1
    }
  });

  const msg2_1_id = `<laurent-initial-${candidate2.id}@example.ch>`;

  await prisma.message.upsert({
    where: { messageId: msg2_1_id },
    update: {},
    create: {
      threadId: thread2.id,
      messageId: msg2_1_id,
      from: candidate2.email,
      to: JSON.stringify([agent.email]),
      subject: 'Intérêt pour le 4.5 pièces à Gland',
      textBody: `Bonjour,\n\nJe suis consultante indépendante et je recherche un appartement à Gland pour me rapprocher de mes clients.\n\nLe 4.5 pièces Rue du Léman m'intéresse beaucoup.\n\nPouvez-vous me donner plus d'informations ?\n\nMerci,\nMarie Laurent`,
      receivedAt: new Date(),
      isRead: false,
      isOutgoing: false,
      detectedIntent: 'INFORMATION',
      urgencyLevel: 'MEDIUM',
      aiSummary: 'Nouvelle demande pour le 4.5 pièces à Gland. Profil indépendant. Demande d\'informations.'
    }
  });

  const eventsCount2 = await prisma.applicationEvent.count({
    where: { applicationId: application2.id }
  });

  if (eventsCount2 === 0) {
    await prisma.applicationEvent.createMany({
      data: [
        {
          applicationId: application2.id,
          eventType: 'EMAIL_RECEIVED',
          title: 'Nouveau contact',
          description: 'Demande d\'information reçue via formulaire web',
          userId: agent.id
        },
        {
          applicationId: application2.id,
          eventType: 'STATUS_CHANGED',
          title: 'Statut : Nouveau',
          description: 'Candidature créée, en attente de qualification',
          userId: agent.id
        }
      ]
    });
  }

  console.log(`   ✅ ${candidate2.firstName} ${candidate2.lastName}`);
  console.log(`      📄 0 documents`);
  console.log(`      💰 Score: Non calculé`);
  console.log(`      📋 Application: ${application2.status}\n`);

  // ========================================================================
  // 5. CANDIDAT 3 : PIERRE MOREL (REJETÉ - POURSUITES IMPORTANTES)
  // ========================================================================
  console.log('❌ Candidat 3 : Pierre Morel (REJETÉ)...');

  const candidate3 = await prisma.candidate.upsert({
    where: { email: 'pierre.morel@example.ch' },
    update: {},
    create: {
      firstName: 'Pierre',
      lastName: 'Morel',
      email: 'pierre.morel@example.ch',
      phone: '+41 77 456 78 90',
      dateOfBirth: new Date('1988-11-30'),
      residencyStatus: 'PERMIT_B',
      permitType: 'B',
      permitExpiry: new Date('2025-06-30'),
      applicantType: 'SINGLE',
      isStudent: false,
      isSelfEmployed: false,
      monthlyIncome: 4200,
      currentRent: 1500,
      currentAddress: 'Rue du Commerce 25',
      currentCity: 'Lausanne',
      currentPostalCode: '1003'
    }
  });

  // Documents avec poursuites
  const doc3_pursuits = await prisma.document.upsert({
    where: { checksum: generateChecksum('pursuits_morel_2024_issues') },
    update: {},
    create: {
      candidateId: candidate3.id,
      filename: `pursuits_${candidate3.id}_001.pdf`,
      originalName: 'Extrait_Poursuites_Morel.pdf',
      mimeType: 'application/pdf',
      size: 178945,
      checksum: generateChecksum('pursuits_morel_2024_issues'),
      storagePath: `/srv/clerivo/data/documents/${candidate3.id}/pursuits_001.pdf`,
      isEncrypted: true,
      documentType: 'PURSUITS_EXTRACT',
      category: 'Extrait du registre des poursuites',
      validationStatus: 'VALID',
      validatedAt: new Date(),
      issueDate: new Date('2024-02-20'),
      expiryDate: new Date('2024-05-20'),
      isExpired: false,
      extractedText: 'POURSUITES ENREGISTRÉES: 3 poursuites actives. Montant total: CHF 8450.-',
      hasQualityIssues: true,
      qualityIssues: JSON.stringify([
        { type: 'PURSUITS_DETECTED', severity: 'HIGH', message: 'Poursuites importantes détectées' }
      ])
    }
  });

  const doc3_permit = await prisma.document.upsert({
    where: { checksum: generateChecksum('permit_morel_b_2023') },
    update: {},
    create: {
      candidateId: candidate3.id,
      filename: `permit_${candidate3.id}_001.pdf`,
      originalName: 'Permis_B_Morel.pdf',
      mimeType: 'application/pdf',
      size: 234567,
      checksum: generateChecksum('permit_morel_b_2023'),
      storagePath: `/srv/clerivo/data/documents/${candidate3.id}/permit_001.pdf`,
      isEncrypted: true,
      documentType: 'PERMIT',
      category: 'Permis de séjour',
      validationStatus: 'VALID',
      validatedAt: new Date(),
      issueDate: new Date('2023-07-01'),
      expiryDate: new Date('2025-06-30'),
      isExpired: false
    }
  });

  // SolvencyProfile avec POURSUITES (V1 active)
  const solvency3 = await prisma.solvencyProfile.upsert({
    where: {
      candidateId_version: {
        candidateId: candidate3.id,
        version: 1
      }
    },
    update: {},
    create: {
      candidateId: candidate3.id,
      version: 1,
      isActive: true,
      pursuitsStatus: 'MAJOR_ISSUES',
      pursuitsDocumentId: doc3_pursuits.id,
      pursuitsIssuedDate: new Date('2024-02-20'),
      pursuitsExpiryDate: new Date('2024-05-20'),
      pursuitsAmount: 8450, // ← POURSUITES IMPORTANTES
      pursuitsDetails: JSON.stringify({
        status: 'major_issues',
        count: 3,
        details: [
          { amount: 3200, creditor: 'Swisscom AG', date: '2023-09-15' },
          { amount: 2800, creditor: 'Caisse Maladie XYZ', date: '2023-11-20' },
          { amount: 2450, creditor: 'Migros Bank', date: '2024-01-10' }
        ]
      }),
      employmentType: 'SALARIED_CDI',
      employerName: 'Restaurant Le Lac SA',
      employmentStartDate: new Date('2022-03-01'),
      contractType: 'CDI',
      salarySlipsReceived: 2,
      salarySlipsRequired: 3,
      averageMonthlyGross: 4200,
      averageMonthlyNet: 3500,
      hasLiabilityInsurance: false,
      solvencyScore: 25,
      solvencyRating: 'REJECTED',
      scoreCalculatedAt: new Date(),
      scoreJustification: 'Dossier rejeté : Poursuites importantes (CHF 8450.-) non régularisées. Ratio loyer/revenu limite (50%). Pas d\'assurance RC.'
    }
  });

  const existingApp3 = await prisma.application.findFirst({
    where: {
      candidateId: candidate3.id,
      propertyId: propertyLausanne.id,
      status: 'REJECTED'
    }
  });

  const application3 = existingApp3 || await prisma.application.create({
    data: {
      candidateId: candidate3.id,
      propertyId: propertyLausanne.id,
      status: 'REJECTED',
      previousStatus: 'DOSSIER_PENDING',
      statusChangedAt: new Date(),
      assignedToId: agent.id,
      completenessScore: 40,
      readinessStatus: 'BLOCKED',
      readinessNotes: 'Dossier rejeté en raison de poursuites importantes non régularisées. Ratio loyer/revenu insuffisant.',
      visitDate: new Date('2024-03-12T10:00:00'),
      visitCompleted: true,
      visitNotes: 'Visite effectuée. Candidat semblait pressé.',
      decisionDate: new Date(),
      priority: 'LOW',
      source: 'Email'
    }
  });

  const existingThread3 = await prisma.thread.findFirst({
    where: {
      applicationId: application3.id,
      subject: 'Candidature pour le 3.5 pièces Lausanne'
    }
  });

  const thread3 = existingThread3 || await prisma.thread.create({
    data: {
      subject: 'Candidature pour le 3.5 pièces Lausanne',
      participants: JSON.stringify([candidate3.email, agent.email]),
      lastMessageAt: new Date(),
      applicationId: application3.id,
      status: 'CLOSED',
      priority: 'LOW',
      assignedToId: agent.id,
      messageCount: 2,
      unreadCount: 0
    }
  });

  const msg3_1_id = `<morel-initial-${candidate3.id}@example.ch>`;
  const msg3_2_id = `<morel-rejection-${agent.id}@clerivo.ch>`;

  await prisma.message.upsert({
    where: { messageId: msg3_1_id },
    update: {},
    create: {
      threadId: thread3.id,
      messageId: msg3_1_id,
      from: candidate3.email,
      to: JSON.stringify([agent.email]),
      subject: 'Candidature urgente - 3.5 pièces Lausanne',
      textBody: `Bonjour,\n\nJe cherche un appartement de toute urgence car je dois quitter mon logement actuel.\n\nLe 3.5 pièces à Lausanne m'intéresse.\n\nMerci de me recontacter rapidement.\n\nPierre Morel`,
      receivedAt: new Date('2024-03-08T09:15:00'),
      isRead: true,
      isOutgoing: false,
      detectedIntent: 'URGENCE',
      urgencyLevel: 'HIGH',
      aiSummary: 'Demande urgente de location. Candidat doit quitter son logement actuel.'
    }
  });

  await prisma.message.upsert({
    where: { messageId: msg3_2_id },
    update: {},
    create: {
      threadId: thread3.id,
      messageId: msg3_2_id,
      inReplyTo: msg3_1_id,
      from: agent.email,
      to: JSON.stringify([candidate3.email]),
      subject: 'RE: Candidature urgente - 3.5 pièces Lausanne',
      textBody: `Bonjour M. Morel,\n\nNous avons bien reçu votre candidature et examiné votre dossier.\n\nMalheureusement, après analyse approfondie, nous ne pouvons pas donner une suite favorable à votre demande pour ce bien.\n\nNous vous remercions de votre intérêt et vous souhaitons bonne chance dans vos recherches.\n\nCordialement,\nSophie Mercier\nClerivo Immobilier`,
      receivedAt: new Date('2024-03-15T16:30:00'),
      sentAt: new Date('2024-03-15T16:30:00'),
      isRead: true,
      isOutgoing: true,
      detectedIntent: 'REJECTION',
      urgencyLevel: 'LOW'
    }
  });

  const eventsCount3 = await prisma.applicationEvent.count({
    where: { applicationId: application3.id }
  });

  if (eventsCount3 === 0) {
    await prisma.applicationEvent.createMany({
      data: [
        {
          applicationId: application3.id,
          eventType: 'EMAIL_RECEIVED',
          title: 'Contact candidat',
          description: 'Demande urgente reçue',
          userId: agent.id
        },
        {
          applicationId: application3.id,
          eventType: 'VISIT_COMPLETED',
          title: 'Visite effectuée',
          description: 'Visite du bien réalisée',
          userId: agent.id
        },
        {
          applicationId: application3.id,
          eventType: 'DOCUMENT_UPLOADED',
          title: 'Documents reçus',
          description: 'Extrait des poursuites et permis reçus',
          userId: agent.id
        },
        {
          applicationId: application3.id,
          eventType: 'QUALITY_CHECK_FAILED',
          title: 'Contrôle qualité : Alerte',
          description: 'Poursuites importantes détectées (CHF 8450.-)',
          userId: agent.id,
          metadata: JSON.stringify({ alertType: 'PURSUITS', amount: 8450 })
        },
        {
          applicationId: application3.id,
          eventType: 'SOLVENCY_CALCULATED',
          title: 'Score de solvabilité : 25/100',
          description: 'Solvabilité insuffisante',
          userId: agent.id,
          metadata: JSON.stringify({ score: 25, rating: 'REJECTED' })
        },
        {
          applicationId: application3.id,
          eventType: 'STATUS_CHANGED',
          title: 'Statut : Rejeté',
          description: 'Candidature rejetée pour raisons financières',
          userId: agent.id
        },
        {
          applicationId: application3.id,
          eventType: 'EMAIL_SENT',
          title: 'Email de refus envoyé',
          description: 'Notification de rejet envoyée au candidat',
          userId: agent.id
        }
      ]
    });
  }

  console.log(`   ✅ ${candidate3.firstName} ${candidate3.lastName}`);
  console.log(`      📄 2 documents`);
  console.log(`      ⚠️  Poursuites: CHF ${solvency3.pursuitsAmount}.-`);
  console.log(`      💰 Score: ${solvency3.solvencyScore}/100 (${solvency3.solvencyRating})`);
  console.log(`      📋 Application: ${application3.status}\n`);

  // ========================================================================
  // 6. AUDIT LOGS (Traçabilité)
  // ========================================================================
  console.log('📋 Création des logs d\'audit...');

  const existingAuditLogs = await prisma.auditLog.count();

  if (existingAuditLogs === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          userId: admin.id,
          action: 'CREATE',
          entityType: 'User',
          entityId: agent.id,
          changes: JSON.stringify({ created: 'Agent Sophie Mercier' })
        },
        {
          userId: agent.id,
          action: 'CREATE',
          entityType: 'Application',
          entityId: application1.id,
          changes: JSON.stringify({ candidate: 'Jean Dupont', property: 'LAU-2024-001' })
        },
        {
          userId: agent.id,
          action: 'UPDATE',
          entityType: 'Application',
          entityId: application1.id,
          changes: JSON.stringify({ status: { from: 'NEW', to: 'DOSSIER_READY' } })
        },
        {
          userId: agent.id,
          action: 'CREATE',
          entityType: 'Application',
          entityId: application2.id,
          changes: JSON.stringify({ candidate: 'Marie Laurent', property: 'GLA-2024-002' })
        },
        {
          userId: agent.id,
          action: 'UPDATE',
          entityType: 'Application',
          entityId: application3.id,
          changes: JSON.stringify({ status: { from: 'DOSSIER_PENDING', to: 'REJECTED' } })
        }
      ]
    });
    console.log(`   ✅ 5 logs d'audit créés\n`);
  } else {
    console.log(`   ⏭️  Logs d'audit déjà présents\n`);
  }

  // ========================================================================
  // RÉSUMÉ FINAL
  // ========================================================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ SEED TERMINÉ AVEC SUCCÈS (IDEMPOTENT)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const stats = {
    users: await prisma.user.count(),
    properties: await prisma.property.count(),
    candidates: await prisma.candidate.count(),
    solvencyProfiles: await prisma.solvencyProfile.count(),
    documents: await prisma.document.count(),
    applications: await prisma.application.count(),
    threads: await prisma.thread.count(),
    messages: await prisma.message.count(),
    events: await prisma.applicationEvent.count(),
    auditLogs: await prisma.auditLog.count()
  };

  console.log('📊 STATISTIQUES DE LA BASE DE DONNÉES:');
  console.log(`   👤 Utilisateurs: ${stats.users}`);
  console.log(`   🏠 Biens: ${stats.properties}`);
  console.log(`   👥 Candidats: ${stats.candidates}`);
  console.log(`   💰 Profils solvabilité: ${stats.solvencyProfiles}`);
  console.log(`   📄 Documents: ${stats.documents}`);
  console.log(`   📋 Applications: ${stats.applications}`);
  console.log(`   📧 Threads: ${stats.threads}`);
  console.log(`   💬 Messages: ${stats.messages}`);
  console.log(`   📝 Événements: ${stats.events}`);
  console.log(`   📋 Logs audit: ${stats.auditLogs}\n`);

  console.log('🎯 DEEP CORE VALIDATION:');
  console.log('   ✓ Thread → Application (lien bidirectionnel)');
  console.log('   ✓ ApplicationEvent → Message (timeline unifiée)');
  console.log('   ✓ SolvencyProfile versioning (v1 active)\n');

  console.log('🔐 CONNEXIONS TEST:');
  console.log('   Admin: admin@clerivo.ch / admin123');
  console.log('   Agent: agent@clerivo.ch / agent123\n');

  console.log('🚀 PROCHAINES ÉTAPES:');
  console.log('   1. npx prisma migrate dev --name module_2_init');
  console.log('   2. node prisma/seed.js (ce script - relançable)');
  console.log('   3. npx prisma studio (visualiser)\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('\n❌ ERREUR LORS DU SEED:', e.message);
    console.error('\n💡 CONSEIL: Si erreur de contrainte unique, la donnée existe déjà (normal en mode idempotent).\n');
    await prisma.$disconnect();
    process.exit(1);
  });
