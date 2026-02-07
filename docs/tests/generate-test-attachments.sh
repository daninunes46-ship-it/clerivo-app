#!/bin/bash

# ============================================================================
# SCRIPT DE GÉNÉRATION DES PIÈCES JOINTES DE TEST
# Pour le test EMAIL DEEP CORE V1
# ============================================================================

echo "🔧 Génération des pièces jointes de test pour Clerivo Deep Core..."

# Créer le dossier de sortie
OUTDIR="./test-attachments"
mkdir -p "$OUTDIR"

# ============================================================================
# Fichier 1 : Fiche de Salaire Sophie
# ============================================================================
cat > "$OUTDIR/Fiche_Salaire_Sophie_Janv2026.txt" << 'EOF'
═══════════════════════════════════════════════════════
   FICHE DE SALAIRE - Janvier 2026
═══════════════════════════════════════════════════════

Employée : Sophie MARTINEZ
Numéro AVS : 756.1234.5678.90
Date de naissance : 15.03.1988

Employeur : Hôpital Cantonal Vaudois (CHUV)
Service : Soins Intensifs - Département de Médecine
Fonction : Infirmière diplômée HES
Taux d'activité : 100%
Ancienneté : 6 ans

═══════════════════════════════════════════════════════
   DÉTAIL DU SALAIRE
═══════════════════════════════════════════════════════

Salaire de base mensuel :               7'500.00 CHF
Prime d'ancienneté :                       800.00 CHF
Prime de nuit (4 gardes) :                 200.00 CHF
                                         ─────────────
SALAIRE BRUT :                           8'500.00 CHF

═══════════════════════════════════════════════════════
   DÉDUCTIONS SOCIALES
═══════════════════════════════════════════════════════

AVS/AI/APG (10.6%) :                      -901.00 CHF
Assurance chômage (2.2%) :                -187.00 CHF
LPP (2ème pilier) :                       -450.00 CHF
Assurance accidents (LAA) :                -68.00 CHF
Impôt à la source (non-résident) :        -94.00 CHF
                                         ─────────────
TOTAL DÉDUCTIONS :                      -1'700.00 CHF

═══════════════════════════════════════════════════════
   SALAIRE NET VERSÉ
═══════════════════════════════════════════════════════

SALAIRE NET :                            6'800.00 CHF

Versement le : 25 janvier 2026
IBAN bénéficiaire : CH93 0076 2011 6238 5295 7 (UBS)

═══════════════════════════════════════════════════════

Attestation conforme.
Hôpital Cantonal Vaudois - Service RH
Rue du Bugnon 21, 1011 Lausanne

Date d'émission : 24.01.2026
Signature RH : [Cachet électronique CHUV]
EOF

# ============================================================================
# Fichier 2 : Extrait Poursuites Sophie
# ============================================================================
cat > "$OUTDIR/Extrait_Poursuites_Sophie_28Jan2026.txt" << 'EOF'
═══════════════════════════════════════════════════════
   CANTON DE VAUD
   OFFICE DES POURSUITES ET FAILLITES
═══════════════════════════════════════════════════════

   EXTRAIT DU REGISTRE DES POURSUITES
   (Art. 8a LP - Loi fédérale sur la poursuite)

═══════════════════════════════════════════════════════

PERSONNE CONCERNÉE :
Nom, Prénom :            MARTINEZ Sophie
Date de naissance :      15.03.1988
Domicile actuel :        Chemin des Acacias 12, 1006 Lausanne

OFFICE COMPÉTENT :
Office des poursuites de Lausanne
Place de la Riponne 10
1014 Lausanne

═══════════════════════════════════════════════════════
   RÉSULTAT DE LA RECHERCHE
═══════════════════════════════════════════════════════

PÉRIODE CONSULTÉE : 5 dernières années (2020-2025)

╔═══════════════════════════════════════════════════╗
║                                                   ║
║   ✅ AUCUNE POURSUITE EN COURS                    ║
║                                                   ║
║   Aucune inscription au registre des poursuites  ║
║   pour la personne désignée ci-dessus.            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════

