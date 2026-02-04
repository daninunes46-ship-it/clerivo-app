import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const AddContactPanel = ({ isOpen, onClose, onAddContact }) => {
  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'ACHETEUR',
    status: 'actif',
    note: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Nettoyer l'erreur quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async () => {
    // Validation simple
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      // Appel asynchrone au parent
      await onAddContact(formData);
      
      // Reset et fermeture (uniquement si succès)
      setFormData(initialFormState);
      setErrors({});
      onClose();
    } catch (error) {
      // L'erreur est déjà gérée dans ContactsPage
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Overlay sombre (Backdrop) */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panneau Glissant (Slide-Over) */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* En-tête Fixe */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-zinc-900">Nouveau Contact</h2>
          <button 
            onClick={onClose}
            disabled={saving}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corps Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-sm text-zinc-500 mb-4">
            Ajoutez les détails de votre nouveau prospect ou client.
          </p>

          {/* Grid Prénom / Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Prénom <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={saving}
                placeholder="Jean"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm disabled:opacity-50 ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nom <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={saving}
                placeholder="Dupont"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm disabled:opacity-50 ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={saving}
              placeholder="jean.dupont@exemple.com"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm disabled:opacity-50"
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Téléphone</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={saving}
              placeholder="+41 79 000 00 00"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm disabled:opacity-50"
            />
          </div>

          {/* Grid Type / Statut */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Type</label>
              <div className="relative">
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none bg-white disabled:opacity-50"
                >
                  <option value="ACHETEUR">Acheteur</option>
                  <option value="VENDEUR">Vendeur</option>
                  <option value="INVESTISSEUR">Investisseur</option>
                  <option value="AUTRE">Autre</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Statut</label>
              <div className="relative">
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none bg-white disabled:opacity-50"
                >
                  <option value="actif">Actif</option>
                  <option value="attente">En Attente</option>
                  <option value="archive">Archivé</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Note / Commentaire */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Note Interne</label>
            <textarea 
              name="note"
              value={formData.note}
              onChange={handleChange}
              disabled={saving}
              rows={4}
              placeholder="Contexte, besoins spécifiques..."
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none disabled:opacity-50"
            />
          </div>

        </div>

        {/* Footer Fixe */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={16} />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddContactPanel;
