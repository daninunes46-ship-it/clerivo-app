import React, { useState } from 'react';
import { UserPlus, MapPin, DollarSign, Phone, Activity, BrainCircuit, Check, Loader2 } from 'lucide-react';
import SmartBadge from './SmartBadge';
import { toast } from 'sonner';

// 🌐 URL API : Utilise la variable d'environnement ou chemin relatif (proxy)
const API_URL = import.meta.env.VITE_API_URL || '';

const EmailAnalysisCard = ({ analysis, loading, emailData }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Helper : Construction de notes enrichies à partir de l'analyse IA
  const buildEnrichedNotes = (summary, entities) => {
    const parts = [
      '🤖 Lead capturé automatiquement depuis l\'Inbox',
      '',
      '📝 Résumé IA:',
      summary || 'N/A',
      ''
    ];

    if (entities) {
      parts.push('📊 Informations extraites:');
      
      if (entities.budget) parts.push(`• Budget/Revenu mentionné: ${entities.budget}`);
      if (entities.location) parts.push(`• Localisation: ${entities.location}`);
      if (entities.phone) parts.push(`• Téléphone: ${entities.phone}`);
      if (entities.intent) parts.push(`• Intention: ${entities.intent}`);
    }

    return parts.join('\n');
  };

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
    // Guard : Si déjà ajouté, ne rien faire
    if (added) {
      console.log('✅ Candidat déjà marqué comme ajouté, action ignorée.');
      return;
    }

    setAdding(true);

    try {
        console.log('🚀 Début de l\'ajout au CRM...');
        console.log('📊 Données IA disponibles:', { entities, summary });
        
        // ═══════════════════════════════════════════════════════════════
        // EXTRACTION INTELLIGENTE DU NOM (avec gestion des formats suisses)
        // ═══════════════════════════════════════════════════════════════
        let firstName = 'Inconnu';
        let lastName = 'N/A';
        
        const fullName = entities?.client_name || emailData?.from || 'Inconnu';
        
        // Split intelligent : gère "M. Dupont Jean", "Jean Dupont", "DUPONT Jean"
        const nameParts = fullName
          .replace(/^(M\.|Mme|Mlle|Mr|Mrs|Ms)\.?\s*/i, '') // Retire les titres
          .trim()
          .split(/\s+/); // Split sur espaces multiples
        
        if (nameParts.length >= 2) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else if (nameParts.length === 1) {
          firstName = nameParts[0];
          lastName = 'N/A';
        }
        
        // ═══════════════════════════════════════════════════════════════
        // EXTRACTION INTELLIGENTE DU REVENU (multi-formats)
        // ═══════════════════════════════════════════════════════════════
        let monthlyIncome = null;
        
        // Sources possibles : entities.budget, entities.income, ou mention dans summary
        const budgetSources = [
          entities?.budget,
          entities?.income,
          entities?.salary
        ].filter(Boolean);
        
        for (const source of budgetSources) {
          if (!source) continue;
          
          // Regex pour extraire les montants (formats suisses) :
          // "2400", "2'400", "2.400", "CHF 2400", "2400 CHF", "2400.-"
          const match = source.match(/(\d[\d'\.\s]*\d|\d+)(?:\s*(?:CHF|Fr\.?|francs?))?/i);
          
          if (match) {
            // Nettoyer : supprimer espaces, apostrophes, points (séparateurs suisses)
            const cleanNumber = match[1].replace(/['.\s]/g, '');
            const parsedNumber = parseInt(cleanNumber, 10);
            
            // Validation : Revenu mensuel raisonnable (entre 1000 et 50'000 CHF)
            if (parsedNumber >= 1000 && parsedNumber <= 50000) {
              monthlyIncome = parsedNumber;
              console.log(`💰 Revenu extrait: ${monthlyIncome} CHF (source: "${source}")`);
              break;
            }
            
            // Si le nombre est trop grand (ex: "800k" = 800'000), c'est probablement un budget achat
            // On ignore et on laisse null pour que l'agent complète
            if (parsedNumber > 50000) {
              console.log(`⚠️ Montant trop élevé ignoré: ${parsedNumber} (probablement un budget achat)`);
            }
          }
        }
        
        // ═══════════════════════════════════════════════════════════════
        // CONSTRUCTION DU PAYLOAD ENRICHI
        // ═══════════════════════════════════════════════════════════════
        const payload = {
            firstName,
            lastName,
            email: emailData?.email || 'no-email@detected.com',
            phone: entities?.phone || null,
            monthlyIncome: monthlyIncome,
            currentCity: entities?.location || null, // Ajout de la localisation
            notes: buildEnrichedNotes(summary, entities), // Notes enrichies
            status: 'NEW'
        };

        console.log('📤 Envoi du payload enrichi:', payload);

        // Appel API avec timeout de sécurité
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(`${API_URL}/api/candidates`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('📥 Réponse API - Status:', response.status);

        // 1. GÉRER LE CAS 409 (DOUBLON) EN PRIORITÉ
        if (response.status === 409) {
            console.log('ℹ️ Candidat déjà existant (409)');
            setAdded(true);
            
            // Toast sécurisé avec délai pour éviter conflit DOM
            setTimeout(() => {
                toast.info("⚠️ Candidat déjà existant", {
                    description: "Ce contact est déjà présent dans le pipeline.",
                    duration: 3000
                });
            }, 100);
            
            return; // STOP ICI - Succès UX
        }

        // 2. GÉRER LES AUTRES ERREURS HTTP
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur HTTP:', response.status, errorText);
            throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        // 3. PARSER LA RÉPONSE JSON
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('❌ Erreur parsing JSON:', parseError);
            throw new Error('Réponse API invalide');
        }

        console.log('✅ Réponse parsée:', data);

        // 4. VALIDER LE SUCCÈS
        if (data.success) {
            setAdded(true);
            
            // Toast de succès avec délai
            setTimeout(() => {
                toast.success("✅ Candidat ajouté au Pipeline !", {
                    description: `${firstName} ${lastName} est dans la colonne "Nouveaux".`,
                    duration: 4000
                });
            }, 100);
        } else {
            throw new Error(data.message || 'Erreur inconnue');
        }

    } catch (err) {
        console.error("❌ ERREUR handleAddToCRM:", err);
        
        // Gestion spécifique des erreurs réseau
        if (err.name === 'AbortError') {
            console.error('⏱️ Timeout de la requête');
            setTimeout(() => {
                toast.error("Timeout", {
                    description: "Le serveur met trop de temps à répondre.",
                    duration: 3000
                });
            }, 100);
        } else {
            setTimeout(() => {
                toast.error("❌ Erreur d'ajout", {
                    description: err.message || "Impossible de contacter le serveur.",
                    duration: 4000
                });
            }, 100);
        }
        
        // NE PAS marquer comme ajouté en cas d'erreur
        // setAdded reste à false pour permettre un nouvel essai
    } finally {
        setAdding(false);
        console.log('🏁 Fin du processus d\'ajout');
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
