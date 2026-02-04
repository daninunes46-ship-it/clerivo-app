import React from 'react';
import { UserPlus, MapPin, DollarSign, Phone, Activity, BrainCircuit } from 'lucide-react';
import SmartBadge from './SmartBadge';

const EmailAnalysisCard = ({ analysis, loading }) => {
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
        <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2">
            <UserPlus size={16} />
            Ajouter au CRM
        </button>

      </div>
    </div>
  );
};

export default EmailAnalysisCard;
