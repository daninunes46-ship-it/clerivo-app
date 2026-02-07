import React, { useState } from 'react';
import { UserPlus, MapPin, DollarSign, Phone, Activity, BrainCircuit, Check, Loader2 } from 'lucide-react';
import SmartBadge from './SmartBadge';
import { toast } from 'sonner';

// 🌐 URL API : Utilise la variable d'environnement ou chemin relatif (proxy)
const API_URL = import.meta.env.VITE_API_URL || '';

const EmailAnalysisCard = ({ analysis, loading, emailData }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-white rounded-xl border border-indigo-100 shadow-sm animate-pulse">
        <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-indigo-100 rounded-full"></div>
            <div className="h-4 w-32 bg-indigo-50 rounded"></div>
        </div>
        <div className="h-20 bg-zinc-50 rounded-lg"></div>
      </div>
    );
  }

  if (!analysis || analysis.error) {
    return null; // Don't show card if analysis failed or doesn't exist yet
  }

  const { classification, sentiment, entities, summary } = analysis;

  const handleAddToCRM = async () => {
    if (added) return;
    setAdding(true);

    try {
        // Préparation des données pour le CRM (Mapping IA -> Candidat)
        const nameParts = (entities?.client_name || emailData?.from || 'Inconnu').split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || 'Inconnu';
        
        // Extraction du budget pour le revenu (simpliste pour la démo)
        let monthlyIncome = null;
        if (entities?.budget) {
            const numbers = entities.budget.match(/\d+/g);
            if (numbers) monthlyIncome = parseInt(numbers.join(''));
        }

        const payload = {
            firstName,
            lastName,
            email: emailData?.email || 'no-email@detected.com',
            phone: entities?.phone,
            monthlyIncome: monthlyIncome,
            // On ajoute une note ou un tag pour dire que ça vient de l'IA
            notes: `Lead capturé depuis l'email. Résumé IA: ${summary}`,
            // Pour le pipeline "Nouveaux"
            status: 'NEW' 
        };

        // Appel API (qui alimente le Pipeline)
        const response = await fetch(`${API_URL}/api/candidates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // 1. Gérer le cas Spécifique 409 D'ABORD
        if (response.status === 409) {
             toast.info("Candidat déjà existant", {
                description: "Ce contact est déjà présent dans le pipeline."
             });
             setAdded(true);
             return; // Stop here, handled gracefully
        }

        // 2. Ensuite gérer les autres erreurs
        if (!response.ok) throw new Error('Erreur API');

        const data = await response.json();

        if (data.success) {
            setAdded(true);
            toast.success("Candidat ajouté au Pipeline !", {
                description: `${firstName} ${lastName} est maintenant dans la colonne "Nouveaux".`
            });
        }
    } catch (err) {
        console.error("Erreur Add CRM:", err);
        toast.error("Impossible d'ajouter le candidat", {
            description: "Vérifiez la console pour les détails."
        });
    } finally {
        setAdding(false);
    }
  };

  return (
    <div className="mb-6 bg-gradient-to-br from-white to-indigo-50/30 rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
      
      {/* Header: AI Identity */}
      <div className="px-5 py-3 border-b border-indigo-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
          <BrainCircuit size={16} className="text-indigo-600" />
          <span>Analyse "Neural Inbox"</span>
        </div>
        <div className="flex gap-2">
           <SmartBadge type="category" value={classification?.category} />
           <SmartBadge type="priority" value={classification?.priority} />
        </div>
      </div>

      <div className="p-5">
        {/* Summary */}
        <p className="text-sm text-zinc-600 mb-4 italic border-l-2 border-indigo-200 pl-3">
          "{summary}"
        </p>

        {/* Entities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            
            {/* Contact Info */}
            <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-zinc-100 rounded-md text-zinc-500 mt-0.5">
                        <UserPlus size={14} />
                    </div>
                    <div>
                        <span className="block text-xs text-zinc-400 font-medium uppercase tracking-wide">Client Détecté</span>
                        <span className="text-sm font-medium text-zinc-900">{entities?.client_name || 'Non identifié'}</span>
                    </div>
                </div>
                
                {entities?.phone && (
                    <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-green-50 rounded-md text-green-600 mt-0.5">
                            <Phone size={14} />
                        </div>
                        <div>
                            <span className="block text-xs text-zinc-400 font-medium uppercase tracking-wide">Téléphone</span>
                            <span className="text-sm font-medium text-zinc-900">{entities.phone}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Deal Info */}
            <div className="space-y-3">
                {(entities?.budget || entities?.location) && (
                    <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-amber-50 rounded-md text-amber-600 mt-0.5">
                            <DollarSign size={14} />
                        </div>
                        <div>
                            <span className="block text-xs text-zinc-400 font-medium uppercase tracking-wide">Potentiel</span>
                            <div className="flex flex-col">
                                {entities.budget && <span className="text-sm font-medium text-zinc-900">{entities.budget}</span>}
                                {entities.location && (
                                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                                        <MapPin size={10} /> {entities.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                 <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-purple-50 rounded-md text-purple-600 mt-0.5">
                        <Activity size={14} />
                    </div>
                    <div>
                        <span className="block text-xs text-zinc-400 font-medium uppercase tracking-wide">Sentiment</span>
                        <span className={`text-sm font-medium ${
                            sentiment === 'Positif' ? 'text-green-600' : 
                            sentiment === 'Négatif' ? 'text-red-600' : 'text-zinc-600'
                        }`}>
                            {sentiment || 'Non analysé'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleAddToCRM}
            disabled={adding || added}
            className={`
                w-full py-2 text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer
                ${added 
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98]'
                }
                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
            `}
        >
            {adding ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    Ajout en cours...
                </>
            ) : added ? (
                <>
                    <Check size={16} />
                    Déjà ajouté
                </>
            ) : (
                <>
                    <UserPlus size={16} />
                    Ajouter au Pipeline
                </>
            )}
        </button>

      </div>
    </div>
  );
};

export default EmailAnalysisCard;
