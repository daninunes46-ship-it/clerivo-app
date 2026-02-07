#!/bin/bash

# ============================================================================
# SCRIPT DE VÉRIFICATION AUTOMATIQUE - TEST EMAIL DEEP CORE
# Exécutez ce script APRÈS avoir envoyé l'email de test
# ============================================================================

echo "🔍 VÉRIFICATION DES RÉSULTATS DU TEST EMAIL DEEP CORE"
echo "======================================================"
echo ""

# Couleurs pour la sortie
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCORE=0
TOTAL=0

# ============================================================================
# 1. VÉRIFIER QUE LE BACKEND TOURNE
# ============================================================================
echo -e "${BLUE}[TEST 1]${NC} Vérification du backend..."
TOTAL=$((TOTAL + 1))

if curl -s http://localhost:3010/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend opérationnel sur port 3010${NC}"
    SCORE=$((SCORE + 1))
else
    echo -e "${RED}❌ Backend non accessible sur port 3010${NC}"
    echo "   → Lancez : cd apps/backend && npm run dev"
fi
echo ""

# ============================================================================
# 2. VÉRIFIER LES CREDENTIALS IMAP
# ============================================================================
echo -e "${BLUE}[TEST 2]${NC} Vérification configuration IMAP..."
TOTAL=$((TOTAL + 1))

if [ -f "../../apps/backend/.env" ]; then
    if grep -q "IMAP_USER=clerivotest@gmail.com" ../../apps/backend/.env; then
        echo -e "${GREEN}✅ IMAP_USER correctement configuré${NC}"
        SCORE=$((SCORE + 1))
    else
        echo -e "${RED}❌ IMAP_USER non configuré${NC}"
    fi
else
    echo -e "${RED}❌ Fichier .env introuvable${NC}"
fi
echo ""

# ============================================================================
# 3. VÉRIFIER LA CLÉ OPENAI
# ============================================================================
echo -e "${BLUE}[TEST 3]${NC} Vérification clé OpenAI..."
TOTAL=$((TOTAL + 1))

if [ -f "../../apps/backend/.env" ]; then
    if grep -q "OPENAI_API_KEY=sk-" ../../apps/backend/.env; then
        echo -e "${GREEN}✅ Clé OpenAI présente${NC}"
        SCORE=$((SCORE + 1))
    else
        echo -e "${RED}❌ Clé OpenAI manquante ou invalide${NC}"
    fi
else
    echo -e "${RED}❌ Fichier .env introuvable${NC}"
fi
echo ""

# ============================================================================
# 4. VÉRIFIER LE CACHE IA (métadonnées)
# ============================================================================
echo -e "${BLUE}[TEST 4]${NC} Vérification cache IA..."
TOTAL=$((TOTAL + 1))

AI_METADATA="../../data/storage/ai_metadata.json"
if [ -f "$AI_METADATA" ]; then
    # Compter le nombre d'analyses dans le cache
    NUM_ANALYSES=$(jq 'keys | length' "$AI_METADATA" 2>/dev/null || echo "0")
    if [ "$NUM_ANALYSES" -gt 0 ]; then
        echo -e "${GREEN}✅ Cache IA contient $NUM_ANALYSES analyse(s)${NC}"
        SCORE=$((SCORE + 1))
        
        # Vérifier si l'email de test est présent (recherche "Sophie" ou "Martinez")
        if grep -q "Sophie\|Martinez\|Lausanne" "$AI_METADATA" 2>/dev/null; then
            echo -e "${GREEN}   ✨ Email de test 'Sophie Martinez' détecté !${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Cache IA vide (aucune analyse encore)${NC}"
        echo "   → Ouvrez un email dans l'UI pour déclencher l'analyse"
    fi
else
    echo -e "${RED}❌ Fichier ai_metadata.json introuvable${NC}"
    echo "   → Créez le dossier : mkdir -p ../../data/storage"
fi
echo ""

# ============================================================================
# 5. VÉRIFIER LA BASE DE DONNÉES
# ============================================================================
echo -e "${BLUE}[TEST 5]${NC} Vérification base de données..."
TOTAL=$((TOTAL + 1))

DB_FILE="../../data/clerivo.db"
if [ -f "$DB_FILE" ]; then
    echo -e "${GREEN}✅ Base de données présente${NC}"
    SCORE=$((SCORE + 1))
    
    # Afficher la taille
    DB_SIZE=$(du -h "$DB_FILE" | cut -f1)
    echo "   Taille : $DB_SIZE"
else
    echo -e "${RED}❌ Base de données introuvable${NC}"
    echo "   → Initialisez : cd apps/backend && npx prisma migrate dev"
fi
echo ""

# ============================================================================
# 6. TESTER L'API EMAILS
# ============================================================================
echo -e "${BLUE}[TEST 6]${NC} Test API récupération emails..."
TOTAL=$((TOTAL + 1))

