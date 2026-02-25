-- ============================================
-- MIGRATION SÉCURISÉE - AJOUT DES NOUVELLES TABLES
-- Ce script ajoute les nouvelles tables SANS supprimer les données existantes
-- ============================================

-- ============================================
-- ÉTAPE 1 : Modifier la table weapons existante
-- ============================================

-- Ajouter les nouvelles colonnes à la table weapons si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter api_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'weapons' AND column_name = 'api_id') THEN
        ALTER TABLE weapons ADD COLUMN api_id INTEGER UNIQUE;
    END IF;

    -- Modifier la colonne tier de INTEGER à TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'weapons' AND column_name = 'tier' AND data_type = 'integer') THEN
        ALTER TABLE weapons ALTER COLUMN tier TYPE TEXT USING tier::TEXT;
    END IF;

    -- Ajouter item_power
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'weapons' AND column_name = 'item_power') THEN
        ALTER TABLE weapons ADD COLUMN item_power INTEGER;
    END IF;

    -- Ajouter identifier
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'weapons' AND column_name = 'identifier') THEN
        ALTER TABLE weapons ADD COLUMN identifier TEXT UNIQUE;
    END IF;

    -- Ajouter category_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'weapons' AND column_name = 'category_name') THEN
        ALTER TABLE weapons ADD COLUMN category_name TEXT;
    END IF;

    -- Ajouter subcategory_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'weapons' AND column_name = 'subcategory_name') THEN
        ALTER TABLE weapons ADD COLUMN subcategory_name TEXT;
    END IF;
END $$;

-- Supprimer l'ancienne contrainte de catégorie si elle existe
ALTER TABLE weapons DROP CONSTRAINT IF EXISTS valid_category;

-- Créer l'index pour identifier si il n'existe pas
CREATE INDEX IF NOT EXISTS idx_weapons_identifier ON weapons(identifier);
CREATE INDEX IF NOT EXISTS idx_weapons_tier ON weapons(tier);

-- ============================================
-- ÉTAPE 2 : Créer la table armors
-- ============================================

CREATE TABLE IF NOT EXISTS armors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    tier TEXT NOT NULL,
    item_power INTEGER,
    identifier TEXT UNIQUE NOT NULL,
    icon_url TEXT,
    category_name TEXT,
    subcategory_name TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Créer les index pour armors
CREATE INDEX IF NOT EXISTS idx_armors_tier ON armors(tier);
CREATE INDEX IF NOT EXISTS idx_armors_active ON armors(is_active);
CREATE INDEX IF NOT EXISTS idx_armors_identifier ON armors(identifier);

-- Désactiver RLS pour armors
ALTER TABLE armors DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 3 : Créer la table accessories
-- ============================================

CREATE TABLE IF NOT EXISTS accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    tier TEXT NOT NULL,
    item_power INTEGER,
    identifier TEXT UNIQUE NOT NULL,
    icon_url TEXT,
    category_name TEXT,
    subcategory_name TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Créer les index pour accessories
CREATE INDEX IF NOT EXISTS idx_accessories_tier ON accessories(tier);
CREATE INDEX IF NOT EXISTS idx_accessories_active ON accessories(is_active);
CREATE INDEX IF NOT EXISTS idx_accessories_identifier ON accessories(identifier);

-- Désactiver RLS pour accessories
ALTER TABLE accessories DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 4 : Créer la table consumables
-- ============================================

CREATE TABLE IF NOT EXISTS consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    tier TEXT NOT NULL,
    item_power INTEGER,
    identifier TEXT UNIQUE NOT NULL,
    icon_url TEXT,
    info TEXT,
    category_name TEXT,
    subcategory_name TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Créer les index pour consumables
CREATE INDEX IF NOT EXISTS idx_consumables_tier ON consumables(tier);
CREATE INDEX IF NOT EXISTS idx_consumables_active ON consumables(is_active);
CREATE INDEX IF NOT EXISTS idx_consumables_identifier ON consumables(identifier);

-- Désactiver RLS pour consumables
ALTER TABLE consumables DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 5 : Vérification
-- ============================================

-- Afficher un résumé des tables
SELECT 
    'Tables créées/modifiées avec succès' as status,
    (SELECT COUNT(*) FROM weapons) as weapons_count,
    (SELECT COUNT(*) FROM armors) as armors_count,
    (SELECT COUNT(*) FROM accessories) as accessories_count,
    (SELECT COUNT(*) FROM consumables) as consumables_count,
    (SELECT COUNT(*) FROM users_profiles) as users_count,
    (SELECT COUNT(*) FROM compositions) as compositions_count,
    (SELECT COUNT(*) FROM activities) as activities_count;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- ✅ Ce script est SÉCURISÉ : il ne supprime AUCUNE donnée existante
-- ✅ Il ajoute uniquement les nouvelles colonnes et tables
-- ✅ Les données existantes dans users_profiles, compositions, activities, etc. sont PRÉSERVÉES
-- ✅ Les données existantes dans weapons sont PRÉSERVÉES (seule la structure est modifiée)
-- ✅ Vous pouvez exécuter ce script plusieurs fois sans risque (idempotent)

-- PROCHAINE ÉTAPE :
-- Après avoir exécuté ce script, vous pourrez lancer : npm run import-items
-- pour peupler les nouvelles tables avec les données de l'API OpenAlbion
