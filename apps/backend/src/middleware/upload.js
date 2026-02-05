// ============================================================================
// UPLOAD MIDDLEWARE - Swiss Safe Documents
// Configuration Multer pour l'upload de documents (PDF, Images)
// ============================================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// 🛡️ SÉCURITÉ : Créer le dossier uploads automatiquement s'il n'existe pas
const UPLOAD_DIR = path.join(__dirname, '../../storage/uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  console.log('📁 Création du dossier uploads...');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`✅ Dossier créé : ${UPLOAD_DIR}`);
} else {
  console.log(`✅ Dossier uploads existant : ${UPLOAD_DIR}`);
}

// Configuration du stockage sur disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Stocker dans storage/uploads (dossier garanti d'exister)
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique : timestamp + random + extension originale
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

// Filtrage des types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true); // Accepter
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}. Formats acceptés: PDF, JPG, PNG, WEBP`), false);
  }
};

// Configuration Multer complète
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max
  }
});

module.exports = upload;
