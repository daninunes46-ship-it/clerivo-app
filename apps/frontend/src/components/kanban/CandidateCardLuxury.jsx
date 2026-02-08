import React from 'react';
import { useDraggableCard } from '../../hooks/useDraggableCard';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, CheckCircle2, Clock, MoreHorizontal, Building2 } from 'lucide-react';

/**
 * CandidateCardLuxury - "Super-Carte" Bento Style (Plan de Bataille 9)
 * 
 * Design System "Clean Luxury":
 * - Layout: Bento Grid 2x3
 * - Visual Signals: Solvency Ring, Pulsing Dot (Date)
 * - Typography: Inter Display (simulated via font-sans)
 * - Material: Pure White Surface, Soft Shadows
 */
const CandidateCardLuxury = ({ candidate, index, onOpenMenu, onDrop }) => {
  const navigate = useNavigate();
  
  // Hook PDND pour le Drag & Drop natif performant
  const { cardRef, isDragging, dragEnabled } = useDraggableCard({
    cardId: candidate.id,
    columnId: candidate.applications?.[0]?.status || 'NEW',
    candidate,
    index,
    onDrop
  });

  // --- DATA EXTRACTION & CALCULS ---
  const { firstName, lastName, monthlyIncome } = candidate;
  const application = candidate.applications?.[0];
  const property = application?.property || { title: 'Recherche générale', address: '' };
  const solvencyProfile = candidate.solvencyProfiles?.[0];
  const solvencyScore = solvencyProfile?.solvencyScore || 0;
  
  // Calcul de l'urgence (Date)
  const dateDeal = new Date(application?.createdAt || candidate.createdAt);
  const daysDiff = Math.floor((new Date() - dateDeal) / (1000 * 60 * 60 * 24));
  
  // --- VISUAL SIGNALS (LOGIQUE FRONTEND) ---
  
  // 1. Solvency Ring Color
  const getSolvencyColor = (score) => {
    if (score >= 80) return '#10B981'; // Emerald-500 (Excellent)
    if (score >= 60) return '#F59E0B'; // Amber-500 (Moyen)
    return '#EF4444'; // Red-500 (Risque)
  };
  const ringColor = getSolvencyColor(solvencyScore);
  
  // 2. Urgence (Pulsing Dot)
  const isUrgent = daysDiff > 7;
  const isStagnant = daysDiff > 30;

  // 3. Montant "Hero"
  const formattedIncome = new Intl.NumberFormat('fr-CH', { 
    style: 'currency', 
    currency: 'CHF',
    maximumFractionDigits: 0 
  }).format(monthlyIncome);

  return (
    <div
      ref={cardRef}
      draggable={dragEnabled}
      onClick={() => navigate(`/candidates/${candidate.id}`)}
      className={`
        group relative w-full mb-3 select-none
        bg-white rounded-2xl
        transition-all duration-300 ease-out
        border border-transparent hover:border-indigo-100
        cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 scale-95 shadow-none' : 'shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]'}
        ${isStagnant ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}
      `}
      style={{
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        transform: isDragging ? 'rotate(2deg)' : 'none' // Petit tilt sympa au drag
      }}
    >
      {/* --- GRID BENTO (Padding interne) --- */}
      <div className="p-4 flex flex-col gap-3">
        
        {/* ROW 1: IDENTITÉ + SOLVENCY HUD */}
        <div className="flex justify-between items-start">
          {/* Zone Identité */}
          <div className="flex items-center gap-3">
            {/* Avatar avec Anneau de Solvabilité (SVG) */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-zinc-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                {/* Solvency Ring (Dynamic) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="3"
                  strokeDasharray={`${solvencyScore}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Initiales au centre */}
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-700">
                {firstName[0]}{lastName[0]}
              </div>
              
              {/* Badge Check si Excellent */}
              {solvencyScore >= 80 && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  <CheckCircle2 size={12} className="text-emerald-500 fill-emerald-50" />
                </div>
              )}
            </div>

            {/* Nom & Détails */}
            <div className="min-w-0">
              <h4 className="font-bold text-zinc-900 text-sm truncate leading-tight group-hover:text-indigo-600 transition-colors">
                {firstName} {lastName}
              </h4>
              <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                <Clock size={10} />
                <span>Il y a {daysDiff}j</span>
                {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse ml-1" title="Attention requise" />}
              </div>
            </div>
          </div>

          {/* Menu Mobile Trigger (3 dots) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenMenu && onOpenMenu(candidate);
            }}
            className="p-1.5 -mr-2 -mt-1 rounded-lg text-zinc-300 hover:text-zinc-600 hover:bg-zinc-50 transition-colors md:opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* ROW 2: CONTEXTE IMMO (Tag Style) */}
        <div className="flex items-center gap-1.5 py-1 px-2.5 bg-zinc-50 rounded-lg border border-zinc-100 self-start max-w-full">
          <Building2 size={10} className="text-zinc-400 flex-shrink-0" />
          <span className="text-[11px] font-medium text-zinc-600 truncate">
            {property.title || property.address || 'Recherche active'}
          </span>
        </div>

        {/* ROW 3: VALUE & STATUS (Bottom Line) */}
        <div className="flex items-end justify-between mt-1 pt-2 border-t border-zinc-50/50">
          {/* Revenu (Hero Metric) */}
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">Revenu</span>
            <span className="text-sm font-bold text-zinc-900 tracking-tight tabular-nums">
              {formattedIncome}
            </span>
          </div>

          {/* Mini Badge Poursuites (si alerte) */}
          {solvencyProfile?.pursuitsStatus === 'MAJOR_ISSUES' && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold border border-red-100">
              <AlertCircle size={10} />
              <span>Poursuites</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateCardLuxury;
