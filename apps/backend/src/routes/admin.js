// ============================================================================
// ADMIN ROUTES - Routes d'administration & maintenance
// ============================================================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

/**
 * GET /api/admin/fix-pipeline
 * Répare les candidats orphelins (sans Application)
 * 
 * USAGE:
 * curl http://localhost:5000/api/admin/fix-pipeline
 * 
 * SÉCURITÉ V1: Aucune authentification (TODO: Ajouter auth admin en V1.1)
 */
router.get('/fix-pipeline', adminController.fixOrphanedCandidates);

/**
 * GET /api/admin/stats
 * Statistiques système pour diagnostic
 */
router.get('/stats', adminController.getSystemStats);

module.exports = router;
