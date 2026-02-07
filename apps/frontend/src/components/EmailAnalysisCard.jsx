import React, { useState } from 'react';
import { UserPlus, MapPin, DollarSign, Phone, Activity, BrainCircuit, Check, Loader2 } from 'lucide-react';
import SmartBadge from './SmartBadge';
import { toast } from 'sonner';

// 🌐 URL API : Utilise la variable d'environnement ou chemin relatif (proxy)
const API_URL = import.meta.env.VITE_API_URL || '';

const EmailAnalysisCard = ({ analysis, loading, emailData }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // ═════════════════════════════════════════════════════════════════════
  // HELPER : Construction de notes enrichies (100% SAFE)
  // ═════════════════════════════════════════════════════════════════════
  const buildEnrichedNotes = (summary, entities) => {
    try {
      const parts = [
        '🤖 Lead capturé automatiquement depuis l\'Inbox',
        '',
        '📝 Résumé IA:',
        String(summary || 'N/A'),
        ''
      ];

      if (entities && typeof entities === 'object') {
        parts.push('📊 Informations extraites:');
        
        if (entities.budget) parts.push(`• Budget/Revenu: ${entities.budget}`);
        if (entities.location) parts.push(`• Localisation: ${entities.location}`);
        if (entities.phone) parts.push(`• Téléphone: ${entities.phone}`);
        if (entities.intent) parts.push(`• Intention: ${entities.intent}`);
      }

      return parts.join('\n');
    } catch (err) {
      console.error('⚠️ Erreur buildEnrichedNotes:', err);
      return '🤖 Lead capturé depuis l\'Inbox';
    }
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
    return null;
  }

  const { classification, sentiment, entities, summary } = analysis;

  // ═════════════════════════════════════════════════════════════════════
  // HANDLER : Ajout au CRM (ULTRA-SÉCURISÉ, ANTI-CRASH)
  // ═════════════════════════════════════════════════════════════════════
  const handleAddToCRM = async () => {
    // Guard 1 : Déjà ajouté
    if (added) {
      console.log('✅ Candidat déjà ajouté, action ignorée.');
      return;
    }

    setAdding(true);

    try {
        console.log('🚀 Début de l\'ajout au CRM...');
        console.log('📊 Données IA:', { entities, summary, emailData });
        
        // ───────────────────────────────────────────────────────────────
        // EXTRACTION NOM (100% SAFE)
        // ───────────────────────────────────────────────────────────────
        let firstName = 'Inconnu';
        let lastName = 'N/A';
        
        try {
          const rawName = entities?.client_name || emailData?.from || '';
          
          // Sécurité : Vérifier que c'est bien une string
          if (typeof rawName === 'string' && rawName.length > 0) {
            // Retirer les titres et nettoyer
            const cleanName = rawName
              .replace(/^(M\.|Mme|Mlle|Mr\.?|Mrs\.?|Ms\.?)\s*/gi, '')
              .trim();
            
            if (cleanName) {
              const parts = cleanName.split(/\s+/).filter(p => p.length > 0);
              
              if (parts.length >= 2) {
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
              } else if (parts.length === 1) {
                firstName = parts[0];
                lastName = 'N/A';
              }
            }
          }
        } catch (nameError) {
          console.error('⚠️ Erreur extraction nom:', nameError);
          // Fallback : garder les valeurs par défaut
        }
        
        console.log(`👤 Nom extrait: ${firstName} ${lastName}`);
        
        // ───────────────────────────────────────────────────────────────
        // EXTRACTION REVENU (FORMATS SUISSES ROBUSTES)
        // ───────────────────────────────────────────────────────────────
        // Formats supportés :
        // - "7500" / "7500 CHF" / "CHF 7500"
        // - "7'500" / "7'500 CHF" (apostrophe séparateur de milliers)
        // - "7.500" / "7.500 CHF" (point séparateur de milliers)
        // - "7 500" / "7 500 CHF" (espace séparateur)
        // - "7'500.-" / "7'500.–" (notation bancaire suisse)
        // ───────────────────────────────────────────────────────────────
        let monthlyIncome = null;
        
        try {
          // Sources possibles (avec vérification de type)
          const sources = [
            entities?.budget,
            entities?.income,
            entities?.salary,
            entities?.revenue, // Parfois l'IA utilise ce champ
            entities?.monthlyIncome // Ou celui-ci
          ];
          
          console.log('🔍 Scanning income sources:', sources.filter(Boolean));
          
          for (const source of sources) {
            // Guard : Vérifier que c'est une string
            if (!source || typeof source !== 'string') continue;
            
            console.log(`   📊 Analysing: "${source}"`);
            
            // ─────────────────────────────────────────────────────────
            // ÉTAPE 1 : EXTRACTION DU MONTANT (avec tous les séparateurs)
            // ─────────────────────────────────────────────────────────
            // Regex ultra-permissive : capture n'importe quel groupe de chiffres
            // avec séparateurs optionnels (apostrophe, point, espace)
            // Exemples matchés : "7'500", "7.500", "7 500", "7500"
            const match = source.match(/(\d[\d'\.\s]*\d|\d+)/);
            
            if (match && match[1]) {
              const rawNumber = match[1];
              console.log(`      → Montant brut capturé: "${rawNumber}"`);
              
              // ─────────────────────────────────────────────────────────
              // ÉTAPE 2 : NETTOYAGE (supprimer TOUS les séparateurs)
              // ─────────────────────────────────────────────────────────
              // On supprime : apostrophes ('), points (.), espaces, tirets (.-)
              // On garde : UNIQUEMENT les chiffres
              const cleaned = rawNumber
                .replace(/['.\s\-–]/g, '') // Supprimer séparateurs suisses
                .replace(/[^\d]/g, '');     // Supprimer tout ce qui n'est pas un chiffre
              
              console.log(`      → Montant nettoyé: "${cleaned}"`);
              
              // ─────────────────────────────────────────────────────────
              // ÉTAPE 3 : CONVERSION & VALIDATION
              // ─────────────────────────────────────────────────────────
              const number = parseInt(cleaned, 10);
              
              if (isNaN(number)) {
                console.log(`      ✗ NaN après parsing`);
                continue;
              }
              
              console.log(`      → Montant converti: ${number} CHF`);
              
              // Validation : Revenu mensuel plausible (1'000 - 50'000 CHF)
              if (number >= 1000 && number <= 50000) {
                monthlyIncome = number;
                console.log(`      ✅ REVENU VALIDÉ: ${monthlyIncome} CHF (source: "${source}")`);
                break; // On a trouvé, on arrête
              } else if (number > 50000) {
                console.log(`      ⚠️ Montant ${number} CHF ignoré (trop élevé = probablement un budget d'achat immobilier)`);
              } else if (number < 1000) {
                console.log(`      ⚠️ Montant ${number} CHF ignoré (trop faible = probablement une erreur)`);
              }
            } else {
              console.log(`      ✗ Aucun montant détecté dans "${source}"`);
            }
          }
          
          if (monthlyIncome === null) {
            console.log('   ⚠️ Aucun revenu valide extrait des sources disponibles');
          }
        } catch (incomeError) {
          console.error('⚠️ ERREUR CRITIQUE extraction revenu:', incomeError);
          console.error('   Stack:', incomeError.stack);
          // monthlyIncome reste null
        }
        
        // ───────────────────────────────────────────────────────────────
        // CONSTRUCTION PAYLOAD (GARANTIE SANS CRASH)
        // ───────────────────────────────────────────────────────────────
        const payload = {
            firstName: String(firstName),
            lastName: String(lastName),
            email: String(emailData?.email || 'no-email@detected.com'),
            phone: entities?.phone && typeof entities.phone === 'string' ? entities.phone : null,
            monthlyIncome: monthlyIncome,
            currentCity: entities?.location && typeof entities.location === 'string' ? entities.location : null,
            notes: buildEnrichedNotes(summary, entities)
        };

        console.log('📤 Payload final:', payload);

        // ───────────────────────────────────────────────────────────────
        // APPEL API (avec timeout & error handling)
        // ───────────────────────────────────────────────────────────────
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

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

        // ───────────────────────────────────────────────────────────────
        // GESTION DES RÉPONSES (ORDRE CRITIQUE)
        // ───────────────────────────────────────────────────────────────
        
        // 1. CAS 409 (DOUBLON) - PRIORITAIRE
        if (response.status === 409) {
            console.log('ℹ️ Doublon détecté (409)');
            setAdded(true);
            
            setTimeout(() => {
                toast.info("⚠️ Candidat déjà existant", {
                    description: "Ce contact est déjà dans le pipeline.",
                    duration: 3000
                });
            }, 100);
            
            return;
        }

        // 2. AUTRES ERREURS HTTP
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Erreur inconnue');
            console.error('❌ Erreur HTTP:', response.status, errorText);
            throw new Error(`Erreur ${response.status}`);
        }

        // 3. PARSING JSON SÉCURISÉ
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('❌ JSON invalide:', parseError);
            throw new Error('Réponse serveur invalide');
        }

        console.log('✅ Données reçues:', data);

        // 4. SUCCÈS
        if (data.success) {
            setAdded(true);
            
            // Dispatcher un événement global pour notifier le Pipeline
            window.dispatchEvent(new CustomEvent('candidateAdded', { 
              detail: { 
                candidateId: data.data?.id,
                firstName,
                lastName 
              } 
            }));
            
            setTimeout(() => {
                toast.success("✅ Candidat ajouté au Pipeline !", {
                    description: `${firstName} ${lastName} est dans "Nouveaux".`,
                    duration: 4000
                });
            }, 100);
        } else {
            throw new Error(data.message || 'Échec création');
        }

    } catch (err) {
        console.error("❌ ERREUR CRITIQUE handleAddToCRM:", err);
        console.error("Stack:", err.stack);
        
        // Gestion d'erreur gracieuse (jamais de crash)
        if (err.name === 'AbortError') {
            setTimeout(() => {
                toast.error("⏱️ Timeout", {
                    description: "Le serveur met trop de temps à répondre.",
                    duration: 3000
                });
            }, 100);
        } else {
            setTimeout(() => {
                toast.error("❌ Erreur d'ajout", {
                    description: err.message || "Erreur inconnue.",
                    duration: 4000
                });
            }, 100);
        }
    } finally {
        setAdding(false);
        console.log('🏁 Fin du processus');
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
