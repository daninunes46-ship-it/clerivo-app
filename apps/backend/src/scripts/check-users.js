const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('🔍 Vérification des utilisateurs dans la base de données...\n');
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données.');
      console.log('   Exécutez: npm run db:seed\n');
    } else {
      console.log(`✅ ${users.length} utilisateur(s) trouvé(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Nom: ${user.firstName} ${user.lastName}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Actif: ${user.isActive ? 'Oui' : 'Non'}`);
        console.log(`   Créé le: ${user.createdAt}`);
        console.log('');
      });
    }

    // Vérifier également les AuditLogs
    const auditCount = await prisma.auditLog.count();
    console.log(`📊 Nombre d'entrées dans AuditLog: ${auditCount}`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