API_RESPONSE=$(curl -s http://localhost:3010/api/emails 2>/dev/null)
if [ $? -eq 0 ]; then
    # Vérifier si la réponse contient "success"
    if echo "$API_RESPONSE" | grep -q '"success".*true'; then
        EMAIL_COUNT=$(echo "$API_RESPONSE" | jq '.count' 2>/dev/null || echo "?")
        echo -e "${GREEN}✅ API emails opérationnelle ($EMAIL_COUNT emails)${NC}"
        SCORE=$((SCORE + 1))
        
        # Vérifier si l'email de test est dans la réponse
        if echo "$API_RESPONSE" | grep -q "Sophie\|Martinez\|Lausanne"; then
            echo -e "${GREEN}   ✨ Email de test 'Sophie Martinez' trouvé dans l'API !${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Email de test non trouvé (peut-être pas encore envoyé)${NC}"
        fi
    else
        echo -e "${RED}❌ API retourne une erreur${NC}"
        echo "   Réponse : ${API_RESPONSE:0:100}..."
    fi
else
    echo -e "${RED}❌ Impossible de contacter l'API${NC}"
fi
echo ""

# ============================================================================
# 7. VÉRIFIER LES FICHIERS DE TEST
# ============================================================================
echo -e "${BLUE}[TEST 7]${NC} Vérification fichiers pièces jointes de test..."
TOTAL=$((TOTAL + 1))

ATTACHMENTS_DIR="./test-attachments"
if [ -d "$ATTACHMENTS_DIR" ]; then
    NUM_FILES=$(ls -1 "$ATTACHMENTS_DIR"/*.pdf 2>/dev/null | wc -l)
    if [ "$NUM_FILES" -eq 3 ]; then
        echo -e "${GREEN}✅ 3 fichiers PDF de test présents${NC}"
        SCORE=$((SCORE + 1))
        ls -lh "$ATTACHMENTS_DIR"/*.pdf | awk '{print "   - " $9 " (" $5 ")"}'
    else
        echo -e "${RED}❌ Nombre incorrect de fichiers ($NUM_FILES au lieu de 3)${NC}"
        echo "   → Relancez : ./generate-test-attachments.sh"
    fi
else
    echo -e "${RED}❌ Dossier test-attachments introuvable${NC}"
    echo "   → Générez les fichiers : ./generate-test-attachments.sh"
fi
echo ""

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================
echo "======================================================"
echo -e "${BLUE}RÉSUMÉ DU TEST${NC}"
echo "======================================================"
echo ""

PERCENTAGE=$((SCORE * 100 / TOTAL))

if [ $SCORE -eq $TOTAL ]; then
    echo -e "${GREEN}🎉 PARFAIT ! Score : $SCORE/$TOTAL (100%)${NC}"
    echo ""
    echo "✅ Tous les systèmes sont opérationnels !"
    echo "📧 Vous pouvez maintenant envoyer l'email de test."
elif [ $PERCENTAGE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  ACCEPTABLE. Score : $SCORE/$TOTAL ($PERCENTAGE%)${NC}"
    echo ""
    echo "Le système est majoritairement opérationnel."
    echo "Vérifiez les points en échec ci-dessus avant le test complet."
else
    echo -e "${RED}❌ CRITIQUE. Score : $SCORE/$TOTAL ($PERCENTAGE%)${NC}"
    echo ""
    echo "Plusieurs systèmes sont défaillants."
    echo "Corrigez les erreurs avant d'envoyer l'email de test."
fi

echo ""
echo "======================================================"
echo ""

# ============================================================================
# ACTIONS RECOMMANDÉES
# ============================================================================
if [ $SCORE -lt $TOTAL ]; then
    echo -e "${BLUE}ACTIONS RECOMMANDÉES :${NC}"
    echo ""
    
    if [ $SCORE -lt 2 ]; then
        echo "1. Démarrez le backend :"
        echo "   cd ../../apps/backend && npm run dev"
        echo ""
    fi
    
    if [ ! -f "$AI_METADATA" ]; then
        echo "2. Créez le dossier de stockage :"
        echo "   mkdir -p ../../data/storage"
        echo ""
    fi
    
    if [ ! -d "$ATTACHMENTS_DIR" ]; then
        echo "3. Générez les fichiers de test :"
        echo "   ./generate-test-attachments.sh"
        echo ""
    fi
fi

# ============================================================================
# PROCHAINES ÉTAPES
# ============================================================================
echo -e "${BLUE}PROCHAINES ÉTAPES :${NC}"
echo ""
if [ $SCORE -ge $((TOTAL * 7 / 10)) ]; then
    echo "1. ✅ Systèmes prêts"
    echo "2. 📧 Envoyez l'email de test (voir GUIDE_RAPIDE_TEST.md)"
    echo "3. 🔍 Surveillez les logs backend"
    echo "4. 🌐 Ouvrez http://localhost:5173/inbox"
    echo "5. 📊 Vérifiez les résultats (voir TEST_EMAIL_DEEP_CORE_V1.md)"
else
    echo "1. ⚠️  Corrigez les erreurs ci-dessus"
    echo "2. 🔄 Relancez ce script : ./verify-test-results.sh"
    echo "3. 📧 Envoyez l'email uniquement si score > 70%"
fi

echo ""
echo "======================================================"
echo ""
echo "📚 Documentation complète :"
echo "   - Guide rapide : GUIDE_RAPIDE_TEST.md"
echo "   - Test complet : TEST_EMAIL_DEEP_CORE_V1.md"
echo ""
echo "🆘 En cas de problème :"
echo "   - Logs backend : tail -f ../../apps/backend/logs/app.log"
echo "   - Console navigateur : F12 dans Chrome/Firefox"
echo ""
