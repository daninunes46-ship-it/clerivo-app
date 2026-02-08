import { useEffect, useRef, useState } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';

/**
 * useDroppableColumn - Hook pour colonnes Kanban (drop zones)
 * 
 * @param {string} columnStatus - Status de la colonne (ex: 'NEW', 'VISIT_SCHEDULED')
 */
export const useDroppableColumn = (columnStatus) => {
  const columnRef = useRef(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;

    const cleanup = combine(
      dropTargetForElements({
        element: column,
        
        // Données de la drop zone
        getData: () => ({
          type: 'column',
          columnStatus
        }),

        // Accepte uniquement les cartes candidats
        canDrop: ({ source }) => source.data.type === 'candidate-card',

        // Visual feedback (hover state)
        onDragEnter: () => setIsOver(true),
        onDragLeave: () => setIsOver(false),
        onDrop: () => setIsOver(false)
      })
    );

    return cleanup;
  }, [columnStatus]);

  return {
    columnRef,
    isOver
  };
};
