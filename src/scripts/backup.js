#!/usr/bin/env node

/**
 * CLERIVO - DATAVAULT BACKUP
 * Stratégie 3-2-1 : Copie locale horodatée
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Configuration
// On est dans apps/backend/src/scripts
const PROJECT_ROOT = path.resolve(__dirname, '../../..'); 
// PROJECT_ROOT = /home/clerivo2/projects/clerivo

const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'apps/backend/storage/uploads');
const RETENTION_DAYS = 7;

// Récupération dynamique du chemin DB
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || !dbUrl.startsWith('file:')) {
  console.error('❌ DATABASE_URL invalide ou non défini (doit commencer par file:)');
  process.exit(1);
}

const dbFileName = path.basename(dbUrl.replace('file:', ''));
const DB_PATH = path.join(DATA_DIR, dbFileName);

// Utilitaires
const formatTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const calculateChecksum = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
};

async function main() {
  const timestamp = formatTimestamp();
  const backupName = `backup-${timestamp}`;
  const tempDir = path.join(BACKUPS_DIR, `temp-${timestamp}`);
  const archivePath = path.join(BACKUPS_DIR, `${backupName}.tar.gz`);

  console.log(`🔒 Démarrage Backup DataVault : ${backupName}`);
  const startTime = Date.now();

  try {
    // 1. Vérifications
    if (!fs.existsSync(DB_PATH)) throw new Error(`DB introuvable: ${DB_PATH}`);
    if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // 2. Checkpoint WAL (Atomicity)
    console.log('🔄 Exécution PRAGMA wal_checkpoint(FULL)...');
    await prisma.$executeRawUnsafe('PRAGMA wal_checkpoint(FULL)');
    
    // 3. Copie des fichiers vers temp
    console.log('📂 Préparation des fichiers...');
    // Copie DB
    fs.copyFileSync(DB_PATH, path.join(tempDir, dbFileName));
    // Copie Uploads (si existe)
    if (fs.existsSync(UPLOADS_DIR)) {
      execSync(`cp -r "${UPLOADS_DIR}" "${path.join(tempDir, 'uploads')}"`);
    } else {
      fs.mkdirSync(path.join(tempDir, 'uploads'));
    }

    // 4. Compression (Tar natif pour performance Pi)
    console.log('🗜️  Compression de l\'archive...');
    execSync(`tar -czf "${archivePath}" -C "${tempDir}" .`);
    
    // Nettoyage temp
    execSync(`rm -rf "${tempDir}"`);

    // 5. Métadonnées & Checksum
    const stats = fs.statSync(archivePath);
    const checksum = calculateChecksum(archivePath);
    const meta = {
      timestamp: new Date().toISOString(),
      size: stats.size,
      checksum,
      dbPath: DB_PATH,
      uploadsPath: UPLOADS_DIR
    };
    fs.writeFileSync(archivePath.replace('.tar.gz', '.json'), JSON.stringify(meta, null, 2));

    // 6. Rotation (Rétention)
    console.log('🧹 Rotation des backups anciens...');
    const files = fs.readdirSync(BACKUPS_DIR);
    const now = Date.now();
    let deleted = 0;
    
    files.forEach(file => {
      if (file.startsWith('backup-') && file.endsWith('.tar.gz')) {
        const filePath = path.join(BACKUPS_DIR, file);
        const fileStats = fs.statSync(filePath);
        const daysOld = (now - fileStats.mtimeMs) / (1000 * 60 * 60 * 24);
        
        if (daysOld > RETENTION_DAYS) {
          fs.unlinkSync(filePath);
          const jsonPath = filePath.replace('.tar.gz', '.json');
          if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
          deleted++;
        }
      }
    });
    if (deleted > 0) console.log(`   - ${deleted} backups supprimés (> ${RETENTION_DAYS} jours)`);

    // 7. AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'BACKUP_CREATED',
        entityType: 'System',
        entityId: backupName,
        metadata: JSON.stringify({ size: stats.size, checksum, durationMs: Date.now() - startTime })
      }
    });

    console.log(`✅ Backup terminé avec succès : ${archivePath}`);
    console.log(`   Taille: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Checksum: ${checksum.substring(0, 8)}...`);

  } catch (error) {
    console.error('❌ Erreur Backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
