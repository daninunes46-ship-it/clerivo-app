#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuration pour résoudre __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement depuis le .env du frontend
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Clé ADMIN (pas l'anon key!)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes !');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('\n💡 Vous devez ajouter SUPABASE_SERVICE_ROLE_KEY dans votre .env');
  console.error('   Trouvez cette clé dans Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

// Client Supabase avec les droits admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  const email = 'test@clerivo.ch';
  const password = 'test123456'; // Minimum 6 caractères
  const firstName = 'Test';
  const lastName = 'User';
  const role = 'AGENT';

  try {
    console.log('🔧 Création de l\'utilisateur dans Supabase Auth...');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);

    // Créer l'utilisateur avec l'API Admin
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true, // Auto-confirmer l'email (pas besoin de vérification)
      user_metadata: {
        firstName: firstName,
        lastName: lastName,
        role: role
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('⚠️  L\'utilisateur existe déjà. Mise à jour du mot de passe...');
        
        // Récupérer l'utilisateur existant
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error('❌ Erreur lors de la récupération des utilisateurs:', listError.message);
          process.exit(1);
        }

        const existingUser = users.users.find(u => u.email === email.toLowerCase());
        
        if (existingUser) {
          // Mettre à jour le mot de passe
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              password: password,
              user_metadata: {
                firstName: firstName,
                lastName: lastName,
                role: role
              }
            }
          );

          if (updateError) {
            console.error('❌ Erreur lors de la mise à jour:', updateError.message);
            process.exit(1);
          }

          console.log('✅ Mot de passe mis à jour avec succès !');
        }
      } else {
        console.error('❌ Erreur lors de la création:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ Utilisateur créé avec succès !');
      console.log('   ID:', data.user.id);
      console.log('   Email:', data.user.email);
    }

    // Afficher tous les utilisateurs
    console.log('\n📋 Liste de tous les utilisateurs :');
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erreur:', listError.message);
    } else {
      users.users.forEach(u => {
        console.log(`  - ${u.email} (${u.user_metadata?.firstName || 'N/A'} ${u.user_metadata?.lastName || ''}) - Role: ${u.user_metadata?.role || 'N/A'}`);
      });
    }

    console.log('\n🎉 Vous pouvez maintenant vous connecter avec :');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    process.exit(1);
  }
}

createUser();
