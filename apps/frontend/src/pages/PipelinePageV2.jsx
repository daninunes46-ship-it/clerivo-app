import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import KanbanColumnV2 from '../components/kanban/KanbanColumnV2';
import CandidateCardV2 from '../components/kanban/CandidateCardV2';
import MoveToMenu from '../components/kanban/MoveToMenu';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * PipelinePage V3.0 - "Clean Luxury" Edition
 * - Mobile : Tabs + Liste Verticale (Fluidité Native)
 * - Desktop : Swimlanes par Bien (Property-Centric)
 * - Design : Premium sans lourdeur
 */
const PipelinePageV2 = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // 📱 ÉTAT MOBILE : Onglet actif
  const [activeTab, setActiveTab] = useState('nouveaux');

  // Configuration des colonnes
  const COLUMNS = {
    nouveaux: {
      id: 'nouveaux',
      title: 'Nouveaux',
      statuses: ['NEW', 'TO_QUALIFY'],
      color: { 
        bg: 'bg-indigo-500',
        text: 'text-indigo-600', 
        cardBorder: 'border-l-indigo-500',
        bgLight: 'bg-indigo-50'
      },
    },
    visites: {
      id: 'visites',
      title: 'Visites',
      statuses: ['VISIT_SCHEDULED', 'VISIT_DONE'],
      color: { 
        bg: 'bg-purple-500',
        text: 'text-purple-600', 
        cardBorder: 'border-l-purple-500',
        bgLight: 'bg-purple-50'
      },
    },
    enCours: {
      id: 'enCours',
      title: 'En cours',
      statuses: ['DOSSIER_INCOMPLETE', 'DOSSIER_PENDING'],
      color: { 
        bg: 'bg-amber-500',
        text: 'text-amber-600', 
        cardBorder: 'border-l-amber-500',
        bgLight: 'bg-amber-50'
      },
    },
    prets: {
      id: 'prets',
      title: 'Prêts',
      statuses: ['DOSSIER_READY'],
      color: { 
        bg: 'bg-emerald-500',
        text: 'text-emerald-600', 
        cardBorder: 'border-l-emerald-500',
        bgLight: 'bg-emerald-50'
      },
    },
    decision: {
      id: 'decision',
      title: 'Décision',
      statuses: ['TRANSMITTED', 'UNDER_REVIEW', 'RETAINED', 'REJECTED', 'ARCHIVED'],
      color: { 
        bg: 'bg-cyan-500',
        text: 'text-cyan-600', 
        cardBorder: 'border-l-cyan-500',
        bgLight: 'bg-cyan-50'
      },
    }
  };

  const COLUMN_ORDER = ['nouveaux', 'visites', 'enCours', 'prets', 'decision'];

  // Fetch candidats
  useEffect(() => {
    fetchCandidates();
    
    const handleCandidateAdded = () => {
      console.log('📢 Nouveau candidat, refresh');
      fetchCandidates();
    };
    
    window.addEventListener('candidateAdded', handleCandidateAdded);
    return () => window.removeEventListener('candidateAdded', handleCandidateAdded);
  }, []);

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

  // 🏠 Grouper candidats par Bien (pour Desktop Swimlanes)
  const groupCandidatesByProperty = () => {
    const grouped = {};
    
    candidates.forEach(candidate => {
      const app = candidate.applications?.[0] || {};
      const property = app.property || {};
      const propertyId = property.id || 'general';
      const propertyTitle = property.title || property.address || 'Recherche Générale';
      
      if (!grouped[propertyId]) {
        grouped[propertyId] = {
          id: propertyId,
          title: propertyTitle,
          candidates: []
        };
      }
      
      grouped[propertyId].candidates.push(candidate);
    });
    
    return Object.values(grouped);
  };

  // Drag & Drop Handler
  const handleDrop = async ({ candidateId, oldStatus, newStatus }) => {
    console.log(`🔄 Optimistic update: ${candidateId} (${oldStatus} → ${newStatus})`);

    const oldCandidates = [...candidates];
    
    setCandidates(prevCandidates => {
      return prevCandidates.map(candidate => {
        if (candidate.id === candidateId) {
          const updatedApplications = candidate.applications.length > 0
            ? candidate.applications.map((app, idx) => (idx === 0 ? { ...app, status: newStatus } : app))
            : [{ status: newStatus, candidateId, readinessStatus: 'INCOMPLETE', priority: 'MEDIUM', source: 'V3' }];
          return { ...candidate, applications: updatedApplications };
        }
        return candidate;
      });
    });

    toast.info(`Déplacement vers "${COLUMNS[Object.keys(COLUMNS).find(key => COLUMNS[key].statuses.includes(newStatus))]?.title}"`, {
      description: 'Mise à jour en cours...'
    });

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
      setCandidates(oldCandidates);
      toast.error('❌ Erreur', {
        description: 'Impossible de mettre à jour. Réessayez.'
      });
    }
  };

  // Menu Mobile Handlers
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

  // 📱 RENDU MOBILE : Tabs + Liste Verticale
  const renderMobileView = () => {
    const columnCandidates = getCandidatesByColumn(activeTab);
    const activeColumn = COLUMNS[activeTab];

    return (
      <div className="h-full flex flex-col">
        {/* Barre d'Onglets Sticky */}
        <div className="sticky top-0 z-20 bg-white border-b border-zinc-100 shadow-sm">
          <div className="flex overflow-x-auto scrollbar-none px-4 py-3 gap-2">
            {COLUMN_ORDER.map(columnId => {
              const column = COLUMNS[columnId];
              const count = getCandidatesByColumn(columnId).length;
              const isActive = activeTab === columnId;
              
              return (
                <button
                  key={columnId}
                  onClick={() => setActiveTab(columnId)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap
                    font-medium text-sm transition-all duration-200
                    ${isActive 
                      ? `${column.color.bgLight} ${column.color.text} shadow-sm` 
                      : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
                    }
                  `}
                >
                  {column.title}
                  <span className={`
                    px-1.5 py-0.5 rounded-full text-xs font-bold tabular-nums
                    ${isActive ? 'bg-white/50' : 'bg-zinc-200'}
                  `}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Liste Verticale des Candidats */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <KanbanColumnV2
            columnId={activeTab}
            title={activeColumn.title}
            count={columnCandidates.length}
            colorClass={activeColumn.color}
            candidates={columnCandidates}
            isMobileView={true}
            renderCard={(candidate, index) => (
              <CandidateCardV2
                key={candidate.id}
                candidate={candidate}
                index={index}
                statusColor={activeColumn.color.cardBorder}
                onOpenMenu={handleOpenMenu}
                onDrop={handleDrop}
                isMobileView={true}
              />
            )}
          />
        </div>
      </div>
    );
  };

  // 🖥️ RENDU DESKTOP : Vue par colonne (classique pour V3.0)
  const renderDesktopView = () => {
    return (
      <div className="h-full overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max px-4 pb-4">
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
    );
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
    <div className="h-[calc(100vh-140px)] w-full font-sans bg-zinc-50/30 relative">
      {/* Mobile : Tabs + Liste */}
      <div className="md:hidden h-full">
        {renderMobileView()}
      </div>

      {/* Desktop : Colonnes classiques */}
      <div className="hidden md:block h-full">
        {renderDesktopView()}
      </div>

      {/* Menu Mobile Contextuel */}
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
