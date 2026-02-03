import React from 'react';
import BentoCard from '../components/ui/BentoCard';
import { ArrowUpRight, CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      
      {/* 1. Carte Hero Premium (Mobile: col-span-1, Desktop: col-span-2) */}
      <BentoCard className="md:col-span-2 min-h-[220px] justify-between relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-lg shadow-indigo-200">
        {/* Cercles décoratifs d'arrière-plan */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 rounded-full bg-indigo-400 opacity-20 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
              Système Opérationnel
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">Bonjour, Agent.</h2>
          <p className="text-indigo-100 max-w-lg font-medium text-sm md:text-base opacity-90">
            Voici le résumé de votre activité immobilière aujourd'hui. 
            Le marché est actif avec <strong className="text-white">3 nouvelles opportunités</strong> détectées ce matin.
          </p>
          
          <button className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm">
            Voir les opportunités
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </BentoCard>

      {/* 2. Carte Activité (Mobile: col-span-1, Desktop: row-span-2) */}
      <BentoCard title="Activité Récente" className="md:row-span-2 h-full order-last md:order-none">
        <div className="space-y-7 mt-2">
          {[
            { time: '10:42', text: 'Nouveau lead qualifié : Villa Montreux', type: 'lead' },
            { time: '09:15', text: 'Email envoyé à M. Dupont', type: 'mail' },
            { time: 'Hier', text: 'Offre signée : Apt. Lausanne', type: 'success' },
            { time: 'Hier', text: 'Mise à jour du pipeline', type: 'update' },
            { time: '2 Fév', text: 'Réunion équipe commerciale', type: 'meeting' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start relative group">
              {/* Ligne de connectivité verticale */}
              {i !== 4 && <div className="absolute left-[9px] top-8 bottom-[-20px] w-0.5 bg-zinc-100 group-hover:bg-indigo-50 transition-colors"></div>}
              
              <div className="flex flex-col items-center mt-1.5 relative z-10">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${i === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 text-zinc-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-indigo-600' : 'bg-zinc-400'}`}></div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 group-hover:text-indigo-700 transition-colors cursor-pointer">{item.text}</p>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-auto pt-6 text-xs text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wide flex items-center justify-center gap-1 transition-colors">
          Voir l'historique
          <ArrowUpRight size={14} />
        </button>
      </BentoCard>

      {/* 3. Cartes KPI (Ligne du bas) */}
      
      {/* KPI 1 : Leads */}
      <BentoCard title="Leads Actifs">
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-4xl font-bold text-indigo-600 tracking-tight">24</span>
            <div className="flex items-center gap-1 mt-2 text-sm text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-flex">
              <TrendingUp size={14} strokeWidth={2.5} />
              <span>+12%</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <UsersIcon />
          </div>
        </div>
      </BentoCard>

      {/* KPI 2 : Ventes */}
      <BentoCard title="Commissions (Mois)">
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-4xl font-bold text-emerald-600 tracking-tight">128k</span>
            <div className="flex items-center gap-1 mt-2 text-sm text-zinc-400 font-medium">
              <span>CHF</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </BentoCard>

      {/* KPI 3 : Tâches Urgentes */}
      <BentoCard title="À Traiter">
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-4xl font-bold text-amber-500 tracking-tight">5</span>
            <div className="flex items-center gap-1 mt-2 text-sm text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md inline-flex">
              <AlertCircle size={14} strokeWidth={2.5} />
              <span>Urgent</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock size={24} />
          </div>
        </div>
      </BentoCard>

    </div>
  );
};

// Petit composant icône locale pour l'exemple
const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default DashboardPage;
