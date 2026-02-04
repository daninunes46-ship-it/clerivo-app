const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/draft', aiController.createDraft);

module.exports = router;
