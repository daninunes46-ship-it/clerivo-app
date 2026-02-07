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
    <div className="h-[calc(100vh-140px)] w-full font-sans">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Container responsive : Grid sur Desktop, Scroll Snap sur Mobile */}
        <div className="flex md:grid md:grid-cols-5 gap-4 h-full overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 px-4 md:px-0 scroll-pl-4">
          
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
      </DragDropContext>
    </div>
  );
};

export default PipelinePage;
