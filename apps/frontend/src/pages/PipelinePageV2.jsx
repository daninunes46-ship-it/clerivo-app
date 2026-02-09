import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Building2, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  LayoutGrid, 
  List, 
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Eye,
  X,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Briefcase,
  User,
  FileText,
  Ban,
  Download,
  UploadCloud,
  Send,
  Sparkles,
  ArrowRightLeft,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const API_URL = import.meta.env.VITE_API_URL || '';

// --- COMPOSANT: DRAWER LATÉRAL (Swiss Safe + Chronos + SmartMatch) ---
const PipelineDrawer = ({ candidate, isOpen, onClose }) => {
  if (!candidate) return null;
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profil'); // 'profil' | 'documents' | 'smart-match'
  const [showScheduler, setShowScheduler] = useState(false); // Mode Chronos
  const [selectedSlot, setSelectedSlot] = useState(null);

  const app = candidate.applications?.[0] || {};
  const prop = app.property;
  
  // Formatage Données
  const income = candidate.income || 0;
  const rent = prop?.rent || 0;
  const effortRate = income > 0 && rent > 0 ? ((rent / income) * 100).toFixed(0) : 0;
  const solvencyScore = candidate.aiScore || 0;

  // DEBUG: Afficher les données reçues dans le drawer
  console.log('🔍 DRAWER - Données:', {
    nom: `${candidate.firstName} ${candidate.lastName}`,
    poursuitesStatus: candidate.poursuitesStatus,
    aiScore: solvencyScore,
    income: income,
    rent: rent,
    effortRate: effortRate,
    aiReason: candidate.aiReason
  });

  // Vérifier si poursuites (MAJOR_ISSUES ou MINOR_ISSUES)
  const hasPursuits = candidate.poursuitesStatus && 
                      (candidate.poursuitesStatus === 'MAJOR_ISSUES' || 
                       candidate.poursuitesStatus === 'MINOR_ISSUES');
  
  const isRisky = solvencyScore < 50 || effortRate > 35 || hasPursuits;

  // Analyse intelligente du risque (Orientée SIGNAUX, sans chiffres bruts)
  const getRiskSignals = () => {
    const signals = [];
    
    // 1. Signal Financier (Capacité) - EN PREMIER
    if (effortRate > 100) {
      signals.push({ label: "Incapacité Financière Critique", severity: 'CRITICAL', icon: <Ban size={14} /> });
    } else if (effortRate > 35) {
      signals.push({ label: "Surcharge Financière", severity: 'WARNING', icon: <AlertTriangle size={14} /> });
    }
    
    // 2. Signal Administratif (Poursuites) - AU MILIEU
    if (hasPursuits) {
      signals.push({ label: "Poursuites Actives", severity: 'CRITICAL', icon: <ShieldCheck size={14} /> });
    }
    
    // 3. Signal Score (IA) - EN DERNIER
    if (solvencyScore > 0 && solvencyScore < 50) {
      signals.push({ label: "Profil Fragile", severity: 'WARNING', icon: <TrendingUp size={14} /> });
    }
    
    // 4. Signal Complétude (seulement si RIEN d'autre détecté et score = 0)
    if (solvencyScore === 0 && !hasPursuits && effortRate <= 35) {
      signals.push({ label: "Analyse Incomplète", severity: 'NEUTRAL', icon: <FileText size={14} /> });
    }
    
    // Si aucun signal négatif majeur
    if (signals.length === 0 && solvencyScore >= 50) {
      signals.push({ label: "Dossier Solide", severity: 'SUCCESS', icon: <CheckCircle2 size={14} /> });
    }
    
    return signals;
  };

  // Déterminer le verdict final (Simplifié pour le Micro-HUD)
  const getVerdict = () => {
    // DÉFAVORABLE : Poursuites majeures OU incapacité financière OU score très bas
    if (candidate.poursuitesStatus === 'MAJOR_ISSUES' || effortRate > 100 || solvencyScore < 30) {
      return { label: 'DÉFAVORABLE', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: <Ban size={12} /> };
    }
    // VIGILANCE : Poursuites mineures OU taux élevé OU score moyen
    if (candidate.poursuitesStatus === 'MINOR_ISSUES' || effortRate > 35 || (solvencyScore > 0 && solvencyScore < 50)) {
      return { label: 'VIGILANCE', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <AlertTriangle size={12} /> };
    }
    return { label: 'FAVORABLE', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <CheckCircle2 size={12} /> };
  };

  // Mock Smart Re-Match (Opportunité Cross-Selling)
  // Si le candidat a un bon revenu mais n'est pas sur ce bien, on propose un autre bien
  const smartMatchOpportunity = income > 8000 ? {
    id: 'opp-1',
    title: 'Loft Eaux-Vives',
    matchScore: 96,
    rent: 3200,
    reason: 'Revenus compatibles (34% taux effort) et recherche secteur lac.'
  } : null;

  // Mock Documents (Swiss Safe)
  const documents = [
    { id: 1, name: 'Extrait des Poursuites', status: candidate.poursuitesStatus === 'ALERTE' ? 'INVALID' : 'VALID', date: '05.02.2026' },
    { id: 2, name: 'Fiche Salaire (Jan)', status: 'VALID', date: '01.02.2026' },
    { id: 3, name: 'Fiche Salaire (Déc)', status: 'VALID', date: '01.01.2026' },
    { id: 4, name: 'Pièce d\'Identité', status: 'VALID', date: '12.01.2026' },
    { id: 5, name: 'Attestation RC', status: 'MISSING', date: '-' },
  ];

  const handleEmailAction = () => {
    if (candidate.email) {
      navigate(`/inbox?search=${encodeURIComponent(candidate.email)}`);
      toast.info(`Recherche des échanges avec ${candidate.firstName}...`);
    } else {
      toast.error("Aucun email renseigné pour ce candidat");
    }
  };

  const handleRequestDocument = (docName) => {
    toast.success(`Demande pour "${docName}" envoyée par email à ${candidate.firstName}`);
  };

  const handleSendInvite = () => {
    if (!selectedSlot) {
      toast.error("Veuillez sélectionner un créneau de visite.");
      return;
    }
    toast.success(`Invitation envoyée à ${candidate.firstName} pour le ${selectedSlot}`);
    setShowScheduler(false);
  };

  const handleSmartMatch = () => {
    toast.success(`Dossier de ${candidate.firstName} dupliqué vers "${smartMatchOpportunity.title}" !`);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-zinc-900/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panneau Coulissant */}
      <div className={`
        fixed top-2 bottom-2 right-2 w-full md:w-[520px] bg-white z-50 shadow-2xl rounded-2xl border border-zinc-100 overflow-hidden flex flex-col
        transition-transform duration-300 ease-out transform
        ${isOpen ? 'translate-x-0' : 'translate-x-[110%]'}
      `}>
        
        {/* HEADER: Identité & Contact */}
        <div className="relative bg-white border-b border-zinc-50 p-6 pb-0 shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-zinc-50 border border-zinc-100 flex items-center justify-center text-2xl font-bold text-indigo-900 shadow-sm shrink-0">
              {candidate.firstName?.[0]}{candidate.lastName?.[0]}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-zinc-900 truncate">
                  {candidate.firstName} {candidate.lastName}
                </h2>
                {candidate.isRisky && (
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider rounded border border-rose-100">
                    Alerte
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-1 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-zinc-400" />
                  <span className="truncate select-all">{candidate.email || "email@non-renseigne.com"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-zinc-400" />
                  <span className="select-all">{candidate.phone || "+41 7X XXX XX XX"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS RAPIDES (Modifiées pour Chronos) */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button 
              onClick={() => setShowScheduler(!showScheduler)} 
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-colors text-xs font-bold ${showScheduler ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-100 text-zinc-600'}`}
            >
              <Calendar size={16} /> {showScheduler ? 'Annuler' : 'Visite'}
            </button>
            <button onClick={handleEmailAction} className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 text-xs font-bold text-zinc-600 transition-colors">
              <Mail size={16} /> Email
            </button>
            <button onClick={() => toast.info("Appel lancé...")} className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 text-xs font-bold text-zinc-600 transition-colors">
              <Phone size={16} /> Appeler
            </button>
          </div>

          {/* ONGLETS DE NAVIGATION */}
          {!showScheduler && (
            <div className="flex gap-6 border-b border-zinc-100">
              <button 
                onClick={() => setActiveTab('profil')}
                className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'profil' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                Vue d'ensemble
                {activeTab === 'profil' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('documents')}
                className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'documents' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                Swiss Safe (Docs)
                {activeTab === 'documents' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('smart-match')}
                className={`pb-3 text-sm font-bold transition-colors relative flex items-center gap-2 ${activeTab === 'smart-match' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                Smart Match
                <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">2</span>
                {activeTab === 'smart-match' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
              </button>
            </div>
          )}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto bg-white p-6 space-y-8 relative">
          
          {/* --- MODULE CHRONOS EXPRESS --- */}
          {showScheduler ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900">Chronos Express</h3>
                    <p className="text-xs text-indigo-600">Planifiez une visite en 1 clic</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Créneaux Disponibles (Suggérés par IA)</label>
                <div className="grid grid-cols-1 gap-3">
                  {['Mardi 11 Fév • 14:00 - 14:15', 'Mardi 11 Fév • 14:15 - 14:30', 'Jeudi 13 Fév • 09:00 - 09:15'].map((slot, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-xl border text-left transition-all ${selectedSlot === slot ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600' : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600'}`}
                    >
                      <span className="font-bold text-sm block">{slot}</span>
                      <span className="text-xs opacity-70">Visite groupée (5 participants max)</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <button 
                    onClick={handleSendInvite}
                    className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Envoyer l'invitation
                  </button>
                  <p className="text-center text-[10px] text-zinc-400 mt-3">
                    Un lien sécurisé sera envoyé par SMS et Email au candidat.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* --- SMART RE-MATCH BANNER --- */}
              {activeTab === 'profil' && smartMatchOpportunity && (
                <div className="bg-gradient-to-r from-zinc-900 to-indigo-900 rounded-2xl p-5 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform" onClick={handleSmartMatch}>
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Sparkles size={80} />
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <ArrowRightLeft size={20} className="text-indigo-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-indigo-100 uppercase tracking-wide">Opportunité Détectée</h4>
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          {smartMatchOpportunity.matchScore}% Match
                        </span>
                      </div>
                      <p className="font-bold text-lg mb-1">{smartMatchOpportunity.title}</p>
                      <p className="text-indigo-200 text-xs leading-relaxed mb-3">
                        {smartMatchOpportunity.reason}
                      </p>
                      <button className="bg-white text-indigo-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-indigo-50 transition-colors">
                        <Copy size={12} /> Dupliquer le dossier vers ce bien
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VUE PROFIL */}
              {activeTab === 'profil' && (
                <>
                  {/* Stats Financières */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Revenu Net</p>
                      <p className="text-base font-bold text-zinc-900">
                        {income > 0 ? `${income.toLocaleString('fr-CH')}.-` : 'Non déclaré'}
                      </p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Taux d'effort</p>
                      <p className={`text-base font-bold ${effortRate > 35 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {effortRate > 0 ? `${effortRate}%` : '-'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden ${isRisky ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                      <div className="absolute inset-0 opacity-10">
                        <ShieldCheck size={60} className="absolute -right-2 -bottom-2" />
                      </div>
                      <p className="text-[10px] uppercase tracking-wider font-bold mb-0 z-10">Score IA</p>
                      <p className="text-xl font-black z-10">{solvencyScore}/100</p>
                    </div>
                  </div>

                  {/* Détails Pro */}
                  <section>
                    <h3 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                      <Briefcase size={14} />
                      Situation
                    </h3>
                    <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm grid grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <p className="text-[10px] text-zinc-400 font-medium mb-1">Profession</p>
                        <p className="text-sm font-medium text-zinc-900">{candidate.jobType || "Non déclaré"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 font-medium mb-1">Employeur</p>
                        <p className="text-sm font-medium text-zinc-900">{candidate.employer || "Non déclaré"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 font-medium mb-1">État Civil</p>
                        <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-zinc-600 text-xs font-bold">
                          {candidate.civilStatus || "SINGLE"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* ANALYSE IA - MICRO-HUD (Site Online Version) */}
                  <section>
                    <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-50 border border-zinc-100 shadow-sm">
                            <Sparkles size={18} className="text-indigo-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 leading-none mb-1">SolvencyScore™</span>
                            <span className="text-sm font-bold text-zinc-900">Analyse de Risque</span>
                          </div>
                        </div>
                        
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black tracking-wide shadow-sm ${getVerdict().color}`}>
                          {getVerdict().icon}
                          {getVerdict().label}
                        </div>
                      </div>

                      {/* SIGNAUX IA (Bento Style) */}
                      <div className="flex gap-2.5 mb-5">
                        {getRiskSignals().map((signal, idx) => (
                          <div 
                            key={idx} 
                            className={`
                              flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all whitespace-nowrap
                              ${signal.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                signal.severity === 'WARNING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                signal.severity === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                'bg-zinc-50 text-zinc-500 border-zinc-200'}
                            `}
                          >
                            <span className="opacity-80">{signal.icon}</span>
                            {signal.label}
                          </div>
                        ))}
                      </div>

                      {/* VERDICT SEMANTIQUE */}
                      <div className="relative pl-4 border-l-2 border-zinc-100 py-1 mb-6">
                        <p className="text-[13px] text-zinc-500 leading-relaxed font-medium italic">
                          "{candidate.aiReason || "Dossier en cours d'analyse."}"
                        </p>
                      </div>

                      {/* ACTION RECOMMANDÉE - Redesign Bouton Rouge Vif (Image 2) */}
                      <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Action Recommandée</span>
                         <button 
                            className={`
                              flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black text-white transition-all transform active:scale-95 shadow-md
                              ${getVerdict().label === 'DÉFAVORABLE' ? 'bg-[#E11D48] hover:bg-[#BE123C] shadow-rose-200' : 
                                getVerdict().label === 'VIGILANCE' ? 'bg-[#D97706] hover:bg-[#B45309] shadow-amber-200' : 
                                'bg-zinc-900 hover:bg-black shadow-zinc-200'}
                            `}
                         >
                            {getVerdict().label === 'DÉFAVORABLE' ? <Ban size={14} strokeWidth={3} /> : 
                             getVerdict().label === 'VIGILANCE' ? <User size={14} strokeWidth={3} /> : 
                             <CheckCircle2 size={14} strokeWidth={3} />}
                            
                            {getVerdict().label === 'DÉFAVORABLE' ? 'Rejet immédiat' : 
                             getVerdict().label === 'VIGILANCE' ? 'Demander Garant' : 
                             'Procéder au bail'}
                            <ChevronRight size={14} strokeWidth={3} className="opacity-70 ml-1" />
                         </button>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* VUE SWISS SAFE (DOCUMENTS) */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-sm font-bold text-indigo-900">Coffre-fort Swiss Safe</h4>
                      <p className="text-xs text-indigo-700 mt-1">
                        Les documents sont stockés de manière sécurisée (AES-256). Seul l'agent assigné peut les consulter.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl hover:border-zinc-200 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            doc.status === 'VALID' ? 'bg-emerald-50 text-emerald-600' :
                            doc.status === 'INVALID' ? 'bg-rose-50 text-rose-600' :
                            'bg-zinc-100 text-zinc-400'
                          }`}>
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900">{doc.name}</p>
                            <p className="text-xs text-zinc-400">Ajouté le {doc.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {doc.status === 'MISSING' ? (
                            <button 
                              onClick={() => handleRequestDocument(doc.name)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 flex items-center gap-1.5"
                            >
                              <Send size={12} /> Demander
                            </button>
                          ) : (
                            <div className="flex gap-1">
                              <button className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                <Eye size={16} />
                              </button>
                              <button className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                <Download size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 mt-4 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 text-sm font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                    <UploadCloud size={18} />
                    Ajouter un document manuellement
                  </button>
                </div>
              )}

              {/* VUE SMART MATCH */}
              {activeTab === 'smart-match' && (
                <div className="space-y-4">
                  {/* Header Opportunités Cross-Selling */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🤝</div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 mb-1">Opportunités Cross-Selling</h4>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          L'IA a détecté que le profil de {candidate.firstName} correspond fortement à d'autres biens de votre portefeuille. Ne passez pas ce dessus!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-indigo-500" />
                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Suggestions IA</h5>
                  </div>

                  {/* Liste de Cartes Horizontales */}
                  <div className="space-y-3">
                    {/* Carte 1 - Loft Eaux-Vives */}
                    <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center gap-3 p-3">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=100" 
                            alt="Loft"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h6 className="font-bold text-sm text-zinc-900 truncate">Loft Eaux-Vives</h6>
                            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded ml-2 shrink-0">
                              96% MATCH
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 font-medium mb-2">2200 CHF/mois</p>
                          <button className="bg-zinc-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1">
                            <Eye size={11} /> Proposer ce bien
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Carte 2 - Studio Gare Cornavin */}
                    <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center gap-3 p-3">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=100" 
                            alt="Studio"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h6 className="font-bold text-sm text-zinc-900 truncate">Studio Gare Cornavin</h6>
                            <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded ml-2 shrink-0">
                              62% MATCH
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 font-medium mb-2">1800 CHF/mois</p>
                          <button className="bg-zinc-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1">
                            <Eye size={11} /> Proposer ce bien
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Actions */}
        {!showScheduler && (
          <div className="p-4 border-t border-zinc-100 bg-white shrink-0 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
            <button className="p-3 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
              <MoreHorizontal size={20} />
            </button>
            <button className="flex-1 py-3 bg-white border border-rose-100 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors text-sm">
              Refuser
            </button>
            <button className="flex-1 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 shadow-lg shadow-zinc-900/10 transition-transform active:scale-95 text-sm flex items-center justify-center gap-2">
              Voir Fiche Complète <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// --- COMPOSANT UI: CARTE (Optimisé) ---

const PropertyThumbnail = ({ property }) => {
  if (!property) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold border border-amber-100/50 w-full hover:bg-amber-100 transition-colors cursor-pointer">
        <AlertTriangle size={12} />
        <span>À Assigner</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-2 py-1.5 bg-zinc-50 rounded-lg border border-zinc-100/50 w-full group-hover:bg-zinc-100 transition-colors">
      <div className="w-8 h-8 rounded-md bg-zinc-200 overflow-hidden shrink-0 relative">
        {property.image ? (
          <img src={property.image} className="w-full h-full object-cover" alt="miniature" />
        ) : (
          <Building2 size={14} className="text-zinc-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-zinc-700 truncate">{property.title}</p>
        <p className="text-[9px] text-zinc-400 truncate">{property.rent} CHF</p>
      </div>
    </div>
  );
};

const CandidateCard = ({ candidate, index, showPropertyContext, onClick }) => {
  const application = candidate.applications?.[0] || {};
  const property = application.property;
  const income = candidate.income || 0;
  
  const rent = property?.rent || 0;
  const coverageRatio = rent > 0 ? (income / rent).toFixed(1) : null;
  const isHealthy = coverageRatio && coverageRatio >= 3.0;

  return (
    <Draggable draggableId={String(candidate.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          onClick={() => onClick(candidate)}
          className={`
            group relative bg-white rounded-2xl p-3.5 mb-3
            border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]
            hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-indigo-100
            transition-all duration-300 ease-out cursor-grab active:cursor-grabbing
            ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 z-50 ring-2 ring-indigo-500/20' : ''}
          `}
        >
          <div className="absolute -top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-20">
            <button className="w-7 h-7 bg-white rounded-full shadow-md border border-zinc-100 flex items-center justify-center text-zinc-500 hover:text-indigo-600 hover:scale-110 transition-transform">
              <Phone size={12} />
            </button>
            <button className="w-7 h-7 bg-white rounded-full shadow-md border border-zinc-100 flex items-center justify-center text-zinc-500 hover:text-indigo-600 hover:scale-110 transition-transform">
              <Mail size={12} />
            </button>
          </div>

          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-white border border-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-900 shadow-sm">
                  {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                </div>
                {candidate.aiScore && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${candidate.aiScore > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-white animate-pulse`} />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 leading-none">
                  {candidate.firstName} {candidate.lastName}
                </h4>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-zinc-400 font-medium bg-zinc-50 px-1.5 py-0.5 rounded">
                    {new Date(candidate.createdAt).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' })}
                  </span>
                  {coverageRatio && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isHealthy ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                      x{coverageRatio}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showPropertyContext && (
            <div className="mt-3 pt-3 border-t border-zinc-50/50">
              <PropertyThumbnail property={property} />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

// --- PAGE PRINCIPALE ---

const PipelinePageV2 = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('global'); 
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState(null);
  
  const COLUMNS = {
    nouveaux: { id: 'nouveaux', title: 'Flux Entrant', subtitle: 'À traiter', statuses: ['NEW', 'TO_QUALIFY'], color: 'text-indigo-600' },
    visites: { id: 'visites', title: 'Visites', subtitle: 'Agenda', statuses: ['VISIT_SCHEDULED', 'VISIT_DONE'], color: 'text-purple-600' },
    dossier: { id: 'dossier', title: 'Analyse', subtitle: 'Dossiers complets', statuses: ['DOSSIER_INCOMPLETE', 'DOSSIER_PENDING', 'DOSSIER_READY'], color: 'text-amber-600' },
    decision: { id: 'decision', title: 'Closing', subtitle: 'Décision finale', statuses: ['TRANSMITTED', 'UNDER_REVIEW', 'RETAINED'], color: 'text-emerald-600' },
  };

  const COLUMN_ORDER = ['nouveaux', 'visites', 'dossier', 'decision'];

  const handleCardClick = (candidate) => {
    setActiveCandidate(candidate);
    setDrawerOpen(true);
  };

  // Fonction de chargement des candidats (réutilisable)
  const loadCandidates = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des candidats depuis l\'API...');
      
      const response = await fetch(`${API_URL}/api/candidates`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📥 Réponse API:', result);
      
      if (result.success && result.data) {
        // Mapper les données API vers le format attendu par le Pipeline
        const mappedCandidates = result.data.map(candidate => {
          const latestProfile = candidate.solvencyProfiles?.[0];
          const latestApplication = candidate.applications?.[0];
          
          return {
            id: candidate.id,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email,
            phone: candidate.phone || 'N/A',
            income: candidate.monthlyIncome || 0,
            createdAt: candidate.createdAt,
            aiScore: latestProfile?.solvencyScore || 0,
            isRisky: (latestProfile?.solvencyScore || 0) < 50,
            jobType: latestProfile?.occupation || 'N/A',
            employer: latestProfile?.employerName || 'N/A',
            civilStatus: candidate.applicantType || 'SINGLE',
            poursuitesStatus: latestProfile?.pursuitsStatus || 'NOT_CHECKED',
            aiReason: latestProfile?.scoreJustification || "Dossier en cours d'analyse.",
            applications: candidate.applications?.map(app => ({
              id: app.id,
              status: app.status,
              property: app.property ? {
                id: app.property.id,
                title: app.property.address || app.property.name || 'Bien immobilier',
                rent: app.property.monthlyRent || 0,
                address: `${app.property.address}, ${app.property.postalCode} ${app.property.city}`,
                image: app.property.imageUrl || null
              } : null
            })) || []
          };
        });
        
        console.log(`✅ ${mappedCandidates.length} candidats chargés`);
        setCandidates(mappedCandidates);
      } else {
        console.warn('⚠️ Aucun candidat trouvé dans la réponse API');
        setCandidates([]);
      }
    } catch (error) {
      console.error('❌ Erreur de chargement des candidats:', error);
      toast.error('Impossible de charger les candidats');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // CHARGEMENT INITIAL
  useEffect(() => {
    loadCandidates();
  }, []);

  // ÉCOUTE DE L'ÉVÉNEMENT "candidateAdded" (depuis l'Inbox)
  useEffect(() => {
    const handleCandidateAdded = (event) => {
      console.log('🎉 Nouveau candidat détecté depuis l\'Inbox:', event.detail);
      toast.info('🔄 Mise à jour du Pipeline...');
      loadCandidates(); // Recharger la liste
    };

    window.addEventListener('candidateAdded', handleCandidateAdded);
    
    return () => {
      window.removeEventListener('candidateAdded', handleCandidateAdded);
    };
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newStatus = COLUMNS[result.destination.droppableId.split('::').pop()].statuses[0];
    setCandidates(prev => prev.map(c => String(c.id) === result.draggableId ? { ...c, applications: [{...c.applications[0], status: newStatus}] } : c));
    toast.success("Statut mis à jour");
  };

  const renderGlobalView = () => (
    <div className="flex h-full overflow-x-auto pb-4 gap-4 px-4 md:px-8">
      {COLUMN_ORDER.map(colId => {
        const column = COLUMNS[colId];
        const colCandidates = candidates.filter(c => {
          const status = c.applications?.[0]?.status || 'NEW';
          return column.statuses.includes(status);
        });

        return (
          <div key={colId} className="flex-shrink-0 w-80 flex flex-col h-full">
            <div className={`mb-3 flex items-center justify-between px-1`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-widest ${column.color}`}>{column.title}</span>
                <span className="bg-zinc-200/50 text-zinc-500 px-1.5 py-0.5 rounded text-[10px] font-bold">{colCandidates.length}</span>
              </div>
            </div>
            <Droppable droppableId={`global::${colId}`}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 rounded-xl transition-colors duration-200 -mx-2 px-2 ${snapshot.isDraggingOver ? 'bg-zinc-100/50' : ''}`}>
                  {colCandidates.map((c, idx) => (
                    <CandidateCard key={c.id} candidate={c} index={idx} showPropertyContext={true} onClick={handleCardClick} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        );
      })}
    </div>
  );

  const renderPropertyView = () => {
    const groups = {};
    candidates.forEach(c => {
      const prop = c.applications?.[0]?.property;
      const key = prop ? prop.id : 'orphans';
      if (!groups[key]) groups[key] = { meta: prop || { title: 'Flux Entrant (Non assigné)', address: 'Email / Tel', rent: 0 }, candidates: [] };
      groups[key].candidates.push(c);
    });

    return (
      <div className="px-4 md:px-8 space-y-8 pb-12">
        {Object.values(groups).map((group, gIdx) => (
          <div key={gIdx} className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-50 bg-zinc-50/30 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {group.meta.image ? (
                  <img src={group.meta.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="bien" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><AlertTriangle /></div>
                )}
                <div>
                  <h3 className="font-bold text-zinc-900">{group.meta.title}</h3>
                  <p className="text-xs text-zinc-500">{group.meta.address}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 divide-x divide-zinc-50">
              {COLUMN_ORDER.map(colId => {
                const colCandidates = group.candidates.filter(c => {
                  const status = c.applications?.[0]?.status || 'NEW';
                  return COLUMNS[colId].statuses.includes(status);
                });
                return (
                  <Droppable key={colId} droppableId={`prop-${gIdx}::${colId}`}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className={`min-h-[150px] p-3 ${snapshot.isDraggingOver ? 'bg-indigo-50/30' : ''}`}>
                        {colCandidates.map((c, idx) => (
                          <CandidateCard key={c.id} candidate={c} index={idx} showPropertyContext={false} onClick={handleCardClick} />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="h-screen flex flex-col bg-[#F7F8FA] font-sans overflow-hidden">
      <div className="h-16 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Pipeline</h1>
          <div className="bg-zinc-100/80 p-1 rounded-lg flex gap-1">
            <button onClick={() => setViewMode('global')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex gap-2 transition-all ${viewMode === 'global' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}><List size={14}/> Flux</button>
            <button onClick={() => setViewMode('property')} className={`px-3 py-1.5 rounded-md text-xs font-bold flex gap-2 transition-all ${viewMode === 'property' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}><LayoutGrid size={14}/> Biens</button>
          </div>
        </div>
        <button className="bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 transition-transform active:scale-95">+ Nouveau</button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pt-6">
        <DragDropContext onDragEnd={onDragEnd}>
          {viewMode === 'global' ? renderGlobalView() : <div className="h-full overflow-y-auto">{renderPropertyView()}</div>}
        </DragDropContext>
      </div>

      <PipelineDrawer 
        candidate={activeCandidate} 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
    </div>
  );
};

export default PipelinePageV2;
