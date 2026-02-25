# 🔄 Script d'Import Albion Online

Import automatique des items depuis l'API OpenAlbion vers Supabase.

## ⚡ Utilisation Rapide

```bash
npm run import-items
```

## 📋 Configuration Requise

**`.env.local`** à la racine :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...  # ⚠️ Sensible !
```

## 📦 Données Importées

| Type | API | Tiers |
|------|-----|-------|
| Weapons | `/api/v3/weapons` | 8.0 |
| Armors | `/api/v3/armors` | 8.0 |
| Accessories | `/api/v3/accessories` | 8.0 |
| Consumables | `/api/v3/consumables` | 7.0, 8.0 |

## ⚙️ Fonctionnement

1. Fetch depuis OpenAlbion API
2. Filtre par tier
3. **Supprime** anciennes données
4. Insert nouvelles données

**⚠️ Note** : Les données existantes dans ces tables sont supprimées. Les autres tables (users, compositions, activities) ne sont pas affectées.

## 🔧 Structure Importée

```typescript
{
  api_id: number
  name: string
  tier: string           // "8.0"
  item_power: number
  identifier: string     // "T8_2H_AXE"
  icon_url: string       // URL image
  category_name: string
  subcategory_name: string
  info?: string          // Consumables uniquement
}
```

## 📝 Régénération Types (Optionnel)

Si vous modifiez manuellement le schéma :
```bash
npx supabase gen types typescript --project-id [ID] > types/database.ts
```

## ❓ Troubleshooting

**Erreur "supabaseUrl is required"**
→ Vérifier que `.env.local` existe avec les bonnes variables

**Erreur 23502 (constraint violation)**
→ Exécuter `database/fix-weapons-category.sql` dans Supabase

**Timeout API**
→ Relancer le script, les APIs peuvent être temporairement lentes
