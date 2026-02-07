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

    // CRITIQUE : Exclure les candidats soft-deleted
    where.deletedAt = null;

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
    console.log('═══════════════════════════════════════════════════════');
    console.log('📥 POST /api/candidates - PAYLOAD REÇU:');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('═══════════════════════════════════════════════════════');
    
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

    // Validation des champs obligatoires (assouplissement pour "Neural Inbox")
    // L'email est le seul vraiment critique pour éviter les doublons
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Le champ email est obligatoire'
      });
    }
    
    // Fallback pour les champs manquants (parsing IA incomplet)
    const safeFirstName = firstName || 'Inconnu';
    const safeLastName = lastName || 'N/A';

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

    // ═══════════════════════════════════════════════════════════════
    // TRANSACTION ATOMIQUE (CRITICAL)
    // ═══════════════════════════════════════════════════════════════
    // Si la création du Candidate OU de l'Application échoue,
    // TOUTE la transaction est annulée (rollback automatique).
    // Cela garantit qu'on ne crée JAMAIS de "candidats orphelins".
    // ═══════════════════════════════════════════════════════════════
    const result = await prisma.$transaction(async (tx) => {
      // Créer le candidat
      const newCandidate = await tx.candidate.create({
        data: {
          firstName: safeFirstName,
          lastName: safeLastName,
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

      // ✨ CRÉER UNE APPLICATION PAR DÉFAUT (OBLIGATOIRE pour Pipeline)
      // Si cette création échoue, le Candidate ci-dessus sera rollback.
      const newApplication = await tx.application.create({
        data: {
          candidateId: newCandidate.id,
          status: 'NEW', // Par défaut, le candidat arrive dans "Nouveaux"
          readinessStatus: 'INCOMPLETE',
          priority: 'MEDIUM',
          source: 'CRM', // Peut être changé dynamiquement plus tard
          notes: req.body.notes || null // Notes du parsing IA (Frontend)
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

      return { candidate: newCandidate, application: newApplication, profile: newProfile };
    }, {
      maxWait: 5000, // Temps max d'attente pour acquérir le verrou (5s)
      timeout: 10000, // Temps max d'exécution de la transaction (10s)
    });

    console.log(`✅ CANDIDAT CRÉÉ: ${result.candidate.firstName} ${result.candidate.lastName} (ID: ${result.candidate.id})`);
    console.log(`✅ APPLICATION CRÉÉE: ID ${result.application.id}, Status: ${result.application.status}`);
    console.log(`📋 Notes stockées: ${result.candidate.notes ? 'OUI' : 'NON'}`);

    res.status(201).json({
      success: true,
      message: 'Candidat créé avec succès',
      data: result
    });

  } catch (error) {
    console.error('❌ ERREUR CRITIQUE createCandidate:', error);
    
    // Logging détaillé pour diagnostic
    console.error('   Type:', error.constructor.name);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      // Contrainte unique violée (email déjà existant normalement déjà géré)
      return res.status(409).json({
        success: false,
        message: 'Un candidat avec cet email existe déjà'
      });
    }
    
    if (error.code === 'P2025') {
      // Record requis non trouvé (Foreign key)
      return res.status(400).json({
        success: false,
        message: 'Erreur de relation : vérifiez les identifiants référencés'
      });
    }
    
    // Erreur de transaction timeout
    if (error.message.includes('Transaction') || error.message.includes('timeout')) {
      return res.status(503).json({
        success: false,
        message: 'Timeout de la transaction. Réessayez dans quelques instants.',
        error: error.message
      });
    }
    
    // Erreur générique
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du candidat',
      error: error.message,
      hint: 'Aucun enregistrement n\'a été créé (transaction annulée).'
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
 * Supprime un candidat (soft delete) + ses applications
 * 
 * COMPORTEMENT V1:
 * - Soft-delete toutes les applications liées (même actives)
 * - Soft-delete le candidat
 * - Conserve les documents (DataVault)
 * - Log audit pour traçabilité
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

    console.log(`🗑️ Suppression candidat: ${candidate.firstName} ${candidate.lastName}`);
    console.log(`   Applications liées: ${candidate.applications.length}`);

    // ═══════════════════════════════════════════════════════════════
    // TRANSACTION ATOMIQUE (soft-delete Applications + Candidate)
    // ═══════════════════════════════════════════════════════════════
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      
      // 1. Soft-delete toutes les applications liées
      const deletedApps = await tx.application.updateMany({
        where: { 
          candidateId: id,
          deletedAt: null // Seulement celles non déjà supprimées
        },
        data: { deletedAt: now }
      });
      
      console.log(`   ✅ ${deletedApps.count} application(s) soft-deleted`);

      // 2. Soft-delete le candidat
      const deletedCandidate = await tx.candidate.update({
        where: { id },
        data: { deletedAt: now }
      });
      
      // 3. Log d'audit
      await tx.auditLog.create({
        data: {
          action: 'DELETE',
          entityType: 'Candidate',
          entityId: id,
          changes: JSON.stringify({
            deletedAt: now,
            name: `${candidate.firstName} ${candidate.lastName}`,
            applicationsDeleted: deletedApps.count
          })
        }
      });
      
      return { candidate: deletedCandidate, applicationsCount: deletedApps.count };
    });

    console.log(`✅ Candidat supprimé (soft delete): ${candidate.firstName} ${candidate.lastName}`);
    console.log(`   + ${result.applicationsCount} application(s) archivée(s)`);

    res.json({
      success: true,
      message: 'Candidat supprimé avec succès',
      data: result.candidate
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

/**
 * POST /api/candidates/:id/documents
 * Upload un document pour un candidat (Swiss Safe)
 */
exports.uploadDocument = async (req, res) => {
  console.log("!!! CODE UPDATED V2 - FIX APPLIED !!!");
  // #region agent log
  const fs = require('fs');
  const crypto = require('crypto');
  const runId = `run_${Date.now()}`;
  try {
    const debugPayload = {
      location: 'candidateController.js:uploadDocument:start',
      message: 'Starting document upload',
      data: { 
        candidateId: req.params.id, 
        hasFile: !!req.file,
        fileDetails: req.file ? { 
          originalname: req.file.originalname, 
          mimetype: req.file.mimetype, 
          size: req.file.size 
        } : null
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: runId,
      hypothesisId: 'schema_mismatch_fix'
    };
    fs.appendFileSync('/home/clerivo2/projects/clerivo/.cursor/debug.log', JSON.stringify(debugPayload) + '\n');
  } catch (e) {}
  // #endregion

  try {
    const { id } = req.params;
    
    // Vérifier qu'un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploadé'
      });
    }

    // Vérifier que le candidat existe
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        solvencyProfiles: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidat non trouvé'
      });
    }

    // Extraire les métadonnées du fichier
    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    const { documentType } = req.body;

    // Calcul du checksum (Requis par le schéma: String @unique)
    let fileChecksum;
    try {
        const fileBuffer = fs.readFileSync(filePath);
        fileChecksum = crypto.createHash('md5').update(fileBuffer).digest('hex');
    } catch (err) {
        // Fallback unique si lecture impossible
        fileChecksum = `${filename}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    const documentData = {
      candidate: { connect: { id: id } },
      documentType: documentType || 'OTHER',
      filename: filename,
      originalName: originalname,
      mimeType: mimetype,
      size: size,
      storagePath: filePath,
      checksum: fileChecksum,
      validationStatus: 'PENDING',
      isEncrypted: true
    };

    // #region agent log
    try {
      fs.appendFileSync('/home/clerivo2/projects/clerivo/.cursor/debug.log', JSON.stringify({
        location: 'candidateController.js:uploadDocument:beforeCreate',
        message: 'Payload for prisma.document.create',
        data: { documentData },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: runId,
        hypothesisId: 'schema_mismatch_fix'
      }) + '\n');
    } catch (e) {}
    // #endregion

    // Créer l'entrée Document dans la base
    const document = await prisma.document.create({
      data: documentData
    });

    // Mise à jour du score (logique métier adaptée sans le champ inexistant isSwissOfficial)
    const isSwissOfficialType = ['PURSUITS_EXTRACT', 'IDENTITY_CARD', 'PERMIT'].includes(documentType);
    
    if (isSwissOfficialType && candidate.solvencyProfiles && candidate.solvencyProfiles[0]) {
      const currentScore = candidate.solvencyProfiles[0].solvencyScore || 0;
      const newScore = Math.min(100, currentScore + 10);

      await prisma.solvencyProfile.update({
        where: { id: candidate.solvencyProfiles[0].id },
        data: { solvencyScore: newScore }
      });
    }

    // #region agent log
    try {
      fs.appendFileSync('/home/clerivo2/projects/clerivo/.cursor/debug.log', JSON.stringify({
        location: 'candidateController.js:uploadDocument:success',
        message: 'Document created successfully',
        data: { documentId: document.id },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: runId,
        hypothesisId: 'schema_mismatch_fix'
      }) + '\n');
    } catch (e) {}
    // #endregion

    console.log(`🎉 Upload complet: ${originalname} pour ${candidate.firstName} ${candidate.lastName}`);

    res.status(201).json({
      success: true,
      message: 'Document uploadé avec succès',
      data: document
    });

  } catch (error) {
    // #region agent log
    try {
      fs.appendFileSync('/home/clerivo2/projects/clerivo/.cursor/debug.log', JSON.stringify({
        location: 'candidateController.js:uploadDocument:error',
        message: 'Error creating document',
        data: { error: error.message, stack: error.stack },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: runId,
        hypothesisId: 'schema_mismatch_fix'
      }) + '\n');
    } catch (e) {}
    // #endregion

    console.error('❌ Erreur uploadDocument:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du document',
      error: error.message
    });
  }
};

module.exports = exports;
