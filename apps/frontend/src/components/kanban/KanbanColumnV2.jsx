import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useDroppableColumn } from '../../hooks/useDroppableColumn';

/**
 * KanbanColumnV2 - Colonne virtualisée avec React-Virtuoso
 * 
 * Architecture V2:
 * - Drop zone PDND Native-Driven
 * - Virtualisation pour listes longues (>20 cartes)
 * - Scroll natif préservé (rubber-banding iOS)
 */
const KanbanColumnV2 = ({ 
  columnId, 
  title, 
  count, 
  colorClass,
  candidates = [],
  renderCard
}) => {
  const { columnRef, isOver } = useDroppableColumn(columnId);

  return (
    <div 
      ref={columnRef}
      className={`
        flex-shrink-0 
        w-[90vw] snap-center
        md:w-[280px] md:snap-align-none
        xl:w-auto xl:flex-shrink
        flex flex-col h-full max-h-full
        transition-colors duration-200
        ${isOver ? 'bg-indigo-50/50' : 'bg-transparent'}
      `}
    >
      {/* Header colonne */}
      <div className={`
        ${colorClass.bg} ${colorClass.text} 
        px-4 py-3 rounded-t-xl font-bold text-sm uppercase tracking-wide
        flex items-center justify-between
        shadow-sm
      `}>
        <span>{title}</span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
          {count}
        </span>
      </div>

      {/* Liste des cartes (Virtualisée) */}
      <div className="flex-1 overflow-hidden rounded-b-xl border border-t-0 border-zinc-100 backdrop-blur-sm bg-white/80">
        {candidates.length === 0 ? (
          // Empty state
          <div className="flex items-center justify-center h-full p-4 text-zinc-400 text-sm">
            Aucun candidat
          </div>
        ) : (
          // Virtuoso pour listes longues (perf optimale)
          <Virtuoso
            style={{ height: '100%' }}
            data={candidates}
            totalCount={candidates.length}
            overscan={200} // Précharge 200px avant/après viewport
            itemContent={(index, candidate) => (
              <div className="px-3 py-2 first:pt-3">
                {renderCard(candidate, index)}
              </div>
            )}
            components={{
              // Custom scroller (préserve scroll natif)
              Scroller: React.forwardRef((props, ref) => (
                <div
                  {...props}
                  ref={ref}
                  style={{
                    ...props.style,
                    // CRITIQUE: Scroll natif, pas custom
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch', // iOS momentum
                    touchAction: 'pan-y' // Autoriser scroll vertical natif
                  }}
                />
              ))
            }}
          />
        )}
      </div>
    </div>
  );
};

export default KanbanColumnV2;
