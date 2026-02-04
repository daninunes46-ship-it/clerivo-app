import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 INITIALISATION SUPABASE CLIENT');
console.log('🌐 URL:', supabaseUrl || '❌ MANQUANTE');
console.log('🔑 KEY:', supabaseAnonKey ? '✅ Présente' : '❌ MANQUANTE');

if (!supabaseUrl || !supabaseAnonKey) {
  alert('🚨 ERREUR CRITIQUE: Variables d\'environnement Supabase manquantes !');
  console.error('❌ SUPABASE_URL:', supabaseUrl);
  console.error('❌ SUPABASE_ANON_KEY:', supabaseAnonKey ? 'présente' : 'manquante');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase client créé avec succès');
console.log('📦 Client:', supabase);
