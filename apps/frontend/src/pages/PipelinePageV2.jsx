import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import KanbanColumnV2 from '../components/kanban/KanbanColumnV2';
import CandidateCardV2 from '../components/kanban/CandidateCardV2';
import MoveToMenu from '../components/kanban/MoveToMenu';

// 🌐 URL API
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * PipelinePage V2 - Architecture Native-Driven (60fps)
 * 
 * Stack:
 * - Pragmatic Drag and Drop (Atlassian) → 0 charge Thread Principal
 * - React-Virtuoso → Virtualisation listes longues
 * - Long Press Protocol (200ms) → Distinction Scroll vs Drag
 * - Haptic Feedback iOS 18+ → Confirmation tactile
 * 
 * Supprimé:
 * - @hello-pangea/dnd (blocages Thread Principal)
 * - Physique custom (remplacé par auto-scroll natif PDND)
 */
const PipelinePageV2 = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const scrollContainerRef = useRef(null);

  // Configuration colonnes (inchangé)
  const COLUMNS = {
    nouveaux: {
      id: 'nouveaux',
      title: 'Nouveaux',
      statuses: ['NEW', 'TO_QUALIFY'],
      color: { 
        bg: 'bg-indigo-500',
        text: 'text-white', 
        cardBorder: 'border-l-indigo-500' 
      },
    },
    visites: {
      id: 'visites',
      title: 'Visites',
      statuses: ['VISIT_SCHEDULED', 'VISIT_DONE'],
      color: { 
        bg: 'bg-purple-500',
        text: 'text-white', 
        cardBorder: 'border-l-purple-500' 
      },
    },
    enCours: {
      id: 'enCours',
      title: 'En cours',
      statuses: ['DOSSIER_INCOMPLETE', 'DOSSIER_PENDING'],
      color: { 
        bg: 'bg-amber-500',
        text: 'text-white', 
        cardBorder: 'border-l-amber-500' 
      },
    },
    prets: {
      id: 'prets',
      title: 'Prêts',
      statuses: ['DOSSIER_READY'],
      color: { 
        bg: 'bg-emerald-500',
        text: 'text-white', 
        cardBorder: 'border-l-emerald-500' 
      },
    },
    decision: {
      id: 'decision',
      title: 'Décision',
      statuses: ['TRANSMITTED', 'UNDER_REVIEW', 'RETAINED', 'REJECTED', 'ARCHIVED'],
      color: { 
        bg: 'bg-cyan-500',
        text: 'text-white', 
        cardBorder: 'border-l-cyan-500' 
      },
    }
  };

  const COLUMN_ORDER = ['nouveaux', 'visites', 'enCours', 'prets', 'decision'];

  // ═══════════════════════════════════════════════════════════════
  // AUTO-SCROLL GLOBAL (PDND Native)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cleanup = autoScrollForElements({
      element: container,
      canScroll: ({ source }) => source.data.type === 'candidate-card',
      getConfiguration: () => ({
        maxScrollSpeed: 'fast'
      })
    });

    return cleanup;
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // FETCH CANDIDATES (inchangé)
  // ═══════════════════════════════════════════════════════════════
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/candidates`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setCandidates(result.data);
        console.log(`✅ ${result.data.length} candidats chargés`);
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
    
    const handleCandidateAdded = () => {
      console.log('📢 Nouveau candidat, refresh');
      fetchCandidates();
    };
    
    window.addEventListener('candidateAdded', handleCandidateAdded);
    return () => window.removeEventListener('candidateAdded', handleCandidateAdded);
  }, []);

  // Grouper candidats par colonne
  const getCandidatesByColumn = (columnId) => {
    const column = COLUMNS[columnId];
    if (!column) return [];

    return candidates.filter(candidate => {
      let status = 'NEW';

      if (candidate.applications && candidate.applications.length > 0) {
        const activeApp = candidate.applications.find(
          app => !['REJECTED', 'ARCHIVED', 'WITHDRAWN'].includes(app.status)
        );
        
        if (activeApp) {
          status = activeApp.status;
        } else {
          status = candidate.applications[0].status;
        }
      }
      
      return column.statuses.includes(status);
    });
  };

  // ═══════════════════════════════════════════════════════════════
  // OPTIMISTIC UPDATE (UI Immédiate)
  // ═══════════════════════════════════════════════════════════════
  const handleDrop = async ({ candidateId, oldStatus, newStatus }) => {
    console.log(`🔄 Optimistic update: ${candidateId} (${oldStatus} → ${newStatus})`);

    // OPTIMISTIC: Update local immédiat
    const oldCandidates = [...candidates];
    
    setCandidates(prevCandidates => {
      return prevCandidates.map(candidate => {
        if (candidate.id === candidateId) {
          const updatedApplications = candidate.applications.length > 0
            ? candidate.applications.map((app, idx) => (idx === 0 ? { ...app, status: newStatus } : app))
            : [{ status: newStatus, candidateId, readinessStatus: 'INCOMPLETE', priority: 'MEDIUM', source: 'PDND' }];
          return { ...candidate, applications: updatedApplications };
        }
        return candidate;
      });
    });

    toast.info(`Déplacement vers "${COLUMNS[Object.keys(COLUMNS).find(key => COLUMNS[key].statuses.includes(newStatus))]?.title}"`, {
      description: 'Mise à jour en cours...'
    });

    // API CALL (Fire and Forget)
    try {
      const candidate = oldCandidates.find(c => c.id === candidateId);
      const applicationId = candidate?.applications?.[0]?.id;
      
      if (!applicationId) {
        throw new Error('Aucune application trouvée');
      }

      const response = await fetch(`${API_URL}/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('✅ Candidat déplacé !');
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur API:', error);
      
      // ROLLBACK
      setCandidates(oldCandidates);
      
      toast.error('❌ Erreur', {
        description: 'Impossible de mettre à jour. Réessayez.'
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // MENU MOBILE (Fallback)
  // ═══════════════════════════════════════════════════════════════
  const handleOpenMenu = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleCloseMenu = () => {
    setSelectedCandidate(null);
  };

  const handleMoveFromMenu = async (candidateId, newStatus) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const oldStatus = candidate.applications?.[0]?.status || 'NEW';
    
    await handleDrop({ candidateId, oldStatus, newStatus });
    handleCloseMenu();
  };

  const handleDeleteFromMenu = async (candidateId) => {
    try {
      const response = await fetch(`${API_URL}/api/candidates/${candidateId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur suppression');
      }

      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast.success('✅ Candidat supprimé');
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      toast.error('Impossible de supprimer');
      throw error;
    }
  };

  const handleViewDetailsFromMenu = (candidateId) => {
    navigate(`/candidates/${candidateId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Chargement du pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] w-full font-sans relative">
      {/* Container avec scroll horizontal (Native iOS rubber-banding) */}
      <div 
        ref={scrollContainerRef}
        className="
          h-full w-full 
          overflow-x-auto overflow-y-hidden
          scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent
          relative
        "
        style={{
          // CRITIQUE: Scroll natif, pas bloqué
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x' // Autoriser scroll horizontal natif
        }}
      >
        {/* Wrapper colonnes */}
        <div className="
          flex 
          gap-4 
          h-full 
          min-w-max 
          px-4 pb-4
          
          xl:grid xl:grid-cols-5 xl:min-w-0 xl:px-0
        ">
          {COLUMN_ORDER.map((columnId) => {
            const column = COLUMNS[columnId];
            const columnCandidates = getCandidatesByColumn(columnId);

            return (
              <KanbanColumnV2
                key={column.id}
                columnId={columnId}
                title={column.title}
                count={columnCandidates.length}
                colorClass={column.color}
                candidates={columnCandidates}
                renderCard={(candidate, index) => (
                  <CandidateCardV2
                    key={candidate.id}
                    candidate={candidate}
                    index={index}
                    statusColor={column.color.cardBorder}
                    onOpenMenu={handleOpenMenu}
                    onDrop={handleDrop}
                  />
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Menu Mobile (Bottom Sheet) */}
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

export default PipelinePageV2;
