import { useEffect, useRef, useState } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';

/**
 * useDraggableCard - Hook Native-Driven pour Drag Mobile 60fps
 * 
 * Architecture:
 * - Long Press Protocol (200ms) → Distinction Scroll vs Drag
 * - Native Preview GPU-delegated → 0 charge Thread Principal
 * - Haptic Feedback iOS 18+ (Switch Hack) → Confirmation tactile
 * 
 * @param {Object} candidate - Données du candidat
 * @param {Function} onDrop - Callback drop (optimistic update)
 */
export const useDraggableCard = (candidate, onDrop) => {
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Références pour le Long Press Protocol
  const longPressTimer = useRef(null);
  const touchStartPos = useRef(null);
  const isDragEnabled = useRef(false);
  
  // Hack Haptique iOS 18+ (Taptic Engine via switch invisible)
  const hapticSwitchRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // ═══════════════════════════════════════════════════════════
    // DÉTECTION PLATEFORME (iOS vs Android)
    // ═══════════════════════════════════════════════════════════
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(navigator.userAgent);

    // ═══════════════════════════════════════════════════════════
    // PHASE 1: LONG PRESS PROTOCOL (200ms Strict)
    // ═══════════════════════════════════════════════════════════
    
    const handleTouchStart = (e) => {
      // Enregistrer position initiale
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      isDragEnabled.current = false;

      // Démarrer timer Long Press (200ms)
      longPressTimer.current = setTimeout(() => {
        // Délai écoulé → ACTIVER DRAG
        isDragEnabled.current = true;
        
        // ═══════════════════════════════════════════════════════
        // HAPTIQUE HYBRIDE (iOS vs Android)
        // ═══════════════════════════════════════════════════════
        if (isIOS && hapticSwitchRef.current) {
          // iOS : Utiliser le Switch Hack (Taptic Engine)
          try {
            hapticSwitchRef.current.click();
            console.log('✨ Haptic iOS (Taptic Engine)');
          } catch (e) {
            // Fallback silencieux
          }
        } else if (isAndroid && 'vibrate' in navigator) {
          // Android : Vibration API native (plus stable)
          navigator.vibrate(15); // 15ms pulse
          console.log('✨ Haptic Android (Vibration API)');
        }
        
        console.log('🔒 Drag ACTIVÉ (Long Press validé)');
      }, 200); // 200ms strict
    };

    const handleTouchMove = (e) => {
      if (!longPressTimer.current) return;
      
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
      const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Si mouvement > 5px avant 200ms → ANNULER DRAG (c'est un scroll)
      if (totalDelta > 5) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        isDragEnabled.current = false;
        console.log('🚫 Drag annulé (Scroll détecté, delta:', totalDelta.toFixed(1), 'px)');
      }
    };

    const handleTouchEnd = () => {
      // Nettoyer timer si touch terminé avant 200ms
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      isDragEnabled.current = false;
    };

    // ═══════════════════════════════════════════════════════════
    // SAMSUNG SHIELD : Bloquer l'OS Android (DataTransfer Cleaning)
    // ═══════════════════════════════════════════════════════════
    const handleDragStart = (e) => {
      if (!e.dataTransfer) return;
      
      // CRITIQUE : Nettoyer le DataTransfer pour que Samsung ne détecte pas "d'export"
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.clearData();
      
      // Satisfaire le navigateur sans déclencher l'overlay OS
      e.dataTransfer.setData('text/plain', 'internal-use-only');
      
      console.log('🛡️ Samsung Shield activé (DataTransfer nettoyé)');
    };

    // Attacher listeners Long Press
    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: true });
    card.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Attacher Samsung Shield (dragstart natif)
    card.addEventListener('dragstart', handleDragStart);

    // ═══════════════════════════════════════════════════════════
    // PHASE 2: PRAGMATIC DRAG AND DROP (Native-Driven)
    // ═══════════════════════════════════════════════════════════
    
    const cleanup = combine(
      draggable({
        element: card,
        
        // Données portées par le drag
        getInitialData: () => ({
          type: 'candidate-card',
          candidateId: candidate.id,
          currentStatus: candidate.applications?.[0]?.status || 'NEW'
        }),

        // ───────────────────────────────────────────────────────
        // NATIVE PREVIEW (GPU-Delegated, 60fps)
        // ───────────────────────────────────────────────────────
        generateNativeDragPreview: ({ nativeSetDragImage }) => {
          // Créer un snapshot DOM simplifié (perf optimale)
          const preview = document.createElement('div');
          preview.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            min-width: 280px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          `;
          
          preview.innerHTML = `
            <div style="font-weight: 600; font-size: 14px; color: #18181b; margin-bottom: 8px;">
              ${candidate.firstName} ${candidate.lastName}
            </div>
            <div style="font-size: 12px; color: #71717a;">
              ${candidate.monthlyIncome 
                ? `${Math.round(candidate.monthlyIncome).toLocaleString('fr-CH')} CHF/mois` 
                : 'Revenu N/D'}
            </div>
          `;

          // Déléguer au moteur graphique natif
          nativeSetDragImage({
            node: preview,
            offsetX: 20,
            offsetY: 20
          });
        },

        // ───────────────────────────────────────────────────────
        // LIFECYCLE CALLBACKS
        // ───────────────────────────────────────────────────────
        onDragStart: () => {
          setIsDragging(true);
          console.log('🎬 Drag START:', candidate.id);
        },

        onDrop: ({ location, source }) => {
          setIsDragging(false);
          
          const destination = location.current.dropTargets[0];
          if (!destination) {
            console.log('❌ Drop hors zone');
            return;
          }

          const newStatus = destination.data.columnStatus;
          const oldStatus = source.data.currentStatus;

          if (newStatus === oldStatus) {
            console.log('⚠️ Drop dans même colonne, ignoré');
            return;
          }

          console.log('✅ Drop validé:', oldStatus, '→', newStatus);
          
          // Callback optimistic update (parent gère l'API)
          onDrop({
            candidateId: candidate.id,
            oldStatus,
            newStatus
          });
        }
      }),

      // ───────────────────────────────────────────────────────
      // AUTO-SCROLL NATIF (PDND built-in, 60fps)
      // ───────────────────────────────────────────────────────
      autoScrollForElements({
        element: card,
        canScroll: ({ source }) => source.data.type === 'candidate-card',
        getConfiguration: () => ({
          maxScrollSpeed: 'fast' // 'standard' | 'fast'
        })
      })
    );

    return () => {
      cleanup();
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
      card.removeEventListener('dragstart', handleDragStart);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [candidate, onDrop]);

  return {
    cardRef,
    hapticSwitchRef,
    isDragging
  };
};
