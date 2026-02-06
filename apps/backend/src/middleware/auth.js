// ============================================================================
// CLERIVO - Middleware d'Authentification JWT
// Étape 1 : Infrastructure Auth (V1 - Rôles stricts ADMIN/AGENT)
// ============================================================================

const jwt = require('jsonwebtoken');

// ============================================================================
// CONFIGURATION
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '8h'; // 8 heures (CDC Étape 1)

// Validation : JWT_SECRET doit être défini
if (!JWT_SECRET) {
  throw new Error('❌ FATAL: JWT_SECRET non défini dans .env');
}

// V1 : Rôles stricts ADMIN et AGENT uniquement (pas de MANAGER)
const ALLOWED_ROLES = ['ADMIN', 'AGENT'];

// ============================================================================
// 1. GÉNÉRATION DE TOKEN JWT
// ============================================================================

/**
 * Génère un token JWT signé pour un utilisateur
 * @param {Object} user - Objet utilisateur (doit contenir id, email, role)
 * @returns {string} Token JWT signé
 * @throws {Error} Si les données utilisateur sont invalides
 */
function generateToken(user) {
  // Validation des données d'entrée
  if (!user || !user.id || !user.email || !user.role) {
    throw new Error('generateToken: données utilisateur invalides (id, email, role requis)');
  }

  // V1 : Validation du rôle (ADMIN ou AGENT uniquement)
  if (!ALLOWED_ROLES.includes(user.role)) {
    throw new Error(`generateToken: rôle invalide "${user.role}". Rôles autorisés: ${ALLOWED_ROLES.join(', ')}`);
  }

  // Payload JWT (données minimales pour sécurité)
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    // Timestamp de génération (utile pour invalidation manuelle)
    iat: Math.floor(Date.now() / 1000)
  };

  // Signature du token avec expiration 8h
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'clerivo-backend',
    audience: 'clerivo-app'
  });

  return token;
}

// ============================================================================
// 2. VÉRIFICATION DE TOKEN (Middleware Express)
// ============================================================================

/**
 * Middleware Express : Vérifie le token JWT dans cookie httpOnly
 * Peuple req.user avec les données décodées si valide
 * Renvoie 401 si token absent/invalide/expiré
 */
function verifyToken(req, res, next) {
  try {
    // Étape 1 : Vérifier que le cookie authToken existe
    const token = req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_TOKEN_MISSING',
        message: 'Token d\'authentification manquant. Connexion requise.'
      });
    }

    // Étape 2 : Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'clerivo-backend',
      audience: 'clerivo-app'
    });

    // Étape 3 : Validation du payload
    if (!decoded.userId || !decoded.email || !decoded.role) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_TOKEN_INVALID',
        message: 'Token JWT invalide (payload incomplet).'
      });
    }

    // V1 : Validation du rôle (protection supplémentaire)
    if (!ALLOWED_ROLES.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        error: 'AUTH_ROLE_INVALID',
        message: `Rôle "${decoded.role}" non autorisé.`
      });
    }

    // Étape 4 : Peupler req.user avec les données utilisateur
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    // ✅ Authentification réussie
    next();

  } catch (error) {
    // Gestion des erreurs JWT spécifiques
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_TOKEN_EXPIRED',
        message: 'Token expiré. Veuillez vous reconnecter.',
        expiredAt: error.expiredAt
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_TOKEN_INVALID',
        message: 'Token JWT invalide ou corrompu.'
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_TOKEN_NOT_ACTIVE',
        message: 'Token pas encore actif.',
        notBefore: error.date
      });
    }

    // Erreur inattendue
    console.error('❌ [Auth] Erreur vérification token:', error);
    return res.status(500).json({
      success: false,
      error: 'AUTH_VERIFICATION_ERROR',
      message: 'Erreur lors de la vérification du token.'
    });
  }
}

// ============================================================================
// 3. CONTRÔLE D'ACCÈS PAR RÔLE (Middleware Express)
// ============================================================================

/**
 * Middleware Express : Vérifie que l'utilisateur a un des rôles autorisés
 * DOIT être utilisé APRÈS verifyToken() pour que req.user soit peuplé
 * 
 * @param {string[]} roles - Liste des rôles autorisés (ex: ['ADMIN'])
 * @returns {Function} Middleware Express
 * 
 * @example
 * // Route accessible uniquement aux ADMIN
 * router.delete('/candidates/:id', verifyToken, requireRole(['ADMIN']), deleteCandidateHandler);
 * 
 * // Route accessible aux ADMIN et AGENT
 * router.get('/candidates', verifyToken, requireRole(['ADMIN', 'AGENT']), listCandidatesHandler);
 */
function requireRole(roles) {
  // Validation : roles doit être un tableau non vide
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error('requireRole: roles doit être un tableau non vide');
  }

  // Validation : tous les rôles doivent être dans ALLOWED_ROLES (V1)
  const invalidRoles = roles.filter(role => !ALLOWED_ROLES.includes(role));
  if (invalidRoles.length > 0) {
    throw new Error(`requireRole: rôles invalides détectés: ${invalidRoles.join(', ')}`);
  }

  // Retourne le middleware Express
  return (req, res, next) => {
    // Vérification : req.user doit exister (verifyToken a été appelé avant)
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_MISSING',
        message: 'Authentification requise. Utilisez verifyToken avant requireRole.'
      });
    }

    // Vérification : le rôle de l'utilisateur est-il autorisé ?
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'AUTH_FORBIDDEN',
        message: `Accès refusé. Rôle requis: ${roles.join(' ou ')}. Votre rôle: ${req.user.role}.`
      });
    }

    // ✅ Autorisation accordée
    next();
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  generateToken,
  verifyToken,
  requireRole,
  // Export des constantes pour tests/validation
  ALLOWED_ROLES,
  JWT_EXPIRY
};
