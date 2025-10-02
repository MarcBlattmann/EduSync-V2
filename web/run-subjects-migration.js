// Script to run the school subjects migration
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    console.log('🚀 Running school subjects migration...\n')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../db/migrations/20251003_add_subjects_to_schools.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded successfully')
    console.log('📝 SQL Preview:')
    console.log(migrationSQL.substring(0, 200) + '...\n')
    
    // Execute the full migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Error executing migration:', error)
      console.error('\n⚠️  You may need to run this migration manually via Supabase Dashboard')
      console.error('   Go to: SQL Editor → Paste the migration SQL → Run')
      process.exit(1)
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('\n📊 Changes applied:')
    console.log('   • Added "subjects" JSONB column to schools table')
    console.log('   • Created GIN index for fast subject lookups')
    console.log('\n✨ You can now add subjects to schools!')
    
  } catch (error) {
    console.error('❌ Error running migration:', error.message)
    console.error('\n📖 Manual migration instructions:')
    console.error('   1. Go to your Supabase Dashboard')
    console.error('   2. Navigate to SQL Editor')
    console.error('   3. Copy contents of: db/migrations/20251003_add_subjects_to_schools.sql')
    console.error('   4. Paste and click "Run"')
    process.exit(1)
  }
}

runMigration()
