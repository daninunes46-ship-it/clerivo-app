#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUser() {
  const email = 'test@clerivo.ch';
  const password = 'test';
  const firstName = 'Test';
  const lastName = 'User';
  const role = 'AGENT';

  try {
    console.log('🔧 Création de l\'utilisateur...');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      console.log('⚠️  L\'utilisateur existe déjà. Mise à jour du mot de passe...');
      
      const passwordHash = await bcrypt.hash(password, 10);
      
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
          passwordHash,
          isActive: true,
          firstName,
          lastName
        }
      });

      console.log('✅ Mot de passe mis à jour avec succès !');
    } else {
      console.log('🆕 Création d\'un nouvel utilisateur...');
      
      const passwordHash = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          role,
          isActive: true
        }
      });

      console.log('✅ Utilisateur créé avec succès !');
    }

    // Afficher tous les utilisateurs
    console.log('\n📋 Liste de tous les utilisateurs actifs :');
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    allUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.firstName} ${u.lastName}) - Role: ${u.role}`);
    });

    console.log('\n🎉 Vous pouvez maintenant vous connecter avec :');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
