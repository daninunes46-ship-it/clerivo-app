import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import KanbanColumnLuxury from '../components/kanban/KanbanColumnLuxury';
import CandidateCardLuxury from '../components/kanban/CandidateCardLuxury';
import MoveToMenu from '../components/kanban/MoveToMenu';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════
// ERROR BOUNDARY (Local)
// ═══════════════════════════════════════════════════════════════
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Pipeline Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-4 border border-red-200">
          <h2 className="text-lg font-bold mb-2">Une erreur est survenue dans le Pipeline</h2>
          <pre className="text-xs bg-white p-4 rounded text-left overflow-auto max-w-lg mx-auto border border-red-100">
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * PipelinePageLuxury - "The Lost Version" Restored (Safe Mode)
 */
const PipelinePageContent = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const scrollContainerRef = useRef(null);

  // Configuration Colonnes "Premium" (Match Screenshot: FLUX ENTRANT, VISITES, ANALYSE, CLOSING)
  const COLUMNS = {
    flux: {
      id: 'flux',
      title: 'FLUX ENTRANT',
      statuses: ['NEW', 'TO_QUALIFY'],
      color: { 
        bgLight: 'bg-indigo-50',
        text: 'text-indigo-600', 
        cardBorder: 'border-l-indigo-500' 
      },
    },
    visites: {
      id: 'visites',
      title: 'VISITES',
      statuses: ['VISIT_SCHEDULED', 'VISIT_DONE'],
      color: { 
        bgLight: 'bg-purple-50',
        text: 'text-purple-600', 
        cardBorder: 'border-l-purple-500' 
      },
    },
    analyse: {
      id: 'analyse',
      title: 'ANALYSE',
      statuses: ['DOSSIER_INCOMPLETE', 'DOSSIER_PENDING'],
      color: { 
        bgLight: 'bg-orange-50',
        text: 'text-orange-600', 
        cardBorder: 'border-l-orange-500' 
      },
    },
    closing: {
      id: 'closing',
      title: 'CLOSING',
      statuses: ['DOSSIER_READY', 'TRANSMITTED', 'UNDER_REVIEW', 'RETAINED'],
      color: { 
        bgLight: 'bg-emerald-50',
        text: 'text-emerald-600', 
        cardBorder: 'border-l-emerald-500' 
      },
    }
  };

  const COLUMN_ORDER = ['flux', 'visites', 'analyse', 'closing'];

  // --- AUTO-SCROLL NATIF ---
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    try {
      const cleanup = autoScrollForElements({
        element: container,
        canScroll: ({ source }) => source.data.type === 'candidate-card',
        getConfiguration: () => ({
          maxScrollSpeed: 'fast' 
        })
      });
      return cleanup;
    } catch (e) {
      console.warn('AutoScroll init failed:', e);
    }
  }, []);

  // --- DATA FETCHING ---
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/candidates`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const result = await response.json();
      if (result.success && result.data) {
        setCandidates(result.data);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error('❌ Erreur fetch:', err);
      setError("Impossible de charger le pipeline");
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    const handleCandidateAdded = () => fetchCandidates();
    window.addEventListener('candidateAdded', handleCandidateAdded);
    return () => window.removeEventListener('candidateAdded', handleCandidateAdded);
  }, []);

  const getCandidatesByColumn = (columnId) => {
    const column = COLUMNS[columnId];
    if (!column) return [];
    return candidates.filter(candidate => {
      let status = 'NEW';
      if (candidate.applications && candidate.applications.length > 0) {
        const activeApp = candidate.applications.find(
          app => !['REJECTED', 'ARCHIVED', 'WITHDRAWN'].includes(app.status)
        );
        status = activeApp ? activeApp.status : candidate.applications[0].status;
      }
      return column.statuses.includes(status);
    });
  };

  // --- OPTIMISTIC DRAG & DROP ---
  const handleDrop = async ({ candidateId, oldStatus, newStatus }) => {
    console.log(`✨ Luxury Drag: ${candidateId} (${oldStatus} → ${newStatus})`);

    const oldCandidates = [...candidates];
    
    // Update local immédiat
    setCandidates(prevCandidates => {
      return prevCandidates.map(candidate => {
        if (candidate.id === candidateId) {
          const updatedApplications = candidate.applications.length > 0
            ? candidate.applications.map((app, idx) => (idx === 0 ? { ...app, status: newStatus } : app))
            : [{ status: newStatus }];
          return { ...candidate, applications: updatedApplications };
        }
        return candidate;
      });
    });

    // Feedback visuel "Success"
    toast.success('Statut mis à jour', {
      description: `Déplacé vers ${COLUMNS[Object.keys(COLUMNS).find(key => COLUMNS[key].statuses.includes(newStatus))]?.title}`,
      duration: 2000
    });

    // API Call
    try {
      const candidate = oldCandidates.find(c => c.id === candidateId);
      const applicationId = candidate?.applications?.[0]?.id;
      
      if (!applicationId) throw new Error('Aucune application trouvée');

      const response = await fetch(`${API_URL}/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Erreur API');

    } catch (error) {
      console.error('❌ Rollback:', error);
      setCandidates(oldCandidates); // Annuler si erreur
      toast.error('Erreur de mise à jour');
    }
  };

  // --- MENU MOBILE ---
  const handleOpenMenu = (candidate) => setSelectedCandidate(candidate);
  const handleCloseMenu = () => setSelectedCandidate(null);
  
  const handleMoveFromMenu = async (candidateId, newStatus) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;
    const oldStatus = candidate.applications?.[0]?.status || 'NEW';
    await handleDrop({ candidateId, oldStatus, newStatus });
    handleCloseMenu();
  };

  const handleDeleteFromMenu = async (candidateId) => {
    try {
      const response = await fetch(`${API_URL}/api/candidates/${candidateId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur suppression');
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast.success('Candidat supprimé');
    } catch (error) {
      toast.error('Impossible de supprimer');
    }
  };

  const handleViewDetailsFromMenu = (candidateId) => navigate(`/candidates/${candidateId}`);

  // Loading Screen "Luxury"
  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] w-full flex items-center justify-center bg-zinc-50/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm font-medium text-zinc-400 tracking-wide uppercase">Chargement du Pipeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] w-full font-sans bg-[#F7F8FA] relative overflow-hidden flex flex-col">
      
      {/* HEADER DE NAVIGATION (Match Screenshot) */}
      <div className="px-8 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-zinc-900">Pipeline</h2>
          <div className="flex bg-zinc-100 p-1 rounded-lg">
             <button className="px-3 py-1 bg-white shadow-sm rounded-md text-sm font-medium text-zinc-900 flex items-center gap-2">
               <span className="text-indigo-500">≡</span> Flux
             </button>
             <button className="px-3 py-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-2">
               <span className="text-zinc-400">88</span> Biens
             </button>
          </div>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          + Nouveau
        </button>
      </div>

      {/* Background Decor (Subtle Gradients) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent"></div>

      {/* --- SCROLL CONTAINER --- */}
      <div 
        ref={scrollContainerRef}
        className="
          flex-1 w-full 
          overflow-x-auto overflow-y-hidden
          scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent
          relative z-10
        "
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x'
        }}
      >
        <div className="flex gap-6 h-full min-w-max px-8 pb-8 pt-4">
          {COLUMN_ORDER.map((columnId) => {
            const column = COLUMNS[columnId];
            const columnCandidates = getCandidatesByColumn(columnId);

            return (
              <KanbanColumnLuxury
                key={column.id}
                columnId={columnId}
                title={column.title}
                count={columnCandidates.length}
                colorClass={column.color}
                candidates={columnCandidates}
                renderCard={(candidate, index) => (
                  <CandidateCardLuxury
                    key={candidate.id}
                    candidate={candidate}
                    index={index}
                    onOpenMenu={handleOpenMenu}
                    onDrop={handleDrop}
                  />
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Menu Mobile */}
      {selectedCandidate && (
        <MoveToMenu
          candidate={selectedCandidate}
          currentStatus={selectedCandidate.applications?.[0]?.status || 'NEW'}
          columns={Object.values(COLUMNS)}
          onMove={handleMoveFromMenu}
          onViewDetails={handleViewDetailsFromMenu}
          onDelete={handleDeleteFromMenu}
          onClose={handleCloseMenu}
        />
      )}
    </div>
  );
};

const PipelinePageLuxury = () => (
  <ErrorBoundary>
    <PipelinePageContent />
  </ErrorBoundary>
);

export default PipelinePageLuxury;
