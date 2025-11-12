"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { PrenotazioneForm } from "@/components/prenotazione-form"
import { EVENTO_CONFIG } from "@/lib/types"
import { TerminalBackground } from "@/components/ui/background/terminal-background"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePrenotazioneSuccess = async (prenotazioneData: any) => {
    setIsLoading(true)
    try {
      // Qui andremo ad integrare Supabase
      console.log("Prenotazione data:", prenotazioneData)

      // Per ora simuliamo il salvataggio
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Redirect alla pagina di successo con i dati
      const params = new URLSearchParams({
        nome: prenotazioneData.nome,
        cognome: prenotazioneData.cognome,
        codice: prenotazioneData.codicePrenotazione,
        tranche: prenotazioneData.tranche
      })

      router.push(`/success?${params}`)
    } catch (error) {
      console.error("Errore durante la prenotazione:", error)
      alert("Si è verificato un errore durante la prenotazione. Riprova.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TerminalBackground>
      {/* Header con logo - Mobile optimized */}
      <header className="py-6 px-4 sm:py-8">
        <div className="max-w-6xl mx-auto flex justify-center">
          <Image
            src="/logo_text_white_bg_black.jpg"
            alt="Underclub Logo"
            width={180}
            height={60}
            className="object-contain w-44 sm:w-52 drop-shadow-2xl"
            priority
          />
        </div>
      </header>

      {/* Hero Section - Mobile first */}
      <section className="py-8 px-4 sm:py-12">
        <div className="max-w-4xl mx-auto text-center text-white mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight drop-shadow-lg">
            {EVENTO_CONFIG.nome}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-2 font-medium text-cyan-300">{EVENTO_CONFIG.data}</p>
          <p className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4 text-purple-300">{EVENTO_CONFIG.apertura}</p>
          <p className="text-sm sm:text-base md:text-lg opacity-90 leading-relaxed px-2 text-gray-200 font-medium">
            {EVENTO_CONFIG.lineup}
          </p>
          <p className="text-xs sm:text-sm md:text-base mt-2 opacity-75 font-medium text-cyan-400">
            {EVENTO_CONFIG.locale} • {EVENTO_CONFIG.location}
          </p>
        </div>

        {/* Locandina - Mobile optimized */}
        <div className="max-w-sm sm:max-w-md mx-auto mb-8 sm:mb-12 px-2">
          <Image
            src="/locandina.jpg"
            alt="Locandina Technoroom"
            width={350}
            height={525}
            className="w-full rounded-xl shadow-2xl border-2 border-cyan-400/30 backdrop-blur-sm"
            priority
          />
        </div>

        {/* Form di Prenotazione - Mobile first */}
        <div className="max-w-2xl mx-auto px-2">
          <PrenotazioneForm
            onSuccess={handlePrenotazioneSuccess}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Footer - Mobile optimized */}
      <footer className="py-6 px-4 text-center text-cyan-300/60 text-xs sm:text-sm">
        <p className="px-2">© 2025 Underclub - Prenotazioni online per {EVENTO_CONFIG.nome}</p>
      </footer>
    </TerminalBackground>
  )
}
