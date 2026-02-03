import React, { useState } from 'react';
import { X, Phone, Mail, Edit2, User, Calendar, MapPin, FileText } from 'lucide-react';

const ContactDetailPanel = ({ contact, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('infos');

  if (!contact) return null;

  const initials = contact.firstName && contact.lastName 
    ? `${contact.firstName[0]}${contact.lastName[0]}` 
    : '??';

  // Mock Timeline pour les Notes
  const MOCK_NOTES = [
    { id: 1, type: 'call', title: 'Appel sortant', date: 'Hier, 14:30', content: 'Discussion sur le budget. Confirmé 1.2M CHF max.' },
    { id: 2, type: 'visit', title: 'Visite planifiée', date: '20 Fév, 10:00', content: 'Visite de la Villa Montreux avec son épouse.' },
    { id: 3, type: 'email', title: 'Email envoyé', date: '2 Fév', content: 'Envoi du dossier technique + plans.' },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panneau */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header & Hero */}
        <div className="relative bg-zinc-50 border-b border-zinc-200 pb-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center pt-10 px-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-md mb-4 ${contact.color || 'bg-zinc-200 text-zinc-600'}`}>
              {initials}
            </div>
            
            <h2 className="text-2xl font-bold text-zinc-900 text-center">
              {contact.firstName} {contact.lastName}
            </h2>
            
            <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white border border-zinc-200 text-zinc-600">
              {contact.type || 'Prospect'}
            </span>

            {/* Actions Bar (Native Href) */}
            <div className="grid grid-cols-3 gap-4 w-full mt-6 max-w-xs">
              <a 
                href={`tel:${contact.phone}`}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-white border border-zinc-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all group"
              >
                <Phone size={20} className="text-zinc-500 group-hover:text-indigo-600" />
                <span className="text-xs font-medium">Appeler</span>
              </a>
              <a 
                href={`mailto:${contact.email}`}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-white border border-zinc-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all group"
              >
                <Mail size={20} className="text-zinc-500 group-hover:text-indigo-600" />
                <span className="text-xs font-medium">Email</span>
              </a>
              <button className="flex flex-col items-center justify-center gap-1 p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all group">
                <Edit2 size={20} className="text-zinc-500 group-hover:text-zinc-900" />
                <span className="text-xs font-medium">Modifier</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200">
          <button 
            onClick={() => setActiveTab('infos')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'infos' ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Informations
            {activeTab === 'infos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 mx-10"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'notes' ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Historique & Notes
            {activeTab === 'notes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 mx-10"></div>}
          </button>
        </div>

        {/* Corps Scrollable */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          
          {activeTab === 'infos' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Section title="Coordonnées">
                <InfoRow icon={Mail} label="Email" value={contact.email} isLink href={`mailto:${contact.email}`} />
                <InfoRow icon={Phone} label="Téléphone" value={contact.phone} isLink href={`tel:${contact.phone}`} />
                <InfoRow icon={MapPin} label="Adresse" value="Lausanne, Suisse" />
              </Section>

              <Section title="Profil Immobilier">
                <InfoRow icon={User} label="Statut" value={contact.status || 'Actif'} />
                <InfoRow icon={FileText} label="Budget" value="1.2M - 1.5M CHF" />
                <InfoRow icon={FileText} label="Recherche" value="Appartement, min 4 pièces, vue lac" />
              </Section>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="relative border-l-2 border-zinc-100 ml-3 space-y-8 py-2">
                {MOCK_NOTES.map((note) => (
                  <div key={note.id} className="relative pl-6">
                    {/* Point Timeline */}
                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                      note.type === 'call' ? 'bg-indigo-400' : 
                      note.type === 'visit' ? 'bg-emerald-400' : 'bg-zinc-300'
                    }`}></div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-zinc-900 text-sm">{note.title}</span>
                        <span className="text-xs text-zinc-400">{note.date}</span>
                      </div>
                      <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100 mt-1">
                        {note.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 border-dashed">
                + Ajouter une note
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

// Petits composants helpers
const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, isLink, href }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-zinc-400">
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-zinc-500 font-medium">{label}</p>
      {isLink ? (
        <a href={href} className="text-sm font-medium text-indigo-600 hover:underline break-all">
          {value || '-'}
        </a>
      ) : (
        <p className="text-sm font-medium text-zinc-900 break-words">{value || '-'}</p>
      )}
    </div>
  </div>
);

export default ContactDetailPanel;
