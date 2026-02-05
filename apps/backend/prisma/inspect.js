// ============================================================================
// CLERIVO - INSPECTION DATABASE
// Script utilitaire pour visualiser rapidement les données
// Usage: node prisma/inspect.js [entity]
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

async function inspectCandidates() {
  log('bright', '\n📊 CANDIDATS\n' + '='.repeat(80));
  
  const candidates = await prisma.candidate.findMany({
    include: {
      applications: {
        include: { property: true }
      },
      solvencyProfiles: true,
      documents: true
    }
  });

  for (const candidate of candidates) {
    const profile = candidate.solvencyProfiles[0];
    const app = candidate.applications[0];
    
    log('cyan', `\n👤 ${candidate.firstName} ${candidate.lastName}`);
    console.log(`   📧 ${candidate.email}`);
    console.log(`   📞 ${candidate.phone || 'N/A'}`);
    console.log(`   🇨🇭 ${candidate.residencyStatus} ${candidate.permitType ? `(${candidate.permitType})` : ''}`);
    console.log(`   👥 ${candidate.applicantType}`);
    
    if (profile) {
      log('yellow', `   💰 Solvabilité: ${profile.solvencyScore || 'N/A'}/100 (${profile.solvencyRating || 'N/A'})`);
      console.log(`   📋 Poursuites: ${profile.pursuitsStatus} ${profile.pursuitsAmount ? `(CHF ${profile.pursuitsAmount}.-)` : ''}`);
      console.log(`   💼 Emploi: ${profile.employmentType}`);
      console.log(`   💵 Revenu moyen: CHF ${profile.averageMonthlyNet || candidate.monthlyIncome || 'N/A'}.-`);
    }
    
    console.log(`   📄 Documents: ${candidate.documents.length}`);
    
    if (app) {
      log(
        app.status === 'DOSSIER_READY' ? 'green' : app.status === 'REJECTED' ? 'red' : 'yellow',
        `   📋 Application: ${app.status} (${app.property?.reference || 'N/A'})`
      );
    }
  }
}

async function inspectApplications() {
  log('bright', '\n📋 APPLICATIONS (PIPELINE)\n' + '='.repeat(80));
  
  const applications = await prisma.application.findMany({
    include: {
      candidate: true,
      property: true,
      assignedTo: true,
      threads: true,
      events: { orderBy: { createdAt: 'desc' }, take: 3 }
    }
  });

  for (const app of applications) {
    const statusColor = 
      app.status === 'DOSSIER_READY' ? 'green' :
      app.status === 'REJECTED' ? 'red' :
      app.status === 'NEW' ? 'blue' : 'yellow';
    
    log('cyan', `\n📁 ${app.candidate.firstName} ${app.candidate.lastName} → ${app.property?.reference || 'N/A'}`);
    log(statusColor, `   Status: ${app.status}`);
    console.log(`   👤 Assigné à: ${app.assignedTo ? `${app.assignedTo.firstName} ${app.assignedTo.lastName}` : 'Non assigné'}`);
    console.log(`   📊 Complétude: ${app.completenessScore}% (${app.readinessStatus})`);
    console.log(`   🔥 Priorité: ${app.priority}`);
    console.log(`   📧 Threads: ${app.threads.length}`);
    
    if (app.events.length > 0) {
      log('yellow', '   📝 Derniers événements:');
      app.events.forEach(evt => {
        const date = new Date(evt.createdAt).toLocaleDateString('fr-CH');
        console.log(`      • ${date} - ${evt.title}`);
      });
    }
  }
}

async function inspectThreads() {
  log('bright', '\n📧 THREADS EMAIL\n' + '='.repeat(80));
  
  const threads = await prisma.thread.findMany({
    include: {
      messages: { orderBy: { receivedAt: 'asc' } },
      application: {
        include: {
          candidate: true,
          property: true
        }
      },
      assignedTo: true
    }
  });

  for (const thread of threads) {
    log('cyan', `\n💬 ${thread.subject}`);
    console.log(`   📊 Status: ${thread.status} | Priorité: ${thread.priority}`);
    console.log(`   📨 Messages: ${thread.messageCount} | Non lus: ${thread.unreadCount}`);
    
    if (thread.application) {
      console.log(`   🔗 Lié à: ${thread.application.candidate.firstName} ${thread.application.candidate.lastName} (${thread.application.property?.reference || 'N/A'})`);
    }
    
    if (thread.assignedTo) {
      console.log(`   👤 Assigné: ${thread.assignedTo.firstName} ${thread.assignedTo.lastName}`);
    }
    
    log('yellow', '   📝 Messages:');
    thread.messages.forEach((msg, idx) => {
      const date = new Date(msg.receivedAt).toLocaleString('fr-CH');
      const direction = msg.isOutgoing ? '➡️' : '⬅️';
      console.log(`      ${idx + 1}. ${direction} ${msg.from} - ${date}`);
      console.log(`         ${msg.snippet || msg.subject}`);
    });
  }
}

