const aiAnalysisService = require('../services/aiAnalysisService');
const { generateDraft } = require('../services/openaiService');

exports.createDraft = async (req, res) => {
  try {
    const { incomingEmailBody, senderName } = req.body;
    const draft = await generateDraft(incomingEmailBody, senderName);
    res.json(draft);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyzeEmailFull = async (req, res) => {
  try {
    const { id, body, sender, subject } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "Email ID is required" });
    }

    const analysis = await aiAnalysisService.analyzeEmail(id, body, sender, subject);
    res.json({ success: true, data: analysis });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
