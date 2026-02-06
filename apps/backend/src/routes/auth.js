const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ============================================================================
// MIDDLEWARE : Vérification d'authentification
// ============================================================================
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Non authentifié. Veuillez vous connecter.'
    });
  }
  next();
};

// ============================================================================
// POST /api/auth/login
// ============================================================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validation des entrées
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis.'
    });
  }

  try {
    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    // Utilisateur inexistant ou inactif
    if (!user || !user.isActive) {
      // Journalisation de l'échec
      await prisma.auditLog.create({
        data: {
          action: 'LOGIN_FAILED',
          entityType: 'User',
          entityId: null,
          userId: null,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          metadata: JSON.stringify({ attemptedEmail: email, reason: 'User not found or inactive' })
        }
      });

      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides.'
      });
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Journalisation de l'échec
      await prisma.auditLog.create({
        data: {
          action: 'LOGIN_FAILED',
          entityType: 'User',
          entityId: user.id,
          userId: null,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          metadata: JSON.stringify({ attemptedEmail: email, reason: 'Invalid password' })
        }
      });

      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides.'
      });
    }

    // Authentification réussie
    // Création de la session
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    // Mise à jour de lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Journalisation du succès
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    });

    // Retour des données utilisateur (sans le hash)
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification.'
    });
  }
});

// ============================================================================
// POST /api/auth/logout
// ============================================================================
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    // Journalisation du logout
    await prisma.auditLog.create({
      data: {
        action: 'LOGOUT',
        entityType: 'User',
        entityId: userId,
        userId: userId,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    });

    // Destruction de la session
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Erreur lors de la destruction de session:', err);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la déconnexion.'
        });
      }

      // Suppression du cookie
      res.clearCookie('clerivo.sid');
      res.status(200).json({
        success: true,
        message: 'Déconnexion réussie.'
      });
    });

  } catch (error) {
    console.error('❌ Erreur lors du logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la déconnexion.'
    });
  }
});

// ============================================================================
// GET /api/auth/me
// ============================================================================
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou inactif.'
      });
    }

    res.status(200).json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
});

module.exports = router;
module.exports.requireAuth = requireAuth;
