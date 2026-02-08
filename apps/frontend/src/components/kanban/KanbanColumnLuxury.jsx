import React from 'react';
import { useDroppableColumn } from '../../hooks/useDroppableColumn';
import CandidateCardLuxury from './CandidateCardLuxury';

/**
 * KanbanColumnLuxury - "Liquid Glass" Container (Plan de Bataille 9)
 * 
 * Design System "Clean Luxury":
 * - Material: Glassmorphism Header (backdrop-blur-xl)
 * - Typography: Inter Display (Total Financier)
 * - Interaction: Sticky Header + Native Scroll
 */
const KanbanColumnLuxury = ({ 
  columnId, 
  title, 
  count, 
  colorClass, 
  candidates = [], 
  renderCard 
}) => {
  const scrollContainerRef = React.useRef(null);
  const headerRef = React.useRef(null);

  // Hook PDND pour la zone de drop
  const { isOver, dropRef } = useDroppableColumn({
    columnId
  });

  // Calcul du "Total Financier" (La métrique Sexy)
  const totalAmount = React.useMemo(() => {
    return candidates.reduce((sum, c) => sum + (c.monthlyIncome || 0), 0);
  }, [candidates]);

  const formattedTotal = new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 0,
    notation: 'compact' // 1.2M au lieu de 1 200 000
  }).format(totalAmount);

  // Style dynamique pour le header (couleur active)
  const headerStyle = {
    backgroundColor: isOver ? colorClass.bgLight : 'rgba(255, 255, 255, 0.8)', // Glass effect
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', // Safari support
    borderBottomColor: isOver ? colorClass.cardBorder : 'rgba(228, 228, 231, 0.4)'
  };

  return (
    <div 
      className={`
        flex flex-col h-full min-w-[320px] max-w-[360px] 
        rounded-3xl bg-zinc-50/50 border border-zinc-100/50 
        transition-colors duration-300
        ${isOver ? 'bg-indigo-50/30' : ''}
      `}
    >
      {/* --- STICKY HEADER (LIQUID GLASS) --- */}
      <div 
        ref={headerRef}
        className="sticky top-0 z-10 px-6 py-5 border-b transition-all duration-300 rounded-t-3xl"
        style={headerStyle}
      >
        <div className="flex justify-between items-center mb-1">
          <h3 className={`font-bold text-sm tracking-tight ${colorClass.text}`}>
            {title}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass.bgLight} ${colorClass.text}`}>
            {count}
          </span>
        </div>
        
        {/* Total Financier (Metric) */}
        <div className="text-2xl font-bold text-zinc-900 tracking-tight tabular-nums">
          {formattedTotal}
          <span className="text-xs text-zinc-400 font-normal ml-1 align-top">CHF</span>
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div 
        ref={(el) => {
          scrollContainerRef.current = el;
          dropRef(el); // Connecter PDND Drop Target
        }}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
        style={{
          scrollBehavior: 'smooth',
          maskImage: 'linear-gradient(to bottom, transparent, black 10px, black 90%, transparent)' // Soft edges
        }}
      >
        {candidates.map((candidate, index) => (
          renderCard ? renderCard(candidate, index) : (
            <CandidateCardLuxury 
              key={candidate.id} 
              candidate={candidate} 
              index={index} 
            />
          )
        ))}
        
        {/* Empty State */}
        {candidates.length === 0 && (
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-2xl">
            <span className="text-xs text-zinc-300 font-medium">Vide</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumnLuxury;
