#!/usr/bin/env node

/**
 * CLERIVO - DATAVAULT BACKUP
 * Conforme CDC v1.1.1 (Section 9.1) & Plan de Bataille 4 (Section 5.2)
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Configuration
const BACKEND_ROOT = path.resolve(__dirname, '../..'); // apps/backend
const PROJECT_ROOT = path.resolve(__dirname, '../../../..'); // racine

const DATA_DIR = path.join(BACKEND_ROOT, 'data');
const BACKUPS_DIR = path.join(PROJECT_ROOT, 'data/backups');
const UPLOADS_DIR = path.join(BACKEND_ROOT, 'storage/uploads');
const RETENTION_DAYS = 7;

// DB dynamique depuis DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || !DATABASE_URL.startsWith('file:')) {
  console.error('❌ DATABASE_URL invalide');
  process.exit(1);
}

const dbFileName = path.basename(DATABASE_URL.replace('file:', ''));
const DB_PATH = path.join(DATA_DIR, dbFileName);

// Utilitaires
const fmt = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const checksum = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const bytes = (b) => {
  if (!b) return '0 B';
  const k = 1024;
  const s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(2)} ${s[i]}`;
};

async function performBackup() {
  const ts = fmt();
  const name = `backup-${ts}`;
  const temp = path.join(BACKUPS_DIR, `temp-${ts}`);
  const archive = path.join(BACKUPS_DIR, `${name}.tar.gz`);

  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     CLERIVO DATAVAULT - BACKUP                 ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`\n📅 ${new Date().toLocaleString('fr-CH')}`);
  console.log(`🎯 Backup: ${name}\n`);

  const start = Date.now();

  try {
    // 1. Vérifications
    console.log('1️⃣  Vérification des prérequis...');
    if (!fs.existsSync(DB_PATH)) throw new Error(`DB introuvable: ${DB_PATH}`);
    if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    if (!fs.existsSync(temp)) fs.mkdirSync(temp, { recursive: true });
    console.log('   ✅ Chemins validés\n');

    // 2. Checkpoint WAL (CRITIQUE)
    console.log('2️⃣  PRAGMA wal_checkpoint(FULL)...');
    await prisma.$queryRawUnsafe('PRAGMA wal_checkpoint(FULL)');
    console.log('   ✅ WAL synchronisé\n');

    // 3. Snapshot
    console.log('3️⃣  Création du snapshot...');
    const dbSize = fs.statSync(DB_PATH).size;
    fs.copyFileSync(DB_PATH, path.join(temp, dbFileName));
    console.log(`   ✅ DB copiée (${bytes(dbSize)})`);

    let upSize = 0;
    if (fs.existsSync(UPLOADS_DIR)) {
      execSync(`cp -r "${UPLOADS_DIR}" "${path.join(temp, 'uploads')}"`, { stdio: 'pipe' });
      upSize = parseInt(execSync(`du -sb "${UPLOADS_DIR}" | cut -f1`).toString().trim());
      console.log(`   ✅ Uploads copiés (${bytes(upSize)})`);
    } else {
      fs.mkdirSync(path.join(temp, 'uploads'));
      console.log('   ℹ️  Uploads vide');
    }

    // 4. Compression
    console.log('\n4️⃣  Compression (tar natif)...');
    execSync(`tar -czf "${archive}" -C "${temp}" .`, { stdio: 'pipe' });
    execSync(`rm -rf "${temp}"`, { stdio: 'pipe' });
    
    const size = fs.statSync(archive).size;
    const ratio = ((1 - size / (dbSize + upSize)) * 100).toFixed(1);
    console.log(`   ✅ Archive créée (${bytes(size)})`);
    console.log(`   📉 Compression: ${ratio}%\n`);

    // 5. Métadonnées
    console.log('5️⃣  Métadonnées & checksum...');
    const cs = checksum(archive);
    const meta = {
      timestamp: new Date().toISOString(),
      backupName: name,
      database: { path: DB_PATH, size: dbSize },
      uploads: { size: upSize },
      archive: { size, checksum: cs, ratio: `${ratio}%` }
    };
    fs.writeFileSync(archive.replace('.tar.gz', '.json'), JSON.stringify(meta, null, 2));
    console.log(`   🔐 ${cs.substring(0, 16)}...\n`);

    // 6. Rotation
    console.log('6️⃣  Rotation (rétention 7j)...');
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.startsWith('backup-') && f.endsWith('.tar.gz'));
    const now = Date.now();
    let del = 0;
    
    files.forEach(f => {
      const age = (now - fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs) / (1000 * 60 * 60 * 24);
      if (age > RETENTION_DAYS) {
        fs.unlinkSync(path.join(BACKUPS_DIR, f));
        const j = path.join(BACKUPS_DIR, f.replace('.tar.gz', '.json'));
        if (fs.existsSync(j)) fs.unlinkSync(j);
        del++;
      }
    });
    console.log(del ? `   🗑️  ${del} supprimé(s)` : '   ✅ Aucun ancien backup');

    // 7. Audit
    console.log('\n7️⃣  Journalisation...');
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP_CREATED',
        entityType: 'System',
        entityId: name,
        metadata: JSON.stringify({ size, checksum: cs, durationMs: Date.now() - start })
      }
    });
    console.log('   ✅ AuditLog enregistré');

    // Résumé
    const dur = ((Date.now() - start) / 1000).toFixed(2);
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║     ✅ BACKUP RÉUSSI                           ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log(`\n📦 ${name}.tar.gz`);
    console.log(`📊 ${bytes(size)}`);
    console.log(`⏱️  ${dur}s`);
    console.log(`\n💡 Restaurer:`);
    console.log(`   node src/scripts/restore.js ${name}.tar.gz\n`);

  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════╗');
    console.error('║     ❌ ERREUR BACKUP                           ║');
    console.error('╚════════════════════════════════════════════════╝\n');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) performBackup();
module.exports = { performBackup };
