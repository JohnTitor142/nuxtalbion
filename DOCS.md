# 📖 Guide de Référence

Documentation technique consolidée pour le projet Albion Zerg.

---

## 🗄️ Base de Données

### Migration Sécurisée

**Pour une nouvelle installation** :
```sql
-- Exécuter database/simple-schema.sql
```

**Pour une mise à jour (préserve les données)** :
```sql
-- Exécuter database/migration-add-items.sql
```

### Tables Principales

#### `users_profiles`
- Authentification par PIN (4 chiffres)
- Rôles : admin, shotcaller, user

#### `weapons`, `armors`, `accessories`, `consumables`
- Structure identique pour tous
- Colonnes : `api_id`, `name`, `tier`, `item_power`, `identifier`, `icon_url`, `category_name`, `subcategory_name`
- Tier 8.0 pour weapons/armors/accessories
- Tier 7.0 & 8.0 pour consumables

#### `compositions` & `composition_slots`
- Compositions multi-groupes (1-5 groupes)
- Slots par groupe avec armes et quantités

#### `activities`
- Statuts : upcoming, ongoing, completed
- `roaster_locked` : verrouillage du roster

#### `activity_registrations`
- Inscription avec 3 armes au choix
- Notes optionnelles

#### `roasters`
- Assignation finale (groupe + position)
- Arme sélectionnée parmi les 3

---

## 🔄 Import de Données

### Script Automatique

```bash
npm run import-items
```

Le script :
1. Supprime les anciennes données
2. Fetch depuis OpenAlbion API
3. Filtre par tier
4. Insert dans Supabase

### APIs Utilisées

- **Weapons** : `https://api.openalbion.com/api/v3/weapons` (Tier 8.0)
- **Armors** : `https://api.openalbion.com/api/v3/armors` (Tier 8.0)
- **Accessories** : `https://api.openalbion.com/api/v3/accessories` (Tier 8.0)
- **Consumables** : `https://api.openalbion.com/api/v3/consumables` (Tier 7.0 & 8.0)

### Configuration Requise

`.env.local` doit contenir :
```env
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

---

## 🎨 Interface Roaster

### Layout
- **Vertical** : Un groupe par ligne
- **Grid** : 4 lignes × 5 colonnes par groupe
- **Sidebar** : Liste des joueurs (sticky)

### Affichage des Armes
- **Composition** : 40×40px (haut du slot)
- **Joueur** : 48×48px (centre du slot)
- **Sélection** : 48×48px (cartes joueurs)

### Interaction
- **Drag & Drop** : De la liste vers les slots
- **Sélection** : Clic sur image d'arme
- **Suppression** : Bouton ✕ sur le slot

---

## 🔧 Build & Corrections TypeScript

### Propriétés Explicites Requises

Les interfaces qui `extend` doivent déclarer explicitement `id` et autres propriétés utilisées :

```typescript
// ✅ Correct
interface RegistrationWithDetails extends ActivityRegistration {
  id: string
  user_id: string
  user?: UserProfile
  weapon1?: Weapon
}

// ❌ Incorrect (TypeScript ne reconnaît pas)
interface RegistrationWithDetails extends ActivityRegistration {
  user?: UserProfile
  weapon1?: Weapon
}
```

### Cast Supabase

Pour les insertions, utiliser `as any` :
```typescript
await supabase.from('weapons').insert(data as any).select()
```

### Structure database.ts

```typescript
export interface Database {
  public: {
    Tables: { /* ... */ }
    Views: {}
    Functions: {}
    Enums: {
      user_role: {
        admin: 'admin';
        shotcaller: 'shotcaller';
        user: 'user'
      }
    }
  }
}
```

---

## 🚀 Déploiement Vercel

### Variables d'Environnement

Dans Vercel Dashboard > Settings > Environment Variables :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Build Settings

- **Framework Preset** : Next.js
- **Build Command** : `npm run build`
- **Output Directory** : `.next`
- **Node Version** : 20.x

---

## 📝 Conventions de Code

### Composants
- PascalCase pour les noms
- Props typées avec interface
- Client Components : `'use client'` en haut

### Hooks
- Préfixe `use`
- Custom hooks dans `/hooks`

### Types
- Export depuis `/types/index.ts`
- Database types auto-générés

### Styling
- Tailwind CSS utility-first
- Shadcn/UI pour les composants
- Pas de CSS modules

---

## 🔐 Sécurité

### Row Level Security (RLS)
**Actuellement désactivé** pour développement.

Pour production, activer RLS et créer policies :
```sql
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON users_profiles FOR SELECT
USING (auth.uid() = id);
```

### Variables Sensibles
- Jamais commit `.env.local`
- Utiliser `.env.local.example`
- Service role key uniquement serveur

---

## 📊 Performance

### Optimisations Next.js
- ✅ Static Generation pour pages publiques
- ✅ Dynamic pour pages auth
- ✅ Image optimization (next/image)

### Optimisations Supabase
- ✅ Indexes sur colonnes fréquentes
- ✅ Select uniquement colonnes nécessaires
- ✅ Pagination (à implémenter pour grandes listes)

---

## 🐛 Problèmes Courants

### "npm not found"
Rafraîchir le PATH PowerShell :
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine")
```

### Build EPERM Error
Supprimer `.next` et reconstruire :
```bash
rm -rf .next
npm run build
```

### TypeScript "Property does not exist"
Ajouter propriété explicitement dans l'interface (voir section Build & Corrections)

### Import Items Error 23502
Vérifier que `database/fix-weapons-category.sql` a été exécuté si migration depuis ancienne version.

---

**Dernière mise à jour** : 2026-02-25
