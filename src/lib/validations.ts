import { z } from "zod"
import { EVENTO_CONFIG } from "./types"

const today = new Date()
const minBirthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
const bookingDeadline = new Date(EVENTO_CONFIG.finePrenotazioni)

export const prenotazioneSchema = z.object({
  nome: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
  cognome: z.string().min(2, "Il cognome deve essere di almeno 2 caratteri"),
  dataNascita: z
    .string()
    .refine(
      (date) => {
        const birthDate = new Date(date)
        return birthDate <= minBirthDate
      },
      "Devi avere almeno 18 anni per prenotare"
    )
    .refine(
      (date) => {
        const birthDate = new Date(date)
        return birthDate < today
      },
      "La data di nascita non può essere nel futuro"
    ),
  email: z.string().email("Inserisci un indirizzo email valido"),
  tranche: z.enum(["tranche1", "tranche2"], {
    required_error: "Seleziona una tranche di prezzo",
  }),
  privacy: z.boolean().refine((val) => val === true, {
    message: "Devi accettare la privacy policy",
  }),
})

export type PrenotazioneForm = z.infer<typeof prenotazioneSchema>
