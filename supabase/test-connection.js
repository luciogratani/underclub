// Script di test per verificare la connessione a Supabase
// Esegui con: node supabase/test-connection.js

const { createClient } = require('@supabase/supabase-js')

// Carica le variabili d'ambiente
require('dotenv').config({ path: '../.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili d\'ambiente mancanti. Configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Test connessione Supabase...')
  console.log(`URL: ${supabaseUrl}`)
  console.log()

  try {
    // Test connessione base
    const { data: connectionTest, error: connectionError } = await supabase
      .from('disponibilita')
      .select('*')
      .limit(1)

    if (connectionError) {
      console.error('❌ Errore connessione:', connectionError.message)
      return
    }

    console.log('✅ Connessione riuscita!')
    console.log('📊 Disponibilità attuale:', connectionTest[0])

    // Test funzione RPC
    console.log('\n🔍 Test funzione crea_prenotazione...')

    const testPrenotazione = {
      nome: 'Test',
      cognome: 'User',
      email: `test-${Date.now()}@example.com`,
      tranche: 'tranche1'
    }

    const { data: rpcResult, error: rpcError } = await supabase.rpc('crea_prenotazione', {
      p_nome: testPrenotazione.nome,
      p_cognome: testPrenotazione.cognome,
      p_email: testPrenotazione.email,
      p_tranche: testPrenotazione.tranche
    })

    if (rpcError) {
      console.error('❌ Errore funzione RPC:', rpcError.message)
    } else {
      console.log('✅ Funzione RPC riuscita!')
      console.log('🎫 Prenotazione creata:', rpcResult)
    }

    // Verifica che la disponibilità sia stata decrementata
    const { data: updatedDisponibilita } = await supabase
      .from('disponibilita')
      .select('*')
      .single()

    console.log('📊 Disponibilità dopo prenotazione:', updatedDisponibilita)

  } catch (error) {
    console.error('❌ Errore imprevisto:', error.message)
  }
}

testConnection()
