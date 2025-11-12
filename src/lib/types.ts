export type TrancheType = 'tranche1' | 'tranche2' | 'tranche3'

export interface Prenotazione {
  id: string
  nome: string
  cognome: string
  dataNascita: string
  email: string
  tranche: TrancheType
  codicePrenotazione: string
  timestamp: string
  stato: 'confermata' | 'checkin' | 'annullata'
}

export interface Disponibilita {
  tranche1: number // 50 posti max
  tranche2: number // 150 posti max
}

export const TRANCHE_CONFIG = {
  tranche1: { prezzo: 10, descrizione: '10€ + 1 drink', maxPosti: 50 },
  tranche2: { prezzo: 15, descrizione: '15€ + 1 drink', maxPosti: 150 },
  tranche3: { prezzo: 20, descrizione: '20€ + 1 drink (solo cassa)', maxPosti: 0 } // non prenotabile online
} as const

export const EVENTO_CONFIG = {
  nome: 'Technoroom',
  data: '22 novembre 2025',
  apertura: '00:30 del 23 novembre',
  lineup: 'Mådvi, Syra, Paola del Bene, Axiver, Alex Akashi',
  location: 'VIA CORSO TRINITA - SASSARI',
  locale: 'Underclub',
  finePrenotazioni: '2025-11-22T23:59:00.000Z'
} as const
