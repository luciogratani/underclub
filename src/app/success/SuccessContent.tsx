"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TRANCHE_CONFIG, EVENTO_CONFIG, type Prenotazione } from "@/lib/types"
import { formatDateTime } from "@/lib/utils"

export default function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [prenotazione, setPrenotazione] = useState<Prenotazione | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const codice = searchParams.get('codice')

  // Recupera i dati della prenotazione dal database
  useEffect(() => {
    const loadPrenotazione = async () => {
      // Se non c'è il codice, redirect immediato
      if (!codice) {
        router.push('/')
        return
      }

      try {
        const { getPrenotazioneByCodice } = await import('@/lib/supabase-functions')
        const data = await getPrenotazioneByCodice(codice)

        if (!data) {
          // Prenotazione non trovata, redirect alla home
          router.push('/')
          return
        }

        setPrenotazione(data)
      } catch (error) {
        console.error('Errore nel recupero prenotazione:', error)
        setError('Errore nel caricamento della prenotazione')
      } finally {
        setIsLoading(false)
      }
    }

    loadPrenotazione()
  }, [codice, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="w-[80vw] h-[75vh] mx-auto backdrop-blur-[14px] shadow-2xl">
        <Card className="w-full h-full border-0 bg-black/5 border border-white/20 flex flex-col rounded-3xl overflow-hidden">
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Caricamento prenotazione...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-[80vw] h-[75vh] mx-auto backdrop-blur-[14px] shadow-2xl">
        <Card className="w-full h-full border-0 bg-black/5 border border-white/20 flex flex-col rounded-3xl overflow-hidden">
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={() => router.push('/')} className="bg-red-500/90 hover:bg-red-600/90">
                Torna alla home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se non abbiamo la prenotazione (dovrebbe essere già gestito dal redirect), mostra null
  if (!prenotazione) {
    return null
  }

  const trancheConfig = TRANCHE_CONFIG[prenotazione.tranche as keyof typeof TRANCHE_CONFIG]

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
    <div className="w-[80vw] h-[75vh] mx-auto backdrop-blur-[14px] shadow-2xl">
      <Card className="w-full h-full border-0 bg-black/5 border border-white/20 flex flex-col rounded-3xl overflow-hidden">

        <CardContent className="flex-1 flex flex-col px-6 py-6 overflow-hidden">
          {/* Success Message */}
          <div className="text-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">
              Prenotazione Confermata!
            </h2>
          </div>
          {/* Dettagli Prenotazione */}
          <div className="flex-1 space-y-4">
            <div className="text-center">
              <p className="text-base font-semibold text-white mb-2">{prenotazione.nome} {prenotazione.cognome}</p>
              <p className="text-sm text-white/70 mb-4">{EVENTO_CONFIG.nome}</p>
            </div>

            <div className="space-y-3">
              <div className="text-center">
                <label className="text-xs text-white/60 font-mono block mb-1">Codice Prenotazione</label>
                <p className="text-lg font-mono font-bold text-white bg-white/10 px-4 py-2 rounded-lg select-all">
                  {prenotazione.codicePrenotazione}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-white/80">{EVENTO_CONFIG.data} • {EVENTO_CONFIG.apertura}</p>
                <p className="text-sm text-white/70 font-mono">{EVENTO_CONFIG.location}</p>
              </div>

              <div className="text-center">
                <p className="text-base font-semibold text-red-400">{trancheConfig.descrizione}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-4">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="w-full bg-red-500/90 hover:bg-red-600/90 backdrop-blur-sm border border-white/20 text-white h-12 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? "Generando..." : "Scarica PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
