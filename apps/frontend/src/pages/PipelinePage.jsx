import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import KanbanColumn from '../components/kanban/KanbanColumn';
import CandidateCard from '../components/kanban/CandidateCard';

// 🌐 URL relative pour fonctionner avec le proxy Vite (mobile ready)
const API_URL = '';

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

  // Données de démonstration (Fallback si DB vide)
  const DEMO_DATA = [
    {
      id: 'demo-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '+41 79 123 45 67',
      monthlyIncome: 8500,
      createdAt: new Date().toISOString(),
      applications: [{
        status: 'DOSSIER_READY', // Colonne Prêts
        property: { city: 'Lausanne', rooms: 3.5 }
      }],
      latestSolvencyProfile: {
        solvencyScore: 95,
        solvencyRating: 'EXCELLENT',
        pursuitsStatus: 'CLEAN'
      }
    },
    {
      id: 'demo-2',
      firstName: 'Pierre',
      lastName: 'Morel',
      email: 'pierre.morel@example.com',
      monthlyIncome: 4200,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      applications: [{
        status: 'VISIT_SCHEDULED', // Colonne Visites
        property: { city: 'Gland', rooms: 2.5 }
      }],
      latestSolvencyProfile: {
        solvencyScore: 25,
        solvencyRating: 'RISKY',
        pursuitsStatus: 'MAJOR_ISSUES'
      }
    }
  ];

  // Fetch candidats depuis le backend
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/candidates`);
      
      // Mode dégradé si API down ou DB vide
      if (!response.ok) {
        console.warn('API non disponible, chargement des données de démo');
        setCandidates(DEMO_DATA);
        return;
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setCandidates(result.data);
        console.log(`✅ ${result.data.length} candidats chargés`);
      } else {
        // Si aucune donnée en DB, charger la démo pour l'UX
        console.log('Aucun candidat en DB, chargement démo');
        setCandidates(DEMO_DATA);
      }
    } catch (err) {
      console.error('❌ Erreur fetch candidats:', err);
      // Fallback sur données démo en cas d'erreur réseau
      setCandidates(DEMO_DATA);
      toast.info("Mode Démo activé (API inaccessible)");
    } finally {
      setLoading(false);
    }
  };

  // Grouper les candidats par colonne selon leur status
  const getCandidatesByColumn = (columnId) => {
    const column = COLUMNS[columnId];
    if (!column) return [];

    return candidates.filter(candidate => {
      // Prendre la dernière application active
      const latestApp = candidate.applications?.find(
        app => !['REJECTED', 'ARCHIVED', 'WITHDRAWN'].includes(app.status)
      ) || candidate.applications?.[0]; // Fallback pour données démo simples
      
      if (!latestApp) return false;
      
      return column.statuses.includes(latestApp.status);
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
