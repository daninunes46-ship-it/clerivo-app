const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const emailRoutes = require('./routes/emails');
const aiRoutes = require('./routes/ai');
const candidateRoutes = require('./routes/candidates');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Écoute sur toutes les interfaces

app.use((req, res, next) => {
  console.log(`[Backend] ${req.method} ${req.url}`);
  next();
});

// 🌐 Configuration CORS permissive (pour tunnel Cloudflare + mobile)
const corsOptions = {
  origin: true, // Accepte toutes les origines en développement
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24h cache preflight
};

// Sécurité et Middleware de base
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Désactive CSP pour permettre le JavaScript Vite
}));
app.use(cors(corsOptions));
app.use(cookieParser()); // ⚠️ AVANT les routes pour lire req.cookies

// 🔐 Configuration des sessions (MemoryStore pour V1)
app.use(session({
  name: 'clerivo.sid', // Nom du cookie (évite les conflits)
  secret: process.env.SESSION_SECRET || 'clerivo-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Protection XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en prod
    sameSite: 'lax', // Protection CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pour multipart/form-data

// Routes API (avec logs pour debug)
console.log('📦 Mounting API routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted');
app.use('/api/emails', emailRoutes);
console.log('✅ Email routes mounted');
app.use('/api/ai', aiRoutes);
console.log('✅ AI routes mounted');
app.use('/api/candidates', candidateRoutes);
console.log('✅ Candidate routes mounted (including upload endpoint)');

// 📦 Servir le frontend (build Vite)
const frontendPath = path.join(__dirname, '../../frontend/dist');
console.log('📂 Serving frontend from:', frontendPath);
app.use(express.static(frontendPath));

// Route catch-all : servir index.html pour toutes les routes non-API (SPA routing)
app.get('*', (req, res, next) => {
  // Si c'est une route API, passer au middleware suivant
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Sinon, servir index.html (React Router gère le routing côté client)
  res.sendFile(path.join(frontendPath, 'index.html'));
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

// 🛡️ Handler 404 pour routes API inexistantes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route API non trouvée: ${req.method} ${req.path}`
  });
});

// Démarrage du serveur
app.listen(PORT, HOST, () => {
  console.log(`\n🚀 [CLERIVO] Server running on http://${HOST}:${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://192.168.1.250:${PORT}`);
  console.log(`📤 Upload endpoint: POST /api/candidates/:id/documents\n`);
});
