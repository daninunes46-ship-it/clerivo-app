const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const emailRoutes = require('./routes/emails');
const aiRoutes = require('./routes/ai');
const candidateRoutes = require('./routes/candidates');

const app = express();
const PORT = process.env.PORT || 3000;

// Sécurité et Middleware de base
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes API (avec logs pour debug)
console.log('📦 Mounting API routes...');
app.use('/api/emails', emailRoutes);
console.log('✅ Email routes mounted');
app.use('/api/ai', aiRoutes);
console.log('✅ AI routes mounted');
app.use('/api/candidates', candidateRoutes);
console.log('✅ Candidate routes mounted (including upload endpoint)');

// Route de base (Health Check)
app.get('/', (req, res) => {
  res.status(200).send('CLERIVO API v1 - Status: OK');
});

// 🛡️ Middleware de gestion des erreurs (doit être APRÈS les routes)
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.message);
  console.error(err.stack);
  
  // Renvoyer TOUJOURS du JSON (pas du HTML)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 🛡️ Handler 404 pour routes inexistantes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.path}`
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`\n🚀 [CLERIVO] Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}`);
  console.log(`📤 Upload endpoint: POST /api/candidates/:id/documents\n`);
});
