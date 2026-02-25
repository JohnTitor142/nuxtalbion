-- ============================================
-- FIX : Supprimer l'ancienne colonne category
-- ============================================

-- Supprimer l'ancienne colonne category qui n'est plus utilisée
ALTER TABLE weapons DROP COLUMN IF EXISTS category;

-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'weapons'
ORDER BY ordinal_position;

-- Message de confirmation
SELECT 'Ancienne colonne "category" supprimée avec succès. Vous pouvez maintenant relancer npm run import-items' as status;
