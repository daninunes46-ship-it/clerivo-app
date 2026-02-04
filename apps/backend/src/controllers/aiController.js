const openaiService = require('../services/openaiService');

const createDraft = async (req, res) => {
  try {
    const { incomingEmailBody, senderName } = req.body;

    if (!incomingEmailBody) {
      return res.status(400).json({ error: "Le corps de l'email est requis." });
    }

    const draft = await openaiService.generateDraft(incomingEmailBody, senderName);
    res.json(draft);
  } catch (error) {
    console.error("Erreur contrôleur AI:", error);
    res.status(500).json({ error: "Erreur lors de la génération du brouillon." });
  }
};

module.exports = { createDraft };
