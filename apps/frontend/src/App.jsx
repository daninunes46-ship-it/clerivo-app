import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import InboxPage from './pages/InboxPage';
import PipelinePage from './pages/PipelinePage';
import ContactsPage from './pages/ContactsPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import LoginPage from './pages/LoginPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const location = useLocation();
  const { user, loading } = useAuth();

  console.log('🟡 [APP CONTENT] RENDER - pathname:', location.pathname, '| loading:', loading, '| user:', user?.email || 'NULL');

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/candidates/')) return { title: 'Fiche Candidat', subtitle: 'Détails, documents et solvabilité.' };

    switch (pathname) {
      case '/': return { title: 'Dashboard', subtitle: "Vue d'ensemble de votre activité immobilière." };
      case '/dashboard': return { title: 'Dashboard', subtitle: "Vue d'ensemble de votre activité immobilière." };
      case '/inbox': return { title: 'Inbox', subtitle: 'Vos messages et notifications.' };
      case '/pipeline': return { title: 'Pipeline', subtitle: 'Suivi de vos opportunités.' };
      case '/contacts': return { title: 'Contacts', subtitle: 'Gestion de votre réseau.' };
      case '/login': return { title: 'Connexion', subtitle: '' };
      default: return { title: 'Clerivo', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);
  const isLoginPage = location.pathname === '/login';

  // ÉTAPE 1 : BLOQUE TOUT pendant le chargement
  if (loading) {
    console.log('🟡 [APP CONTENT] État = LOADING - Affichage du spinner');
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  // ÉTAPE 2 : Si pas connecté ET pas sur /login -> REDIRECTION IMMÉDIATE
  if (!user && !isLoginPage) {
    console.log('🔴 [APP CONTENT] PAS DE USER + PAS SUR /login -> REDIRECTION VERS /login');
    return <Navigate to="/login" replace />;
  }

  // ÉTAPE 3 : Si connecté ET sur /login -> REDIRECTION vers dashboard
  if (user && isLoginPage) {
    console.log('🟢 [APP CONTENT] USER TROUVÉ + SUR /login -> REDIRECTION VERS /');
    return <Navigate to="/" replace />;
  }

  // ÉTAPE 4 : Rendu de la page (login ou contenu protégé)
  console.log('🟡 [APP CONTENT] Rendu de la page:', isLoginPage ? 'LOGIN' : 'DASHBOARD/AUTRE');
  return (
    <>
      {isLoginPage ? (
        <>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
          <Toaster richColors position="top-right" closeButton />
        </>
      ) : (
        <Layout>
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-zinc-500 text-sm">
                {subtitle}
              </p>
            )}
          </header>
          
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/candidates/:id" element={<CandidateDetailPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" closeButton />
        </Layout>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
