import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, AlertTriangle, CheckCircle, FileText, 
  Mail, Phone, MapPin, UploadCloud, Clock, Calendar, 
  Download, Eye, MoreHorizontal, UserCheck, Briefcase, Loader2, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// 🌐 URL API : Utilise la variable d'environnement ou proxy Vite
const API_URL = import.meta.env.VITE_API_URL || '';

// ============================================================================
// MOCK DATA (Pour valider le design & les cas d'usage Suisse)
// ============================================================================
const MOCK_CANDIDATES = {
  'demo-1': {
    id: 'demo-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+41 79 123 45 67',
    avatar: null, // Initials JD
    
    // Contexte Immo
    property: { name: 'Appartement 3.5 pièces', address: 'Av. de la Gare 14, 1003 Lausanne', rent: 2450 },
    status: 'DOSSIER_READY',
    
    // Profil Suisse
    permitType: 'Permis C (Établissement)',
    nationality: 'Suisse',
    maritalStatus: 'Célibataire',
    
    // Financier
    employmentType: 'CDI',
    employer: 'Nestlé Suisse SA',
    monthlyIncome: 8500, // CHF
    guarantor: null, // Pas de garant nécessaire
    
    // Swiss Safe - Solvency
    solvencyScore: 95,
    solvencyRating: 'EXCELLENT',
    pursuitsStatus: 'CLEAN',
    
    // Swiss Safe - Documents
    documents: [
      { id: 1, name: 'Extrait Registre Poursuites', type: 'PDF', date: '01.02.2026', status: 'VALID', isSwissKey: true },
      { id: 2, name: 'Pièce d\'identité (ID)', type: 'JPG', date: '01.02.2026', status: 'VALID', isSwissKey: true },
      { id: 3, name: 'Fiches salaire (3 derniers mois)', type: 'PDF', date: '01.02.2026', status: 'VALID', isSwissKey: true },
      { id: 4, name: 'Police Assurance RC', type: 'PDF', date: '15.01.2025', status: 'VALID', isSwissKey: true },
    ],
    
    // Communications (Timeline)
    timeline: [
      { id: 1, type: 'EMAIL_RECEIVED', date: 'Aujourd\'hui 09:15', title: 'Re: Visite confirmée', content: 'Merci pour la confirmation. Je serai présent à 14h.' },
      { id: 2, type: 'STATUS_CHANGE', date: 'Hier 18:30', title: 'Dossier complet', content: 'Le dossier est passé au statut "Prêt".' },
      { id: 3, type: 'EMAIL_SENT', date: 'Hier 14:00', title: 'Invitation visite', content: 'Bonjour Jean, suite à votre demande...' },
    ]
  },
  
  'demo-2': {
    id: 'demo-2',
    firstName: 'Pierre',
    lastName: 'Morel',
    email: 'pierre.morel@hotmail.com',
    phone: '+41 78 999 88 77',
    avatar: null,
    
    property: { name: 'Studio Centre', address: 'Rue du Midi 4, 1003 Lausanne', rent: 1100 },
    status: 'DOSSIER_PENDING',
    
    permitType: 'Permis B (Renouvellement en cours)',
    nationality: 'Française',
    maritalStatus: 'Divorcé',
    
    employmentType: 'CDD (6 mois)',
    employer: 'StartUp Immo',
    monthlyIncome: 4200,
    guarantor: { name: 'Michel Morel (Père)', status: 'VALIDATED' },
    
    // Swiss Safe - Alertes
    solvencyScore: 45,
    solvencyRating: 'RISKY',
    pursuitsStatus: 'MAJOR_ISSUES', // Alerte Poursuites
    
    documents: [
      { id: 1, name: 'Extrait Registre Poursuites', type: 'PDF', date: '10.01.2026', status: 'INVALID', isSwissKey: true, alert: 'Montant ouvert: 2\'500 CHF' },
      { id: 2, name: 'Permis de séjour B', type: 'JPG', date: '01.02.2026', status: 'VALID', isSwissKey: true },
      { id: 3, name: 'Fiches salaire', type: 'PDF', date: '-', status: 'MISSING', isSwissKey: true },
    ],
    
    timeline: [
      { id: 1, type: 'NOTE', date: 'Hier 10:00', title: 'Appel téléphonique', content: 'Le candidat indique que les poursuites sont une erreur administrative.' },
      { id: 2, type: 'EMAIL_RECEIVED', date: '03.02.2026', title: 'Candidature Studio', content: 'Bonjour, je vous envoie mon dossier...' },
    ]
  }
};

