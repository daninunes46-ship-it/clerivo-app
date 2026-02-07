// ============================================================================
// ADMIN CONTROLLER - Routes d'administration & maintenance
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/admin/fix-pipeline
 * Répare les candidats orphelins (sans Application)
 * 
 * CONTEXTE : Suite aux bugs de validation Backend, certains candidats
 * ont été créés sans Application associée, les rendant invisibles dans
 * le Pipeline.
 * 
 * CETTE ROUTE :
 * 1. Trouve tous les candidats sans Application
 * 2. Leur crée une Application avec status 'NEW'
 * 3. Retourne le rapport de réparation
 */
exports.fixOrphanedCandidates = async (req, res) => {
  try {
    console.log('🔧 DÉBUT DE LA RÉPARATION DES CANDIDATS ORPHELINS');
    console.log('═══════════════════════════════════════════════════════');

    // 1. Trouver tous les candidats (non soft-deleted)
    const allCandidates = await prisma.candidate.findMany({
      where: {
        deletedAt: null
      },
      include: {
        applications: true
      }
    });

    console.log(`📊 Total candidats actifs: ${allCandidates.length}`);

    // 2. Filtrer les orphelins (sans applications)
    const orphanedCandidates = allCandidates.filter(
      candidate => candidate.applications.length === 0
    );

    console.log(`🚨 Candidats orphelins détectés: ${orphanedCandidates.length}`);

    if (orphanedCandidates.length === 0) {
      return res.json({
        success: true,
        message: 'Aucun candidat orphelin détecté. Pipeline sain.',
        data: {
          totalCandidates: allCandidates.length,
          orphanedCount: 0,
          fixed: []
        }
      });
    }

    // 3. Réparer chaque orphelin (transaction atomique pour chacun)
    const fixedCandidates = [];
    const errors = [];

    for (const candidate of orphanedCandidates) {
      try {
        console.log(`🔨 Réparation: ${candidate.firstName} ${candidate.lastName} (${candidate.email})`);

        const newApplication = await prisma.application.create({
          data: {
            candidateId: candidate.id,
            status: 'NEW',
            readinessStatus: 'INCOMPLETE',
            priority: 'MEDIUM',
            source: 'REPAIR_ORPHAN', // Tag spécial pour traçabilité
            notes: `🔧 Application créée automatiquement le ${new Date().toISOString()} pour réparer un candidat orphelin (bug validation Backend).`
          }
        });

        fixedCandidates.push({
          candidateId: candidate.id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email,
          applicationId: newApplication.id,
          createdAt: candidate.createdAt
        });

        console.log(`   ✅ Application créée: ${newApplication.id}`);

      } catch (error) {
        console.error(`   ❌ Erreur pour ${candidate.email}:`, error.message);
        errors.push({
          candidateId: candidate.id,
          email: candidate.email,
          error: error.message
        });
      }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Réparation terminée: ${fixedCandidates.length}/${orphanedCandidates.length} candidats réparés`);
    
    if (errors.length > 0) {
      console.error(`⚠️ Erreurs: ${errors.length} candidats non réparés`);
    }

    res.json({
      success: true,
      message: `${fixedCandidates.length} candidat(s) orphelin(s) réparé(s) avec succès`,
      data: {
        totalCandidates: allCandidates.length,
        orphanedCount: orphanedCandidates.length,
        fixedCount: fixedCandidates.length,
        errorCount: errors.length,
        fixed: fixedCandidates,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('❌ ERREUR CRITIQUE fix-pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réparation des candidats orphelins',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/stats
 * Statistiques générales du système (pour diagnostic)
 */
exports.getSystemStats = async (req, res) => {
  try {
    const stats = await prisma.$transaction(async (tx) => {
      const totalCandidates = await tx.candidate.count({
        where: { deletedAt: null }
      });

      const totalApplications = await tx.application.count({
        where: { deletedAt: null }
      });

      const candidatesWithoutApp = await tx.candidate.findMany({
        where: {
          deletedAt: null,
          applications: { none: {} }
        },
        select: { id: true }
      });

      const applicationsByStatus = await tx.application.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true
      });

      return {
        totalCandidates,
        totalApplications,
        orphanedCandidates: candidatesWithoutApp.length,
        applicationsByStatus: applicationsByStatus.map(s => ({
          status: s.status,
          count: s._count
        }))
      };
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Erreur getSystemStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

module.exports = exports;
