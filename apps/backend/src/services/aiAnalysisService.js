const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Path configuration
const STORAGE_DIR = path.join(__dirname, '../../../../data/storage');
const METADATA_FILE = path.join(STORAGE_DIR, 'ai_metadata.json');

// Ensure storage directory exists
const ensureStorage = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify({}, null, 2));
  }
};

// Load metadata from disk
const loadMetadata = () => {
  ensureStorage();
  try {
    const data = fs.readFileSync(METADATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading AI metadata:", error);
    return {};
  }
};

// Save metadata to disk
const saveMetadata = (data) => {
  ensureStorage();
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing AI metadata:", error);
  }
};

/**
 * Retrieves existing analysis for an email ID, or null if not found.
 * @param {string|number} emailId
 * @returns {Object|null}
 */
const getAnalysis = (emailId) => {
  const metadata = loadMetadata();
  return metadata[emailId] || null;
};

/**
 * Analyzes an email using GPT-4o.
 * Returns cached result if available.
 * @param {string|number} emailId
 * @param {string} emailBody
 * @param {string} senderInfo
 * @param {string} subject
 * @returns {Promise<Object>}
 */
const analyzeEmail = async (emailId, emailBody, senderInfo, subject) => {
  // 1. Check cache first (Speed & Cost efficiency)
  const existingAnalysis = getAnalysis(emailId);
  if (existingAnalysis) {
    return existingAnalysis;
  }

  // 2. Prepare Prompt
  const systemPrompt = `Tu es l'IA Omnisciente de Clerivo, un CRM immobilier avancé.
Ton rôle est d'analyser les emails entrants pour en extraire de la "Business Intelligence".
Tu dois être précis, capable de détecter l'urgence et les opportunités commerciales.

Réponds UNIQUEMENT en JSON valide.`;

  const userPrompt = `Analyse cet email :
Expéditeur: ${senderInfo}
Sujet: ${subject}
Corps: """
${emailBody ? emailBody.substring(0, 3000) : "(Pas de contenu texte)"} 
"""

Extrais les informations suivantes en JSON strict :
{
  "classification": {
    "category": "Acheteur" | "Vendeur" | "Locataire" | "Administratif" | "Autre",
    "priority": "Haute" | "Moyenne" | "Basse" (Haute = opportunité de deal immédiate ou problème urgent)
  },
  "sentiment": "Positif" | "Neutre" | "Négatif",
  "entities": {
    "client_name": "Nom complet si trouvé, sinon null",
    "phone": "Numéro de téléphone si trouvé, sinon null",
    "budget": "Budget mentionné (ex: '800k CHF') ou null",
    "location": "Lieu/Ville recherché ou du bien, ou null",
    "intent": "Résumé très court de l'intention (ex: 'Veut visiter le bien à Gland')"
  },
  "summary": "Une phrase de résumé pour l'aperçu."
}`;

  // 3. Call OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // 4. Save to cache
    const metadata = loadMetadata();
    metadata[emailId] = {
      ...result,
      analyzedAt: new Date().toISOString()
    };
    saveMetadata(metadata);

    return metadata[emailId];

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Return a safe default to not break the UI
    return {
      classification: { category: "Autre", priority: "Basse" },
      sentiment: "Neutre",
      entities: { client_name: null, phone: null, budget: null, location: null, intent: "Analyse non disponible" },
      summary: "Erreur lors de l'analyse IA.",
      error: true
    };
  }
};

module.exports = {
  getAnalysis,
  analyzeEmail,
  loadMetadata // Exporting this to help the emailController merge data easily
};
