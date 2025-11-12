import { supabase } from './supabase'
import { Prenotazione, Disponibilita } from './types'
import { PrenotazioneForm } from './validations'

// Funzione per verificare la disponibilità dei posti
export async function getDisponibilita(): Promise<Disponibilita | null> {
  try {
    const { data, error } = await supabase
      .from('disponibilita')
      .select('tranche1, tranche2')
      .single()

    if (error) {
      console.error('Errore nel recupero disponibilità:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Errore nel recupero disponibilità:', error)
    return null
  }
}

// Funzione per creare una prenotazione
export async function creaPrenotazione(formData: PrenotazioneForm): Promise<{
  success: boolean
  data?: Prenotazione
  error?: string
}> {
  try {
    // Chiama la funzione RPC del database che gestisce la prenotazione atomica
    const { data, error } = await supabase.rpc('crea_prenotazione', {
      p_nome: formData.nome,
      p_cognome: formData.cognome,
      p_email: formData.email,
      p_tranche: formData.tranche
    })

    if (error) {
      console.error('Errore nella creazione prenotazione:', error)

      // Gestione errori specifici
      if (error.message?.includes('Posti esauriti')) {
        return { success: false, error: 'Posti esauriti per la tranche selezionata' }
      }

      if (error.message?.includes('duplicate key value')) {
        return { success: false, error: 'Email già utilizzata per una prenotazione' }
      }

      return { success: false, error: 'Errore durante la prenotazione. Riprova.' }
    }

    if (!data) {
      return { success: false, error: 'Errore imprevisto durante la prenotazione' }
    }

    // I dati completi della prenotazione sono già restituiti dalla funzione RPC
    // Converti i campi snake_case del database in camelCase per il frontend
    const prenotazione: Prenotazione = {
      id: data.id,
      nome: data.nome,
      cognome: data.cognome,
      dataNascita: data.data_nascita || undefined,
      email: data.email,
      tranche: data.tranche,
      codicePrenotazione: data.codice_prenotazione,
      timestamp: data.timestamp,
      stato: data.stato,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return { success: true, data: prenotazione }

  } catch (error) {
    console.error('Errore nella creazione prenotazione:', error)
    return { success: false, error: 'Errore di connessione. Riprova più tardi.' }
  }
}

// Funzione per recuperare una prenotazione tramite codice (versione sicura con RPC)
export async function getPrenotazioneByCodice(codice: string): Promise<Prenotazione | null> {
  try {
    const { data, error } = await supabase.rpc('get_prenotazione_by_codice', {
      p_codice: codice.toUpperCase()
    })

    if (error) {
      console.error('Errore nel recupero prenotazione:', error)
      return null
    }

    if (!data) {
      return null
    }

    // Converti snake_case in camelCase
    const prenotazione: Prenotazione = {
      id: data.id,
      nome: data.nome,
      cognome: data.cognome,
      dataNascita: data.data_nascita || undefined,
      email: data.email,
      tranche: data.tranche,
      codicePrenotazione: data.codice_prenotazione,
      timestamp: data.timestamp,
      stato: data.stato,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return prenotazione
  } catch (error) {
    console.error('Errore nel recupero prenotazione:', error)
    return null
  }
}

// Funzione per recuperare una prenotazione tramite email (solo per l'utente stesso)
export async function getPrenotazioneByEmail(email: string): Promise<Prenotazione | null> {
  try {
    const { data, error } = await supabase
      .from('prenotazioni')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Errore nel recupero prenotazione:', error)
      return null
    }

    // Converti snake_case in camelCase
    const prenotazione: Prenotazione = {
      id: data.id,
      nome: data.nome,
      cognome: data.cognome,
      dataNascita: data.data_nascita || undefined,
      email: data.email,
      tranche: data.tranche,
      codicePrenotazione: data.codice_prenotazione,
      timestamp: data.timestamp,
      stato: data.stato,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return prenotazione
  } catch (error) {
    console.error('Errore nel recupero prenotazione:', error)
    return null
  }
}
