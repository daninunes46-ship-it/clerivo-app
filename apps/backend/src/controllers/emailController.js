const imapService = require('../services/imapService');
const nodemailer = require('nodemailer');

/**
 * Configuration du transporteur SMTP pour l'envoi d'emails
 * Compatible avec Gmail, Infomaniak et autres fournisseurs SMTP
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER || process.env.IMAP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.IMAP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Récupère la liste des emails via le service IMAP sécurisé
 * @route GET /api/emails
 */
exports.getEmails = async (req, res) => {
  try {
    console.log('🔄 Récupération des emails via imapService...');
    
    // Appel du service IMAP sécurisé avec limite de 20 emails
    const result = await imapService.fetchEmails({ limit: 20 });
    
    // Renvoie l'objet complet au frontend (success, count, data)
    res.json(result);

  } catch (error) {
    console.error('❌ Erreur Controller getEmails:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des emails',
      details: error.message 
    });
  }
};

/**
 * Envoie un email via SMTP
 * @route POST /api/emails/send
 * @body { to, subject, text, html }
 */
exports.sendEmail = async (req, res) => {
  const { to, subject, text, html } = req.body;

  // Validation des champs obligatoires
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      success: false,
      message: 'Champs manquants : to, subject, et text ou html sont requis'
    });
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_USER || process.env.IMAP_USER,
      to: to,
      subject: subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès, ID:', info.messageId);

    res.json({
      success: true,
      message: 'Email envoyé avec succès',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email',
      error: error.message
    });
  }
};
