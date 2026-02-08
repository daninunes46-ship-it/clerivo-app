import React from 'react';
import { Calendar, User, MapPin, Shield, AlertTriangle, CheckCircle, Mail, Phone, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDraggableCard } from '../../hooks/useDraggableCard';

/**
 * CandidateCard - Carte candidat PDND Native-Driven (60fps)
 * 
 * Architecture V2:
 * - Long Press Protocol (200ms) → Distinction Scroll vs Drag
 * - Native Preview GPU → 0 charge React
 * - Haptic Feedback iOS 18+ → Confirmation tactile
 * - Suppression totale @hello-pangea/dnd
 */
const CandidateCard = ({ candidate, index, statusColor = 'border-l-zinc-200', onOpenMenu, onDrop }) => {
  const navigate = useNavigate();
  
  // Hook PDND Native-Driven
  const { cardRef, hapticSwitchRef, isDragging } = useDraggableCard(candidate, onDrop);

  // Extraction des données
  const { firstName, lastName, email, monthlyIncome } = candidate;
  const latestApplication = candidate.applications?.[0];
  const property = latestApplication?.property;
  const latestSolvency = candidate.latestSolvencyProfile || candidate.solvencyProfiles?.[0];
  
  const fullName = `${firstName} ${lastName}`;
  
  const propertyLabel = property 
    ? `${property.city} ${property.rooms}P` 
    : 'Bien non défini';
  
  const incomeLabel = monthlyIncome 
    ? `${Math.round(monthlyIncome).toLocaleString('fr-CH')} CHF/mois`
    : 'Revenu N/D';
  
  // Badge Solvency Score
  const solvencyScore = latestSolvency?.solvencyScore;
  const solvencyRating = latestSolvency?.solvencyRating;
  
  const getSolvencyBadge = () => {
    if (!solvencyScore && !solvencyRating) return null;
    
    if (solvencyScore >= 80 || solvencyRating === 'EXCELLENT' || solvencyRating === 'GOOD') {
      return {
        label: 'Solide',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle
      };
    }
    
    if (solvencyScore >= 60 || solvencyRating === 'ACCEPTABLE') {
      return {
        label: 'Acceptable',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertTriangle
      };
    }
    
    return {
      label: 'À vérifier',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: AlertTriangle
    };
  };
  
  // Badge Poursuites
  const pursuitsStatus = latestSolvency?.pursuitsStatus;
  
  const getPursuitsBadge = () => {
    if (!pursuitsStatus || pursuitsStatus === 'NOT_CHECKED' || pursuitsStatus === 'PENDING_DOCUMENT') {
      return null;
    }
    
    if (pursuitsStatus === 'CLEAN') {
      return {
        label: 'Poursuites OK',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Shield
      };
    }
    
    if (pursuitsStatus === 'MINOR_ISSUES') {
      return {
        label: 'Poursuites Mineures',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertTriangle
      };
    }
    
    return {
      label: 'Alerte Poursuites',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertTriangle
    };
  };
  
  const solvencyBadge = getSolvencyBadge();
  const pursuitsBadge = getPursuitsBadge();
  
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HACK HAPTIQUE iOS 18+ (Switch invisible, Taptic Engine)     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <input
        ref={hapticSwitchRef}
        type="checkbox"
        role="switch"
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0
        }}
      />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CARTE CANDIDAT (PDND Native-Driven)                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div
        ref={cardRef}
        onClick={() => {
          console.log('🔗 Navigation vers candidat:', candidate.id);
          if (!candidate.id) {
            console.error('❌ ID candidat manquant');
            return;
          }
          navigate(`/candidates/${candidate.id}`);
        }}
        className={`
          bg-white p-4 rounded-xl shadow-sm border border-zinc-100 
          border-l-4 ${statusColor}
          transition-all duration-200 ease-out
          group cursor-grab active:cursor-grabbing
          ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'}
          touch-action-manipulation select-none
        `}
        style={{
          // CRITIQUE ANDROID: Bloquer overlay Samsung Split-Screen
          touchAction: 'manipulation',
          WebkitTouchCallout: 'none', // Bloque menu contextuel système
          userSelect: 'none',         // Bloque sélection texte
          WebkitUserSelect: 'none'    // Compatibilité WebKit
        }}
      >
        {/* Header - Nom + Menu Mobile */}
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-zinc-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors flex-1">
            {fullName}
          </h4>
          
          {/* Bouton Menu Mobile (⋮) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('📱 Ouverture menu mobile:', candidate.id);
              if (onOpenMenu) {
                onOpenMenu(candidate);
              }
            }}
            className="md:hidden flex-shrink-0 p-1.5 -mr-2 rounded-lg hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
            aria-label="Ouvrir le menu d'actions"
          >
            <MoreVertical size={16} className="text-zinc-500" />
          </button>

          <div className="hidden md:flex items-center gap-1 text-[10px] text-zinc-400">
            <Calendar size={10} />
            <span>
              {new Date(candidate.createdAt).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
        
        {/* Bien recherché */}
        <div className="flex items-center gap-1.5 mb-2 text-xs text-zinc-600">
          <MapPin size={12} className="text-indigo-500" />
          <span className="truncate font-medium">{propertyLabel}</span>
        </div>
        
        {/* Revenu */}
        <div className="flex items-center gap-1.5 mb-3 text-xs text-zinc-500">
          <User size={12} />
          <span className="truncate">{incomeLabel}</span>
        </div>
        
        {/* Badges Swiss Safe */}
        {(solvencyBadge || pursuitsBadge) && (
          <div className="flex flex-wrap gap-1.5 mb-3 pt-3 border-t border-zinc-50">
            {solvencyBadge && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${solvencyBadge.color}`}>
                <solvencyBadge.icon size={10} />
                <span>{solvencyBadge.label}</span>
              </div>
            )}
            
            {pursuitsBadge && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${pursuitsBadge.color}`}>
                <pursuitsBadge.icon size={10} />
                <span>{pursuitsBadge.label}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Actions rapides (desktop hover) */}
        <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${email}`;
            }}
            className="p-1.5 rounded hover:bg-indigo-50 text-zinc-500 hover:text-indigo-600 transition-colors"
            title="Envoyer un email"
          >
            <Mail size={12} />
          </button>
          {candidate.phone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${candidate.phone}`;
              }}
              className="p-1.5 rounded hover:bg-indigo-50 text-zinc-500 hover:text-indigo-600 transition-colors"
              title="Appeler"
            >
              <Phone size={12} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CandidateCard;
