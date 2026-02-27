-- ============================================
-- SCHÉMA SIMPLIFIÉ SANS ENCRYPTION
-- Pour développement uniquement - PIN stocké en clair
-- ============================================

-- Supprimer l'ancienne table
DROP TABLE IF EXISTS activity_registrations CASCADE;
DROP TABLE IF EXISTS roasters CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS composition_slots CASCADE;
DROP TABLE IF EXISTS compositions CASCADE;
DROP TABLE IF EXISTS weapons CASCADE;
DROP TABLE IF EXISTS users_profiles CASCADE;

-- Supprimer les types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS activity_status CASCADE;

-- Créer les types ENUM
CREATE TYPE user_role AS ENUM ('admin', 'shotcaller', 'user');
CREATE TYPE activity_status AS ENUM ('upcoming', 'ongoing', 'completed');

-- Table utilisateurs SIMPLIFIÉE (PIN en clair)
CREATE TABLE users_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    pin TEXT NOT NULL,  -- PIN stocké en clair (4 chiffres)
    role user_role DEFAULT 'user' NOT NULL,
    silver BIGINT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    CONSTRAINT pin_format CHECK (pin ~ '^\d{4}$')  -- Exactement 4 chiffres
);

-- Tables armes, compositions, etc.
CREATE TABLE weapons (
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

-- Table armures
CREATE TABLE armors (
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

-- Table accessoires
CREATE TABLE accessories (
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

-- Table consommables
CREATE TABLE consumables (
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

CREATE TABLE compositions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    total_groups INTEGER NOT NULL CHECK (total_groups >= 1 AND total_groups <= 10),
    created_by UUID REFERENCES users_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE composition_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    composition_id UUID REFERENCES compositions(id) ON DELETE CASCADE NOT NULL,
    group_number INTEGER NOT NULL CHECK (group_number >= 1 AND group_number <= 10),
    weapon_id UUID REFERENCES weapons(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    composition_id UUID REFERENCES compositions(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status activity_status DEFAULT 'upcoming' NOT NULL,
    roaster_locked BOOLEAN DEFAULT false NOT NULL,
    created_by UUID REFERENCES users_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE activity_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE NOT NULL,
    weapon1_id UUID REFERENCES weapons(id) ON DELETE CASCADE NOT NULL,
    weapon2_id UUID REFERENCES weapons(id) ON DELETE CASCADE,
    weapon3_id UUID REFERENCES weapons(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(activity_id, user_id)
);

CREATE TABLE roasters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE NOT NULL,
    weapon_id UUID REFERENCES weapons(id) ON DELETE CASCADE NOT NULL,
    group_number INTEGER NOT NULL CHECK (group_number >= 1 AND group_number <= 10),
    slot_position INTEGER NOT NULL CHECK (slot_position >= 1 AND slot_position <= 20),
    assigned_by UUID REFERENCES users_profiles(id) ON DELETE SET NULL NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(activity_id, user_id),
    UNIQUE(activity_id, group_number, slot_position)
);

-- Index
CREATE INDEX idx_users_username ON users_profiles(username);
CREATE INDEX idx_users_role ON users_profiles(role);
CREATE INDEX idx_weapons_tier ON weapons(tier);
CREATE INDEX idx_weapons_active ON weapons(is_active);
CREATE INDEX idx_weapons_identifier ON weapons(identifier);
CREATE INDEX idx_armors_tier ON armors(tier);
CREATE INDEX idx_armors_active ON armors(is_active);
CREATE INDEX idx_armors_identifier ON armors(identifier);
CREATE INDEX idx_accessories_tier ON accessories(tier);
CREATE INDEX idx_accessories_active ON accessories(is_active);
CREATE INDEX idx_accessories_identifier ON accessories(identifier);
CREATE INDEX idx_consumables_tier ON consumables(tier);
CREATE INDEX idx_consumables_active ON consumables(is_active);
CREATE INDEX idx_consumables_identifier ON consumables(identifier);
CREATE INDEX idx_compositions_created_by ON compositions(created_by);
CREATE INDEX idx_composition_slots_composition ON composition_slots(composition_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_scheduled ON activities(scheduled_at);
CREATE INDEX idx_registrations_activity ON activity_registrations(activity_id);
CREATE INDEX idx_registrations_user ON activity_registrations(user_id);
CREATE INDEX idx_roasters_activity ON roasters(activity_id);

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_profiles_updated_at
    BEFORE UPDATE ON users_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compositions_updated_at
    BEFORE UPDATE ON compositions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON activity_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- DÉSACTIVER COMPLÈTEMENT RLS
ALTER TABLE users_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE weapons DISABLE ROW LEVEL SECURITY;
ALTER TABLE armors DISABLE ROW LEVEL SECURITY;
ALTER TABLE accessories DISABLE ROW LEVEL SECURITY;
ALTER TABLE consumables DISABLE ROW LEVEL SECURITY;
ALTER TABLE compositions DISABLE ROW LEVEL SECURITY;
ALTER TABLE composition_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE roasters DISABLE ROW LEVEL SECURITY;

-- Créer un admin par défaut
INSERT INTO users_profiles (username, pin, role)
VALUES ('admin', '1234', 'admin');

-- Créer quelques utilisateurs de test
INSERT INTO users_profiles (username, pin, role) VALUES
('shotcaller1', '2345', 'shotcaller'),
('player1', '3456', 'user'),
('player2', '4567', 'user');

-- Vérifier
SELECT username, pin, role, is_active FROM users_profiles;
