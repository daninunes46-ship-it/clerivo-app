import { useEffect, useRef, useState } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

export function useDraggableCard({ cardId, columnId, candidate, index, onDrop }) {
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const cleanupDnd = draggable({
      element: card,
      // Late Binding : Le drag n'est possible que si dragEnabled est true
      canDrag: () => dragEnabled,
      getInitialData: () => ({ type: 'candidate-card', cardId, columnId, index, candidate }),
      onDragStart: (e) => {
        setIsDragging(true);
        // FIX API & SAMSUNG : On ne clear PAS les data (ça casse l'API).
        // On définit un type MIME propriétaire que Android ne sait pas ouvrir.
        if (e.source.dataTransfer) {
            e.source.dataTransfer.effectAllowed = 'move';
            e.source.dataTransfer.setData('application/x-clerivo-secure', 'true');
        }
        // Petit retour haptique au décollage
        if (navigator.vibrate) navigator.vibrate(20);
      },
      onDrop: ({ location, source }) => {
        setIsDragging(false);
        
        // Gérer le callback API vers le parent
        const destination = location.current.dropTargets[0];
        if (!destination) {
          console.log('❌ Drop hors zone');
          return;
        }

        const newStatus = destination.data.columnStatus;
        const oldStatus = source.data.columnId;

        if (newStatus === oldStatus) {
          console.log('⚠️ Drop dans même colonne, ignoré');
          return;
        }

        console.log('✅ Drop validé:', oldStatus, '→', newStatus);
        
        // Callback optimistic update (parent gère l'API)
        if (onDrop) {
          onDrop({
            candidateId: cardId,
            oldStatus,
            newStatus
          });
        }
      },
      // FIX DESKTOP : On force une preview opaque et solide (pas de fantôme transparent)
      generateNativeDragPreview: ({ nativeSetDragImage }) => {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset: ({ container }) => {
             // On centre la preview sous le curseur/doigt
             const rect = container.getBoundingClientRect();
             return { x: rect.width / 2, y: 40 }; 
          },
          render: ({ container }) => {
            const preview = document.createElement('div');
            preview.style.width = `${container.clientWidth}px`;
            preview.style.backgroundColor = 'white'; // Fond blanc opaque
            preview.style.padding = '16px';
            preview.style.borderRadius = '12px';
            preview.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)'; // Grosse ombre
            preview.style.opacity = '1'; // Opacité forcée
            preview.style.display = 'flex';
            preview.style.flexDirection = 'column';
            preview.style.gap = '4px';
            
            // Contenu minimaliste pour la fluidité 60fps
            preview.innerHTML = `
              <div style="font-weight: 700; color: #1f2937; font-size: 14px;">${candidate.attributes?.first_name} ${candidate.attributes?.last_name}</div>
              <div style="font-size: 12px; color: #6b7280;">${candidate.attributes?.income_currency || ''} ${candidate.attributes?.income || ''}</div>
            `;
            return preview;
          },
        });
      },
    });

    // LOGIQUE HYBRIDE : MOUSE vs TOUCH
    const handlePointerDown = (e) => {
      // SCÉNARIO 1 : SOURIS (PC)
      // Activation immédiate, pas de délai, expérience fluide
      if (e.pointerType === 'mouse') {
        setDragEnabled(true);
        return;
      }

      // SCÉNARIO 2 : TACTILE (Mobile)
      // Délai de 200ms pour éviter le conflit avec le scroll
      const timer = setTimeout(() => {
        setDragEnabled(true);
        if (navigator.vibrate) navigator.vibrate(10); // Confirmation physique
      }, 200);

      const cancel = () => {
        clearTimeout(timer);
        setDragEnabled(false);
      };
      
      // Si on bouge ou on relâche avant 200ms, c'est un scroll/click, pas un drag
      card.addEventListener('pointermove', cancel, { once: true });
      card.addEventListener('pointerup', cancel, { once: true });
      card.addEventListener('pointercancel', cancel, { once: true });
      // Important : nettoyer les listeners si le composant démonte pendant l'appui
      return () => {
         clearTimeout(timer);
         card.removeEventListener('pointermove', cancel);
      };
    };

    // Bloquer le menu contextuel (clic droit / appui long système)
    const preventContext = (e) => {
       if (e.cancelable && e.pointerType !== 'mouse') e.preventDefault();
    };

    card.addEventListener('pointerdown', handlePointerDown);
    card.addEventListener('contextmenu', preventContext);

    return () => {
      cleanupDnd();
      card.removeEventListener('pointerdown', handlePointerDown);
      card.removeEventListener('contextmenu', preventContext);
    };
  }, [cardId, columnId, index, candidate, dragEnabled, onDrop]);

  // On retourne l'état pour l'UI (opacité, scale)
  return { cardRef, isDragging, dragEnabled };
}
