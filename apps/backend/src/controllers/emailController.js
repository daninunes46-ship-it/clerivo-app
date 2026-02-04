const imap = require('imap-simple');
const { simpleParser } = require('mailparser');

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

exports.getEmails = async (req, res) => {
  let connection;
  try {
    // 1. Connexion
    // console.log('Connecting to IMAP...');
    connection = await imap.connect(config);
    
    // 2. Ouverture de la boîte
    await connection.openBox('INBOX');

    // 3. Recherche (Derniers 20 messages pour commencer)
    // TODO: Optimiser avec pagination pour la V2
    const searchCriteria = ['ALL'];
    const fetchOptions = {
      bodies: [''], // Récupère tout le raw message (header + body)
      markSeen: false,
      struct: true
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
