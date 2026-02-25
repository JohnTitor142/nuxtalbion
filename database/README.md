# Scripts de base de données

## ⚠️ IMPORTANT : Quel script utiliser ?

### 🆕 Nouvelle installation (base vide)
➡️ Utilisez : **`simple-schema.sql`**
- Crée toutes les tables depuis zéro
- ⚠️ **ATTENTION** : Supprime toutes les données existantes !
- À utiliser uniquement si vous démarrez un nouveau projet

### 🔄 Migration (base existante avec données)
➡️ Utilisez : **`migration-add-items.sql`**
- Ajoute les nouvelles tables sans supprimer les données
- ✅ **SÉCURISÉ** : Préserve toutes vos données existantes
- Modifie la structure de la table weapons sans perte de données
- À utiliser si vous avez déjà des données dans votre base

## 📋 Contenu des scripts

### `simple-schema.sql` - Schéma complet (DESTRUCTIF)
```sql
-- ⚠️ Ce script supprime TOUT et recrée la base depuis zéro
DROP TABLE IF EXISTS ... -- Supprime toutes les tables
CREATE TABLE ... -- Recrée toutes les tables
```

**Tables créées :**
- users_profiles
- weapons
- armors (nouveau)
- accessories (nouveau)
- consumables (nouveau)
- compositions
- composition_slots
- activities
- activity_registrations
- roasters

### `migration-add-items.sql` - Migration sécurisée (SAFE)
```sql
-- ✅ Ce script préserve vos données existantes
ALTER TABLE weapons ... -- Modifie la structure uniquement
CREATE TABLE IF NOT EXISTS armors ... -- Crée uniquement si absent
CREATE TABLE IF NOT EXISTS accessories ...
CREATE TABLE IF NOT EXISTS consumables ...
```

**Ce qui est fait :**
- Modifie la table weapons pour ajouter les nouvelles colonnes
- Crée les tables armors, accessories, consumables
- Ne touche PAS aux autres tables existantes
- Peut être exécuté plusieurs fois sans danger

## 🚀 Comment utiliser

### Scénario 1 : Vous avez déjà des données (RECOMMANDÉ)

1. **Faites une sauvegarde** (voir section ci-dessous)

2. **Exécutez le script de migration** :
   - Connectez-vous à Supabase
   - Allez dans **SQL Editor**
   - Copiez le contenu de **`migration-add-items.sql`**
   - Cliquez sur **Run**

3. **Vérifiez** :
   ```sql
   SELECT * FROM information_schema.tables WHERE table_schema = 'public';
   ```

4. **Lancez l'import des données** :
   ```bash
   npm run import-items
   ```

### Scénario 2 : Nouvelle installation (base vide)

1. **Exécutez le schéma complet** :
   - Connectez-vous à Supabase
   - Allez dans **SQL Editor**
   - Copiez le contenu de **`simple-schema.sql`**
   - Cliquez sur **Run**

2. **Lancez l'import des données** :
   ```bash
   npm run import-items
   ```

## 💾 Faire une sauvegarde avant migration

### Méthode rapide (Export CSV)
1. Allez dans **Table Editor**
2. Pour chaque table importante, cliquez sur **Export as CSV**
   - users_profiles
   - weapons
   - compositions
   - activities

### Méthode complète (pg_dump)
```powershell
# Récupérez votre connection string dans Settings > Database
pg_dump "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" > "backups/backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
```

## 🔄 Restaurer une sauvegarde

```powershell
# Restaurer depuis pg_dump
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" < backups/backup_20250225.sql
```

## ❓ Questions fréquentes

### Quelle est la différence entre les deux scripts ?

| Caractéristique | simple-schema.sql | migration-add-items.sql |
|----------------|-------------------|------------------------|
| Supprime les données | ❌ OUI | ✅ NON |
| Crée les nouvelles tables | ✅ OUI | ✅ OUI |
| Modifie weapons | ✅ OUI | ✅ OUI |
| Idempotent (réexécutable) | ❌ NON | ✅ OUI |
| Recommandé pour production | ❌ NON | ✅ OUI |

### J'ai exécuté simple-schema.sql par erreur, que faire ?

Si vous aviez fait une sauvegarde :
1. Restaurez la sauvegarde (voir section ci-dessus)
2. Utilisez `migration-add-items.sql` à la place

Si vous n'aviez pas de sauvegarde :
- Les données sont perdues
- Vous devrez recréer vos utilisateurs, compositions, etc.

### Puis-je exécuter migration-add-items.sql plusieurs fois ?

✅ OUI ! Le script est idempotent :
- Il vérifie si les colonnes/tables existent avant de les créer
- Aucune donnée n'est supprimée
- Vous pouvez l'exécuter autant de fois que nécessaire

### Que fait le script d'import (npm run import-items) ?

Le script d'import :
- Vide les tables weapons, armors, accessories, consumables
- Les remplit avec les données fraîches de l'API OpenAlbion
- Ne touche PAS aux autres tables (users, compositions, activities)

## 📚 Ordre d'exécution recommandé

```
1. Sauvegarde de la base de données
   ↓
2. Exécution de migration-add-items.sql
   ↓
3. Vérification des tables créées
   ↓
4. Configuration du .env.local
   ↓
5. npm install
   ↓
6. npm run import-items
   ↓
7. Régénération des types TypeScript
```

## 🆘 Besoin d'aide ?

Si vous n'êtes pas sûr de quel script utiliser :
- Vous avez déjà des données ? ➡️ **migration-add-items.sql**
- Base de données vide ? ➡️ **simple-schema.sql**
- Vous hésitez ? ➡️ **Faites une sauvegarde d'abord !**
