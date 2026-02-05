import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Phone, Mail, FileText, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

// URL API dynamique
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PipelinePage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colonnes définies selon le CDC 6.2 (Location)
  const columns = [
    { id: 'NEW', title: 'Nouveaux', color: 'border-l-blue-500' },
    { id: 'VISIT', title: 'Visites', color: 'border-l-purple-500' },
    { id: 'DOSSIER', title: 'Dossiers', color: 'border-l-amber-500' },
    { id: 'DECISION', title: 'Décision', color: 'border-l-indigo-500' },
    { id: 'DONE', title: 'Terminé', color: 'border-l-emerald-500' }
  ];

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/candidates`);
      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
      
      // Mapping intelligent des statuts API vers les colonnes UI
      const mappedData = data.data.map(c => ({
        ...c,
        columnId: mapStatusToColumn(c.status)
      }));
      
      setCandidates(mappedData);
    } catch (err) {
      console.error("Erreur pipeline:", err);
      setError("Impossible de charger les candidats.");
      // Données de secours pour démo si API vide (Failover)
      if (candidates.length === 0) loadDemoData(); 
    } finally {
      setLoading(false);
    }
  };

  const mapStatusToColumn = (status) => {
    if (['NEW', 'TO_QUALIFY'].includes(status)) return 'NEW';
    if (['VISIT_SCHEDULED', 'VISIT_DONE'].includes(status)) return 'VISIT';
    if (['DOSSIER_INCOMPLETE', 'DOSSIER_READY', 'DOSSIER_PENDING'].includes(status)) return 'DOSSIER';
    if (['TRANSMITTED', 'UNDER_REVIEW', 'RETAINED', 'REJECTED'].includes(status)) return 'DECISION';
    if (['CONTRACT_SIGNED', 'ARCHIVED'].includes(status)) return 'DONE';
    return 'NEW'; // Fallback
  };

  const loadDemoData = () => {
     // Juste pour éviter l'écran blanc si la DB est vide au début
     setCandidates([
         { id: 'demo1', firstName: 'Jean', lastName: 'Dupont', property: { name: 'T3 Lausanne' }, columnId: 'DOSSIER', solvencyScore: 95, pursuitsStatus: 'CLEAN' },
         { id: 'demo2', firstName: 'Pierre', lastName: 'Morel', property: { name: 'Studio Gland' }, columnId: 'DECISION', solvencyScore: 25, pursuitsStatus: 'MAJOR_ISSUES' }
     ]);
  };

  if (loading) return <div className="p-10 text-center text-zinc-500">Chargement du pipeline...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7] text-zinc-900 font-sans overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight">Pipeline Location</h1>
        <div className="flex gap-3">
            <button className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-lg"><Search size={20} /></button>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-all shadow-sm">
                <Plus size={18} /> Nouveau Candidat
            </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full gap-6 min-w-[1200px]">
          {columns.map(col => (
            <div key={col.id} className="flex-1 flex flex-col min-w-[280px] max-w-[350px]">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color.replace('border-l-', 'bg-')}`}></span>
                    {col.title}
                </h3>
                <span className="bg-zinc-200 text-zinc-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {candidates.filter(c => c.columnId === col.id).length}
                </span>
              </div>

              {/* Drop Zone */}
              <div className="flex-1 bg-zinc-100/50 rounded-xl p-2 overflow-y-auto space-y-3">
                {candidates.filter(c => c.columnId === col.id).map(candidate => (
                  <div key={candidate.id} className={`bg-white p-4 rounded-xl border-l-4 ${col.color} shadow-sm hover:shadow-md transition-all cursor-pointer group`}>
                    
                    {/* Header Carte */}
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-zinc-900 text-base">{candidate.firstName} {candidate.lastName}</h4>
                            <p className="text-xs text-zinc-500 font-medium truncate max-w-[180px]">
                                {candidate.property ? candidate.property.name : 'Recherche générale'}
                            </p>
                        </div>
                        {/* 🇨🇭 Badge Swiss Safe - Solvabilité */}
                        {candidate.solvencyScore >= 80 && (
                            <div className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-100 flex items-center gap-1" title="Solvabilité vérifiée">
                                <Shield size={10} /> 95%
                            </div>
                        )}
                    </div>

                    {/* 🇨🇭 Badge Swiss Safe - Poursuites (Alerte) */}
                    {candidate.pursuitsStatus === 'MAJOR_ISSUES' && (
                        <div className="mb-3 bg-red-50 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-100 flex items-center gap-1.5">
                            <AlertTriangle size={12} />
                            Poursuites Détectées
                        </div>
                    )}

                    {/* Footer Carte (Actions) */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-50 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-zinc-400">
                            {candidate.monthlyIncome ? `CHF ${candidate.monthlyIncome}.-` : 'Revenu N/A'}
                        </span>
                        <div className="flex gap-1">
                            <button className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400 hover:text-indigo-600"><Mail size={14}/></button>
                            <button className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400 hover:text-indigo-600"><FileText size={14}/></button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelinePage;
