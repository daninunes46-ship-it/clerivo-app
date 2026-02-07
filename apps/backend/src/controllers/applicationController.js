// ============================================================================
// APPLICATION CONTROLLER - Gestion des candidatures
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * PUT /api/applications/:id
 * Met à jour le statut d'une application (Drag & Drop Pipeline)
 */
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('═══════════════════════════════════════════════════════');
    console.log('📥 PUT /api/applications/:id - UPDATE STATUT');
    console.log('   Application ID:', id);
    console.log('   Nouveau statut:', status);
    console.log('═══════════════════════════════════════════════════════');

    // Validation du statut
    const validStatuses = [
      'NEW', 'TO_QUALIFY',
      'VISIT_SCHEDULED', 'VISIT_DONE', 'VISIT_NO_SHOW',
      'DOSSIER_INCOMPLETE', 'DOSSIER_PENDING', 'DOSSIER_READY',
      'TRANSMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFO',
      'RETAINED', 'REJECTED',
      'AWAITING_GUARANTEE', 'GUARANTEE_RECEIVED', 'CONTRACT_SIGNED',
      'ON_HOLD', 'WITHDRAWN', 'ARCHIVED'
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`
      });
    }

    // Vérifier que l'application existe
    const existingApp = await prisma.application.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!existingApp) {
      return res.status(404).json({
        success: false,
        message: 'Application non trouvée'
      });
    }

    console.log(`   Candidat: ${existingApp.candidate.firstName} ${existingApp.candidate.lastName}`);
    console.log(`   Statut actuel: ${existingApp.status}`);

    // Mettre à jour l'application dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update l'application
      const updatedApp = await tx.application.update({
        where: { id },
        data: {
          status: status,
          previousStatus: existingApp.status,
          statusChangedAt: new Date()
        },
        include: {
          candidate: true,
          property: true
        }
      });

      // 2. Créer un événement de timeline
      await tx.applicationEvent.create({
        data: {
          applicationId: id,
          eventType: 'STATUS_CHANGED',
          title: `Statut changé: ${existingApp.status} → ${status}`,
          description: `Application déplacée vers ${status}`,
          metadata: JSON.stringify({
            oldStatus: existingApp.status,
            newStatus: status,
            changedAt: new Date()
          })
        }
      });

      // 3. Log d'audit
      await tx.auditLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'Application',
          entityId: id,
          changes: JSON.stringify({
            status: { from: existingApp.status, to: status }
          })
        }
      });

      return updatedApp;
    });

    console.log(`✅ STATUT MIS À JOUR: ${existingApp.status} → ${status}`);

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: result
    });

  } catch (error) {
    console.error('❌ ERREUR updateApplication:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'application',
      error: error.message
    });
  }
};

/**
 * GET /api/applications/:id
 * Récupère une application par ID
 */
exports.getApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        candidate: true,
        property: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        events: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application non trouvée'
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('❌ Erreur getApplication:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'application',
      error: error.message
    });
  }
};

module.exports = exports;
