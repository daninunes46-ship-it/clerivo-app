# 🛡️ CLERIVO DATAVAULT - COMMANDES RAPIDES

## 🚀 OPÉRATIONS QUOTIDIENNES

### Créer un backup manuel

```bash
cd apps/backend
node src/scripts/backup.js
```

**Durée estimée :** < 1 seconde  
**Sortie :** `./data/backups/backup-YYYY-MM-DDTHH-MM-SS.tar.gz`

---

### Restaurer un backup

```bash
cd apps/backend

# 1. Lister les backups disponibles
ls -lth ../../data/backups/backup-*.tar.gz | head -5

# 2. Restaurer (remplacer par le nom du fichier)
node src/scripts/restore.js backup-2026-02-06T20-07-35.tar.gz
```

**⚠️ ATTENTION :** La restauration écrase la DB et les uploads actuels. Un backup PRE-RESTORE est créé automatiquement.

---

### Lancer le Disaster Drill (Test complet)

```bash
cd apps/backend
node src/scripts/test-datavault.js
```

**Durée estimée :** ~2 secondes  
**Impact :** Aucun (crée et nettoie un candidat témoin)

---

## 🔍 VÉRIFICATIONS

### Voir les backups disponibles

```bash
ls -lth data/backups/backup-*.tar.gz
```

---

### Inspecter le contenu d'une archive

```bash
tar -tzf data/backups/backup-2026-02-06T20-07-35.tar.gz
```

---

### Vérifier l'intégrité (checksum)

```bash
# Voir le checksum attendu
jq -r '.archive.checksum' data/backups/backup-2026-02-06T20-07-35.json

# Calculer le checksum actuel
sha256sum data/backups/backup-2026-02-06T20-07-35.tar.gz
```

Les deux valeurs doivent être identiques.

---

### Voir les événements dans AuditLog

```bash
cd apps/backend
npx prisma studio
```

Puis filtrer `AuditLog` par action :
- `BACKUP_CREATED`
- `SYSTEM_RESTORED`

---

## 🆘 PROCÉDURES D'URGENCE

### Scénario 1 : DB corrompue, restaurer le dernier backup

```bash
cd apps/backend
node src/scripts/restore.js $(ls -t ../../data/backups/backup-*.tar.gz | head -1 | xargs basename)
```

---

### Scénario 2 : Restauration a échoué, revenir à l'état précédent

```bash
cd apps/backend
# Lister les backups PRE-RESTORE
ls -lth ../../data/backups/PRE-RESTORE-*.tar.gz

# Restaurer l'état précédent
node src/scripts/restore.js PRE-RESTORE-1770408456245.tar.gz
```

---

### Scénario 3 : Nettoyer les anciens backups PRE-RESTORE (manuel)

```bash
cd data/backups
rm -f PRE-RESTORE-*.tar.gz
```

**Note :** Les backups normaux sont automatiquement supprimés après 7 jours.

---

## 📄 DOCUMENTATION COMPLÈTE

**Référence technique :** `apps/backend/docs/DATAVAULT.md`

---

**Mise à jour :** 06 février 2026
