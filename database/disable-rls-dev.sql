-- ============================================
-- DÉSACTIVATION COMPLÈTE DES RLS POUR LE DÉVELOPPEMENT
-- ============================================
-- ⚠️ ATTENTION : À n'utiliser QUE pour le développement local
-- En production, vous devrez réactiver et configurer correctement les RLS

-- Désactiver RLS sur toutes les tables
ALTER TABLE users_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE weapons DISABLE ROW LEVEL SECURITY;
ALTER TABLE compositions DISABLE ROW LEVEL SECURITY;
ALTER TABLE composition_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE roasters DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les policies existantes (au cas où)
DROP POLICY IF EXISTS "Users can view active profiles" ON users_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;
DROP POLICY IF EXISTS "Admins full access users" ON users_profiles;
DROP POLICY IF EXISTS "Anyone can read active users" ON users_profiles;
DROP POLICY IF EXISTS "Users can insert themselves" ON users_profiles;

DROP POLICY IF EXISTS "Everyone can view active weapons" ON weapons;
DROP POLICY IF EXISTS "Admins and shotcallers manage weapons" ON weapons;
DROP POLICY IF EXISTS "Public read weapons" ON weapons;

DROP POLICY IF EXISTS "Everyone can view compositions" ON compositions;
DROP POLICY IF EXISTS "Shotcallers and admins manage compositions" ON compositions;
DROP POLICY IF EXISTS "Creator and admins update compositions" ON compositions;
DROP POLICY IF EXISTS "Public read compositions" ON compositions;

DROP POLICY IF EXISTS "Everyone can view composition slots" ON composition_slots;
DROP POLICY IF EXISTS "Composition creator manages slots" ON composition_slots;
DROP POLICY IF EXISTS "Public read composition_slots" ON composition_slots;

DROP POLICY IF EXISTS "Everyone can view activities" ON activities;
DROP POLICY IF EXISTS "Shotcallers and admins manage activities" ON activities;
DROP POLICY IF EXISTS "Public read activities" ON activities;

DROP POLICY IF EXISTS "Users can view registrations" ON activity_registrations;
DROP POLICY IF EXISTS "Users can register to activities" ON activity_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON activity_registrations;
DROP POLICY IF EXISTS "Users can delete own registrations" ON activity_registrations;
DROP POLICY IF EXISTS "Public read registrations" ON activity_registrations;
DROP POLICY IF EXISTS "Anyone can register" ON activity_registrations;

DROP POLICY IF EXISTS "Everyone can view roasters" ON roasters;
DROP POLICY IF EXISTS "Shotcallers and admins manage roasters" ON roasters;
DROP POLICY IF EXISTS "Public read roasters" ON roasters;

-- Vérifier que RLS est bien désactivé
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'users_profiles', 
    'weapons', 
    'compositions', 
    'composition_slots', 
    'activities', 
    'activity_registrations', 
    'roasters'
)
ORDER BY tablename;

-- Le résultat devrait montrer "false" pour toutes les tables
