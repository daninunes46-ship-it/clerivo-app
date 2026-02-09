import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Inbox, Kanban, Users, Calendar, Bell, Search, 
  TrendingUp, ArrowUpRight, CheckCircle2, Clock, MoreHorizontal, 
  FileText, Key, Home, Settings, ChevronRight, Filter, Plus, 
  MapPin, ShieldCheck, Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. CONFIGURATION & PHYSIQUE (Framer Motion) ---

const SPRING_LIGHT = { type: "spring", stiffness: 300, damping: 30 };
const SPRING_BOUNCY = { type: "spring", stiffness: 400, damping: 15 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: SPRING_LIGHT }
};

// --- 2. DONNÉES SUISSES ULTRA-RÉALISTES (Swissification) ---

const SWISS_LOCATIONS = ["Lausanne", "Morges", "Gland", "Nyon", "Renens"];

const MOCK_STATS = {
  'jour': [
    { label: "Leads du jour", value: "4", delta: "+2 vs hier", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Commissions", value: 1250, isCurrency: true, delta: "Validé ce matin", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "À Traiter", value: "3", delta: "Priorité haute", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ],
  'semaine': [
    { label: "Leads Actifs", value: "24", delta: "+12% vs s-1", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Commissions", value: 14850, isCurrency: true, delta: "Prévisionnel", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Dossiers Bloqués", value: "5", delta: "Attente pièces", icon: ShieldCheck, color: "text-red-600", bg: "bg-red-50" },
  ],
  'mois': [
    { label: "Total Leads", value: "86", delta: "+8% vs M-1", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Commissions", value: 42300, isCurrency: true, delta: "Record", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Taux Conversion", value: "18%", delta: "Stable", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  ]
};

const MOCK_TASKS = [
  { id: 1, name: "Mme. Rochat", task: "Contrôle solvabilité (Extrait O.P.)", property: "3.5p - Av. de la Gare 14, Lausanne", time: "09:30", urgent: true },
  { id: 2, name: "M. Weber", task: "Relance attestation R.C. Ménage", property: "Studio - Rue du Lac, Morges", time: "11:15", urgent: false },
  { id: 3, name: "Famille Dubuis", task: "Préparer bail à loyer (Vaud)", property: "Villa 5p - Chemin du Coteau, Gland", time: "14:00", urgent: false },
];

const MOCK_ACTIVITY = [
  { id: 1, title: "Nouveau dossier complet", subtitle: "M. Sébastien Kuenzi • Villa Montreux", time: "10:42", type: "new", location: "Montreux" },
  { id: 2, title: "Garantie SwissCaution reçue", subtitle: "Dossier #4829 - Apt Lausanne", time: "09:15", type: "success", location: "Lausanne" },
  { id: 3, title: "État des lieux sortant", subtitle: "Confirmé pour le 15.03 à 14h", time: "Hier", type: "todo", location: "Renens" },
  { id: 4, title: "Email envoyé à la Régie", subtitle: "Objet: Travaux peinture cuisine", time: "Hier", type: "sent", location: "Nyon" },
];

// Formatteur CHF
const formatCHF = (amount) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(amount);

// --- 3. COMPOSANTS UI PREMIUM ---

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ x: 4, backgroundColor: "rgba(241, 245, 249, 1)" }}
    whileTap={{ scale: 0.98 }}
    className={`
      flex items-center px-3 py-3 mx-3 mb-1 rounded-xl cursor-pointer transition-colors relative group
      ${active ? 'bg-indigo-50/80 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-900'}
    `}
  >
    <Icon size={20} className={`z-10 relative transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={active ? 2.5 : 2} />
    {!collapsed && (
      <motion.span 
        initial={{ opacity: 0, x: -10 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="ml-3 text-sm tracking-wide z-10 relative"
      >
        {label}
      </motion.span>
    )}
    {active && (
      <motion.div 
        layoutId="active-pill" 
        className="absolute inset-0 bg-indigo-50 rounded-xl z-0"
        transition={SPRING_LIGHT}
      />
    )}
    {active && !collapsed && (
      <motion.div 
        layoutId="active-dot" 
        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-600" 
      />
    )}
  </motion.div>
);

const GlassCard = ({ children, className = "", onClick, noHover = false }) => (
  <motion.div
    variants={itemVariants}
    whileHover={!noHover ? { y: -4, boxShadow: "0 12px 30px -8px rgba(99, 102, 241, 0.15)" } : undefined}
    onClick={onClick}
    className={`
      bg-white/70 backdrop-blur-xl rounded-[24px] border border-white/60
      shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]
      transition-shadow duration-300 relative overflow-hidden
      ${className}
    `}
  >
    {/* Subtle gradient noise overlay for texture */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat z-0" />
    <div className="relative z-10 h-full">{children}</div>
  </motion.div>
);

const TaskRow = ({ task, onToggle }) => {
  const [checked, setChecked] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className={`
        p-4 rounded-2xl flex items-center justify-between group cursor-pointer border border-transparent
        ${checked ? 'bg-slate-50' : 'hover:bg-white hover:border-indigo-100 hover:shadow-sm'}
        transition-all duration-200
      `}
      onClick={() => { setChecked(!checked); onToggle(task.id); }}
    >
      <div className="flex items-center gap-4">
        <motion.div 
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
            ${checked ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 group-hover:border-indigo-400'}
          `}
          whileTap={{ scale: 0.8 }}
        >
          {checked && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 size={14} className="text-white" /></motion.div>}
        </motion.div>
        
        <div className={`transition-opacity duration-300 ${checked ? 'opacity-40' : 'opacity-100'}`}>
          <h4 className={`text-sm font-bold text-slate-800 ${checked ? 'line-through' : ''}`}>
            {task.name} <span className="font-normal text-slate-500">• {task.task}</span>
          </h4>
          <div className="flex items-center text-xs text-slate-500 mt-0.5">
            <MapPin size={10} className="mr-1" />
            {task.property}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {task.urgent && !checked && (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
            <Clock size={10} className="mr-1" /> Urgent
          </span>
        )}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
          <ChevronRight size={18} />
        </div>
      </div>
    </motion.div>
  );
};

