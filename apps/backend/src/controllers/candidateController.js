// ============================================================================
// CANDIDATE CONTROLLER - Module 2
// Gestion des candidats et de leur solvabilité (Swiss Safe)
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/candidates
 * Liste tous les candidats avec filtres optionnels
 */
exports.getCandidates = async (req, res) => {
  try {
    const { 
      status,           // Filtre par statut de candidature
      residencyStatus,  // Filtre par statut de résidence
      search            // Recherche par nom/email
    } = req.query;

    const where = {};

    // Filtre par recherche (nom ou email)
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtre par statut de résidence
    if (residencyStatus) {
      where.residencyStatus = residencyStatus;
    }

    // Filtre par statut de candidature
    if (status) {
      where.applications = {
        some: { status: status }
      };
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        solvencyProfiles: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        applications: {
          include: {
            property: true,
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          where: { validationStatus: 'VALID' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Enrichir avec des métadonnées calculées
    const enrichedCandidates = candidates.map(candidate => ({
      ...candidate,
      latestSolvencyProfile: candidate.solvencyProfiles[0] || null,
      activeApplicationsCount: candidate.applications.filter(
        app => !['REJECTED', 'ARCHIVED', 'WITHDRAWN'].includes(app.status)
      ).length,
      validDocumentsCount: candidate.documents.length
    }));

    res.json({
      success: true,
      count: enrichedCandidates.length,
      data: enrichedCandidates
    });

  } catch (error) {
    console.error('❌ Erreur getCandidates:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidats',
      error: error.message
    });
  }
};

/**
 * GET /api/candidates/:id
 * Récupère un candidat par ID avec toutes ses relations
 */
exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        solvencyProfiles: {
          include: {
            pursuitsDocument: true,
            liabilityDocument: true,
            guaranteeProof: true
          },
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        guarantors: {
          include: {
            documents: true
          }
        },
        applications: {
          include: {
            property: true,
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            threads: {
              include: {
                messages: {
                  orderBy: { receivedAt: 'desc' },
                  take: 5
                }
              }
            },
            events: {
              orderBy: { createdAt: 'desc' },
              take: 10,
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidat non trouvé'
      });
    }

    res.json({
      success: true,
      data: candidate
    });

  } catch (error) {
    console.error('❌ Erreur getCandidateById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du candidat',
      error: error.message
    });
  }
};

/**
 * POST /api/candidates
 * Crée un nouveau candidat avec profil de solvabilité
 */
exports.createCandidate = async (req, res) => {
  try {
    const {
      // Informations de base
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      
      // Spécificités suisses
      residencyStatus,
      permitType,
      permitExpiry,
      
      // Profil
      applicantType,
      isStudent,
      isSelfEmployed,
      monthlyIncome,
      currentRent,
      
      // Adresse actuelle
      currentAddress,
      currentCity,
      currentPostalCode,
      
      // Profil de solvabilité (optionnel)
      solvencyProfile
    } = req.body;

    // Validation des champs obligatoires
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Les champs firstName, lastName et email sont obligatoires'
      });
    }

    // Vérifier si l'email existe déjà
    const existingCandidate = await prisma.candidate.findUnique({
      where: { email }
    });

    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        message: 'Un candidat avec cet email existe déjà'
      });
    }

    // Créer le candidat avec transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer le candidat
      const newCandidate = await tx.candidate.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          residencyStatus: residencyStatus || 'NOT_DECLARED',
          permitType,
          permitExpiry: permitExpiry ? new Date(permitExpiry) : null,
          applicantType: applicantType || 'SINGLE',
          isStudent: isStudent || false,
          isSelfEmployed: isSelfEmployed || false,
          monthlyIncome,
          currentRent,
          currentAddress,
          currentCity,
          currentPostalCode
        }
      });

      // Créer le profil de solvabilité si fourni
      let newProfile = null;
      if (solvencyProfile) {
        newProfile = await tx.solvencyProfile.create({
          data: {
            candidateId: newCandidate.id,
            employmentType: solvencyProfile.employmentType || 'NOT_DECLARED',
            employerName: solvencyProfile.employerName,
            salarySlipsRequired: 3
          }
        });
      }

      return { candidate: newCandidate, profile: newProfile };
    });

    console.log(`✅ Candidat créé: ${result.candidate.firstName} ${result.candidate.lastName}`);

    res.status(201).json({
      success: true,
      message: 'Candidat créé avec succès',
      data: result
    });

  } catch (error) {
    console.error('❌ Erreur createCandidate:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du candidat',
      error: error.message
    });
  }
};

/**
 * PUT /api/candidates/:id
 * Met à jour un candidat
 */
exports.updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier que le candidat existe
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!existingCandidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidat non trouvé'
      });
    }

    // Gérer les dates
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    if (updateData.permitExpiry) {
      updateData.permitExpiry = new Date(updateData.permitExpiry);
    }

    // Mettre à jour le candidat
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: updateData,
      include: {
        solvencyProfiles: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        applications: {
          include: { property: true }
        }
      }
    });

    // Créer un log d'audit
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Candidate',
        entityId: id,
        changes: JSON.stringify({
          updated: Object.keys(updateData)
        })
      }
    });

    console.log(`✅ Candidat mis à jour: ${updatedCandidate.firstName} ${updatedCandidate.lastName}`);

    res.json({
      success: true,
      message: 'Candidat mis à jour avec succès',
      data: updatedCandidate
    });

  } catch (error) {
    console.error('❌ Erreur updateCandidate:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du candidat',
      error: error.message
    });
  }
};

/**
 * DELETE /api/candidates/:id
 * Supprime un candidat (soft delete)
 */
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le candidat existe
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: true
      }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidat non trouvé'
      });
    }

    // Vérifier s'il y a des candidatures actives
    const hasActiveApplications = candidate.applications.some(
      app => !['REJECTED', 'ARCHIVED', 'WITHDRAWN'].includes(app.status)
    );

    if (hasActiveApplications) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un candidat avec des candidatures actives'
      });
    }

    // Soft delete
    const deletedCandidate = await prisma.candidate.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    // Créer un log d'audit
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Candidate',
        entityId: id,
        changes: JSON.stringify({
          deletedAt: new Date(),
          name: `${candidate.firstName} ${candidate.lastName}`
        })
      }
    });

    console.log(`✅ Candidat supprimé (soft delete): ${candidate.firstName} ${candidate.lastName}`);

    res.json({
      success: true,
      message: 'Candidat supprimé avec succès',
      data: deletedCandidate
    });

  } catch (error) {
    console.error('❌ Erreur deleteCandidate:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du candidat',
      error: error.message
    });
  }
};

/**
 * GET /api/candidates/:id/solvency
 * Récupère le profil de solvabilité d'un candidat
 */
exports.getSolvencyProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await prisma.solvencyProfile.findFirst({
      where: { candidateId: id },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        pursuitsDocument: true,
        liabilityDocument: true,
        guaranteeProof: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profil de solvabilité non trouvé'
      });
    }

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('❌ Erreur getSolvencyProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil de solvabilité',
      error: error.message
    });
  }
};

module.exports = exports;
