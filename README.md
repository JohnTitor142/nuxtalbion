# 🎮 Albion Zerg - Next.js Application

Application de gestion de groupe pour Albion Online, développée avec Next.js 16, Supabase et TypeScript.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20.x
- npm 9.0.0+
- Compte Supabase

### Installation

1. **Cloner le projet**
```bash
git clone [votre-repo]
cd nuxtalbion
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration**

Créer `.env.local` à la racine :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_publique
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

4. **Base de données**

Exécuter les scripts SQL dans Supabase (dans l'ordre) :
- `database/simple-schema.sql` (nouvelle installation)
- OU `database/migration-add-items.sql` (mise à jour)

5. **Importer les données**
```bash
npm run import-items
```

6. **Lancer l'application**
```bash
npm run dev
```

Application disponible sur `http://localhost:3000`

## 📦 Scripts Disponibles

- `npm run dev` - Lancer en mode développement
- `npm run build` - Build de production
- `npm run start` - Démarrer le serveur production
- `npm run lint` - Vérifier le code
- `npm run import-items` - Importer les données depuis l'API Albion

## 🗂️ Structure du Projet

```
nuxtalbion/
├── app/                      # Pages Next.js (App Router)
│   ├── activities/          # Gestion des activités
│   ├── admin/               # Interface admin (users, weapons)
│   ├── compositions/        # Compositions de groupe
│   └── profile/             # Profil utilisateur
├── components/              # Composants réutilisables
├── database/                # Scripts SQL
├── lib/                     # Utilitaires et clients
├── scripts/                 # Scripts d'import
└── types/                   # Types TypeScript
```

## 🎯 Fonctionnalités

### Utilisateurs
- ✅ Authentification par PIN
- ✅ 3 rôles : Admin, Shotcaller, User
- ✅ Gestion des profils

### Activités
- ✅ Création d'activités avec compositions
- ✅ Inscription avec choix de 3 armes
- ✅ Gestion du roaster (drag & drop)
- ✅ Historique des participations

### Compositions
- ✅ Création de compositions multi-groupes
- ✅ Définition des armes par slot
- ✅ Quantités par type d'arme

### Items (Albion Online)
- ✅ Armes Tier 8.0
- ✅ Armures Tier 8.0
- ✅ Accessoires Tier 8.0
- ✅ Consommables Tier 7.0 & 8.0
- ✅ Import automatique depuis OpenAlbion API

## 🔑 Rôles & Permissions

| Fonctionnalité | Admin | Shotcaller | User |
|----------------|-------|------------|------|
| Gérer utilisateurs | ✅ | ❌ | ❌ |
| Créer activités | ✅ | ✅ | ❌ |
| Gérer roaster | ✅ | ✅ | ❌ |
| S'inscrire activités | ✅ | ✅ | ✅ |
| Voir compositions | ✅ | ✅ | ✅ |

## 🎨 Technologies

- **Framework**: Next.js 16.1.6
- **UI**: React 19, Tailwind CSS, Shadcn/UI
- **Base de données**: Supabase (PostgreSQL)
- **State**: Zustand
- **Drag & Drop**: @dnd-kit
- **Langage**: TypeScript 5

## 📚 Documentation Technique

### Base de Données

**Tables principales** :
- `users_profiles` - Utilisateurs
- `weapons`, `armors`, `accessories`, `consumables` - Items Albion
- `compositions` & `composition_slots` - Compositions
- `activities` - Activités
- `activity_registrations` - Inscriptions
- `roasters` - Assignations finales

### API Externe

Import depuis **OpenAlbion API** :
- `https://api.openalbion.com/api/v3/weapons`
- `https://api.openalbion.com/api/v3/armors`
- `https://api.openalbion.com/api/v3/accessories`
- `https://api.openalbion.com/api/v3/consumables`

## 🐛 Dépannage

### Build TypeScript Errors
```bash
# Nettoyer le cache
rm -rf .next
npm run build
```

### Import Items Fails
Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est bien défini dans `.env.local`

### Port 3000 déjà utilisé
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 📝 Notes de Version

### Dernières Améliorations
- ✅ Interface roaster améliorée (images agrandies, layout vertical)
- ✅ Nouvelles données Albion Online (API OpenAlbion)
- ✅ Build de production fonctionnel
- ✅ Support TypeScript strict

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m 'Ajout de ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est privé.

---

**Développé avec ❤️ pour la communauté Albion Online**
