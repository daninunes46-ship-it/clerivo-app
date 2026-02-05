// ============================================================================
// CANDIDATES ROUTES - Module 2
// Routes API pour la gestion des candidats
// ============================================================================

const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');

/**
 * @route   GET /api/candidates
 * @desc    Liste tous les candidats avec filtres optionnels
 * @query   ?status=NEW&residencyStatus=PERMIT_C&search=dupont
 * @access  Private (Agent+)
 */
router.get('/', candidateController.getCandidates);

/**
 * @route   GET /api/candidates/:id
 * @desc    Récupère un candidat par ID avec toutes ses relations
 * @access  Private (Agent+)
 */
router.get('/:id', candidateController.getCandidateById);

/**
 * @route   POST /api/candidates
 * @desc    Crée un nouveau candidat
 * @access  Private (Agent+)
 */
router.post('/', candidateController.createCandidate);

/**
 * @route   PUT /api/candidates/:id
 * @desc    Met à jour un candidat
 * @access  Private (Agent+)
 */
router.put('/:id', candidateController.updateCandidate);

/**
 * @route   DELETE /api/candidates/:id
 * @desc    Supprime un candidat (soft delete)
 * @access  Private (Agent+)
 */
router.delete('/:id', candidateController.deleteCandidate);

/**
 * @route   GET /api/candidates/:id/solvency
 * @desc    Récupère le profil de solvabilité d'un candidat
 * @access  Private (Agent+)
 */
router.get('/:id/solvency', candidateController.getSolvencyProfile);

module.exports = router;
