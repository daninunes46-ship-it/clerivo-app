#!/usr/bin/env node

/**
 * CLERIVO - DATAVAULT RESTORE
 * Procédure de restauration d'urgence
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'apps/backend/storage/uploads');

// Récupération dynamique DB
const dbUrl = process.env.DATABASE_URL;
const dbFileName = path.basename(dbUrl.replace('file:', ''));
const DB_PATH = path.join(DATA_DIR, dbFileName);

// Utilitaires
const calculateChecksum = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

async function main() {
  const backupFile = process.argv[2];

  if (!backupFile) {
    console.error('❌ Usage: node src/scripts/restore.js <backup-filename.tar.gz>');
    console.error('   Exemple: node src/scripts/restore.js backup-2026-02-06T12-00-00.tar.gz');
    process.exit(1);
  }

  const backupPath = path.join(BACKUPS_DIR, backupFile);
  const metaPath = backupPath.replace('.tar.gz', '.json');

  console.log(`🚑 Démarrage Restauration DataVault : ${backupFile}`);
  
  try {
    // 1. Vérification intégrité
    console.log('🔍 Vérification intégrité backup...');
    if (!fs.existsSync(backupPath)) throw new Error(`Fichier introuvable: ${backupPath}`);
    
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const currentChecksum = calculateChecksum(backupPath);
      if (meta.checksum !== currentChecksum) {
        throw new Error('⛔ CHECKSUM INVALID : Le fichier de backup semble corrompu !');
      }
      console.log('   ✅ Checksum validé');
    } else {
      console.warn('   ⚠️  Pas de fichier métadonnées .json trouvé, restauration sans validation checksum.');
    }

    // 2. Backup de sécurité (Pre-restore)
    console.log('🛡️  Création backup de sécurité (PRE-RESTORE)...');
    const safeBackupPath = path.join(BACKUPS_DIR, `PRE-RESTORE-${Date.now()}.tar.gz`);
    execSync(`tar -czf "${safeBackupPath}" -C "${DATA_DIR}" ${dbFileName}`);
    console.log(`   ✅ État actuel sauvegardé : ${safeBackupPath}`);

    // 3. Arrêt des connexions Prisma (Best effort)
    await prisma.$disconnect();

    // 4. Restauration
    console.log('⚡ Restauration en cours...');
    const tempDir = path.join(BACKUPS_DIR, 'restore-temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Extraction
    execSync(`tar -xzf "${backupPath}" -C "${tempDir}"`);

    // Remplacement DB
    const restoredDbPath = path.join(tempDir, dbFileName);
    if (fs.existsSync(restoredDbPath)) {
        fs.copyFileSync(restoredDbPath, DB_PATH);
        console.log('   ✅ Base de données restaurée');
    } else {
        throw new Error(`DB non trouvée dans l'archive : ${dbFileName}`);
    }

    // Remplacement Uploads
    const restoredUploads = path.join(tempDir, 'uploads');
    if (fs.existsSync(restoredUploads)) {
        fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
        fs.renameSync(restoredUploads, UPLOADS_DIR);
        console.log('   ✅ Dossier Uploads restauré');
    }

    // Nettoyage temp
    fs.rmSync(tempDir, { recursive: true, force: true });

    // 5. Reconnexion et Audit
    const prismaAudit = new PrismaClient();
    await prismaAudit.auditLog.create({
      data: {
        action: 'SYSTEM_RESTORED',
        entityType: 'System',
        entityId: backupFile,
        metadata: JSON.stringify({ timestamp: new Date().toISOString() })
      }
    });
    await prismaAudit.$disconnect();

    console.log('\n🎉 RESTAURATION TERMINÉE AVEC SUCCÈS');
    console.log('   Le système a été rétabli à l\'état du backup.');

  } catch (error) {
    console.error('\n❌ ÉCHEC RESTAURATION :', error.message);
    process.exit(1);
  }
}

main();
