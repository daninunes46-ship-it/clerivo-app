import React from 'react';
import { Shield, Home, Key, User, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// Maps categories/priorities to styles and icons
const getBadgeConfig = (type, value) => {
  if (type === 'priority') {
    switch (value) {
      case 'Haute': return { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
      case 'Moyenne': return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
      case 'Basse': return { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: CheckCircle };
      default: return { color: 'bg-zinc-100 text-zinc-500', icon: null };
    }
  }
  
  if (type === 'category') {
    switch (value) {
      case 'Acheteur': return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: User };
      case 'Vendeur': return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Home };
      case 'Locataire': return { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Key };
      case 'Administratif': return { color: 'bg-zinc-100 text-zinc-700 border-zinc-200', icon: FileText };
      default: return { color: 'bg-zinc-50 text-zinc-500 border-zinc-100', icon: null };
    }
  }
  
  return { color: 'bg-gray-100', icon: null };
};

const SmartBadge = ({ type, value, compact = false }) => {
  if (!value) return null;
  
  const config = getBadgeConfig(type, value);
  const Icon = config.icon;

  if (compact) {
     // Small dot/icon version for dense lists
     return (
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${config.color}`} title={`${type}: ${value}`}>
           {Icon && <Icon size={10} />}
           <span>{value}</span>
        </div>
     );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.color}`}>
      {Icon && <Icon size={12} />}
      {value}
    </span>
  );
};

export default SmartBadge;
