-- ============================================
-- MIGRATION: Ajout de la colonne silver
-- Monnaie in-app rattachée à chaque compte
-- ============================================

-- Ajouter la colonne silver à users_profiles
ALTER TABLE users_profiles
ADD COLUMN IF NOT EXISTS silver BIGINT DEFAULT 0 NOT NULL;

-- Index pour le leaderboard (tri par silver décroissant)
CREATE INDEX IF NOT EXISTS idx_users_silver ON users_profiles(silver DESC);

-- Donner un peu de silver aux utilisateurs de test
UPDATE users_profiles SET silver = 5000000 WHERE username = 'admin';
UPDATE users_profiles SET silver = 2500000 WHERE username = 'shotcaller1';
UPDATE users_profiles SET silver = 1200000 WHERE username = 'player1';
UPDATE users_profiles SET silver = 800000 WHERE username = 'player2';
