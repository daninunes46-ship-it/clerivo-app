import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import InboxPage from './pages/InboxPage';
import PipelinePage from './pages/PipelinePage';
import ContactsPage from './pages/ContactsPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import LoginPage from './pages/LoginPage';

function App() {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/candidates/')) return { title: 'Fiche Candidat', subtitle: 'Détails, documents et solvabilité.' };

    switch (pathname) {
      case '/': return { title: 'Dashboard', subtitle: "Vue d'ensemble de votre activité immobilière." };
      case '/inbox': return { title: 'Inbox', subtitle: 'Vos messages et notifications.' };
      case '/pipeline': return { title: 'Pipeline', subtitle: 'Suivi de vos opportunités.' };
      case '/contacts': return { title: 'Contacts', subtitle: 'Gestion de votre réseau.' };
      case '/login': return { title: 'Connexion', subtitle: '' };
      default: return { title: 'Clerivo', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  // Page de login sans Layout
  const isLoginPage = location.pathname === '/login';

  return (
    <AuthProvider>
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
            {/* Routes protégées */}
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/inbox" element={<PrivateRoute><InboxPage /></PrivateRoute>} />
            <Route path="/pipeline" element={<PrivateRoute><PipelinePage /></PrivateRoute>} />
            <Route path="/candidates/:id" element={<PrivateRoute><CandidateDetailPage /></PrivateRoute>} />
            <Route path="/contacts" element={<PrivateRoute><ContactsPage /></PrivateRoute>} />
          </Routes>
          <Toaster richColors position="top-right" closeButton />
        </Layout>
      )}
    </AuthProvider>
  )
}

export default App
