"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PrenotazioneForm } from "@/components/prenotazione-form"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePrenotazioneSuccess = async (prenotazioneData: any) => {
    setIsLoading(true)
    try {
      // Importa dinamicamente per evitare errori se Supabase non è configurato
      const { creaPrenotazione } = await import('@/lib/supabase-functions')

      const result = await creaPrenotazione(prenotazioneData)

      if (!result.success) {
        alert(result.error || "Si è verificato un errore durante la prenotazione. Riprova.")
        return
      }

      // Redirect alla pagina di successo con solo il codice prenotazione
      // I dati verranno recuperati dal database per sicurezza
      router.push(`/success?codice=${result.data!.codicePrenotazione}`)
    } catch (error) {
      console.error("Errore durante la prenotazione:", error)
      alert("Si è verificato un errore durante la prenotazione. Riprova.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <PrenotazioneForm
          onSuccess={handlePrenotazioneSuccess}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
