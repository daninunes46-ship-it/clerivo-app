#!/usr/bin/env node

/**
 * CLERIVO - DATAVAULT DISASTER DRILL
 * Test automatisé de la chaîne de sauvegarde/restauration
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const BACKUP_SCRIPT = path.join(__dirname, 'backup.js');
const RESTORE_SCRIPT = path.join(__dirname, 'restore.js');
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const BACKUPS_DIR = path.join(PROJECT_ROOT, 'data/backups');

async function main() {
  console.log('🚨 DÉMARRAGE DISASTER DRILL (TEST AUTOMATISÉ)');
  console.log('---------------------------------------------');

  const testEmail = `datavault-${Date.now()}@test.com`;
  let backupFile = '';

  try {
    // ÉTAPE 1 : CRÉATION DONNÉE TÉMOIN
    console.log('\n1️⃣  Création candidat témoin...');
    await prisma.candidate.create({
      data: {
        email: testEmail,
        firstName: 'Jean',
        lastName: 'DataVault',
        residencyStatus: 'SWISS_CITIZEN',
        applicantType: 'SINGLE'
      }
    });
    console.log(`   ✅ Candidat créé : ${testEmail}`);

    // ÉTAPE 2 : BACKUP
    console.log('\n2️⃣  Lancement du Backup...');
    execSync(`node "${BACKUP_SCRIPT}"`, { stdio: 'inherit' });
    
    // Trouver le dernier backup créé
    const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.startsWith('backup-') && f.endsWith('.tar.gz'))
        .sort()
        .reverse();
    backupFile = files[0];
    
    if (!backupFile) throw new Error('Aucun fichier backup trouvé après exécution');
    console.log(`   ✅ Backup généré : ${backupFile}`);

    // ÉTAPE 3 : SABOTAGE (SUPPRESSION)
    console.log('\n3️⃣  Sabotage (Suppression donnée témoin)...');
    await prisma.candidate.delete({ where: { email: testEmail } });
    
    const checkDeleted = await prisma.candidate.findUnique({ where: { email: testEmail } });
    if (checkDeleted) throw new Error('La suppression a échoué !');
    console.log('   ✅ Candidat supprimé de la base active');

    // ÉTAPE 4 : RESTAURATION
    console.log('\n4️⃣  Restauration du système...');
    await prisma.$disconnect();
    
    execSync(`node "${RESTORE_SCRIPT}" "${backupFile}"`, { stdio: 'inherit' });
    console.log('   ✅ Script de restauration terminé');

    // ÉTAPE 5 : VÉRIFICATION
    console.log('\n5️⃣  Vérification finale...');
    const prismaVerify = new PrismaClient();
    const restoredCandidate = await prismaVerify.candidate.findUnique({ where: { email: testEmail } });
    
    if (restoredCandidate) {
        console.log('   🎉 SUCCÈS : Le candidat est revenu des morts !');
        console.log('   ✅ Intégrité des données validée.');
        
        // Nettoyage final
        await prismaVerify.candidate.delete({ where: { email: testEmail } });
        console.log('   🧹 Donnée témoin nettoyée.');
    } else {
        console.error('   ❌ ÉCHEC : Le candidat n\'a pas été restauré.');
        process.exit(1);
    }
    await prismaVerify.$disconnect();

  } catch (error) {
    console.error('\n❌ ERREUR DRILL :', error);
    process.exit(1);
  }
}

main();
