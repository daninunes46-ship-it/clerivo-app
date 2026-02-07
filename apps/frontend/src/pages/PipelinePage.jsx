import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import KanbanColumn from '../components/kanban/KanbanColumn';
import CandidateCard from '../components/kanban/CandidateCard';
import MoveToMenu from '../components/kanban/MoveToMenu';

// 🌐 URL API : Utilise la variable d'environnement ou proxy Vite
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * PipelinePage - Vue Kanban Pipeline Locatif Suisse
 * Design: "Apple-like" (Zero Learning Curve)
 * Data: API / Candidates
 * 
 * V1.1: Ajout menu mobile contextuel pour déplacer candidats sans drag
 */
const PipelinePage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null); // Pour le menu mobile
  const scrollContainerRef = React.useRef(null);
  const autoScrollIntervalRef = React.useRef(null);

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

  // ═══════════════════════════════════════════════════════════════
  // AUTO-SCROLL INTELLIGENT pendant Drag (@hello-pangea/dnd hooks)
  // V1.1: Support SOURIS + TACTILE (Mobile)
  // ═══════════════════════════════════════════════════════════════
  const onDragStart = (start) => {
    console.log('🎬 Drag démarré:', start.draggableId);
    
    // ───────────────────────────────────────────────────────────
    // TRACKING POSITION : Souris (Desktop) + Touch (Mobile)
    // ───────────────────────────────────────────────────────────
    
    const trackMouse = (e) => {
      window.dragMouseX = e.clientX;
    };
    
    const trackTouch = (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        window.dragMouseX = touch.clientX; // Utilise la même variable pour uniformité
        
        // Empêcher le scroll natif pendant le drag (optionnel, peut créer des conflits)
        // e.preventDefault(); // DÉSACTIVÉ pour éviter de bloquer le scroll manuel
      }
    };
    
    // Écouter les deux types d'événements
    document.addEventListener('mousemove', trackMouse, { passive: true });
    document.addEventListener('touchmove', trackTouch, { passive: true }); // V1.1: NOUVEAU
    
    // ───────────────────────────────────────────────────────────
    // AUTO-SCROLL INTELLIGENT (même logique Souris + Touch)
    // ───────────────────────────────────────────────────────────
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const performAutoScroll = () => {
      const mouseX = window.dragMouseX;
      if (!mouseX) return;
      
      const rect = container.getBoundingClientRect();
      const EDGE_ZONE = 150; // Zone de déclenchement (150px des bords)
      const MAX_SPEED = 20;   // Vitesse max de scroll
      
      let scrollAmount = 0;
      
      // DROITE : Si curseur/doigt proche du bord droit
      if (mouseX > rect.right - EDGE_ZONE && mouseX < rect.right) {
        const proximity = (mouseX - (rect.right - EDGE_ZONE)) / EDGE_ZONE;
        scrollAmount = MAX_SPEED * proximity;
        console.log(`→ Auto-scroll DROITE (${scrollAmount.toFixed(1)}px)`);
      }
      
      // GAUCHE : Si curseur/doigt proche du bord gauche
      else if (mouseX < rect.left + EDGE_ZONE && mouseX > rect.left) {
        const proximity = ((rect.left + EDGE_ZONE) - mouseX) / EDGE_ZONE;
        scrollAmount = -MAX_SPEED * proximity;
        console.log(`← Auto-scroll GAUCHE (${scrollAmount.toFixed(1)}px)`);
      }
      
      if (scrollAmount !== 0) {
        container.scrollLeft += scrollAmount;
      }
    };
    
    // Démarrer l'interval d'auto-scroll (60fps)
    autoScrollIntervalRef.current = setInterval(performAutoScroll, 16);
    
    // ───────────────────────────────────────────────────────────
    // CLEANUP FUNCTION (Nettoie Souris + Touch)
    // ───────────────────────────────────────────────────────────
    
    window.cleanupDragTracking = () => {
      document.removeEventListener('mousemove', trackMouse);
      document.removeEventListener('touchmove', trackTouch); // V1.1: NOUVEAU
      
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      
      delete window.dragMouseX;
      console.log('🧹 Cleanup drag tracking (souris + tactile)');
    };
  };

  const onDragUpdate = (update) => {
    // Hook appelé à chaque mouvement, utile pour debug
    // L'auto-scroll est géré par l'interval dans onDragStart
  };

  // ═══════════════════════════════════════════════════════════════
  // Gestion du Drag & Drop (UPDATE STATUT API)
  // ═══════════════════════════════════════════════════════════════
  const onDragEnd = async (result) => {
    // Cleanup du tracking souris et auto-scroll
    if (window.cleanupDragTracking) {
      window.cleanupDragTracking();
      delete window.cleanupDragTracking;
    }

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
    const candidateToMove = candidates.find(c => String(c.id) === draggableId);
    
    if (!candidateToMove) {
      console.error('❌ Candidat introuvable:', draggableId);
      return;
    }

    // Déterminer le nouveau statut (prendre le premier du tableau)
    const newStatus = destColumn.statuses[0];
    
    console.log(`🔄 Déplacement: ${candidateToMove.firstName} ${candidateToMove.lastName}`);
    console.log(`   De: ${source.droppableId} → Vers: ${destination.droppableId}`);
    console.log(`   Nouveau statut: ${newStatus}`);

    // ─────────────────────────────────────────────────────────────
    // OPTIMISTIC UPDATE (Update local immédiat pour UX fluide)
    // ─────────────────────────────────────────────────────────────
    const oldCandidates = [...candidates];
    
    setCandidates(prevCandidates => {
      return prevCandidates.map(candidate => {
        if (String(candidate.id) === draggableId) {
          // Mettre à jour le statut de l'application
          const updatedApplications = candidate.applications.map((app, idx) => {
            if (idx === 0) { // Update la première application
              return { ...app, status: newStatus };
            }
            return app;
          });
          
          return { 
            ...candidate, 
            applications: updatedApplications.length > 0 
              ? updatedApplications 
              : [{ status: newStatus }] // Créer une app si inexistante
          };
        }
        return candidate;
      });
    });

    // Toast de feedback immédiat
    toast.info(`Déplacement vers "${destColumn.title}"`, {
      description: 'Mise à jour du statut en cours...',
      duration: 2000
    });

    // ─────────────────────────────────────────────────────────────
    // APPEL API pour persister le changement
    // ─────────────────────────────────────────────────────────────
    try {
      // Récupérer l'ID de l'application
      const applicationId = candidateToMove.applications?.[0]?.id;
      
      if (!applicationId) {
        throw new Error('Aucune application trouvée pour ce candidat');
      }

      const response = await fetch(`${API_URL}/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Statut mis à jour sur le serveur');
        toast.success('✅ Statut mis à jour', {
          description: `${candidateToMove.firstName} ${candidateToMove.lastName} → ${destColumn.title}`,
          duration: 2000
        });
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }

    } catch (error) {
      console.error('❌ Erreur update statut:', error);
      
      // REVERT : Restaurer l'état précédent
      setCandidates(oldCandidates);
      
      toast.error('❌ Erreur de déplacement', {
        description: 'Le statut n\'a pas pu être mis à jour. Réessayez.',
        duration: 3000
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // MENU MOBILE : Déplacer/Supprimer candidat (Alternative au D&D)
  // ═══════════════════════════════════════════════════════════════
  
  const handleOpenMenu = (candidate) => {
    console.log('📱 Menu ouvert pour:', candidate.firstName, candidate.lastName);
    setSelectedCandidate(candidate);
  };

  const handleCloseMenu = () => {
    setSelectedCandidate(null);
  };

  const handleMoveFromMenu = async (candidateId, newStatus) => {
    console.log('📱 Déplacement via menu:', candidateId, '->', newStatus);
    
    const candidateToMove = candidates.find(c => c.id === candidateId);
    if (!candidateToMove) {
      toast.error('Candidat introuvable');
      return;
    }

    // OPTIMISTIC UPDATE
    const oldCandidates = [...candidates];
    setCandidates(prevCandidates => {
      return prevCandidates.map(candidate => {
        if (candidate.id === candidateId) {
          const updatedApplications = candidate.applications.length > 0
            ? candidate.applications.map((app, idx) => (idx === 0 ? { ...app, status: newStatus } : app))
            : [{ status: newStatus, candidateId, readinessStatus: 'INCOMPLETE', priority: 'MEDIUM', source: 'MOBILE_MENU' }];
          return { ...candidate, applications: updatedApplications };
        }
        return candidate;
      });
    });

    toast.info(`Déplacement vers "${COLUMNS[Object.keys(COLUMNS).find(key => COLUMNS[key].statuses.includes(newStatus))]?.title}"`, {
      description: 'Mise à jour du statut en cours...'
    });

    // API CALL
    try {
      const applicationId = candidateToMove.applications?.[0]?.id;
      if (!applicationId) {
        throw new Error('Aucune application trouvée pour ce candidat');
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
        toast.success('✅ Candidat déplacé !', {
          description: `Maintenant dans la colonne "${COLUMNS[Object.keys(COLUMNS).find(key => COLUMNS[key].statuses.includes(newStatus))]?.title}"`
        });
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur update statut (menu):', error);
      
      // REVERT
      setCandidates(oldCandidates);
      
      toast.error('❌ Erreur de déplacement', {
        description: 'Le statut n\'a pas pu être mis à jour. Réessayez.'
      });
      throw error; // Pour que MoveToMenu puisse gérer l'erreur
    }
  };

  const handleDeleteFromMenu = async (candidateId) => {
    console.log('🗑️ Suppression via menu:', candidateId);

    try {
      const response = await fetch(`${API_URL}/api/candidates/${candidateId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }

      // Succès : Retirer le candidat de la liste locale
      setCandidates(prevCandidates => prevCandidates.filter(c => c.id !== candidateId));
      
      toast.success('✅ Candidat supprimé', {
        description: 'Le candidat a été retiré du pipeline'
      });
    } catch (error) {
      console.error('❌ Erreur suppression (menu):', error);
      toast.error('Impossible de supprimer le candidat');
      throw error;
    }
  };

  const handleViewDetailsFromMenu = (candidateId) => {
    navigate(`/candidates/${candidateId}`);
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
      <DragDropContext 
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      >
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
                    onOpenMenu={handleOpenMenu}
                  />
                ))}
              </KanbanColumn>
            );
          })}
          
        </div>
        </div>
      </DragDropContext>

      {/* Menu Mobile Contextuel (Bottom Sheet) */}
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

export default PipelinePage;
