import React, { useState } from 'react';
import { X, Check, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

/**
 * MoveToMenu - Menu mobile pour déplacer un candidat entre colonnes
 * 
 * UX: Bottom Sheet mobile avec liste de statuts + actions rapides
 * Accessibilité: Lecteurs d'écran, navigation clavier, focus trap
 */
const MoveToMenu = ({ 
  candidate, 
  currentStatus, 
  columns, 
  onMove, 
  onViewDetails,
  onDelete,
  onClose 
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMove = async (columnId) => {
    if (isMoving) return;
    
    const targetColumn = columns.find(col => col.id === columnId);
    if (!targetColumn) return;

    // Si déjà dans cette colonne, fermer sans action
    if (targetColumn.statuses.includes(currentStatus)) {
      toast.info('Le candidat est déjà dans cette colonne');
      onClose();
      return;
    }

    setIsMoving(true);
    
    try {
      const newStatus = targetColumn.statuses[0]; // Premier statut de la colonne cible
      await onMove(candidate.id, newStatus);
      
      // Succès géré par le parent (PipelinePage)
      onClose();
    } catch (error) {
      console.error('❌ Erreur déplacement menu:', error);
      toast.error('Impossible de déplacer le candidat');
    } finally {
      setIsMoving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    // Confirmation utilisateur
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${candidate.firstName} ${candidate.lastName} ?\n\nCette action est irréversible.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      await onDelete(candidate.id);
      onClose();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      toast.error('Impossible de supprimer le candidat');
      setIsDeleting(false);
    }
  };

  // Trouver la colonne actuelle du candidat
  const currentColumn = columns.find(col => col.statuses.includes(currentStatus));

  return (
    <>
      {/* Backdrop (fond semi-transparent) */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet (iOS-style) */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-menu-title"
      >
        {/* Handle (barre de préhension iOS) */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-zinc-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 id="move-menu-title" className="text-lg font-bold text-zinc-900">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <p className="text-sm text-zinc-500 mt-0.5">
                Actuellement dans : <span className="font-medium">{currentColumn?.title || 'N/D'}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={20} className="text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Section: Déplacer vers */}
        <div className="px-6 py-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-3">
            Déplacer vers
          </h4>
          
          <div className="space-y-2">
            {columns.map((column) => {
              const isCurrentColumn = column.statuses.includes(currentStatus);
              
              return (
                <button
                  key={column.id}
                  onClick={() => handleMove(column.id)}
                  disabled={isMoving || isCurrentColumn}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all
                    ${isCurrentColumn 
                      ? 'bg-indigo-50 border-indigo-200 cursor-default' 
                      : 'bg-white border-zinc-100 hover:border-indigo-300 hover:bg-indigo-50/50 active:scale-[0.98]'
                    }
                    ${isMoving ? 'opacity-50 cursor-wait' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Indicateur de couleur de la colonne */}
                    <div 
                      className={`w-1 h-8 rounded-full ${column.color.bg}`}
                      aria-hidden="true"
                    />
                    
                    <div>
                      <div className="font-semibold text-sm text-zinc-900">
                        {column.title}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {column.statuses.length} statut{column.statuses.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Checkmark si colonne actuelle */}
                  {isCurrentColumn && (
                    <Check size={20} className="text-indigo-600" aria-label="Colonne actuelle" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Actions rapides */}
        <div className="px-6 py-4 border-t border-zinc-100 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-3">
            Actions rapides
          </h4>

          {/* Voir le dossier */}
          <button
            onClick={() => {
              onViewDetails(candidate.id);
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-zinc-100 bg-white hover:bg-zinc-50 hover:border-zinc-200 active:scale-[0.98] transition-all text-left"
          >
            <Eye size={18} className="text-indigo-600" />
            <div>
              <div className="font-semibold text-sm text-zinc-900">
                Voir le dossier complet
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Profil, documents, historique
              </div>
            </div>
          </button>

          {/* Supprimer le candidat */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`
              w-full flex items-center gap-3 p-4 rounded-xl border-2 border-red-100 bg-red-50 text-left transition-all
              ${isDeleting 
                ? 'opacity-50 cursor-wait' 
                : 'hover:bg-red-100 hover:border-red-200 active:scale-[0.98]'
              }
            `}
          >
            <Trash2 size={18} className="text-red-600" />
            <div>
              <div className="font-semibold text-sm text-red-900">
                {isDeleting ? 'Suppression...' : 'Supprimer le candidat'}
              </div>
              <div className="text-xs text-red-600 mt-0.5">
                Action irréversible
              </div>
            </div>
          </button>
        </div>

        {/* Bouton Annuler (Mobile Safe Area) */}
        <div className="px-6 pb-8 pt-4">
          <button
            onClick={onClose}
            className="w-full py-3 text-center font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </>
  );
};

export default MoveToMenu;
