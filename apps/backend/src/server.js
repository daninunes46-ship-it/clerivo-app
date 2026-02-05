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

// Routes API
app.use('/api/emails', emailRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/candidates', candidateRoutes);

// Route de base (Health Check)
app.get('/', (req, res) => {
  res.status(200).send('CLERIVO API v1 - Status: OK');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`[CLERIVO] Server running on port ${PORT}`);
});
