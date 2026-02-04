import React, { useState, useEffect } from 'react';
import BentoCard from '../components/ui/BentoCard';
import AddContactPanel from './AddContactPanel';
import ContactDetailPanel from './ContactDetailPanel';
import { Search, Plus, MoreHorizontal, Phone, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// VÉRIFICATION AU CHARGEMENT : Supabase est-il initialisé ?
if (!supabase) {
  alert('🚨 ERREUR CRITIQUE : Supabase n\'est pas initialisé !');
  console.error('🚨 SUPABASE NON INITIALISÉ');
}

// Couleurs autorisées pour les avatars
const ALLOWED_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
];

const ContactRow = ({ contact, onClick }) => {
  const initials = contact.firstName && contact.lastName 
    ? `${contact.firstName[0]}${contact.lastName[0]}` 
    : '??';
  
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
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${contact.color}`}>
          {initials}
        </div>
        
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

      <div className="hidden md:flex items-center gap-6 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <Phone size={14} />
          {contact.phone || '-'}
        </div>
        <div className="group-hover:text-indigo-600 transition-colors">
          <MoreHorizontal size={20} />
        </div>
      </div>

      <div className="md:hidden text-zinc-300">
        <MoreHorizontal size={20} />
      </div>
    </div>
  );
};

const ContactsPage = () => {
  // INITIALISATION : Liste VIDE (pas de Mock Data)
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    console.log('🔍 VERIFICATION : Chargement des contacts depuis Supabase...');
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      console.log('🔗 CONNEXION À SUPABASE...');
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ERREUR SUPABASE CHARGEMENT:', error);
        alert(`🚨 ERREUR CRITIQUE SUPABASE (CHARGEMENT): ${error.message}`);
        throw error;
      }

      console.log('📥 DONNÉES REÇUES DE SUPABASE:', data);
      console.log(`📊 NOMBRE DE CONTACTS: ${data.length}`);

      const contactsTransformed = data.map(contact => {
        const nameParts = contact.name ? contact.name.split(' ') : ['', ''];
        return {
          ...contact,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || nameParts[0] || '',
          color: contact.color || ALLOWED_COLORS[Math.floor(Math.random() * ALLOWED_COLORS.length)]
        };
      });

      setContacts(contactsTransformed);
      console.log('✅ Contacts chargés avec succès');
    } catch (error) {
      console.error('❌ ÉCHEC CHARGEMENT:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (formData) => {
    console.log('🚀 DÉBUT AJOUT CONTACT VIA SUPABASE');
    console.log('📝 Formulaire reçu:', formData);
    
    try {
      const contactToSave = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email || null,
        phone: formData.phone || null,
        company: formData.company || null,
        status: formData.status || 'actif',
        type: formData.type || 'ACHETEUR',
        color: ALLOWED_COLORS[Math.floor(Math.random() * ALLOWED_COLORS.length)],
      };

      console.log('📤 OBJET À ENVOYER (SANS ID):', contactToSave);
      console.log('🔗 APPEL SUPABASE .insert()...');

      const { data, error } = await supabase
        .from('contacts')
        .insert([contactToSave])
        .select()
        .single();

      if (error) {
        console.error('❌❌❌ ERREUR SUPABASE INSERT ❌❌❌');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        console.error('Détails:', error.details);
        alert(`🚨 ERREUR CRITIQUE SUPABASE (INSERT): ${error.message}`);
        throw error;
      }

      if (!data || !data.id) {
        console.error('❌ SUPABASE N\'A PAS RENVOYÉ DE DATA');
        alert('🚨 ERREUR CRITIQUE: Pas d\'ID retourné');
        throw new Error('Pas d\'ID retourné par Supabase');
      }

      console.log('🆔🆔🆔 ID RETOURNÉ:', data.id);
      console.log('🆔 TYPE:', typeof data.id);
      console.log('📦 DATA COMPLÈTE:', data);

      const isUUID = typeof data.id === 'string' && data.id.length > 10 && data.id.includes('-');
      
      if (isUUID) {
        console.log('✅✅✅ C\'EST UN UUID !');
      } else {
        console.error('⚠️⚠️⚠️ CE N\'EST PAS UN UUID ! C\'EST:', data.id);
        alert(`⚠️ ATTENTION: L'ID n'est pas un UUID, c'est: ${data.id}`);
      }

      const enrichedContact = {
        ...data,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      
      setContacts(prev => [enrichedContact, ...prev]);
      console.log('✅ Contact ajouté localement');
      
      alert(`✅ Contact créé avec ID: ${data.id}`);
    } catch (error) {
      console.error('❌ ÉCHEC GLOBAL:', error);
      alert(`❌ ÉCHEC: ${error.message}`);
      throw error;
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        <button 
          onClick={() => setIsAddPanelOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Nouveau Contact</span>
        </button>
      </div>

      <AddContactPanel 
        isOpen={isAddPanelOpen} 
        onClose={() => setIsAddPanelOpen(false)} 
        onAddContact={handleAddContact}
      />

      <ContactDetailPanel
        contact={selectedContact}
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
      />

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Tous les contacts</h3>
          <span className="text-xs font-medium text-zinc-500 bg-white px-2 py-1 rounded-md border border-zinc-200">
            {loading ? '...' : `${filteredContacts.length} total`}
          </span>
        </div>
        
        <div className="divide-y divide-zinc-100">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-zinc-500 font-medium">Chargement depuis Supabase...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 font-medium mb-2">❌ Erreur Supabase</p>
              <p className="text-zinc-500 text-sm mb-4">{error}</p>
              <button 
                onClick={fetchContacts}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div key={contact.id} className="px-4 md:px-2">
                <ContactRow 
                  contact={contact} 
                  onClick={() => setSelectedContact(contact)}
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500">
              {searchTerm ? `Aucun contact trouvé pour "${searchTerm}"` : 'Aucun contact dans Supabase. Ajoutez-en un !'}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ContactsPage;
