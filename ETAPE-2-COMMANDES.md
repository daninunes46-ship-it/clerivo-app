# 🚀 ÉTAPE 2 : COMMANDES ESSENTIELLES

## ⚡ DÉMARRAGE RAPIDE (30 SECONDES)

```bash
# 1. Aller dans le backend
cd apps/backend

# 2. Démarrer le serveur
npm start
```

Le serveur démarre sur `http://127.0.0.1:3010`

---

## 🧪 TESTER L'AUTHENTIFICATION

### Option 1 : Tests automatisés (RECOMMANDÉ)

```bash
cd apps/backend
bash src/scripts/test-auth.sh
```

**Résultat attendu :**
```
✅ TEST 1 : Login Admin (HTTP 200)
✅ TEST 2 : Récupération profil (HTTP 200)
✅ TEST 3 : Logout (HTTP 200)
✅ TEST 4 : Session détruite après logout (HTTP 401)
✅ TEST 5 : Login échoué avec mauvais mot de passe (HTTP 401)
```

### Option 2 : Test manuel avec cURL

```bash
# Login
curl -X POST http://127.0.0.1:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clerivo.ch","password":"admin123"}' \
  -c cookies.txt

# Récupérer le profil
curl http://127.0.0.1:3010/api/auth/me -b cookies.txt

# Logout
curl -X POST http://127.0.0.1:3010/api/auth/logout -b cookies.txt
```

---

## 👤 COMPTES DE TEST

| Email              | Password | Rôle  |
|--------------------|----------|-------|
| admin@clerivo.ch   | admin123 | ADMIN |
| agent@clerivo.ch   | agent123 | AGENT |

---

## 📊 VÉRIFIER LA BASE DE DONNÉES

### Voir les utilisateurs

```bash
cd apps/backend
node src/scripts/check-users.js
```

### Ouvrir Prisma Studio (GUI)

```bash
npm run db:studio
```

Puis ouvrir : http://localhost:5555

---

## 🔄 COMMANDES UTILES

### Re-créer les utilisateurs de test

```bash
npm run db:seed
```

### Synchroniser le schema Prisma

```bash
npm run db:push
```

### Voir les logs du serveur en temps réel

```bash
npm run dev
```

---

## 📁 DOCUMENTATION COMPLÈTE

- **Technique :** `apps/backend/docs/STEP-2-AUTH.md`
- **Récapitulatif CTO :** `apps/backend/ETAPE-2-RECAP.md`

---

## 🆘 EN CAS DE PROBLÈME

### Le serveur ne démarre pas

```bash
# Vérifier si le port est occupé
lsof -i:3010

# Tuer le processus
lsof -ti:3010 | xargs kill
```

### Les tests échouent (HTTP 401)

```bash
# Re-seeder les utilisateurs
npm run db:seed

# Redémarrer le serveur
npm start
```

### Vérifier que tout fonctionne

```bash
# 1. Vérifier les utilisateurs
node src/scripts/check-users.js

# 2. Tester l'auth
bash src/scripts/test-auth.sh
```

---

**✅ ÉTAPE 2 COMPLÉTÉE PAR HERMÈS LE 06/02/2026**
