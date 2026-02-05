import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import InboxPage from './pages/InboxPage';
import PipelinePage from './pages/PipelinePage';
import ContactsPage from './pages/ContactsPage';

import CandidateDetailPage from './pages/CandidateDetailPage';

function App() {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/candidates/')) return { title: 'Fiche Candidat', subtitle: 'Détails, documents et solvabilité.' };

    switch (pathname) {
      case '/': return { title: 'Dashboard', subtitle: "Vue d'ensemble de votre activité immobilière." };
      case '/inbox': return { title: 'Inbox', subtitle: 'Vos messages et notifications.' };
      case '/pipeline': return { title: 'Pipeline', subtitle: 'Suivi de vos opportunités.' };
      case '/contacts': return { title: 'Contacts', subtitle: 'Gestion de votre réseau.' };
      default: return { title: 'Clerivo', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
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
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/candidates/:id" element={<CandidateDetailPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
      </Routes>
      <Toaster richColors position="top-right" closeButton />
    </Layout>
  )
}

export default App
