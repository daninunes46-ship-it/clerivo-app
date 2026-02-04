require('dotenv').config();
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

async function testEmailConnection() {
  console.log('🚀 Démarrage du test de connexion Email (Mode Robustesse UTF-8)...');
  
  if (!config.imap.user || !config.imap.password) {
    console.error('❌ Erreur: Les variables IMAP_USER et IMAP_PASSWORD sont requises dans le .env');
    console.log('   Copiez le fichier .env.example vers .env et remplissez-le.');
    process.exit(1);
  }

  console.log(`🔌 Connexion à ${config.imap.host}:${config.imap.port} (${config.imap.user})...`);

  let connection;
  try {
    connection = await imap.connect(config);
    console.log('✅ Connexion IMAP établie.');

    await connection.openBox('INBOX');
    console.log('📂 Boîte INBOX ouverte.');

    // Recherche des 3 derniers messages
    // On récupère 'ALL' pour avoir la liste, puis on prend les derniers
    const searchCriteria = ['ALL'];
    const fetchOptions = {
      bodies: [''], // On récupère le corps complet (headers + body) pour que mailparser fasse le travail parfait de décodage
      markSeen: false,
      struct: true
    };

    console.log('🔍 Récupération des messages...');
    const allMessages = await connection.search(searchCriteria, fetchOptions);
    
    if (allMessages.length === 0) {
      console.log('📭 Aucun message trouvé.');
    } else {
      console.log(`📨 ${allMessages.length} messages trouvés.`);
      
      // On prend les 3 derniers
      const messagesToProcess = allMessages.slice(-3);
      console.log(`\n--- ANALYSE DES 3 DERNIERS EMAILS (Encodage garanti par Mailparser) ---`);

      for (const [index, item] of messagesToProcess.entries()) {
        const all = item.parts.find(part => part.which === '');
        const id = item.attributes.uid;
        const seq = item.seqno;

        // Utilisation de mailparser pour garantir un décodage UTF-8 parfait des headers et du corps
        try {
            const parsed = await simpleParser(all.body);
            
            console.log(`\n📧 Email #${index + 1} (UID: ${id})`);
            console.log(`   📅 Date:    ${parsed.date ? parsed.date.toISOString() : 'Inconnue'}`);
            console.log(`   👤 De:      ${parsed.from ? parsed.from.text : 'Inconnu'}`);
            console.log(`   📝 Sujet:   ${parsed.subject}`); // simpleParser décode automatiquement les sujets MIME (ex: =?UTF-8?...)
        } catch (err) {
            console.error(`   ❌ Erreur de parsing pour le message #${id}:`, err.message);
        }
      }
      console.log(`\n-----------------------------------------------------------------------`);
    }

  } catch (error) {
    console.error('❌ Erreur Critique :', error);
  } finally {
    if (connection) {
      connection.end();
      console.log('👋 Déconnexion.');
    }
  }
}

testEmailConnection();
