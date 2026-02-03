import React, { useState } from 'react';
import BentoCard from '../components/ui/BentoCard';
import AddContactPanel from './AddContactPanel';
import ContactDetailPanel from './ContactDetailPanel';
import { Search, Plus, MoreHorizontal, Phone, Mail } from 'lucide-react';

// Mock Data Initial
const INITIAL_CONTACTS = [
  { id: 1, firstName: 'Jean', lastName: 'Dupont', type: 'ACHETEUR', email: 'j.dupont@email.ch', phone: '+41 79 123 45 67', color: 'bg-indigo-100 text-indigo-700' },
  { id: 2, firstName: 'Sophie', lastName: 'Martin', type: 'VENDEUR', email: 's.martin@bluewin.ch', phone: '+41 78 456 78 90', color: 'bg-emerald-100 text-emerald-700' },
  { id: 3, firstName: 'Marc', lastName: 'Weber', type: 'INVESTISSEUR', email: 'm.weber@invest.ch', phone: '+41 21 333 44 55', color: 'bg-amber-100 text-amber-700' },
  { id: 4, firstName: 'Isabelle', lastName: 'Rochat', type: 'ACHETEUR', email: 'isa.rochat@gmail.com', phone: '+41 76 999 88 77', color: 'bg-blue-100 text-blue-700' },
  { id: 5, firstName: 'Pierre', lastName: 'Favre', type: 'VENDEUR', email: 'p.favre@architectes.ch', phone: '+41 79 555 22 11', color: 'bg-indigo-100 text-indigo-700' },
  { id: 6, firstName: 'Claire', lastName: 'Dubois', type: 'ACHETEUR', email: 'c.dubois@yahoo.fr', phone: '+41 78 111 22 33', color: 'bg-rose-100 text-rose-700' },
];

const ALLOWED_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
];

const ContactRow = ({ contact, onClick }) => {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`;
  
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'ACHETEUR': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'VENDEUR': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'INVESTISSEUR': return 'bg-purple-50 text-purple-700 border border-purple-100';
      default: return 'bg-zinc-100 text-zinc-600';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer -mx-4 md:mx-0 md:rounded-xl"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${contact.color}`}>
          {initials}
        </div>
        
        {/* Info Principale */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-zinc-900 truncate">
              {contact.firstName} {contact.lastName}
            </h4>
            <span className={`hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${getBadgeStyle(contact.type)}`}>
              {contact.type}
            </span>
          </div>
          <p className="text-sm text-zinc-500 truncate md:hidden">
            {contact.type}
          </p>
          <p className="hidden md:block text-sm text-zinc-500 truncate">
            {contact.email || '-'}
          </p>
        </div>
      </div>

      {/* Info Secondaire (Desktop) */}
      <div className="hidden md:flex items-center gap-6 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <Phone size={14} />
          {contact.phone || '-'}
        </div>
        <div className="group-hover:text-indigo-600 transition-colors">
          <MoreHorizontal size={20} />
        </div>
      </div>

      {/* Action Mobile (Chevron ou simple fleche) */}
      <div className="md:hidden text-zinc-300">
        <MoreHorizontal size={20} />
      </div>
    </div>
  );
};

const ContactsPage = () => {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const handleAddContact = (formData) => {
    const newContact = {
      id: Math.max(...contacts.map(c => c.id)) + 1,
      firstName: formData.firstName,
      lastName: formData.lastName,
      type: formData.type,
      email: formData.email,
      phone: formData.phone,
      // Couleur aléatoire maîtrisée (Palette officielle)
      color: ALLOWED_COLORS[Math.floor(Math.random() * ALLOWED_COLORS.length)],
    };

    setContacts(prev => [newContact, ...prev]); // Ajout en haut de liste
    console.log("Nouveau contact ajouté :", newContact);
    // Ici on pourrait ajouter un Toast de succès
  };

  const filteredContacts = contacts.filter(c => 
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* En-tête de contrôle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Barre de recherche */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un contact..."
            className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-xl leading-5 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bouton Ajouter */}
        <button 
          onClick={() => setIsAddPanelOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Nouveau Contact</span>
        </button>
      </div>

      {/* Slide-Over Add Panel */}
      <AddContactPanel 
        isOpen={isAddPanelOpen} 
        onClose={() => setIsAddPanelOpen(false)} 
        onAddContact={handleAddContact}
      />

      {/* Slide-Over Detail Panel */}
      <ContactDetailPanel
        contact={selectedContact}
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
      />

      {/* Liste des contacts */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Tous les contacts</h3>
          <span className="text-xs font-medium text-zinc-500 bg-white px-2 py-1 rounded-md border border-zinc-200">
            {filteredContacts.length} total
          </span>
        </div>
        
        <div className="divide-y divide-zinc-100">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div key={contact.id} className="px-4 md:px-2"> {/* Wrapper pour padding mobile */}
                <ContactRow 
                  contact={contact} 
                  onClick={() => setSelectedContact(contact)}
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500">
              Aucun contact trouvé pour "{searchTerm}"
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ContactsPage;
