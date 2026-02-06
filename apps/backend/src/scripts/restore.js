#!/usr/bin/env node

/**
 * CLERIVO - DATAVAULT RESTORE
 * Procédure de restauration avec backup de sécurité PRE-RESTORE
 * 
 * Usage: node src/scripts/restore.js <backup-filename.tar.gz>
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Configuration
const BACKEND_ROOT = path.resolve(__dirname, '../..');
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

const DATA_DIR = path.join(BACKEND_ROOT, 'data');
const BACKUPS_DIR = path.join(PROJECT_ROOT, 'data/backups');
const UPLOADS_DIR = path.join(BACKEND_ROOT, 'storage/uploads');

const DATABASE_URL = process.env.DATABASE_URL;
const dbFileName = path.basename(DATABASE_URL.replace('file:', ''));
const DB_PATH = path.join(DATA_DIR, dbFileName);

const checksum = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

async function performRestore() {
  const backupFile = process.argv[2];

  if (!backupFile) {
    console.error('\n❌ Usage: node src/scripts/restore.js <backup-filename.tar.gz>');
    console.error('\n📂 Backups disponibles:');
    try {
      const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.startsWith('backup-') && f.endsWith('.tar.gz'))
        .sort().reverse();
      files.slice(0, 5).forEach(f => console.error(`   - ${f}`));
    } catch (e) {
      console.error('   (aucun)');
    }
    console.error('');
    process.exit(1);
  }

  const backupPath = path.join(BACKUPS_DIR, backupFile);
  const metaPath = backupPath.replace('.tar.gz', '.json');

  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     CLERIVO DATAVAULT - RESTORE                ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`\n🚑 Restauration: ${backupFile}\n`);

  try {
    // 1. Intégrité
    console.log('1️⃣  Vérification intégrité...');
    if (!fs.existsSync(backupPath)) throw new Error(`Fichier introuvable: ${backupPath}`);
    
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const current = checksum(backupPath);
      if (meta.archive.checksum !== current) throw new Error('⛔ CHECKSUM INVALIDE');
      console.log('   ✅ Checksum OK');
      console.log(`   📅 ${new Date(meta.timestamp).toLocaleString('fr-CH')}`);
    } else {
      console.warn('   ⚠️  Pas de métadonnées (restauration sans validation)');
    }

    // 2. Backup PRE-RESTORE (CRITIQUE)
    console.log('\n2️⃣  Backup de sécurité PRE-RESTORE...');
    const preName = `PRE-RESTORE-${Date.now()}`;
    const prePath = path.join(BACKUPS_DIR, `${preName}.tar.gz`);
    const preTemp = path.join(BACKUPS_DIR, `temp-${preName}`);

    if (!fs.existsSync(preTemp)) fs.mkdirSync(preTemp, { recursive: true });
    fs.copyFileSync(DB_PATH, path.join(preTemp, dbFileName));
    if (fs.existsSync(UPLOADS_DIR)) {
      execSync(`cp -r "${UPLOADS_DIR}" "${path.join(preTemp, 'uploads')}"`, { stdio: 'pipe' });
    }
    execSync(`tar -czf "${prePath}" -C "${preTemp}" .`, { stdio: 'pipe' });
    execSync(`rm -rf "${preTemp}"`, { stdio: 'pipe' });

    console.log(`   🛡️  Sauvegardé: ${preName}.tar.gz`);
    console.log('   ℹ️  Utilisable en cas de problème\n');

    // 3. Déconnexion
    console.log('3️⃣  Déconnexion Prisma...');
    await prisma.$disconnect();
    console.log('   ✅ Connexions fermées\n');

    // 4. Restauration
    console.log('4️⃣  Restauration...');
    const restoreTemp = path.join(BACKUPS_DIR, 'restore-temp');
    if (fs.existsSync(restoreTemp)) fs.rmSync(restoreTemp, { recursive: true, force: true });
    fs.mkdirSync(restoreTemp, { recursive: true });

    execSync(`tar -xzf "${backupPath}" -C "${restoreTemp}"`, { stdio: 'pipe' });
    console.log('   ✅ Archive extraite');

    const restoredDb = path.join(restoreTemp, dbFileName);
    if (fs.existsSync(restoredDb)) {
      fs.copyFileSync(restoredDb, DB_PATH);
      console.log('   ✅ DB restaurée');
    } else {
      throw new Error(`DB manquante dans l'archive: ${dbFileName}`);
    }

    const restoredUploads = path.join(restoreTemp, 'uploads');
    if (fs.existsSync(restoredUploads)) {
      if (fs.existsSync(UPLOADS_DIR)) fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
      fs.renameSync(restoredUploads, UPLOADS_DIR);
      console.log('   ✅ Uploads restaurés');
    }

    fs.rmSync(restoreTemp, { recursive: true, force: true });

    // 5. Audit
    console.log('\n5️⃣  Journalisation...');
    const prismaAudit = new PrismaClient();
    await prismaAudit.auditLog.create({
      data: {
        action: 'SYSTEM_RESTORED',
        entityType: 'System',
        entityId: backupFile,
        metadata: JSON.stringify({ timestamp: new Date().toISOString(), preRestoreBackup: `${preName}.tar.gz` })
      }
    });
    await prismaAudit.$disconnect();
    console.log('   ✅ AuditLog enregistré');

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║     🎉 RESTAURATION RÉUSSIE                    ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log(`\n✅ Système rétabli à l'état du backup`);
    console.log(`📦 ${backupFile}`);
    console.log(`🛡️  Backup sécurité: ${preName}.tar.gz\n`);

  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════╗');
    console.error('║     ❌ ÉCHEC RESTAURATION                      ║');
    console.error('╚════════════════════════════════════════════════╝\n');
    console.error('Erreur:', error.message);
    console.error('\n💡 Utilisez le backup PRE-RESTORE si nécessaire\n');
    process.exit(1);
  }
}

if (require.main === module) performRestore();
module.exports = { performRestore };