async function inspectProperties() {
  log('bright', '\n🏠 BIENS IMMOBILIERS\n' + '='.repeat(80));
  
  const properties = await prisma.property.findMany({
    include: {
      applications: {
        include: { candidate: true }
      }
    }
  });

  for (const property of properties) {
    log('cyan', `\n🏢 ${property.reference}`);
    console.log(`   📍 ${property.address}, ${property.postalCode} ${property.city}`);
    console.log(`   🏠 ${property.propertyType} - ${property.rooms} pièces`);
    console.log(`   💰 Loyer: CHF ${property.monthlyRent}.- + charges CHF ${property.charges || 0}.-`);
    console.log(`   🎯 Status: ${property.status}`);
    console.log(`   📅 Disponible: ${property.availableFrom ? new Date(property.availableFrom).toLocaleDateString('fr-CH') : 'N/A'}`);
    
    if (property.applications.length > 0) {
      log('yellow', '   👥 Candidatures:');
      property.applications.forEach(app => {
        console.log(`      • ${app.candidate.firstName} ${app.candidate.lastName} (${app.status})`);
      });
    }
  }
}

async function inspectStats() {
  log('bright', '\n📊 STATISTIQUES GLOBALES\n' + '='.repeat(80));
  
  const counts = {
    users: await prisma.user.count(),
    candidates: await prisma.candidate.count(),
    applications: await prisma.application.count(),
    properties: await prisma.property.count(),
    documents: await prisma.document.count(),
    threads: await prisma.thread.count(),
    messages: await prisma.message.count(),
    events: await prisma.applicationEvent.count(),
    auditLogs: await prisma.auditLog.count()
  };

  console.log('\n');
  Object.entries(counts).forEach(([key, value]) => {
    console.log(`   ${key.padEnd(20)}: ${value}`);
  });

  // Statistiques par statut
  log('yellow', '\n📋 Applications par statut:');
  const appsByStatus = await prisma.application.groupBy({
    by: ['status'],
    _count: true
  });
  
  appsByStatus.forEach(({ status, _count }) => {
    console.log(`   ${status.padEnd(25)}: ${_count}`);
  });

  // Documents par type
  log('yellow', '\n📄 Documents par type:');
  const docsByType = await prisma.document.groupBy({
    by: ['documentType'],
    _count: true
  });
  
  docsByType.forEach(({ documentType, _count }) => {
    console.log(`   ${documentType.padEnd(25)}: ${_count}`);
  });
}

async function main() {
  const entity = process.argv[2]?.toLowerCase();

  console.clear();
  log('bright', '\n╔═══════════════════════════════════════════════════════════════════════╗');
  log('bright', '║               CLERIVO - INSPECTION BASE DE DONNÉES                    ║');
  log('bright', '╚═══════════════════════════════════════════════════════════════════════╝');

  try {
    switch (entity) {
      case 'candidates':
      case 'candidats':
        await inspectCandidates();
        break;
      
      case 'applications':
      case 'apps':
        await inspectApplications();
        break;
      
      case 'threads':
      case 'emails':
        await inspectThreads();
        break;
      
      case 'properties':
      case 'biens':
        await inspectProperties();
        break;
      
      case 'stats':
        await inspectStats();
        break;
      
      case 'all':
        await inspectStats();
        await inspectCandidates();
        await inspectApplications();
        await inspectThreads();
        await inspectProperties();
        break;
      
      default:
        log('yellow', '\n💡 Usage: node prisma/inspect.js [entity]\n');
        console.log('Entités disponibles:');
        console.log('  • candidates   - Liste des candidats avec leurs profils');
        console.log('  • applications - Pipeline des candidatures');
        console.log('  • threads      - Threads email et messages');
        console.log('  • properties   - Biens immobiliers');
        console.log('  • stats        - Statistiques globales');
        console.log('  • all          - Tout afficher\n');
        
        log('cyan', 'Exemples:');
        console.log('  node prisma/inspect.js candidates');
        console.log('  node prisma/inspect.js applications');
        console.log('  node prisma/inspect.js all\n');
    }

  } catch (error) {
    log('red', `\n❌ Erreur: ${error.message}\n`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
