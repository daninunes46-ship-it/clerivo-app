const imapService = require('../services/imapService');
const imap = require('imap-simple');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');

const config = {
  imap: {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: process.env.IMAP_PORT || 993,
    tls: process.env.IMAP_TLS === 'true',
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000
  }
};

// Configuration du transporteur SMTP (Envoi)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou utilisez host/port si ce n'est pas Gmail
    auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASSWORD
    }
});

/**
 * Récupère la liste des emails (Sécurisés & avec pièces jointes)
 */
exports.getEmails = async (req, res) => {
  try {
    console.log('🔄 Récupération des emails via imapService...');
    
    // On appelle le nouveau service "Blindé"
    const result = await imapService.fetchEmails({ limit: 20 });
    
    // On renvoie le résultat propre au Frontend
    res.json(result.data);

  } catch (error) {
    console.error('❌ Erreur Controller:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des emails',
      details: error.message 
    });
  }
};

    const allMessages = await connection.search(searchCriteria, fetchOptions);
    
    // On prend les 20 derniers et on inverse pour avoir les plus récents en premier
    const messagesToProcess = allMessages.slice(-20).reverse(); 

    const emails = [];

    for (const item of messagesToProcess) {
        const all = item.parts.find(part => part.which === '');
        const id = item.attributes.uid;
        const seq = item.seqno;
        const flags = item.attributes.flags || [];

        try {
            const parsed = await simpleParser(all.body);
            
            emails.push({
                id: id,
                seq: seq,
                from: parsed.from ? parsed.from.value[0] : { address: 'Inconnu', name: 'Inconnu' },
                subject: parsed.subject || '(Sans objet)',
                date: parsed.date,
                // Snippet : 100 premiers caractères du texte brut, sans sauts de ligne
                snippet: parsed.text ? parsed.text.substring(0, 100).replace(/[\r\n]+/g, ' ') + '...' : '',
                text: parsed.text, // Contenu texte complet pour l'affichage détail
                html: parsed.html, // Contenu HTML complet pour l'affichage riche (si dispo)
                unread: !flags.includes('\\Seen'),
                hasAttachments: parsed.attachments && parsed.attachments.length > 0
            });
        } catch (err) {
            console.error(`Erreur parsing email UID ${id}:`, err.message);
            // On continue pour ne pas bloquer toute la liste pour un mail corrompu
            emails.push({
                id: id,
                error: "Erreur de lecture du message",
                subject: "Message illisible"
            });
        }
    }

    res.json({
        success: true,
        count: emails.length,
        data: emails
    });

  } catch (error) {
    console.error('Erreur API Emails:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des emails',
        error: error.message 
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Erreur lors de la fermeture de la connexion:', err);
      }
    }
  }
};

exports.sendEmail = async (req, res) => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
        return res.status(400).json({
            success: false,
            message: 'Champs manquants (to, subject, text/html)'
        });
    }

    try {
        const mailOptions = {
            from: process.env.IMAP_USER,
            to: to,
            subject: subject,
            text: text,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé: %s', info.messageId);

        res.json({
            success: true,
            message: 'Email envoyé avec succès',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de l\'email',
            error: error.message
        });
    }
};
