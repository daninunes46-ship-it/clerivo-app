import React, { useState } from 'react';
import { Search, ArrowLeft, Star, Reply, MoreHorizontal, Paperclip, Mail as MailIcon } from 'lucide-react';
import BentoCard from '../components/ui/BentoCard';

// Mock Data Email
const MOCK_EMAILS = [
  { 
    id: 1, 
    from: 'Sophie Martin', 
    email: 's.martin@bluewin.ch', 
    subject: 'Offre pour la Villa Montreux', 
    preview: 'Bonjour, suite à notre visite de mardi, nous souhaitons formuler une offre à...', 
    date: '10:42', 
    unread: true, 
    body: `Bonjour,

Suite à notre visite de mardi dernier, nous avons le plaisir de vous confirmer notre intérêt pour la Villa à Montreux.

Nous souhaitons formuler une offre d'achat au prix de 3'850'000 CHF.

Vous trouverez ci-joint notre attestation de financement bancaire. Nous restons à votre disposition pour toute question.

Cordialement,
Sophie Martin`,
    color: 'bg-emerald-100 text-emerald-700'
  },
  { 
    id: 2, 
    from: 'Notaire Durand', 
    email: 'etude.durand@notaires.ch', 
    subject: 'Projet d\'acte - Vente Rue du Lac', 
    preview: 'Veuillez trouver en pièce jointe le projet d\'acte pour la vente de...', 
    date: 'Hier', 
    unread: false, 
    body: `Maître, Monsieur,

Veuillez trouver en pièce jointe le projet d'acte pour la vente de l'appartement sis Rue du Lac 12.

Merci de nous faire part de vos éventuelles remarques avant vendredi.

Salutations distinguées,
Étude Durand`,
    color: 'bg-indigo-100 text-indigo-700'
  },
  { 
    id: 3, 
    from: 'Portail Immobilier', 
    email: 'noreply@immo.ch', 
    subject: 'Nouveau Lead : Appartement Lausanne', 
    preview: 'Un nouvel utilisateur a demandé une visite pour l\'objet #12345...', 
    date: 'Hier', 
    unread: true, 
    body: `Nouveau contact reçu via le portail.

Nom: Marc Weber
Tel: +41 79 123 44 55
Objet: Demande de visite
Bien: Appartement Lausanne Centre (Ref #12345)

Message: "Bonjour, est-il possible de visiter ce bien samedi matin ?"`,
    color: 'bg-amber-100 text-amber-700'
  },
  { 
    id: 4, 
    from: 'Jean Dupont', 
    email: 'j.dupont@gmail.com', 
    subject: 'Re: Documents dossier location', 
    preview: 'Merci pour votre retour rapide. Voici les extraits de l\'office des poursuites...', 
    date: '2 Fév', 
    unread: false, 
    body: `Bonjour,

Merci pour votre retour rapide.
Voici comme demandé les extraits de l'office des poursuites et mes 3 dernières fiches de salaire.

Tenez-moi au courant.

Bien à vous,
Jean`,
    color: 'bg-blue-100 text-blue-700'
  },
  { 
    id: 5, 
    from: 'Agence K.', 
    email: 'marketing@agence-k.ch', 
    subject: 'Photos HD - Shooting Lutry', 
    preview: 'Les photos retouchées de la propriété de Lutry sont disponibles sur le serveur...', 
    date: '30 Jan', 
    unread: false, 
    body: `Hello,

Le shooting est terminé et retouché. Les photos HD sont sur le serveur.
Le rendu est magnifique, surtout celles du coucher de soleil !

Lien de téléchargement : [Lien]

A+`,
    color: 'bg-purple-100 text-purple-700'
  }
];

const InboxPage = () => {
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedEmail = MOCK_EMAILS.find(e => e.id === selectedEmailId);

  const filteredEmails = MOCK_EMAILS.filter(e => 
    e.from.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {filteredEmails.map((email) => (
            <div 
              key={email.id}
              onClick={() => setSelectedEmailId(email.id)}
              className={`p-4 border-b border-zinc-100 cursor-pointer transition-colors hover:bg-zinc-50 ${selectedEmailId === email.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${email.unread ? 'font-bold text-zinc-900' : 'font-medium text-zinc-700'}`}>
                    {email.from}
                  </span>
                  {email.unread && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                </div>
                <span className={`text-xs ${email.unread ? 'text-indigo-600 font-bold' : 'text-zinc-400'}`}>
                  {email.date}
                </span>
              </div>
              
              <h4 className={`text-sm mb-1 truncate ${email.unread ? 'font-bold text-zinc-900' : 'text-zinc-600'}`}>
                {email.subject}
              </h4>
              
              <p className="text-xs text-zinc-400 line-clamp-2">
                {email.preview}
              </p>
            </div>
          ))}
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
              {/* Subject & Meta */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 mb-6 leading-tight">
                  {selectedEmail.subject}
                </h1>
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${selectedEmail.color}`}>
                    {selectedEmail.from[0]}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-zinc-900">{selectedEmail.from}</span>
                      <span className="text-sm text-zinc-500">&lt;{selectedEmail.email}&gt;</span>
                    </div>
                    <p className="text-xs text-zinc-400">À : Moi</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-zinc max-w-none text-sm text-zinc-700 whitespace-pre-line leading-relaxed">
                {selectedEmail.body}
              </div>

              {/* Attachments Mock */}
              <div className="mt-8 pt-6 border-t border-zinc-100">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">Pièces jointes (1)</h4>
                <div className="flex items-center gap-3 p-3 border border-zinc-200 rounded-lg w-max cursor-pointer hover:bg-zinc-50 hover:border-indigo-200 transition-colors group">
                  <div className="p-2 bg-zinc-100 rounded text-zinc-500 group-hover:text-indigo-600">
                    <Paperclip size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700 group-hover:text-indigo-700">document.pdf</p>
                    <p className="text-xs text-zinc-400">245 KB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reply Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
              <button className="w-full flex items-center justify-center gap-2 py-3 border border-zinc-200 rounded-xl bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all font-medium">
                <Reply size={18} />
                Répondre à {selectedEmail.from.split(' ')[0]}
              </button>
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
