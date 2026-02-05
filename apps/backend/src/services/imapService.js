const imap = require('imap-simple');
const { simpleParser } = require('mailparser');
const DOMPurify = require('isomorphic-dompurify');
const crypto = require('crypto');

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

/**
 * 🛡️ MISSION 1 : LE BOUCLIER (SANITIZATION)
 * Nettoie le HTML des emails pour supprimer tout code malveillant
 * ✅ Autorise : <img>, <a>, <p>, <div>, styles basiques
 * ❌ Interdit : <script>, <iframe>, onclick, onmouseover, etc.
 */
function sanitizeEmailHTML(rawHtml) {
  if (!rawHtml) return null;

  // Configuration stricte de DOMPurify
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    // Autorise les images mais interdit strictement les scripts
    ALLOWED_TAGS: [
      'p', 'br', 'div', 'span', 'a', 'img', 'strong', 'em', 'u', 'b', 'i',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tr', 'td', 'th', 'blockquote', 'pre', 'code'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'width', 'height', 'style', 'class', 'id'
    ],
    // Interdit TOUS les événements JavaScript
    FORBID_ATTR: [
      'onclick', 'onmouseover', 'onmouseout', 'onerror', 'onload',
      'onmouseenter', 'onmouseleave', 'onfocus', 'onblur', 'onchange'
    ],
    // Interdit les scripts, iframes et objets
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'button'],
    // Autorise les URLs de données pour les images (base64)
    ALLOW_DATA_ATTR: false,
    // Nettoie aussi les styles CSS dangereux
    ALLOW_UNKNOWN_PROTOCOLS: false
  });

  return cleanHtml;
}

/**
 * 📎 MISSION 2 : GESTION DES PIÈCES JOINTES
 * Extrait les métadonnées des pièces jointes sans les télécharger
 * @param {Array} attachments - Tableau des pièces jointes de mailparser
 * @returns {Array} Métadonnées des pièces jointes
 */
function extractAttachmentMetadata(attachments) {
  if (!attachments || attachments.length === 0) return [];

  return attachments.map(att => {
    // Calcul du checksum MD5 pour identification unique
    const checksum = crypto
      .createHash('md5')
      .update(att.content)
      .digest('hex');

    return {
      filename: att.filename || 'fichier_sans_nom',
      contentType: att.contentType || 'application/octet-stream',
      size: att.size || (att.content ? att.content.length : 0),
      checksum: checksum,
      // Pour la v2 : on pourra stocker le contenu avec un flag
      // downloadable: false
    };
  });
}

/**
 * Récupère les emails depuis le serveur IMAP
 * @param {Object} options - Options de récupération (limite, critères)
 * @returns {Promise<Array>} Liste des emails avec métadonnées complètes
 */
async function fetchEmails(options = {}) {
  const { limit = 20, searchCriteria = ['ALL'] } = options;
  
  let connection;
  try {
    // 1. Connexion au serveur IMAP
    connection = await imap.connect(config);
    
    // 2. Ouverture de la boîte de réception
    await connection.openBox('INBOX');

    // 3. Recherche et récupération des messages
    const fetchOptions = {
      bodies: [''], // Récupère le message complet
      markSeen: false,
      struct: true
    };

    const allMessages = await connection.search(searchCriteria, fetchOptions);
    
    // Prendre les N derniers messages et inverser pour avoir les plus récents en premier
    const messagesToProcess = allMessages.slice(-limit).reverse(); 
    
    const emails = [];

    // 4. Parser et sécuriser chaque message
    for (const item of messagesToProcess) {
      const all = item.parts.find(part => part.which === '');
      const id = item.attributes.uid;
      const seq = item.seqno;
      const flags = item.attributes.flags || [];

      try {
        // Parser le message brut
        const parsed = await simpleParser(all.body);
        
        // 🛡️ Sécurisation du contenu HTML
        const sanitizedHtml = sanitizeEmailHTML(parsed.html);
        
        // 📎 Extraction des métadonnées des pièces jointes
        const attachmentMetadata = extractAttachmentMetadata(parsed.attachments);
        
        // Construction de l'objet email sécurisé
        emails.push({
          id: id,
          seq: seq,
          from: parsed.from ? parsed.from.value[0] : { address: 'Inconnu', name: 'Inconnu' },
          to: parsed.to ? parsed.to.value : [],
          subject: parsed.subject || '(Sans objet)',
          date: parsed.date,
          // Snippet : 100 premiers caractères du texte brut
          snippet: parsed.text 
            ? parsed.text.substring(0, 100).replace(/[\r\n]+/g, ' ') + '...' 
            : '',
          text: parsed.text, // Texte brut (safe)
          html: sanitizedHtml, // ⚠️ HTML SÉCURISÉ
          unread: !flags.includes('\\Seen'),
          // 📎 Métadonnées des pièces jointes
          hasAttachments: attachmentMetadata.length > 0,
          attachments: attachmentMetadata,
          // Headers utiles pour debug/traçabilité
          messageId: parsed.messageId,
          inReplyTo: parsed.inReplyTo,
          references: parsed.references
        });

      } catch (err) {
        console.error(`❌ Erreur parsing email UID ${id}:`, err.message);
        // Ne pas bloquer toute la liste pour un mail corrompu
        emails.push({
          id: id,
          error: "Erreur de lecture du message",
          subject: "Message illisible",
          hasAttachments: false,
          attachments: []
        });
      }
    }

    return {
      success: true,
      count: emails.length,
      data: emails
    };

  } catch (error) {
    console.error('❌ Erreur IMAP Service:', error);
    throw error;
  } finally {
    // Toujours fermer la connexion
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error('Erreur fermeture connexion:', err);
      }
    }
  }
}

module.exports = {
  fetchEmails,
  sanitizeEmailHTML,
  extractAttachmentMetadata
};
