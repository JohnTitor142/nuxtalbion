import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

interface AlbionItem {
  id: number
  name: string
  tier: string
  item_power: number | null
  identifier: string
  icon: string
  category: {
    id: number
    name: string
    type: string
  }
  subcategory: {
    id: number
    name: string
    type: string
  }
  info?: string
}

interface AlbionResponse {
  data: AlbionItem[]
}

async function fetchItems(url: string): Promise<AlbionItem[]> {
  console.log(`Fetching data from ${url}...`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`)
  }
  const json: AlbionResponse = await response.json()
  return json.data
}

function filterByTier(items: AlbionItem[], tiers: string[]): AlbionItem[] {
  return items.filter((item) => tiers.includes(item.tier))
}

async function importWeapons() {
  console.log('\n=== Importing Weapons (Tier 8.0 only) ===')
  
  const items = await fetchItems('https://api.openalbion.com/api/v3/weapons')
  const filtered = filterByTier(items, ['8.0'])
  
  console.log(`Found ${filtered.length} weapons to import`)
  
  // Supprimer les anciennes données
  const { error: deleteError } = await supabase
    .from('weapons')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  
  if (deleteError) {
    console.error('Error deleting old weapons:', deleteError)
  } else {
    console.log('Old weapons deleted successfully')
  }
  
  // Insérer les nouvelles données
  const weaponsData = filtered.map((item) => ({
    api_id: item.id,
    name: item.name,
    tier: item.tier,
    item_power: item.item_power,
    identifier: item.identifier,
    icon_url: item.icon,
    category_name: item.category.name,
    subcategory_name: item.subcategory.name,
    is_active: true,
  }))
  
  const { data, error } = await supabase
    .from('weapons')
    .insert(weaponsData as any)
    .select()
  
  if (error) {
    console.error('Error importing weapons:', error)
  } else {
    console.log(`✅ Successfully imported ${data?.length || 0} weapons`)
  }
}

async function importArmors() {
  console.log('\n=== Importing Armors (Tier 8.0 only) ===')
  
  const items = await fetchItems('https://api.openalbion.com/api/v3/armors')
  const filtered = filterByTier(items, ['8.0'])
  
  console.log(`Found ${filtered.length} armors to import`)
  
  // Supprimer les anciennes données
  const { error: deleteError } = await supabase
    .from('armors')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  
  if (deleteError) {
    console.error('Error deleting old armors:', deleteError)
  } else {
    console.log('Old armors deleted successfully')
  }
  
  // Insérer les nouvelles données
  const armorsData = filtered.map((item) => ({
    api_id: item.id,
    name: item.name,
    tier: item.tier,
    item_power: item.item_power,
    identifier: item.identifier,
    icon_url: item.icon,
    category_name: item.category.name,
    subcategory_name: item.subcategory.name,
    is_active: true,
  }))
  
  const { data, error } = await supabase
    .from('armors')
    .insert(armorsData as any)
    .select()
  
  if (error) {
    console.error('Error importing armors:', error)
  } else {
    console.log(`✅ Successfully imported ${data?.length || 0} armors`)
  }
}

async function importAccessories() {
  console.log('\n=== Importing Accessories (Tier 8.0 only) ===')
  
  const items = await fetchItems('https://api.openalbion.com/api/v3/accessories')
  const filtered = filterByTier(items, ['8.0'])
  
  console.log(`Found ${filtered.length} accessories to import`)
  
  // Supprimer les anciennes données
  const { error: deleteError } = await supabase
    .from('accessories')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  
  if (deleteError) {
    console.error('Error deleting old accessories:', deleteError)
  } else {
    console.log('Old accessories deleted successfully')
  }
  
  // Insérer les nouvelles données
  const accessoriesData = filtered.map((item) => ({
    api_id: item.id,
    name: item.name,
    tier: item.tier,
    item_power: item.item_power,
    identifier: item.identifier,
    icon_url: item.icon,
    category_name: item.category.name,
    subcategory_name: item.subcategory.name,
    is_active: true,
  }))
  
  const { data, error } = await supabase
    .from('accessories')
    .insert(accessoriesData as any)
    .select()
  
  if (error) {
    console.error('Error importing accessories:', error)
  } else {
    console.log(`✅ Successfully imported ${data?.length || 0} accessories`)
  }
}

async function importConsumables() {
  console.log('\n=== Importing Consumables (Tier 7.0 and 8.0) ===')
  
  const items = await fetchItems('https://api.openalbion.com/api/v3/consumables')
  const filtered = filterByTier(items, ['7.0', '8.0'])
  
  console.log(`Found ${filtered.length} consumables to import`)
  
  // Supprimer les anciennes données
  const { error: deleteError } = await supabase
    .from('consumables')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  
  if (deleteError) {
    console.error('Error deleting old consumables:', deleteError)
  } else {
    console.log('Old consumables deleted successfully')
  }
  
  // Insérer les nouvelles données
  const consumablesData = filtered.map((item) => ({
    api_id: item.id,
    name: item.name,
    tier: item.tier,
    item_power: item.item_power,
    identifier: item.identifier,
    icon_url: item.icon,
    info: item.info || null,
    category_name: item.category.name,
    subcategory_name: item.subcategory.name,
    is_active: true,
  }))
  
  const { data, error } = await supabase
    .from('consumables')
    .insert(consumablesData as any)
    .select()
  
  if (error) {
    console.error('Error importing consumables:', error)
  } else {
    console.log(`✅ Successfully imported ${data?.length || 0} consumables`)
  }
}

async function main() {
  console.log('Starting Albion Online Items Import...\n')
  console.log('Supabase URL:', supabaseUrl)
  
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  }
  
  try {
    await importWeapons()
    await importArmors()
    await importAccessories()
    await importConsumables()
    
    console.log('\n🎉 All items imported successfully!')
  } catch (error) {
    console.error('\n❌ Error during import:', error)
    process.exit(1)
  }
}

main()
