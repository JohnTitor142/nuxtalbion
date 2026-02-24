# Albion Zerg Manager

Application web moderne pour la gestion des compositions et activités de zerg dans Albion Online.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

## ✨ Fonctionnalités

### Authentification Simplifiée
- 🔐 Inscription par **pseudo uniquement** (pas d'email)
- 🎲 Génération automatique d'un **PIN à 4 chiffres**
- 👤 3 niveaux de rôles: **Joueur**, **Shotcaller**, **Admin**

### Gestion des Activités
- 📅 Création d'activités avec compositions personnalisées
- ✅ Inscription des joueurs avec **1 à 3 armes** au choix
- 📝 Modification des inscriptions avant verrouillage
- 🎯 3 états: **À venir**, **En cours**, **Terminée**

### Roasters Dynamiques
- 🖱️ Interface **drag & drop** intuitive
- 📊 Grilles **4x5** par groupe (jusqu'à 10 groupes)
- 🎨 Organisation visuelle des joueurs
- 🔄 Sélection de l'arme finale par joueur
- 🔒 Verrouillage et démarrage de l'activité

### Compositions
- 🧩 Création de templates de composition
- 👥 Configuration de **1 à 10 groupes**
- ⚔️ Définition des armes par slot
- 📋 Maximum **20 slots par groupe**

### Interface Moderne
- 🎨 Design **glass morphism** avec gradients
- ✨ Animations fluides et micro-interactions
- 📱 Interface **responsive**
- 🌈 Couleurs et icônes par catégorie d'arme
- 🎭 Navigation adaptée selon le rôle

### Administration
- 🛡️ Gestion des utilisateurs (rôles, activation)
- ⚔️ Gestion du catalogue d'armes (70+ armes d'Albion)
- 📊 Statistiques et historiques
- 🔐 Permissions granulaires par rôle

## 🏗️ Stack Technique

- **Framework:** Next.js 15 (App Router, React Server Components)
- **Langage:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn/UI
- **Base de données:** Supabase (PostgreSQL)
- **Drag & Drop:** @dnd-kit
- **Déploiement:** Vercel

## 🚀 Démarrage Rapide

### 1. Installation

```bash
npm install
```

### 2. Configuration Supabase

1. Créer un projet sur https://supabase.com
2. Exécuter les scripts SQL dans cet ordre :
   - `database/disable-rls-dev.sql` (désactiver la sécurité pour le dev)
   - `database/simple-schema.sql` (créer les tables + admin/1234)
   - `database/insert-weapons.sql` (ajouter les 70+ armes)

### 3. Variables d'environnement

Copier `.env.local.example` vers `.env.local` et remplir :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...votre_clé_anon
```

### 4. Lancer en local

```bash
npm run dev
```

Ouvrir http://localhost:3000 et se connecter avec **admin / 1234**

## 📦 Déploiement sur Vercel

Voir le guide complet : **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

**TL;DR:**
1. Push sur GitHub
2. Importer dans Vercel
3. Ajouter les env vars
4. Déployer → C'est en ligne ! 🎉

## 🎮 Utilisation

### Pour les Joueurs
1. **Créer un compte :** `/signup` - Noter le PIN généré
2. **S'inscrire :** Consulter les activités et proposer 1-3 armes
3. **Profil :** Voir ses inscriptions et participations

### Pour les Shotcallers
Tout ce que fait un joueur, plus :
- ✅ Créer des **compositions**
- ✅ Créer des **activités**
- ✅ Gérer les **roasters** (drag & drop)
- ✅ Confirmer et démarrer les activités

### Pour les Admins
Tout ce que font les shotcallers, plus :
- ✅ Gérer les **utilisateurs** (rôles, activation)
- ✅ Gérer le **catalogue d'armes**

## 🎨 Catégories d'Armes

| Catégorie | Icône | Couleur |
|-----------|-------|---------|
| Tank | 🛡️ | Bleu |
| Healer | 💚 | Vert |
| DPS Melee | ⚔️ | Rouge |
| DPS Range | 🏹 | Violet |
| Support | ✨ | Orange |

## 📊 Base de Données

### Tables
- `users_profiles` - Utilisateurs (pseudo + PIN)
- `weapons` - Catalogue d'armes d'Albion
- `compositions` - Templates de compositions
- `composition_slots` - Slots d'armes par composition
- `activities` - Activités/Events
- `activity_registrations` - Inscriptions des joueurs
- `roasters` - Compositions finales assignées

## 🛠️ Scripts Disponibles

```bash
npm run dev        # Serveur de développement
npm run build      # Build pour production
npm run start      # Démarrer en production
npm run lint       # Vérifier le code
```

## 📝 Structure du Dossier `database/`

- ✅ **`simple-schema.sql`** - Schéma complet (à utiliser)
- ✅ **`insert-weapons.sql`** - 70+ armes d'Albion (à utiliser)
- ✅ **`disable-rls-dev.sql`** - Désactiver la sécurité pour le dev (à utiliser)

## 📄 Licence

MIT

---

**Made with ❤️ for Albion Online guilds** ⚔️🛡️

