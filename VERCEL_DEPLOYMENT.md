# 🚀 Guide de Déploiement Vercel - Albion Zerg Manager

## 📋 Prérequis

- ✅ Compte **Vercel** (gratuit: https://vercel.com)
- ✅ Compte **Supabase** (gratuit: https://supabase.com)
- ✅ **Git** installé localement
- ✅ Votre projet prêt à déployer

---

## 🗄️ Étape 1: Configuration Supabase

### 1.1 Créer un projet Supabase

1. Aller sur **https://supabase.com** et se connecter
2. Cliquer sur **"New project"**
3. Remplir les informations:
   - **Name:** `albion-zerg-manager` (ou votre choix)
   - **Database Password:** Choisir un mot de passe fort (le noter !)
   - **Region:** Choisir la plus proche de vous (ex: Europe West)
4. Cliquer sur **"Create new project"**
5. Attendre que le projet soit créé (~2 minutes)

### 1.2 Désactiver RLS pour le développement

Dans le **SQL Editor**, exécuter le script `database/disable-rls-dev.sql` :

```sql
-- Désactiver RLS sur toutes les tables
ALTER TABLE users_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE weapons DISABLE ROW LEVEL SECURITY;
ALTER TABLE compositions DISABLE ROW LEVEL SECURITY;
ALTER TABLE composition_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE roasters DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "users_select_own" ON users_profiles;
-- etc...
```

### 1.3 Créer le schéma de base de données

Dans le **SQL Editor**, exécuter le script `database/simple-schema.sql` :

1. Copier **tout** le contenu du fichier `database/simple-schema.sql`
2. Coller dans l'éditeur SQL de Supabase
3. Cliquer sur **"Run"**
4. ✅ Vérifier qu'il n'y a **aucune erreur**

Ce script créé :
- Les tables (`users_profiles`, `weapons`, `compositions`, etc.)
- Un utilisateur **admin** avec PIN **1234**
- Un utilisateur test **testjoueur** avec PIN **1234**

### 1.4 Ajouter les armes d'Albion Online

Dans le **SQL Editor**, exécuter le script `database/insert-weapons.sql` :

1. Copier **tout** le contenu du fichier `database/insert-weapons.sql`
2. Coller dans l'éditeur SQL
3. Cliquer sur **"Run"**
4. ✅ Vérifier qu'environ **70+ armes** ont été insérées

### 1.5 Récupérer les clés API Supabase

1. Aller dans **Settings** > **API**
2. Noter ces deux informations :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public key** (commence par `eyJh...`)

⚠️ **Ne partagez jamais** ces clés publiquement !

---

## 🔧 Étape 2: Préparer le projet pour Vercel

### 2.1 Vérifier les fichiers locaux

Assurez-vous que votre fichier `.env.local` existe avec :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...votre_clé_anon
```

### 2.2 Tester en local (optionnel mais recommandé)

```powershell
npm run dev
```

Ouvrir http://localhost:3000 et vérifier :
- ✅ Page de login s'affiche
- ✅ Connexion avec **admin / 1234** fonctionne
- ✅ Liste des activités s'affiche

Si tout fonctionne, vous êtes prêt pour le déploiement !

### 2.3 Initialiser Git (si pas déjà fait)

```powershell
# Dans le dossier albion-zerg-nextjs
git init
git add .
git commit -m "feat: Application Albion Zerg Manager prête pour déploiement"
```

### 2.4 Créer un repository sur GitHub/GitLab

1. Aller sur **GitHub** (https://github.com)
2. Cliquer sur **"New repository"**
3. Nommer le repo : `albion-zerg-nextjs`
4. **Ne pas** ajouter README, .gitignore ou license (ils existent déjà)
5. Cliquer sur **"Create repository"**

### 2.5 Pousser le code

```powershell
git remote add origin https://github.com/VOTRE_USERNAME/albion-zerg-nextjs.git
git branch -M main
git push -u origin main
```

---

## 🚀 Étape 3: Déployer sur Vercel

### 3.1 Connexion à Vercel

1. Aller sur **https://vercel.com**
2. Se connecter avec votre compte GitHub
3. Autoriser Vercel à accéder à vos repositories

### 3.2 Importer le projet

1. Cliquer sur **"Add New..."** > **"Project"**
2. Trouver votre repository `albion-zerg-nextjs`
3. Cliquer sur **"Import"**

### 3.3 Configurer le projet

Vercel devrait détecter automatiquement que c'est un projet **Next.js**.

Vérifier les paramètres :
- **Framework Preset:** Next.js ✅
- **Root Directory:** `./` ✅
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅

### 3.4 Ajouter les variables d'environnement

⚠️ **IMPORTANT** : Avant de déployer, cliquer sur **"Environment Variables"**

Ajouter ces deux variables :

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJh...votre_clé_anon` |

**Environment:** Cocher **Production**, **Preview** et **Development**

### 3.5 Déployer !

1. Cliquer sur **"Deploy"**
2. ⏳ Attendre 2-3 minutes que Vercel build et déploie
3. ✅ Voir le message **"Congratulations!"**

Vercel vous donne une URL (ex: `https://albion-zerg-nextjs.vercel.app`)

---

## ✅ Étape 4: Vérifier le déploiement

### 4.1 Tester l'application en ligne

1. Ouvrir l'URL Vercel (ex: `https://albion-zerg-nextjs.vercel.app`)
2. Vérifier que la page de **login** s'affiche
3. Se connecter avec :
   - **Username:** `admin`
   - **PIN:** `1234`
4. ✅ Vous devriez voir la page des **Activités**

### 4.2 Tester les fonctionnalités

- ✅ **Créer une activité** (bouton en haut à droite)
- ✅ **Voir Mon Profil**
- ✅ **Gestion Armes** (vérifier que les 70+ armes sont là)
- ✅ **Gestion Utilisateurs** (admin et testjoueur doivent être là)

---

## 🎨 Étape 5: Configuration Initiale

### 5.1 Créer une composition test

1. Aller dans **Compositions** (menu gauche)
2. Cliquer **"Créer une composition"**
3. Remplir :
   - **Nom:** "Composition ZvZ Standard"
   - **Nombre de groupes:** 2
4. Ajouter des armes pour chaque slot
5. Sauvegarder

### 5.2 Créer une activité test

1. Aller dans **Activités**
2. Cliquer **"Créer une activité"**
3. Remplir :
   - **Nom:** "ZvZ Caerleon Test"
   - **Date et heure:** Demain à 20h
   - **Composition:** Sélectionner celle créée
   - **Description:** "Activité de test"
4. Créer

### 5.3 Inviter des utilisateurs

Partager le lien de votre application :
- **URL:** `https://votre-app.vercel.app/signup`
- Les joueurs peuvent créer leur compte
- Ils recevront un **PIN à 4 chiffres** à noter précieusement

### 5.4 Promouvoir des Shotcallers

1. Aller dans **Gestion Utilisateurs**
2. Cliquer sur un utilisateur
3. Changer son rôle en **"Shotcaller"**
4. Sauvegarder

---

## 🔄 Étape 6: Déploiements futurs

### 6.1 Mettre à jour l'application

Après avoir modifié le code localement :

```powershell
git add .
git commit -m "feat: Nouvelle fonctionnalité"
git push
```

**Vercel déploie automatiquement** à chaque push sur `main` ! 🎉

### 6.2 Voir les logs

1. Aller sur le **Dashboard Vercel**
2. Cliquer sur votre projet
3. Onglet **"Deployments"** : Voir l'historique
4. Onglet **"Logs"** : Voir les erreurs en temps réel

---

## 🐛 Dépannage

### Problème : "Build failed"

**Solution :**
1. Vérifier les logs Vercel
2. Souvent causé par :
   - Erreur TypeScript → Corriger localement
   - Dépendance manquante → `npm install` puis push
3. Tester `npm run build` localement avant de push

### Problème : "Cannot connect to database"

**Solution :**
1. Vérifier que les **variables d'environnement** sont bien configurées dans Vercel
2. Vérifier que l'URL Supabase est correcte
3. Redéployer le projet après modification des env vars

### Problème : "Pseudo ou PIN incorrect"

**Solution :**
1. Vérifier que le script `simple-schema.sql` a bien été exécuté
2. Vérifier dans Supabase > **Table Editor** > `users_profiles` que l'utilisateur existe
3. Le PIN par défaut est **1234** (4 chiffres)

### Problème : "Les armes ne s'affichent pas"

**Solution :**
1. Vérifier que le script `insert-weapons.sql` a été exécuté
2. Vérifier dans Supabase > **Table Editor** > `weapons` qu'il y a des données
3. Vérifier que `is_active = true` pour les armes

---

## 🎯 Checklist Complète

- [ ] ✅ Projet Supabase créé
- [ ] ✅ Script `disable-rls-dev.sql` exécuté
- [ ] ✅ Script `simple-schema.sql` exécuté
- [ ] ✅ Script `insert-weapons.sql` exécuté
- [ ] ✅ Clés API Supabase récupérées
- [ ] ✅ Repository GitHub créé
- [ ] ✅ Code poussé sur GitHub
- [ ] ✅ Projet Vercel créé et configuré
- [ ] ✅ Variables d'environnement ajoutées
- [ ] ✅ Premier déploiement réussi
- [ ] ✅ Test de connexion avec admin/1234
- [ ] ✅ Armes visibles dans l'admin
- [ ] ✅ Composition test créée
- [ ] ✅ Activité test créée
- [ ] ✅ Lien partagé aux joueurs

---

## 🎉 Félicitations !

Votre application **Albion Zerg Manager** est maintenant **en ligne** et prête à gérer vos activités de guilde !

### 📱 Liens utiles

- **Application:** `https://votre-app.vercel.app`
- **Dashboard Vercel:** https://vercel.com/dashboard
- **Dashboard Supabase:** https://supabase.com/dashboard

### 🔗 Domaine personnalisé (optionnel)

Pour utiliser votre propre domaine (ex: `albion.votredomaine.com`) :

1. Aller dans **Vercel Dashboard** > **Settings** > **Domains**
2. Ajouter votre domaine
3. Suivre les instructions DNS

---

**Besoin d'aide ?** Vérifiez :
1. Les **logs Vercel** (onglet Logs)
2. Les **logs Supabase** (onglet API Logs)
3. La **console navigateur** (F12)

Bon zerg ! ⚔️🛡️
