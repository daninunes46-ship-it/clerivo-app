#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "🔍 DIAGNOSTIC CLERIVO - Problèmes Pipeline & Bouton Action"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 1. Vérifier que le backend tourne
echo "1️⃣ Vérification Backend..."
if curl -s http://localhost:5000/api/admin/stats > /dev/null 2>&1; then
    echo "   ✅ Backend accessible sur port 5000"
    curl -s http://localhost:5000/api/admin/stats | jq '.'
else
    echo "   ❌ Backend inaccessible ! Lancez 'cd apps/backend && npm start'"
fi
echo ""

# 2. Vérifier les candidats en DB
echo "2️⃣ Vérification Base de Données..."
cd /home/clerivo2/projects/clerivo/apps/backend
echo "SELECT COUNT(*) as total FROM Candidate WHERE deletedAt IS NULL;" | sqlite3 prisma/dev.db
echo "   candidats actifs trouvés"
echo ""

# 3. Vérifier les candidats orphelins
echo "3️⃣ Vérification Candidats Orphelins..."
ORPHANS=$(echo "
SELECT COUNT(*) FROM Candidate c 
WHERE c.deletedAt IS NULL 
AND NOT EXISTS (SELECT 1 FROM Application a WHERE a.candidateId = c.id AND a.deletedAt IS NULL);
" | sqlite3 prisma/dev.db)
echo "   $ORPHANS candidats orphelins (sans Application)"
echo ""

# 4. Test API GET /api/candidates
echo "4️⃣ Test API GET /api/candidates..."
RESPONSE=$(curl -s http://localhost:5000/api/candidates)
COUNT=$(echo $RESPONSE | jq '.count // 0')
echo "   Candidats retournés par l'API: $COUNT"
echo ""

# 5. Afficher les derniers candidats
echo "5️⃣ Derniers Candidats Créés (Top 5)..."
echo "SELECT id, firstName, lastName, email, datetime(createdAt) as created 
FROM Candidate 
WHERE deletedAt IS NULL 
ORDER BY createdAt DESC 
LIMIT 5;" | sqlite3 -header -column prisma/dev.db
echo ""

# 6. Afficher leurs applications
echo "6️⃣ Applications Associées..."
echo "SELECT 
  c.firstName || ' ' || c.lastName as Candidat,
  a.id as AppId,
  a.status,
  datetime(a.createdAt) as created
FROM Candidate c
LEFT JOIN Application a ON c.id = a.candidateId AND a.deletedAt IS NULL
WHERE c.deletedAt IS NULL
ORDER BY c.createdAt DESC
LIMIT 5;" | sqlite3 -header -column prisma/dev.db
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "📋 ACTIONS RECOMMANDÉES"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Si candidats orphelins > 0:"
echo "   → Exécutez: curl http://localhost:5000/api/admin/fix-pipeline"
echo ""
echo "Si le bouton Action ne fonctionne pas:"
echo "   → Vérifiez la console du navigateur (F12)"
echo "   → Rechargez la page (Ctrl+R ou Cmd+R)"
echo "   → Videz le cache (Ctrl+Shift+R ou Cmd+Shift+R)"
echo ""
echo "Pour tester l'ajout depuis Inbox:"
echo "   → Allez dans Inbox, sélectionnez un email"
echo "   → Cliquez 'Ajouter au Pipeline'"
echo "   → Vérifiez les logs console (F12)"
echo "   → Le Pipeline devrait se rafraîchir automatiquement"
echo ""
