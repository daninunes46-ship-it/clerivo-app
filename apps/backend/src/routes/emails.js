const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// GET /api/emails
router.get('/', emailController.getEmails);

// POST /api/emails/send
router.post('/send', emailController.sendEmail);

module.exports = router;
