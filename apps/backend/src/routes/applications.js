// ============================================================================
// APPLICATION ROUTES - Routes pour les candidatures
// ============================================================================

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

/**
 * GET /api/applications/:id
 * Récupère une application par ID
 */
router.get('/:id', applicationController.getApplication);

/**
 * PUT /api/applications/:id
 * Met à jour une application (statut, priorité, etc.)
 * 
 * USAGE PRINCIPAL: Drag & Drop dans le Pipeline
 */
router.put('/:id', applicationController.updateApplication);

module.exports = router;
