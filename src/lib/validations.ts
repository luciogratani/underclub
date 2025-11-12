import { z } from "zod"
import { EVENTO_CONFIG, type Disponibilita } from "./types"

const today = new Date()
const bookingDeadline = new Date(EVENTO_CONFIG.finePrenotazioni)

// Funzione per creare lo schema con validazione dinamica sulla disponibilità
export const createPrenotazioneSchema = (disponibilita: Disponibilita | null) => {
  return z.object({
    nome: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
    cognome: z.string().min(2, "Il cognome deve essere di almeno 2 caratteri"),
    email: z.string().email("Inserisci un indirizzo email valido"),
    tranche: z.enum(["tranche1", "tranche2"], {
      required_error: "Seleziona una tranche di prezzo prenotabile online",
    }).refine((tranche) => {
      if (!disponibilita) return true // Se non abbiamo i dati, permetti la validazione
      return disponibilita[tranche as keyof Disponibilita] > 0
    }, {
      message: "Questa tranche è esaurita. Seleziona un'altra opzione."
    }),
  })
}

// Schema statico per compatibilità (usato quando non abbiamo i dati dinamici)
export const prenotazioneSchema = z.object({
  nome: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
  cognome: z.string().min(2, "Il cognome deve essere di almeno 2 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  tranche: z.enum(["tranche1", "tranche2"], {
    required_error: "Seleziona una tranche di prezzo prenotabile online",
  }),
})

export type PrenotazioneForm = z.infer<typeof prenotazioneSchema>