// --- 4. APP PRINCIPALE ---

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('semaine');
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Simulation de données dynamiques basées sur le filtre temporel
  const currentStats = MOCK_STATS[timeFilter];

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        body { font-family: 'Montserrat', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* --- SIDEBAR (Fixed & Clean) --- */}
      <motion.aside 
        initial={{ x: -100 }} 
        animate={{ x: 0 }} 
        transition={SPRING_LIGHT}
        className="w-72 bg-white/80 backdrop-blur-2xl h-full border-r border-white/50 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      >
        <div className="h-24 flex items-center px-8">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 text-xl"
          >
            C
          </motion.div>
          <span className="ml-4 font-bold text-xl tracking-tight text-slate-800">Clerivo</span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto hide-scrollbar">
          <div className="px-8 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Principal</div>
          <SidebarItem icon={LayoutDashboard} label="Tableau de bord" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Inbox} label="Messagerie" active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
          <SidebarItem icon={Kanban} label="Pipeline Location" active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} />
          <SidebarItem icon={Users} label="Candidats" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
          
          <div className="px-8 mt-8 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestion</div>
          <SidebarItem icon={FileText} label="Baux & Contrats" />
          <SidebarItem icon={Key} label="États des lieux" />
          <SidebarItem icon={Calendar} label="Agenda Visites" />
        </nav>

        <div className="p-6 border-t border-slate-100/50">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 cursor-pointer">
             <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://ui-avatars.com/api/?name=Daniel+Nunes&background=6366f1&color=fff" alt="User" />
             </div>
             <div className="ml-3">
               <p className="text-sm font-bold text-slate-800">Daniel Nunes</p>
               <p className="text-[10px] text-slate-500 font-medium">Agence Gland</p>
             </div>
             <Settings size={16} className="ml-auto text-slate-400" />
          </motion.div>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Abstract Background Blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-300/20 rounded-full blur-[100px] pointer-events-none" />

        {/* --- HEADER (Glassmorphic) --- */}
        <header className="h-24 px-8 flex items-center justify-between z-20 sticky top-0">
          <div className="flex flex-col">
            <motion.h2 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
              className="text-2xl font-bold text-slate-800 tracking-tight"
            >
              {activeTab === 'dashboard' ? 'Vue d\'ensemble' : 'Messagerie'}
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-xs text-slate-500 font-medium mt-1">
              {new Date().toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </motion.p>
          </div>
          
          <div className="flex items-center space-x-5">
            {/* Interactive Search */}
            <motion.div 
              animate={{ width: searchFocused ? 320 : 240, borderColor: searchFocused ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.0)' }}
              className="bg-white/60 backdrop-blur-md shadow-sm border border-white rounded-full px-4 py-2.5 flex items-center transition-all"
            >
              <Search size={18} className={`mr-3 ${searchFocused ? 'text-indigo-500' : 'text-slate-400'}`} />
              <input 
                type="text" 
                placeholder="Recherche (Cmd+K)" 
                className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </motion.div>
            
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative p-3 bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-white text-slate-500 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#4f46e5" }} 
              whileTap={{ scale: 0.95 }} 
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 text-sm font-semibold flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Nouveau dossier</span>
            </motion.button>
          </div>
        </header>

        {/* --- SCROLLABLE DASHBOARD CONTENT --- */}
        <motion.div 
          className="flex-1 overflow-y-auto px-8 pb-12 pt-2 hide-scrollbar z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* HERO SECTION */}
            <motion.div variants={itemVariants} className="relative rounded-[32px] overflow-hidden p-10 text-white shadow-2xl shadow-indigo-500/20 group">
              {/* Dynamic Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
              <motion.div 
                className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" 
                animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              />
              
              {/* Decorative Shapes */}
              <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-50px] right-[-50px] w-80 h-80 bg-white/10 rounded-full blur-3xl"
              />

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold mb-4 text-indigo-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                    Système Opérationnel • Gland, CH
                  </div>
                  <h1 className="text-4xl font-bold mb-3 tracking-tight">Bonjour, Daniel.</h1>
                  <p className="text-indigo-100 text-lg max-w-xl leading-relaxed opacity-90">
                    Le marché est actif. Vous avez <span className="font-bold text-white border-b border-white/30">3 nouvelles candidatures complètes</span> prêtes pour analyse ce matin.
                  </p>
                </div>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold text-sm transition-colors border border-white/20">
                    Agenda
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold text-sm shadow-xl flex items-center">
                    Voir les opportunités
                    <ArrowUpRight size={18} className="ml-2" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* FILTERS & STATS */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Indicateurs Clés</h3>
                <div className="bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-white/50 flex shadow-sm">
                  {(['jour', 'semaine', 'mois']).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeFilter(t)}
                      className={`
                        px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${timeFilter === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                      `}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatePresence mode='wait'>
                  {currentStats.map((stat, idx) => (
                    <GlassCard key={`${timeFilter}-${idx}`}>
                      <div className="p-6 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</span>
                          <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={20} />
                          </div>
                        </div>
                        <div>
                          <motion.div 
                            key={stat.value} // Trigger animation on value change
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-slate-800 tracking-tight"
                          >
                            {stat.isCurrency ? formatCHF(stat.value) : stat.value}
                          </motion.div>
                          <div className={`text-xs font-bold mt-2 inline-flex items-center px-2 py-1 rounded-md ${
                            stat.delta.includes('+') || stat.delta === 'Record' ? 'text-emerald-600 bg-emerald-50' : 
                            stat.delta.includes('Priorité') || stat.delta.includes('Bloqués') ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50'
                          }`}>
                            {stat.delta}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* SPLIT VIEW: TASKS & ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* TASKS (Interactive) */}
              <div className="lg:col-span-2 space-y-4">
                <motion.div variants={itemVariants} className="flex justify-between items-end px-1">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    Tâches Prioritaires <span className="bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">3</span>
                  </h3>
                  <button className="text-xs text-indigo-600 font-bold hover:underline">Tout voir</button>
                </motion.div>
                
                <GlassCard className="min-h-[300px]" noHover>
                  <div className="p-2 space-y-1">
                    {MOCK_TASKS.map((task) => (
                      <TaskRow key={task.id} task={task} onToggle={(id) => console.log('Toggle', id)} />
                    ))}
                    {/* Add Task Button */}
                    <motion.button 
                      whileHover={{ backgroundColor: "rgba(248, 250, 252, 1)" }}
                      className="w-full py-3 flex items-center justify-center text-sm font-medium text-slate-400 border border-dashed border-slate-200 rounded-xl hover:border-indigo-300 hover:text-indigo-500 transition-colors mt-2"
                    >
                      <Plus size={16} className="mr-2" /> Ajouter une tâche rapide
                    </motion.button>
                  </div>
                </GlassCard>
              </div>

              {/* ACTIVITY FEED */}
              <div className="lg:col-span-1 space-y-4">
                <motion.div variants={itemVariants} className="flex justify-between items-end px-1">
                  <h3 className="text-lg font-bold text-slate-800">Fil d'Activité</h3>
                  <button className="p-1 hover:bg-slate-200 rounded-lg transition-colors"><Filter size={16} className="text-slate-500" /></button>
                </motion.div>

                <GlassCard className="h-full" noHover>
                  <div className="p-6">
                    <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                      {MOCK_ACTIVITY.map((item, idx) => (
                        <div key={item.id} className="relative pl-8 group cursor-pointer">
                          {/* Dot */}
                          <div className={`
                            absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125
                            ${item.type === 'new' ? 'bg-indigo-500' : item.type === 'success' ? 'bg-emerald-500' : item.type === 'todo' ? 'bg-amber-500' : 'bg-slate-400'}
                          `} />
                          
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{item.time}</span>
                            <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{item.subtitle}</p>
                            <div className="flex items-center mt-2">
                              <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100 flex items-center">
                                <MapPin size={8} className="mr-1" /> {item.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                    <button className="w-full py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      Voir tout l'historique
                    </button>
                  </div>
                </GlassCard>
              </div>

            </div>

          </div>
        </motion.div>

      </main>
    </div>
  );
}
