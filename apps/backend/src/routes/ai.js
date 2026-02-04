const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/draft', aiController.createDraft);
router.post('/analyze-full', aiController.analyzeEmailFull);

module.exports = router;
