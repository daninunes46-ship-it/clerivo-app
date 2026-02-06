#!/usr/bin/env node

/**
 * CLERIVO - DATAVAULT DISASTER DRILL
 * 
 * Test automatisé de la chaîne Backup → Restore
 * Conforme CDC v1.1.1 Section 10.6 : "preuve de restauration"
 * 
 * Usage: node src/scripts/test-datavault.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_SCRIPT = path.join(__dirname, 'backup.js');
const RESTORE_SCRIPT = path.join(__dirname, 'restore.js');
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const BACKUPS_DIR = path.join(PROJECT_ROOT, 'data/backups');

async function runDisasterDrill() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   🚨 CLERIVO DATAVAULT - DISASTER DRILL            ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\n📋 Test Backup → Restore (Cycle Complet)\n');

  const testEmail = `datavault-test-${Date.now()}@clerivo.test`;
  let backupFile = '';
  let prisma = new PrismaClient();

  try {
    // ÉTAPE 1 : CRÉATION TÉMOIN
    console.log('1️⃣  Création du candidat témoin...');
    console.log('───────────────────────────────────');
    
    const witness = await prisma.candidate.create({
      data: {
        email: testEmail,
        firstName: 'Jean',
        lastName: 'DataVault',
        residencyStatus: 'SWISS_CITIZEN',
        applicantType: 'SINGLE'
      }
    });

    console.log('   ✅ Candidat créé');
    console.log(`   📧 ${testEmail}`);
    console.log(`   🆔 ${witness.id}\n`);

    // ÉTAPE 2 : BACKUP
    console.log('2️⃣  Exécution du backup...');
    console.log('───────────────────────────');
    
    execSync(`node "${BACKUP_SCRIPT}"`, { stdio: 'inherit' });
    
    const allBackups = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.tar.gz'))
      .sort()
      .reverse();
    
    backupFile = allBackups[0];
    if (!backupFile) throw new Error('Aucun backup trouvé');
    
    console.log(`\n   ✅ Backup: ${backupFile}\n`);

    // ÉTAPE 3 : SABOTAGE
    console.log('3️⃣  Sabotage - Suppression...');
    console.log('──────────────────────────────');
    
    await prisma.candidate.delete({ where: { email: testEmail } });
    
    const check = await prisma.candidate.findUnique({ where: { email: testEmail } });
    if (check) throw new Error('Suppression échouée');

    console.log('   ✅ Candidat supprimé');
    console.log('   ⚠️  Données perdues (simulation crash)\n');

    // ÉTAPE 4 : RESTAURATION
    console.log('4️⃣  Restauration du système...');
    console.log('──────────────────────────────');
    
    await prisma.$disconnect();
    execSync(`node "${RESTORE_SCRIPT}" "${backupFile}"`, { stdio: 'inherit' });
    console.log('\n   ✅ Restauration terminée\n');

    // ÉTAPE 5 : VÉRIFICATION
    console.log('5️⃣  Vérification...');
    console.log('────────────────────');
    
    const verify = new PrismaClient();
    const restored = await verify.candidate.findUnique({ where: { email: testEmail } });

    if (restored) {
      console.log('   🎉 SUCCÈS : Candidat restauré !');
      console.log(`   📧 ${restored.email}`);
      console.log(`   👤 ${restored.firstName} ${restored.lastName}`);
      console.log('   ✅ Intégrité validée');

      // NETTOYAGE
      console.log('\n6️⃣  Nettoyage...');
      console.log('────────────────');
      await verify.candidate.delete({ where: { email: testEmail } });
      console.log('   🧹 Témoin supprimé');
    } else {
      console.error('   ❌ ÉCHEC : Candidat NON restauré');
      await verify.$disconnect();
      process.exit(1);
    }

    await verify.$disconnect();

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║   ✅ DISASTER DRILL RÉUSSI                         ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('\n🎯 Backup → Restore opérationnel');
    console.log('✅ CDC v1.1.1 Section 10.6 validée');
    console.log('✅ Système prêt pour production\n');

  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════╗');
    console.error('║   ❌ DISASTER DRILL ÉCHOUÉ                         ║');
    console.error('╚════════════════════════════════════════════════════╝\n');
    console.error('Erreur:', error.message);
    console.error('\n⚠️  Révision nécessaire\n');
    process.exit(1);
  }
}

if (require.main === module) runDisasterDrill();
module.exports = { runDisasterDrill };
