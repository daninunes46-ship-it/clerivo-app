const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed de la base de données...');

  // Hachage des mots de passe (10 rounds)
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const agentPasswordHash = await bcrypt.hash('agent123', 10);

  // ============================================================================
  // UTILISATEURS (Admin + Agent)
  // ============================================================================

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clerivo.ch' },
    update: {
      passwordHash: adminPasswordHash, // Force la mise à jour du mot de passe
      isActive: true
    },
    create: {
      email: 'admin@clerivo.ch',
      passwordHash: adminPasswordHash,
      firstName: 'Administrateur',
      lastName: 'Clerivo',
      role: 'ADMIN',
      isActive: true
    }
  });
  console.log('✅ Utilisateur Admin créé/mis à jour:', admin.email);

  // Agent
  const agent = await prisma.user.upsert({
    where: { email: 'agent@clerivo.ch' },
    update: {
      passwordHash: agentPasswordHash, // Force la mise à jour du mot de passe
      isActive: true
    },
    create: {
      email: 'agent@clerivo.ch',
      passwordHash: agentPasswordHash,
      firstName: 'Agent',
      lastName: 'Immobilier',
      role: 'AGENT',
      isActive: true
    }
  });
  console.log('✅ Utilisateur Agent créé/mis à jour:', agent.email);

  // ============================================================================
  // LOGS DE SEED (AuditLog)
  // ============================================================================
  await prisma.auditLog.create({
    data: {
      action: 'SEED_EXECUTED',
      entityType: 'System',
      entityId: 'seed',
      userId: admin.id,
      metadata: JSON.stringify({
        users: ['admin@clerivo.ch', 'agent@clerivo.ch'],
        timestamp: new Date().toISOString()
      })
    }
  });

  console.log('\n🎉 Seed terminé avec succès !');
  console.log('\n📋 Comptes de test disponibles :');
  console.log('   👤 Admin: admin@clerivo.ch / admin123');
  console.log('   👤 Agent: agent@clerivo.ch / agent123\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