/**
 * CandidateDetailPage - "Golden Record"
 * Vue unifiée Data + Docs + Comms
 */
const CandidateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profil'); // profil | swiss-safe | comms
  
  // États API
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // États pour le menu Action
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const actionMenuRef = useRef(null);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setIsActionMenuOpen(false);
      }
    };
    
    if (isActionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionMenuOpen]);

  // 🔍 Debug: Log de l'ID au chargement
  useEffect(() => {
    console.log('🆔 CandidateDetailPage - ID depuis URL:', id);
    console.log('🆔 Type:', typeof id, '| Valide:', !!id && id !== 'undefined');
  }, [id]);

  // Charger les données du candidat
  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchCandidate();
    } else {
      console.error('❌ ID invalide, impossible de charger le candidat');
      setError('ID candidat invalide');
      setLoading(false);
    }
  }, [id]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/candidates/${id}`);
      
      if (!response.ok) {
        throw new Error('Candidat non trouvé');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Mapper les données API vers le format UI
        const mappedCandidate = mapCandidateFromAPI(data.data);
        setCandidate(mappedCandidate);
      } else {
        throw new Error(data.message || 'Erreur API');
      }
    } catch (err) {
      console.error("Erreur fetch candidate:", err);
      setError(err.message);
      // Fallback sur mock si erreur (pour la démo)
      setCandidate(MOCK_CANDIDATES['demo-1']);
    } finally {
      setLoading(false);
    }
  };

  // Mapper les données API vers le format UI attendu
  const mapCandidateFromAPI = (apiData) => {
    const latestProfile = apiData.solvencyProfiles?.[0];
    const latestApplication = apiData.applications?.[0];
    
    return {
      id: apiData.id,
      firstName: apiData.firstName,
      lastName: apiData.lastName,
      email: apiData.email,
      phone: apiData.phone || 'N/A',
      avatar: null,
      
      property: latestApplication?.property ? {
        name: latestApplication.property.name,
        address: latestApplication.property.fullAddress || 'Adresse non spécifiée',
        rent: latestApplication.property.rentMonthly || 0
      } : { name: 'Recherche générale', address: 'N/A', rent: 0 },
      
      status: latestApplication?.status || 'NEW',
      
      permitType: apiData.permitType || 'Non déclaré',
      nationality: apiData.residencyStatus === 'SWISS_NATIONAL' ? 'Suisse' : apiData.residencyStatus || 'Non déclaré',
      maritalStatus: apiData.applicantType || 'Non déclaré',
      
      employmentType: latestProfile?.employmentType || 'N/A',
      employer: latestProfile?.employerName || 'N/A',
      monthlyIncome: apiData.monthlyIncome || 0,
      guarantor: apiData.guarantors?.[0] ? { 
        name: `${apiData.guarantors[0].firstName} ${apiData.guarantors[0].lastName}`, 
        status: 'VALIDATED' 
      } : null,
      
      solvencyScore: latestProfile?.solvencyScore || 0,
      solvencyRating: getSolvencyRating(latestProfile?.solvencyScore || 0),
      pursuitsStatus: latestProfile?.pursuitsStatus || 'NOT_CHECKED',
      
      documents: (apiData.documents || []).map(doc => ({
        id: doc.id,
        name: doc.originalName,
        type: doc.mimeType?.includes('pdf') ? 'PDF' : 'JPG',
        date: new Date(doc.createdAt).toLocaleDateString('fr-FR'),
        status: doc.validationStatus,
        isSwissKey: doc.isSwissOfficial
      })),
      
      timeline: buildTimeline(apiData)
    };
  };

  const getSolvencyRating = (score) => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'BON';
    if (score >= 40) return 'MOYEN';
    return 'RISKY';
  };

  const buildTimeline = (apiData) => {
    const timeline = [];
    
    // Ajouter les événements de candidature
    if (apiData.applications?.[0]?.events) {
      apiData.applications[0].events.forEach(event => {
        timeline.push({
          id: event.id,
          type: event.eventType,
          date: new Date(event.createdAt).toLocaleString('fr-FR'),
          title: event.description || event.eventType,
          content: event.details || ''
        });
      });
    }
    
    // Ajouter les messages email
    if (apiData.applications?.[0]?.threads?.[0]?.messages) {
      apiData.applications[0].threads[0].messages.forEach(msg => {
        timeline.push({
          id: `msg-${msg.id}`,
          type: msg.direction === 'INBOUND' ? 'EMAIL_RECEIVED' : 'EMAIL_SENT',
          date: new Date(msg.receivedAt || msg.sentAt).toLocaleString('fr-FR'),
          title: msg.subject,
          content: msg.body?.substring(0, 150) + '...' || ''
        });
      });
    }
    
    return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Upload de document
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    try {
      setUploading(true);
      
      // 🛡️ SÉCURITÉ : Vérifier que l'ID candidat existe
      console.log('🔍 ID Candidat:', id);
      console.log('🔍 Type ID:', typeof id, 'Valeur:', id);
      
      if (!id || id === 'undefined' || id === 'null') {
        toast.error("Erreur: ID candidat introuvable", {
          description: "Impossible d'uploader sans ID candidat valide"
        });
        console.error('❌ ID candidat manquant ou invalide:', id);
        return;
      }
      
      // Validation taille et type
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 10MB`);
      }
      
      // Construction de l'URL en relatif (proxy Vite)
      const uploadUrl = `/api/candidates/${id}/documents`;
      
      console.log('📤 Upload Infos:', {
        candidateId: id,
        fileName: file.name,
        fileType: file.type,
        fileSize: `${(file.size / 1024).toFixed(1)}KB`
      });
      console.log('🎯 URL Cible:', uploadUrl);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'OTHER'); // On peut améliorer ça plus tard
      formData.append('description', `Uploadé depuis l'interface le ${new Date().toLocaleDateString('fr-FR')}`);
      
      console.log('📦 FormData créé, envoi en cours...');
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
        // NE PAS mettre Content-Type, le navigateur le génère automatiquement avec boundary
      });
      
      console.log('📊 Response Status:', response.status, response.statusText);
      console.log('📋 Response Headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });
      
      // 🛡️ Gestion robuste de la réponse
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // Réponse JSON normale
        data = await response.json();
      } else {
        // Réponse non-JSON (HTML d'erreur ou texte brut)
        const textResponse = await response.text();
        console.error('❌ Réponse non-JSON:', textResponse.substring(0, 500));
        throw new Error(`Erreur serveur (${response.status}): ${textResponse.substring(0, 100)}`);
      }
      
      // Vérifier le succès
      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (data.success) {
        console.log('✅ Upload réussi:', data.data);
        toast.success('Document uploadé avec succès !');
        // Rafraîchir les données du candidat
        fetchCandidate();
      } else {
        throw new Error(data.message || 'Erreur upload');
      }
    } catch (err) {
      console.error('❌ Erreur upload complète:', err);
      toast.error(`Erreur d'upload: ${err.message}`, {
        duration: 5000,
        description: 'Vérifiez la console pour plus de détails'
      });
    } finally {
      setUploading(false);
    }
  };

  // Gestion du drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SUPPRESSION DU CANDIDAT (avec confirmation)
  // ═══════════════════════════════════════════════════════════════
  const handleDeleteCandidate = async () => {
    // Confirmation utilisateur (native pour la V1)
    const confirmed = window.confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\n` +
      `Êtes-vous sûr de vouloir supprimer le candidat "${candidate.firstName} ${candidate.lastName}" ?\n\n` +
      `Cette action supprimera :\n` +
      `• Le profil candidat\n` +
      `• L'application associée (soft delete)\n` +
      `• Les documents (conservation DataVault)\n\n` +
      `Cette action est IRRÉVERSIBLE.`
    );
    
    if (!confirmed) {
      console.log('❌ Suppression annulée par l\'utilisateur');
      setIsActionMenuOpen(false);
      return;
    }
    
    try {
      setIsDeleting(true);
      setIsActionMenuOpen(false);
      
      console.log('🗑️ Début suppression candidat:', id);
      
      // Appel API DELETE
      const response = await fetch(`${API_URL}/api/candidates/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Réponse DELETE:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Candidat supprimé:', data.data);
        
        // Toast de succès
        toast.success('Candidat supprimé avec succès', {
          description: `${candidate.firstName} ${candidate.lastName} a été supprimé du système.`,
          duration: 4000
        });
        
        // Redirection immédiate vers le Pipeline
        setTimeout(() => {
          navigate('/pipeline', { replace: true });
        }, 500);
        
      } else {
        throw new Error(data.message || 'Échec de la suppression');
      }
      
    } catch (err) {
      console.error('❌ ERREUR SUPPRESSION:', err);
      
      toast.error('Erreur de suppression', {
        description: err.message || 'Impossible de supprimer le candidat.',
        duration: 5000
      });
      
      setIsDeleting(false);
    }
  };

  // Affichage loading
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-10 flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="animate-spin" size={32} />
          <p>Chargement du candidat...</p>
        </div>
      </div>
    );
  }

  // Affichage erreur
  if (error && !candidate) {
    return (
      <div className="max-w-6xl mx-auto pb-10 flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertTriangle size={32} />
          <p>Erreur : {error}</p>
          <button 
            onClick={() => navigate('/pipeline')} 
            className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-sm hover:bg-zinc-200 transition-colors"
          >
            Retour au Pipeline
          </button>
        </div>
      </div>
    );
  }

  if (!candidate) return null;

  // Helpers UI
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 border-emerald-500 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 border-amber-500 bg-amber-50';
    return 'text-red-600 border-red-500 bg-red-50';
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 font-sans text-zinc-900 animate-in fade-in duration-300">
      
      {/* HEADER DE NAVIGATION */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/pipeline')}
          className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{candidate.firstName} {candidate.lastName}</h1>
            {candidate.pursuitsStatus === 'CLEAN' ? (
               <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                 <Shield size={10} /> SWISS SAFE
               </span>
            ) : (
               <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                 <AlertTriangle size={10} /> ALERTES
               </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 flex items-center gap-1.5">
            <Briefcase size={12} /> Dossier pour <span className="font-medium text-zinc-900">{candidate.property.name}</span>
          </p>
        </div>
        
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 text-zinc-700 shadow-sm">
             <Mail size={16} /> Contacter
          </button>
          
          {/* Menu Action Déroulant */}
          <div className="relative" ref={actionMenuRef}>
            <button 
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              disabled={isDeleting}
              className={`
                flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium shadow-sm transition-all
                ${isDeleting 
                  ? 'bg-zinc-300 border-zinc-300 text-zinc-500 cursor-not-allowed' 
                  : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
                }
              `}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <MoreHorizontal size={16} />
                  Actions
                </>
              )}
            </button>
            
            {/* Dropdown Menu */}
            {isActionMenuOpen && !isDeleting && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-zinc-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={handleDeleteCandidate}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600 font-medium"
                >
                  <Trash2 size={16} />
                  Supprimer le candidat
                </button>
                
                {/* Séparateur */}
                <div className="h-px bg-zinc-100 my-1"></div>
                
                {/* Autres actions futures */}
                <button
                  disabled
                  className="w-full px-4 py-2 text-left text-sm text-zinc-400 cursor-not-allowed flex items-center gap-2"
                >
                  <Clock size={16} />
                  Archiver (V1.1)
                </button>
                <button
                  disabled
                  className="w-full px-4 py-2 text-left text-sm text-zinc-400 cursor-not-allowed flex items-center gap-2"
                >
                  <Download size={16} />
                  Exporter PDF (V1.1)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HERO SECTION - SCORE & INFO CLÉS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Carte de Gauche: Identité & Contact */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
               <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-xl font-bold text-zinc-400">
                  {candidate.firstName[0]}{candidate.lastName[0]}
               </div>
               <div>
                 <h2 className="text-lg font-bold">Candidat {candidate.nationality}</h2>
                 <div className="flex flex-col gap-1 mt-1">
                   <div className="flex items-center gap-2 text-sm text-zinc-600">
                     <Mail size={14} className="text-zinc-400" /> {candidate.email}
                   </div>
                   <div className="flex items-center gap-2 text-sm text-zinc-600">
                     <Phone size={14} className="text-zinc-400" /> {candidate.phone}
                   </div>
                   <div className="flex items-center gap-2 text-sm text-zinc-600">
                     <MapPin size={14} className="text-zinc-400" /> {candidate.property.address}
                   </div>
                 </div>
               </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-500 mb-1">Revenu Mensuel</div>
              <div className="text-xl font-bold text-zinc-900">CHF {candidate.monthlyIncome.toLocaleString('fr-CH')}.-</div>
              <div className="text-xs text-zinc-400">Loyer cible: CHF {candidate.property.rent}.-</div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
             <div className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-600">
               {candidate.permitType}
             </div>
             <div className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-600">
               {candidate.maritalStatus}
             </div>
             {candidate.guarantor && (
               <div className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100 text-xs font-medium text-purple-700 flex items-center gap-1">
                 <UserCheck size={12} /> Garant: {candidate.guarantor.name}
               </div>
             )}
          </div>
        </div>

        {/* Carte de Droite: Solvency Score */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent opacity-50"></div>
          
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Solvency Score</h3>
          
          <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold shadow-sm mb-2 ${getScoreColor(candidate.solvencyScore)}`}>
            {candidate.solvencyScore}
          </div>
          
          <div className={`text-sm font-bold ${candidate.solvencyScore >= 60 ? 'text-emerald-600' : 'text-red-600'}`}>
             {candidate.solvencyRating}
          </div>
          
          {candidate.pursuitsStatus !== 'CLEAN' && (
             <div className="mt-3 text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">
               ⚠️ Poursuites Détectées
             </div>
          )}
        </div>
      </div>

      {/* TABS NAVIGATION (Apple Segmented Style) */}
      <div className="mb-6 border-b border-zinc-200">
        <div className="flex gap-8">
          {['profil', 'swiss-safe', 'comms'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                pb-3 text-sm font-medium transition-all relative
                ${activeTab === tab ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}
              `}
            >
              {tab === 'profil' && 'Profil & Situation'}
              {tab === 'swiss-safe' && 'Swiss Safe (Documents)'}
              {tab === 'comms' && 'Communications'}
              
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[300px] animate-in slide-in-from-bottom-2 duration-300">
        
        {/* --- ONGLET 1: PROFIL --- */}
        {activeTab === 'profil' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <Briefcase size={18} className="text-zinc-400" /> Situation Professionnelle
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-sm text-zinc-500">Employeur</span>
                    <span className="text-sm font-medium">{candidate.employer}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-sm text-zinc-500">Type de contrat</span>
                    <span className="text-sm font-medium">{candidate.employmentType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-sm text-zinc-500">Revenu Net Mensuel</span>
                    <span className="text-sm font-bold text-emerald-600">CHF {candidate.monthlyIncome}.-</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-sm text-zinc-500">Taux d'effort (Loyer/Revenu)</span>
                    <span className={`text-sm font-bold ${(candidate.property.rent / candidate.monthlyIncome) > 0.33 ? 'text-orange-500' : 'text-zinc-900'}`}>
                      {Math.round((candidate.property.rent / candidate.monthlyIncome) * 100)}%
                    </span>
                  </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-zinc-400" /> Garanties & Sécurité
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-sm text-zinc-500">Extrait des poursuites</span>
                    {candidate.pursuitsStatus === 'CLEAN' ? (
                       <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">VIERGE</span>
                    ) : (
                       <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">ALERTE</span>
                    )}
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-sm text-zinc-500">Permis de séjour</span>
                    <span className="text-sm font-medium">{candidate.permitType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-50">
                    <span className="text-sm text-zinc-500">Assurance RC</span>
                    <span className="text-sm font-medium flex items-center gap-1 text-zinc-600">
                      <CheckCircle size={12} className="text-emerald-500" /> Vérifiée
                    </span>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* --- ONGLET 2: SWISS SAFE (DOCUMENTS) --- */}
        {activeTab === 'swiss-safe' && (
           <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
             {/* Drag & Drop Zone (Fonctionnel) */}
             <div 
               className={`border-b border-zinc-100 p-6 flex flex-col items-center justify-center border-dashed border-2 m-4 rounded-xl transition-all cursor-pointer group relative ${
                 isDragging 
                   ? 'bg-indigo-50 border-indigo-400' 
                   : uploading 
                   ? 'bg-zinc-100 border-zinc-300' 
                   : 'bg-zinc-50/50 border-zinc-200 hover:bg-indigo-50/50 hover:border-indigo-200'
               }`}
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               onClick={() => !uploading && document.getElementById('fileInput').click()}
             >
                <input 
                  id="fileInput"
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileInputChange}
                  disabled={uploading}
                />
                
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin text-indigo-500 mb-2" size={24} />
                    <p className="text-sm font-medium text-zinc-700">Upload en cours...</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                       <UploadCloud size={20} className="text-indigo-500" />
                    </div>
                    <p className="text-sm font-medium text-zinc-700">Glissez-déposez des fichiers ici ou cliquez</p>
                    <p className="text-xs text-zinc-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                  </>
                )}
             </div>

             {/* Liste des documents */}
             <div className="divide-y divide-zinc-50">
                {candidate.documents.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                     <div className="flex items-center gap-4">
                        {/* Icone Type */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] ${doc.type === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                           {doc.type}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                             <h4 className="text-sm font-medium text-zinc-900">{doc.name}</h4>
                             {doc.isSwissKey && <Shield size={12} className="text-indigo-400" title="Pièce officielle requise" />}
                           </div>
                           <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                              <span>Ajouté le {doc.date}</span>
                              {doc.alert && (
                                <span className="text-red-600 font-medium flex items-center gap-1">
                                   • {doc.alert}
                                </span>
                              )}
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        {doc.status === 'VALID' && (
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">Validé</span>
                        )}
                        {doc.status === 'INVALID' && (
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-wide">Rejeté</span>
                        )}
                        {doc.status === 'MISSING' && (
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">Manquant</span>
                        )}

                        <div className="flex gap-1">
                          <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded"><Eye size={16} /></button>
                          <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded"><Download size={16} /></button>
                          <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded"><MoreHorizontal size={16} /></button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           </div>
        )}

        {/* --- ONGLET 3: COMMUNICATIONS --- */}
        {activeTab === 'comms' && (
           <div className="space-y-6 max-w-3xl">
              {candidate.timeline.map((event, idx) => (
                 <div key={event.id} className="flex gap-4 relative">
                    {/* Ligne verticale */}
                    {idx !== candidate.timeline.length - 1 && (
                      <div className="absolute left-[19px] top-8 bottom-[-24px] w-[2px] bg-zinc-100"></div>
                    )}

                    {/* Icone Event */}
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-white border border-zinc-200 flex items-center justify-center z-10 shadow-sm">
                       {event.type.includes('EMAIL') && <Mail size={16} className="text-zinc-500" />}
                       {event.type === 'STATUS_CHANGE' && <CheckCircle size={16} className="text-emerald-500" />}
                       {event.type === 'NOTE' && <FileText size={16} className="text-amber-500" />}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                       <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-zinc-900">{event.title}</h4>
                          <span className="text-xs text-zinc-400 font-medium">{event.date}</span>
                       </div>
                       <p className="text-sm text-zinc-600 leading-relaxed">
                          {event.content}
                       </p>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetailPage;
