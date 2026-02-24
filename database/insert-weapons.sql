-- ============================================
-- ARMES ALBION ONLINE - INSERTION COMPLÈTE
-- Basé sur : https://wiki.albiononline.com/wiki/Weapon
-- Exclus : Shields, Torches, Tomes
-- ============================================

-- ============================================
-- TANK (Mace, Hammer, Quarterstaff défensif)
-- ============================================

INSERT INTO weapons (name, category, tier) VALUES
-- Maces
('Mace', 'Tank', 4),
('Heavy Mace', 'Tank', 4),
('Morning Star', 'Tank', 4),
('Bedrock Mace', 'Tank', 4),
('Incubus Mace', 'Tank', 4),

-- Hammers
('Hammer', 'Tank', 4),
('Polehammer', 'Tank', 4),
('Great Hammer', 'Tank', 4),
('Tombhammer', 'Tank', 4),
('Forge Hammer', 'Tank', 4),

-- Quarterstaff Tank
('Quarterstaff', 'Tank', 4),
('Iron-clad Staff', 'Tank', 4),
('Double Bladed Staff', 'Tank', 4),
('Black Monk Stave', 'Tank', 4),
('Grovekeeper', 'Tank', 4),

-- Axes Tank
('Greataxe', 'Tank', 4),
('Halberd', 'Tank', 4),
('Carrioncaller', 'Tank', 4);

-- ============================================
-- HEALER (Holy Staff, Nature Staff)
-- ============================================

INSERT INTO weapons (name, category, tier) VALUES
-- Holy Staff
('Holy Staff', 'Healer', 4),
('Great Holy Staff', 'Healer', 4),
('Divine Staff', 'Healer', 4),
('Lifetouch Staff', 'Healer', 4),
('Hallowfall', 'Healer', 4),
('Redemption Staff', 'Healer', 4),

-- Nature Staff (Healer)
('Nature Staff', 'Healer', 4),
('Great Nature Staff', 'Healer', 4),
('Wild Staff', 'Healer', 4),
('Druidic Staff', 'Healer', 4),
('Blight Staff', 'Healer', 4),
('Rampant Staff', 'Healer', 4);

-- ============================================
-- SUPPORT (Frost Staff, Nature Support)
-- ============================================

INSERT INTO weapons (name, category, tier) VALUES
-- Frost Staff
('Frost Staff', 'Support', 4),
('Hoarfrost Staff', 'Support', 4),
('Glacial Staff', 'Support', 4),
('Icicle Staff', 'Support', 4),
('Permafrost Prism', 'Support', 4),
('Chillhowl', 'Support', 4);

-- ============================================
-- DPS MELEE (Sword, Axe, Dagger, Spear)
-- ============================================

INSERT INTO weapons (name, category, tier) VALUES
-- Swords
('Broadsword', 'DPS Melee', 4),
('Claymore', 'DPS Melee', 4),
('Dual Swords', 'DPS Melee', 4),
('Clarent Blade', 'DPS Melee', 4),
('Carving Sword', 'DPS Melee', 4),
('Kingmaker', 'DPS Melee', 4),
('Galatine Pair', 'DPS Melee', 4),

-- Axes (DPS)
('Battleaxe', 'DPS Melee', 4),
('Infernal Scythe', 'DPS Melee', 4),
('Bear Paws', 'DPS Melee', 4),
('Realmbreaker', 'DPS Melee', 4),

-- Daggers
('Dagger', 'DPS Melee', 4),
('Dagger Pair', 'DPS Melee', 4),
('Claws', 'DPS Melee', 4),
('Bloodletter', 'DPS Melee', 4),
('Black Hands', 'DPS Melee', 4),
('Deathgivers', 'DPS Melee', 4),
('Bridled Fury', 'DPS Melee', 4),

-- Spears
('Spear', 'DPS Melee', 4),
('Pike', 'DPS Melee', 4),
('Glaive', 'DPS Melee', 4),
('Heron Spear', 'DPS Melee', 4),
('Spirithunter', 'DPS Melee', 4),
('Trinity Spear', 'DPS Melee', 4);

-- ============================================
-- DPS RANGE (Bow, Crossbow, Fire, Arcane, Curse)
-- ============================================

INSERT INTO weapons (name, category, tier) VALUES
-- Bows
('Bow', 'DPS Range', 4),
('Warbow', 'DPS Range', 4),
('Longbow', 'DPS Range', 4),
('Whispering Bow', 'DPS Range', 4),
('Bow of Badon', 'DPS Range', 4),
('Weeping Repeater', 'DPS Range', 4),
('Energy Shaper', 'DPS Range', 4),

-- Crossbows
('Crossbow', 'DPS Range', 4),
('Heavy Crossbow', 'DPS Range', 4),
('Light Crossbow', 'DPS Range', 4),
('Weeping Repeater', 'DPS Range', 4),
('Siegebow', 'DPS Range', 4),
('Boltcasters', 'DPS Range', 4),
('Shadowcaller', 'DPS Range', 4),

-- Fire Staff
('Fire Staff', 'DPS Range', 4),
('Great Fire Staff', 'DPS Range', 4),
('Infernal Staff', 'DPS Range', 4),
('Wildfire Staff', 'DPS Range', 4),
('Blazing Staff', 'DPS Range', 4),
('Brimstone Staff', 'DPS Range', 4),
('Scorched Staff', 'DPS Range', 4),

-- Arcane Staff
('Arcane Staff', 'DPS Range', 4),
('Great Arcane Staff', 'DPS Range', 4),
('Enigmatic Staff', 'DPS Range', 4),
('Witchwork Staff', 'DPS Range', 4),
('Master''s Occult Staff', 'DPS Range', 4),
('Malevolent Locus', 'DPS Range', 4),
('Evensong', 'DPS Range', 4),

-- Curse Staff
('Cursed Staff', 'DPS Range', 4),
('Great Cursed Staff', 'DPS Range', 4),
('Demonic Staff', 'DPS Range', 4),
('Lifecurse Staff', 'DPS Range', 4),
('Cursed Skull', 'DPS Range', 4),
('Damnation Staff', 'DPS Range', 4),
('Shadowcaller', 'DPS Range', 4);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Compter les armes par catégorie
SELECT 
    category,
    COUNT(*) as nombre_armes
FROM weapons
GROUP BY category
ORDER BY category;

-- Afficher toutes les armes
SELECT 
    category,
    name,
    tier,
    is_active
FROM weapons
ORDER BY category, name;