DATE D'ÉMISSION : 28 janvier 2026
VALIDITÉ : 3 mois (jusqu'au 28 avril 2026)

Numéro d'attestation : VD-LP-2026-012345

Attestation officielle délivrée conformément à l'art. 8a LP.
Ce document ne peut être utilisé que dans le cadre d'une 
demande de location (usage conforme LPD).

═══════════════════════════════════════════════════════

[Cachet officiel : Office des Poursuites Canton de Vaud]
[Signature électronique certifiée]

Document authentique - Vérification en ligne :
https://poursuites.vd.ch/verify?ref=VD-LP-2026-012345
EOF

# ============================================================================
# Fichier 3 : Attestation RC Couple
# ============================================================================
cat > "$OUTDIR/Attestation_RC_Couple.txt" << 'EOF'
═══════════════════════════════════════════════════════
        HELVETIA ASSURANCES SUISSE
═══════════════════════════════════════════════════════

   ATTESTATION D'ASSURANCE RESPONSABILITÉ CIVILE
   PRIVÉE ET MÉNAGE (RC)

═══════════════════════════════════════════════════════

ASSURÉS :
- MARTINEZ Sophie, née le 15.03.1988
- DUBOIS Marc, né le 22.07.1985

Domicile actuel :
Chemin des Acacias 12
1006 Lausanne
Canton de Vaud

═══════════════════════════════════════════════════════
   CARACTÉRISTIQUES DE LA POLICE
═══════════════════════════════════════════════════════

Numéro de police :      RC-2024-789456
Type de contrat :       RC Privée & Ménage Famille
Date d'effet :          01.01.2024
Date d'échéance :       31.12.2026 (renouvellement automatique)
Statut :                ✅ EN VIGUEUR

═══════════════════════════════════════════════════════
   COUVERTURES INCLUSES
═══════════════════════════════════════════════════════

✅ Responsabilité civile privée :    5'000'000 CHF
✅ Dommages locatifs :                  500'000 CHF
✅ Objets confiés :                     100'000 CHF
✅ Animal domestique (chat) :               INCLUS
✅ Clés perdues (serrures) :             50'000 CHF
✅ Franchise :                             200 CHF

═══════════════════════════════════════════════════════
   CONFIRMATION POUR LOCATION
═══════════════════════════════════════════════════════

Cette attestation confirme que les personnes désignées 
ci-dessus bénéficient d'une couverture RC complète 
conforme aux exigences des bailleurs suisses.

La police est valide et les primes sont à jour.

═══════════════════════════════════════════════════════

Date d'émission : 05 février 2026
Lieu : Bâle

Pour Helvetia Assurances Suisse SA
Service Attestations - Département Particuliers

[Logo Helvetia]
[Signature électronique certifiée]

═══════════════════════════════════════════════════════

Contact Service Clients :
📞 0800 74 74 74 (gratuit)
📧 service.clients@helvetia.ch
🌐 www.helvetia.ch

Document authentique - Code de vérification : HEL-RC-2026-789456
EOF

# ============================================================================
# Conversion en "pseudo-PDF" (fichiers texte renommés)
# Pour un vrai test, utilisez ces contenus dans de vrais PDFs
# ============================================================================

echo "📄 Fichiers texte générés dans : $OUTDIR/"
echo ""
echo "Pour simuler des PDFs, vous pouvez :"
echo "1. Renommer les .txt en .pdf (le serveur les acceptera)"
echo "2. OU utiliser un outil en ligne pour convertir TXT → PDF :"
echo "   - https://www.ilovepdf.com/txt_to_pdf"
echo "   - https://convertio.co/txt-pdf/"
echo ""
echo "🎯 Fichiers créés :"
ls -lh "$OUTDIR/"

echo ""
echo "✅ Génération terminée !"
echo ""
echo "📧 Prochaine étape :"
echo "   1. Ouvrez votre client email"
echo "   2. Créez un nouveau message à clerivotest@gmail.com"
echo "   3. Copiez le contenu depuis TEST_EMAIL_DEEP_CORE_V1.md"
echo "   4. Attachez les 3 fichiers de $OUTDIR/"
echo "   5. ENVOYEZ ! 🚀"
echo ""
