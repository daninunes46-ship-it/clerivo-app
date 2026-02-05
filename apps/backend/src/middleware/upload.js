// ============================================================================
// UPLOAD MIDDLEWARE - Swiss Safe Documents
// Configuration Multer pour l'upload de documents (PDF, Images)
// ============================================================================

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configuration du stockage sur disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Stocker dans storage/uploads
    cb(null, path.join(__dirname, '../../storage/uploads'));
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
