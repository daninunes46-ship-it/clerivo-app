#!/usr/bin/env node

/**
 * Script pour ajouter un profil de solvabilité à Valérie Dupuis
 * avec détection de poursuites
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Ajout d\'un profil de solvabilité pour Valérie Dupuis...\n');

  // ID de Valérie Dupuis
  const candidateId = '867dad01-7495-42bf-937a-a31150dc6d73';

  // Créer ou mettre à jour le profil de solvabilité
  const profile = await prisma.solvencyProfile.create({
    data: {
      candidateId: candidateId,
      
      // SWISS SAFE - Poursuites détectées
      pursuitsStatus: 'MAJOR_ISSUES',
      pursuitsAmount: 2500, // 2'500 CHF de poursuites
      pursuitsIssuedDate: new Date('2026-01-10'),
      pursuitsExpiryDate: new Date('2026-04-10'), // Expire dans 3 mois
      pursuitsDetails: JSON.stringify({
        entries: [
          {
            creditor: 'SwissCard AECS GmbH',
            amount: 1800,
            date: '2025-11-15',
            type: 'Credit Card Debt'
          },
          {
            creditor: 'Sunrise Communications AG',
            amount: 700,
            date: '2025-12-20',
            type: 'Telecom Invoice'
          }
        ],
        totalAmount: 2500,
        status: 'ACTIVE',
        notes: 'Poursuites actives détectées. Montant ouvert: 2\'500 CHF.'
      }),
      
      // Profil emploi
      employmentType: 'NOT_DECLARED',
      employerName: 'Non déclaré',
      salarySlipsReceived: 0,
      salarySlipsRequired: 3,
      
      // Score de solvabilité (bas à cause des poursuites)
      solvencyScore: 25,
      solvencyRating: 'REJECTED',
      scoreCalculatedAt: new Date(),
      scoreJustification: 'ALERTE: Poursuites actives détectées pour un montant de 2\'500 CHF (SwissCard 1\'800 CHF + Sunrise 700 CHF). Revenu déclaré de 8\'500 CHF mais dossier incomplet. Risque élevé de défaut de paiement.'
    }
  });

  console.log('✅ Profil de solvabilité créé:\n');
  console.log(`   ID: ${profile.id}`);
  console.log(`   Candidat: ${candidateId}`);
  console.log(`   Poursuites: ${profile.pursuitsStatus}`);
  console.log(`   Montant: ${profile.pursuitsAmount} CHF`);
  console.log(`   Score: ${profile.solvencyScore}/100`);
  console.log(`   Rating: ${profile.solvencyRating}`);
  console.log(`\n🎯 Justification: ${profile.scoreJustification}`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
