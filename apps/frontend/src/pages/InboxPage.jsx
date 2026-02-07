import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Star, Reply, MoreHorizontal, Paperclip, Mail as MailIcon, Loader2, AlertCircle, Send, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

import EmailAnalysisCard from '../components/EmailAnalysisCard';
import SmartBadge from '../components/SmartBadge';

// 🌐 URL API : Utilise la variable d'environnement ou proxy Vite
const API_URL = import.meta.env.VITE_API_URL || '';

// #region agent log
fetch('http://localhost:7242/ingest/f6bc3034-93fd-46ad-989f-26889a413c45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InboxPage.jsx:11',message:'API_URL initialized',data:{API_URL,VITE_API_URL:import.meta.env.VITE_API_URL,allEnvVars:import.meta.env},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,D'})}).catch(()=>{});
// #endregion

const InboxPage = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour l'analyse IA
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // États pour la réponse
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);


  const fetchEmails = async () => {
    try {
      setLoading(true);
      // #region agent log
      const fullUrl = `${API_URL}/api/emails`;
      fetch('http://localhost:7242/ingest/f6bc3034-93fd-46ad-989f-26889a413c45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InboxPage.jsx:37',message:'About to fetch emails',data:{API_URL,fullUrl,windowOrigin:window.location.origin},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      const response = await fetch(fullUrl);
      
      // #region agent log
      fetch('http://localhost:7242/ingest/f6bc3034-93fd-46ad-989f-26889a413c45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InboxPage.jsx:43',message:'Fetch response received',data:{status:response.status,statusText:response.statusText,contentType:response.headers.get('content-type'),url:response.url,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,E'})}).catch(()=>{});
      // #endregion
      
      if (!response.ok) {
        // #region agent log
        const responseText = await response.text();
        fetch('http://localhost:7242/ingest/f6bc3034-93fd-46ad-989f-26889a413c45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InboxPage.jsx:49',message:'Response not OK - captured body',data:{status:response.status,responseText:responseText.substring(0,500),isHTML:responseText.startsWith('<')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,E'})}).catch(()=>{});
        // #endregion
        throw new Error('Erreur réseau lors de la récupération des emails');
      }
      
      const data = await response.json();
      // #region agent log
      fetch('http://localhost:7242/ingest/f6bc3034-93fd-46ad-989f-26889a413c45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InboxPage.jsx:60',message:'JSON parsed successfully',data:{success:data.success,dataLength:data.data?.length,keys:Object.keys(data)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      if (data.success) {
        // Mapper les données API vers le format UI
        const formattedEmails = data.data.map(email => ({
           id: email.id,
           from: email.from ? (email.from.name || email.from.address) : 'Inconnu',
           email: email.from ? email.from.address : '',
           subject: email.subject,
           preview: email.snippet,
           date: new Date(email.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
           unread: email.unread,
           body: email.text || 'Contenu non disponible en format texte.',
           html: email.html,
           color: getColorForSender(email.from ? (email.from.name || email.from.address) : ''),
           ai: email.ai, // Récupération des métadonnées IA si existantes
           hasAttachments: email.hasAttachments || false, // 📎 Indicateur de pièces jointes
           attachments: email.attachments || [] // 📎 Métadonnées des pièces jointes
        }));
        setEmails(formattedEmails);
      } else {
        throw new Error(data.message || 'Erreur API');
      }
    } catch (err) {
      console.error("Erreur fetch emails:", err);
      // #region agent log
      fetch('http://localhost:7242/ingest/f6bc3034-93fd-46ad-989f-26889a413c45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InboxPage.jsx:85',message:'CATCH block - error occurred',data:{errorMessage:err.message,errorName:err.name,errorStack:err.stack?.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmail = (id) => {
    setSelectedEmailId(id);
    setIsReplying(false);
    setReplyBody('');
    setAnalysis(null);

    const email = emails.find(e => e.id === id);
    if (!email) return;

    // Si l'analyse existe déjà dans la liste (cache), on l'utilise
    if (email.ai) {
        setAnalysis(email.ai);
    } else {
        // Sinon, on lance l'analyse (non-bloquant)
        triggerAnalysis(id, email);
    }
  };

  const triggerAnalysis = async (id, email) => {
      setAnalyzing(true);
      try {
          const response = await fetch(`${API_URL}/api/ai/analyze-full`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  id: id,
                  body: email.body,
                  sender: email.from,
                  subject: email.subject
              })
          });
          
          const data = await response.json();
          if (data.success) {
              setAnalysis(data.data);
              // Mise à jour optimiste de la liste pour afficher les badges
              setEmails(prev => prev.map(e => e.id === id ? { ...e, ai: data.data } : e));
          }
      } catch (err) {
          console.error("Erreur analyse IA:", err);
      } finally {
          setAnalyzing(false);
      }
  };


  const getColorForSender = (name) => {
    const colors = [
      'bg-emerald-100 text-emerald-700',
      'bg-indigo-100 text-indigo-700', 
      'bg-amber-100 text-amber-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-rose-100 text-rose-700'
    ];
    let hash = 0;
    if (name) {
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleSendReply = async () => {
    if (!replyBody.trim()) return;
    
    setSending(true);
    try {
        const response = await fetch(`${API_URL}/api/emails/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: selectedEmail.email,
                subject: `Re: ${selectedEmail.subject}`,
                text: replyBody,
            })
        });

        const data = await response.json();

        if (data.success) {
            setReplyBody('');
            setIsReplying(false);
            toast.success("Email envoyé avec succès !");
        } else {
            toast.error("Erreur lors de l'envoi : " + data.message);
        }
    } catch (err) {
        console.error("Erreur envoi:", err);
        toast.error("Erreur réseau lors de l'envoi.");
    } finally {
        setSending(false);
    }
  };

  const handleSmartDraft = async () => {
    if (!selectedEmail) return;

    setIsDrafting(true);
    const toastId = toast.loading("L'IA rédige votre réponse...");

    try {
      const response = await fetch(`${API_URL}/api/ai/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingEmailBody: selectedEmail.body,
          senderName: selectedEmail.from
        })
      });

      const data = await response.json();

      if (response.ok) {
        setReplyBody(data.body);
        toast.dismiss(toastId);
        toast.success("Brouillon généré par l'IA !");
      } else {
        throw new Error(data.error || "Erreur lors de la génération");
      }
    } catch (err) {
      console.error("Erreur Smart Draft:", err);
      toast.dismiss(toastId);
      toast.error("Impossible de générer le brouillon : " + err.message);
    } finally {
      setIsDrafting(false);
    }
  };

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  const filteredEmails = emails.filter(e => 
    e.from.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
      return (
          <div className="h-[calc(100vh-140px)] flex items-center justify-center bg-white rounded-2xl border border-zinc-200 font-sans">
              <div className="flex flex-col items-center gap-3 text-zinc-500">
                  <Loader2 className="animate-spin" size={32} />
                  <p>Chargement de vos messages...</p>
              </div>
          </div>
      );
  }

  if (error) {
      return (
          <div className="h-[calc(100vh-140px)] flex items-center justify-center bg-white rounded-2xl border border-zinc-200 font-sans">
              <div className="flex flex-col items-center gap-3 text-red-500">
                  <AlertCircle size={32} />
                  <p>Erreur : {error}</p>
                  <button onClick={fetchEmails} className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-sm hover:bg-zinc-200 transition-colors">
                      Réessayer
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-140px)] bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex font-sans">
        
        {/* COLONNE GAUCHE : LISTE */}
        <div className={`w-full md:w-1/3 flex flex-col border-r border-zinc-200 ${selectedEmailId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Search Header */}
        <div className="p-4 border-b border-zinc-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Email List Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.length === 0 ? (
             <div className="p-8 text-center text-zinc-400 text-sm">Aucun message trouvé</div>
          ) : (
            filteredEmails.map((email) => (
                <div 
                key={email.id}
                onClick={() => handleSelectEmail(email.id)}
                className={`p-4 border-b border-zinc-100 cursor-pointer transition-colors hover:bg-zinc-50 ${selectedEmailId === email.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                >
                <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                    <span className={`text-sm truncate max-w-[150px] ${email.unread ? 'font-bold text-zinc-900' : 'font-medium text-zinc-700'}`}>
                        {email.from}
                    </span>
                    {email.unread && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>}
                    {/* 📎 Icône Trombone si pièces jointes */}
                    {email.hasAttachments && (
                      <Paperclip size={14} className="text-zinc-400" />
                    )}
                    </div>
                    <span className={`text-xs ${email.unread ? 'text-indigo-600 font-bold' : 'text-zinc-400'}`}>
                    {email.date}
                    </span>
                </div>
                
                <h4 className={`text-sm mb-1 truncate ${email.unread ? 'font-bold text-zinc-900' : 'text-zinc-600'}`}>
                    {email.subject}
                </h4>
                
                <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                    {email.preview}
                </p>
                
                {/* Smart Badges if AI data is available */}
                {email.ai && email.ai.classification && (
                  <div className="flex gap-1.5 mt-1">
                    <SmartBadge type="category" value={email.ai.classification.category} compact />
                    {email.ai.classification.priority === 'Haute' && (
                      <SmartBadge type="priority" value="Haute" compact />
                    )}
                  </div>
                )}
                </div>
            ))
          )}
        </div>
      </div>

      {/* COLONNE DROITE : CONTENU (DETAIL) */}
      <div className={`w-full md:w-2/3 flex flex-col bg-white ${!selectedEmailId ? 'hidden md:flex' : 'flex'}`}>
        
        {selectedEmail ? (
          <>
            {/* Toolbar Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedEmailId(null)}
                  className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex gap-2">
                   <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg" title="Archiver">
                     <MailIcon size={18} />
                   </button>
                   <button className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg" title="Important">
                     <Star size={18} />
                   </button>
                </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg">
                   <MoreHorizontal size={18} />
                 </button>
              </div>
            </div>

            {/* Email Body Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              
              {/* NEURAL INBOX: AI ANALYSIS CARD */}
              <EmailAnalysisCard analysis={analysis} loading={analyzing} emailData={selectedEmail} />

              {/* Subject & Meta */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 mb-6 leading-tight">
                  {selectedEmail.subject}
                </h1>
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${selectedEmail.color}`}>
                    {selectedEmail.from[0]}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-bold text-zinc-900">{selectedEmail.from}</span>
                      <span className="text-sm text-zinc-500 truncate">&lt;{selectedEmail.email}&gt;</span>
                    </div>
                    <p className="text-xs text-zinc-400">À : Moi</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div 
                className="prose prose-zinc max-w-none text-sm text-zinc-700 leading-relaxed [&_img]:max-w-full [&_img]:h-auto [&_a]:text-indigo-600 [&_a]:underline"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedEmail.html || selectedEmail.body || '<i>Aucun contenu</i>')
                }}
              />

              {/* 📎 Section Pièces Jointes */}
              {selectedEmail.hasAttachments && selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-8 pt-6 border-t border-zinc-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip size={16} className="text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-700">
                      {selectedEmail.attachments.length} pièce{selectedEmail.attachments.length > 1 ? 's' : ''} jointe{selectedEmail.attachments.length > 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-200 rounded flex items-center justify-center text-zinc-600">
                            <Paperclip size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{attachment.filename}</p>
                            <p className="text-xs text-zinc-500">
                              {(attachment.size / 1024).toFixed(1)} Ko • {attachment.contentType}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-zinc-400 italic">Non téléchargeable en v1</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reply Footer - Zone de réponse */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
              {!isReplying ? (
                <div className="flex flex-col gap-2">
                   {/* Suggestion rapide */}
                   <button 
                    onClick={() => {
                      setIsReplying(true);
                      handleSmartDraft();
                    }}
                    disabled={isDrafting}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-indigo-100 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:shadow-sm transition-all font-medium mb-1"
                  >
                    <Sparkles size={18} className={isDrafting ? "animate-pulse" : ""} />
                    {isDrafting ? "Rédaction en cours..." : "Générer une réponse IA (Brouillon)"}
                  </button>

                  <button 
                    onClick={() => setIsReplying(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-zinc-200 rounded-xl bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all font-medium"
                  >
                    <Reply size={18} />
                    Répondre à {selectedEmail.from.split(' ')[0]}
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-4 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Réponse à {selectedEmail.from}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleSmartDraft}
                            disabled={isDrafting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                            title="Générer un nouveau brouillon"
                          >
                            <Sparkles size={14} className={isDrafting ? "animate-pulse" : ""} />
                            {isDrafting ? "..." : "IA"}
                          </button>
                          <button onClick={() => setIsReplying(false)} className="text-zinc-400 hover:text-zinc-600">
                              <X size={16} />
                          </button>
                        </div>
                    </div>
                    
                    <textarea 
                        autoFocus
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Rédigez votre réponse..."
                        className="w-full min-h-[120px] p-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-3 resize-none"
                    />
                    
                    <div className="flex justify-between items-center">
                        <button className="text-zinc-400 hover:text-zinc-600 p-2 rounded-lg hover:bg-zinc-50">
                            <Paperclip size={18} />
                        </button>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsReplying(false)}
                                className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleSendReply}
                                disabled={!replyBody.trim() || sending}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Envoi...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Envoyer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* EMPTY STATE (Desktop only) */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-zinc-50/30">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300 mb-4">
              <MailIcon size={40} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Aucun message sélectionné</h3>
            <p className="text-zinc-500 mt-2 max-w-xs">
              Choisissez un email dans la liste de gauche pour afficher son contenu.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default InboxPage;
