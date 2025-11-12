"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Download, ArrowLeft } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TRANCHE_CONFIG, EVENTO_CONFIG } from "@/lib/types"
import { formatDateTime } from "@/lib/utils"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const nome = searchParams.get('nome')
  const cognome = searchParams.get('cognome')
  const codice = searchParams.get('codice')
  const tranche = searchParams.get('tranche')

  // Redirect se mancano i parametri essenziali
  useEffect(() => {
    if (!nome || !cognome || !codice || !tranche) {
      router.push('/')
    }
  }, [nome, cognome, codice, tranche, router])

  if (!nome || !cognome || !codice || !tranche) {
    return null
  }

  const trancheConfig = TRANCHE_CONFIG[tranche as keyof typeof TRANCHE_CONFIG]
  const timestamp = new Date().toISOString()

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      // Per ora simuliamo il download
      // Qui integreremo la generazione PDF vera
      alert("PDF generation will be implemented with Supabase integration")
    } catch (error) {
      console.error("Errore generazione PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header - Mobile optimized */}
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

      {/* Success Content - Mobile first */}
      <main className="py-8 px-4 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message - Mobile optimized */}
          <div className="text-center mb-6 sm:mb-8">
            <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-400 mx-auto mb-4 drop-shadow-lg" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-2 leading-tight drop-shadow-lg">
              Prenotazione Confermata!
            </h1>
            <p className="text-lg sm:text-xl text-cyan-200 px-2 font-medium">
              La tua prenotazione per {EVENTO_CONFIG.nome} è stata registrata con successo.
            </p>
          </div>

          {/* Prenotazione Details - Mobile optimized */}
          <Card className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border-cyan-400/30 text-white shadow-2xl border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl sm:text-2xl text-cyan-300 font-bold">
                🎫 Dettagli Prenotazione
              </CardTitle>
              <CardDescription className="text-center text-cyan-200/80 text-sm sm:text-base font-medium">
                Salva questo biglietto per l'ingresso all'evento
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 sm:space-y-6 px-4 sm:px-6">
              {/* Info Persona */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-white/70 uppercase tracking-wide">Nome</label>
                  <p className="text-base sm:text-lg font-semibold">{nome} {cognome}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-white/70 uppercase tracking-wide">Codice Prenotazione</label>
                  <p className="text-base sm:text-lg font-semibold font-mono bg-white/20 px-3 py-2 rounded-lg border border-white/20 select-all">
                    {codice}
                  </p>
                </div>
              </div>

              {/* Info Evento */}
              <div className="border-t border-white/20 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-white/70 uppercase tracking-wide">Evento</label>
                    <p className="text-base sm:text-lg font-medium">{EVENTO_CONFIG.nome}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-white/70 uppercase tracking-wide">Data & Ora</label>
                    <p className="text-sm sm:text-base">{EVENTO_CONFIG.data} - {EVENTO_CONFIG.apertura}</p>
                  </div>
                </div>
              </div>

              {/* Info Tranche */}
              <div className="border-t border-white/20 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-white/70 uppercase tracking-wide">Tranche</label>
                    <p className="text-base sm:text-lg">{trancheConfig.descrizione}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-white/70 uppercase tracking-wide">Prezzo</label>
                    <p className="text-base sm:text-lg font-semibold text-green-300">€{trancheConfig.prezzo}</p>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="border-t border-white/20 pt-4 text-center">
                <label className="text-xs sm:text-sm font-medium text-white/70 uppercase tracking-wide block mb-1">Prenotato il</label>
                <p className="text-sm sm:text-base font-medium">{formatDateTime(timestamp)}</p>
              </div>

              {/* Location */}
              <div className="border-t border-white/20 pt-4 text-center">
                <label className="text-xs sm:text-sm font-medium text-white/70 uppercase tracking-wide block mb-2">Location</label>
                <p className="text-base sm:text-lg font-semibold">{EVENTO_CONFIG.locale}</p>
                <p className="text-sm text-white/70">{EVENTO_CONFIG.location}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions - Mobile optimized */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex-1 bg-purple-600 hover:bg-purple-700 h-12 sm:h-11 text-base sm:text-sm font-semibold touch-manipulation"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? "Generando PDF..." : "Scarica Biglietto PDF"}
            </Button>

            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1 border-white/30 text-white hover:bg-white/10 h-12 sm:h-11 text-base sm:text-sm font-semibold touch-manipulation"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </div>

          {/* Info aggiuntive - Mobile optimized */}
          <div className="mt-6 sm:mt-8 text-center text-white/70 text-xs sm:text-sm px-2">
            <p className="mb-3 font-medium">
              💡 <strong>Importante:</strong> Porta con te un documento d'identità per verificare l'età all'ingresso.
            </p>
            <p className="leading-relaxed">
              📧 Riceverai una conferma via email con tutti i dettagli della tua prenotazione.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-cyan-300/60 text-xs sm:text-sm">
        <p className="px-2">© 2025 Underclub - Prenotazioni online per {EVENTO_CONFIG.nome}</p>
      </footer>
    </div>
  )
}
