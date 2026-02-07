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
  console.log(`[Backend] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'no-origin'}`);
  next();
});

// 🌐 Configuration CORS STRICTE pour Production
const allowedOrigins = [
  'https://clerivo.ch',                    // Frontend Vercel (domaine principal)
  'https://www.clerivo.ch',                // Frontend Vercel avec www (CRITIQUE !)
  'https://app.clerivo.ch',                // Application via tunnel Cloudflare
  'https://clerivo-frontend.vercel.app',   // URL native Vercel (backup)
  'http://localhost:5173',                 // Dev local Vite
  'http://localhost:3010',                 // Dev local Backend
  'http://192.168.1.212:3010',            // Réseau local (votre Pi)
  'http://192.168.1.107:3010'             // Réseau local WiFi
];

const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqué pour origin: ${origin}`);
      callback(new Error(`Origin ${origin} non autorisée par CORS`));
    }
  },
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

// 🛡️ Handler 404 pour routes API inexistantes (AVANT le catch-all frontend)
app.use('/api/*', (req, res) => {
  console.error(`❌ Route API non trouvée: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route API non trouvée: ${req.method} ${req.path}`
  });
});

// 🛡️ Middleware de gestion des erreurs API (AVANT le catch-all frontend)
app.use((err, req, res, next) => {
  // Si c'est une route API, renvoyer JSON
  if (req.path.startsWith('/api/')) {
    console.error('❌ Erreur API:', err.message);
    console.error(err.stack);
    
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Erreur serveur interne',
      error: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }
  
  // Sinon, passer au middleware suivant (frontend)
  next(err);
});

// 📦 Servir le frontend (build Vite) - APRÈS les routes API
const frontendPath = path.join(__dirname, '../../frontend/dist');
console.log('📂 Serving frontend from:', frontendPath);
app.use(express.static(frontendPath));

// Route catch-all : servir index.html pour le SPA (DOIT être en dernier)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, HOST, () => {
  console.log(`\n🚀 [CLERIVO] Server running on http://${HOST}:${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Cloudflare Tunnel: https://app.clerivo.ch`);
  console.log(`📍 Frontend: https://clerivo.ch`);
  console.log(`📤 Upload endpoint: POST /api/candidates/:id/documents\n`);
});
