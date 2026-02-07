import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import KanbanColumn from '../components/kanban/KanbanColumn';
import CandidateCard from '../components/kanban/CandidateCard';

// 🌐 URL API : Utilise la variable d'environnement ou proxy Vite
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * PipelinePage - Vue Kanban Pipeline Locatif Suisse
 * Design: "Apple-like" (Zero Learning Curve)
 * Data: API / Candidates
 */
const PipelinePage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = React.useRef(null);

  // Configuration des colonnes selon le workflow suisse (CDC 6.2)
  const COLUMNS = {
    nouveaux: {
      id: 'nouveaux',
      title: 'Nouveaux',
      statuses: ['NEW', 'TO_QUALIFY'],
      color: { 
        border: 'border-indigo-500', 
        text: 'text-indigo-600', 
        cardBorder: 'border-l-indigo-500' 
      },
    },
    visites: {
      id: 'visites',
      title: 'Visites',
      statuses: ['VISIT_SCHEDULED', 'VISIT_DONE'],
      color: { 
        border: 'border-blue-500', 
        text: 'text-blue-600', 
        cardBorder: 'border-l-blue-500' 
      },
    },
    enCours: {
      id: 'enCours',
      title: 'En Cours',
      statuses: ['DOSSIER_INCOMPLETE', 'DOSSIER_PENDING'],
      color: { 
        border: 'border-amber-500', 
        text: 'text-amber-600', 
        cardBorder: 'border-l-amber-500' 
      },
    },
    prets: {
      id: 'prets',
      title: 'Prêts',
      statuses: ['DOSSIER_READY'],
      color: { 
        border: 'border-purple-500', 
        text: 'text-purple-600', 
        cardBorder: 'border-l-purple-500' 
      },
    },
    decision: {
      id: 'decision',
      title: 'Décision',
      statuses: ['TRANSMITTED', 'UNDER_REVIEW', 'RETAINED'],
      color: { 
        border: 'border-emerald-500', 
        text: 'text-emerald-600', 
        cardBorder: 'border-l-emerald-500' 
      },
    },
  };

  const COLUMN_ORDER = ['nouveaux', 'visites', 'enCours', 'prets', 'decision'];

  // Fetch candidats depuis le backend
  useEffect(() => {
    fetchCandidates();
    
    // Event listener : Rafraîchir automatiquement quand un candidat est ajouté depuis l'Inbox
    const handleCandidateAdded = () => {
      console.log('📢 Événement détecté : Nouveau candidat ajouté, rafraîchissement du pipeline...');
      fetchCandidates();
    };
    
    window.addEventListener('candidateAdded', handleCandidateAdded);
    
    return () => {
      window.removeEventListener('candidateAdded', handleCandidateAdded);
    };
  }, []);

  // Gérer l'affichage des ombres latérales selon le scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      // Calculer l'opacité des ombres (0 ou 1)
      const leftOpacity = scrollLeft > 10 ? 1 : 0;
      const rightOpacity = scrollLeft + clientWidth >= scrollWidth - 10 ? 0 : 1;
      
      // Appliquer via CSS variables
      container.style.setProperty('--shadow-left-opacity', leftOpacity);
      container.style.setProperty('--shadow-right-opacity', rightOpacity);
    };

    container.addEventListener('scroll', handleScroll);
    // Vérifier au chargement
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [loading]);

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
        console.log(`✅ ${result.data.length} candidats chargés depuis l'API`);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error('❌ Erreur fetch candidats:', err);
      setError("Impossible de charger le pipeline. Vérifiez que le backend tourne.");
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Grouper les candidats par colonne selon leur status
  const getCandidatesByColumn = (columnId) => {
    const column = COLUMNS[columnId];
    if (!column) return [];

    return candidates.filter(candidate => {
      // Logique robuste : Si le candidat a des applications, on prend le statut de la plus récente.
      // Sinon (cas "Sophie Martinez" ajoutée via CRM sans application encore créée), on par défaut à 'NEW'.
      let status = 'NEW';

      if (candidate.applications && candidate.applications.length > 0) {
          // Chercher une application active (non rejetée/archivée)
          const activeApp = candidate.applications.find(
            app => !['REJECTED', 'ARCHIVED', 'WITHDRAWN'].includes(app.status)
          );
          
          // Si on trouve une active, on prend son statut. Sinon on prend la toute dernière (même si fermée/refusée pour historique)
          if (activeApp) {
              status = activeApp.status;
          } else {
             status = candidate.applications[0].status;
          }
      }
      
      return column.statuses.includes(status);
    });
  };

  // Gestion du Drag & Drop
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Pas de destination ou drop au même endroit
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destColumn = COLUMNS[destination.droppableId];
    
    // Optimistic update pour l'UX
    const candidateToMove = candidates.find(c => String(c.id) === draggableId);
    if (!candidateToMove) return;

    // Dans une vraie implémentation : 
    // 1. Mettre à jour l'état local immédiatement
    // 2. Envoyer la requête API
    // 3. Revert si erreur
    
    toast.info(`Déplacement vers "${destColumn.title}"`, {
      description: 'Mise à jour du statut en cours...'
    });

    // TODO: Appel API réel pour update status
  };

  // État de chargement
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
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Container avec scroll horizontal fluide et ombres latérales */}
        <div 
          ref={scrollContainerRef}
          className="
            h-full w-full 
            overflow-x-auto overflow-y-hidden
            scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent
            relative
            group
          "
        >
          {/* Ombre gauche (indique contenu scrollé) */}
          <div className="
            absolute left-0 top-0 h-full w-12 
            bg-gradient-to-r from-white via-white/50 to-transparent 
            pointer-events-none 
            opacity-0 
            transition-opacity duration-300
            z-10
          " style={{ opacity: 'var(--shadow-left-opacity, 0)' }} />
          
          {/* Ombre droite (indique contenu masqué) */}
          <div className="
            absolute right-0 top-0 h-full w-12 
            bg-gradient-to-l from-white via-white/50 to-transparent 
            pointer-events-none 
            opacity-100
            transition-opacity duration-300
            z-10
          " style={{ opacity: 'var(--shadow-right-opacity, 1)' }} />
          
          {/* Wrapper colonnes : Flex sur mobile/tablet, Grid sur desktop large */}
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
              <KanbanColumn 
                key={column.id} 
                columnId={column.id}
                title={column.title} 
                count={columnCandidates.length} 
                colorClass={column.color}
              >
                {columnCandidates.map((candidate, index) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    index={index}
                    statusColor={column.color.cardBorder}
                  />
                ))}
              </KanbanColumn>
            );
          })}
          
        </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default PipelinePage;
