#!/bin/bash

# ============================================================================
# SCRIPT DE TEST : Authentification Clerivo (Étape 2)
# ============================================================================

BASE_URL="http://127.0.0.1:3010"
COOKIES_FILE="/tmp/clerivo-cookies.txt"

echo "🧪 Test du système d'authentification Clerivo"
echo "================================================"
echo ""

# Nettoyage des cookies précédents
rm -f $COOKIES_FILE

# ============================================================================
# TEST 1 : LOGIN avec credentials valides (Admin)
# ============================================================================
echo "📍 TEST 1 : Login Admin (admin@clerivo.ch)"
echo "-------------------------------------------"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clerivo.ch","password":"admin123"}' \
  -c $COOKIES_FILE \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "Statut HTTP: $HTTP_STATUS"
echo "Réponse: $BODY"

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Login réussi"
else
  echo "❌ Login échoué"
  exit 1
fi

echo ""

# ============================================================================
# TEST 2 : Récupération du profil utilisateur (GET /me)
# ============================================================================
echo "📍 TEST 2 : Récupération du profil utilisateur"
echo "-----------------------------------------------"

RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -b $COOKIES_FILE \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "Statut HTTP: $HTTP_STATUS"
echo "Réponse: $BODY"

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Profil récupéré"
else
  echo "❌ Récupération échouée"
  exit 1
fi

echo ""

# ============================================================================
# TEST 3 : Logout
# ============================================================================
echo "📍 TEST 3 : Déconnexion (Logout)"
echo "---------------------------------"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -b $COOKIES_FILE \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "Statut HTTP: $HTTP_STATUS"
echo "Réponse: $BODY"

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Logout réussi"
else
  echo "❌ Logout échoué"
  exit 1
fi

echo ""

# ============================================================================
# TEST 4 : Vérification que la session est bien détruite
# ============================================================================
echo "📍 TEST 4 : Vérification destruction session (GET /me après logout)"
echo "--------------------------------------------------------------------"

RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -b $COOKIES_FILE \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "Statut HTTP: $HTTP_STATUS"
echo "Réponse: $BODY"

if [ "$HTTP_STATUS" -eq 401 ]; then
  echo "✅ Session bien détruite (HTTP 401 attendu)"
else
  echo "❌ Session toujours active (problème)"
  exit 1
fi

echo ""

# ============================================================================
# TEST 5 : Login échoué avec mauvais credentials
# ============================================================================
echo "📍 TEST 5 : Login échoué (mauvais mot de passe)"
echo "------------------------------------------------"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clerivo.ch","password":"wrongpassword"}' \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//g')

echo "Statut HTTP: $HTTP_STATUS"
echo "Réponse: $BODY"

if [ "$HTTP_STATUS" -eq 401 ]; then
  echo "✅ Login échoué comme attendu (HTTP 401)"
else
  echo "❌ Login n'a pas échoué (problème de sécurité)"
  exit 1
fi

echo ""
echo "================================================"
echo "🎉 Tous les tests sont passés avec succès !"
echo "================================================"

# Nettoyage
rm -f $COOKIES_FILE
