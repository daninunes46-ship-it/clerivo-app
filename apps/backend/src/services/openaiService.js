const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Génère un brouillon de réponse d'email intelligent.
 * @param {string} incomingEmailBody - Le corps de l'email reçu.
 * @param {string} senderName - Le nom de l'expéditeur.
 * @returns {Promise<{subject: string, body: string}>}
 */
const generateDraft = async (incomingEmailBody, senderName) => {
  const systemPrompt = `Tu es l'assistant exécutif d'une agence immobilière suisse de prestige (Clerivo). 
Ton style est empathique, ultra-professionnel, précis et chaleureux. 
Tu anticipes les besoins du client. 
Tu réponds en français parfait.
Ton objectif est de rédiger une réponse à un email entrant.`;

  const userPrompt = `Voici l'email reçu de ${senderName || 'le client'} :
"""
${incomingEmailBody}
"""

Rédige une réponse complète incluant :
1. Un objet pertinent (Subject).
2. Le corps du message (Body).

Format de réponse attendu (JSON uniquement) :
{
  "subject": "L'objet de l'email",
  "body": "Le corps de l'email"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Erreur OpenAI:", error);
    throw new Error("Impossible de générer le brouillon pour le moment.");
  }
};

module.exports = { generateDraft };
