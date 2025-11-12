"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Download } from "lucide-react"
import jsPDF from 'jspdf'
// @ts-ignore
import QRCode from 'qrcode'

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

  // Funzione per caricare un'immagine come base64
  const loadImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL('image/png')
        resolve(dataURL)
      }
      img.onerror = reject
      img.src = url
    })
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {

      // Carica l'immagine di sfondo
      const backgroundImage = await loadImageAsBase64(`${window.location.origin}/sfondo-pdf.jpg`)

      // Usa dimensioni PDF standard A4 verticale (210x297mm)
      // L'immagine verrà scalata per adattarsi mantenendo le proporzioni
      const pageWidth = 210  // A4 width in mm
      const pageHeight = 297 // A4 height in mm

      // Crea documento A4 verticale
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Calcola le dimensioni per adattare l'immagine (1080x1920) in A4 mantenendo proporzioni
      // L'immagine originale è 9:16, A4 è circa 1:1.414
      // Adatta l'immagine per riempire l'altezza e centrare orizzontalmente
      const imgAspectRatio = 1080 / 1920 // 0.5625 (9:16)
      const pageAspectRatio = pageWidth / pageHeight // ~0.707 (A4)

      let imgWidth, imgHeight, xOffset, yOffset

      if (imgAspectRatio > pageAspectRatio) {
        // Immagine più larga rispetto al PDF - adatta all'altezza
        imgHeight = pageHeight
        imgWidth = pageHeight * imgAspectRatio
        xOffset = (pageWidth - imgWidth) / 2 // Centra orizzontalmente
        yOffset = 0
      } else {
        // Immagine più alta - adatta alla larghezza
        imgWidth = pageWidth
        imgHeight = pageWidth / imgAspectRatio
        xOffset = 0
        yOffset = (pageHeight - imgHeight) / 2 // Centra verticalmente
      }

      // Aggiungi l'immagine scalata e centrata
      doc.addImage(backgroundImage, 'JPEG', xOffset, yOffset, imgWidth, imgHeight)

      // Genera QR Code che punta alla pagina success
      const qrCodeUrl = `${window.location.origin}/success?codice=${prenotazione.codicePrenotazione}`

      // Genera QR code come data URL usando la libreria locale
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeUrl, {
        width: 200,
        height: 200,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Box elegante per il QR code al centro
      const boxWidth = 100
      const boxHeight = 120
      const boxX = (pageWidth - boxWidth) / 2
      const boxY = (pageHeight - boxHeight) / 2

      // Sfondo nero solido
      doc.setFillColor(0, 0, 0, 1)
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 8, 8, 'F')

      // Bordo sottile bianco
      doc.setDrawColor(255, 255, 255, 0.3)
      doc.setLineWidth(0.5)
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 8, 8, 'S')

      // Titolo
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(`UNDERCLUB - ${EVENTO_CONFIG.data.toUpperCase()}`, pageWidth / 2, boxY + 12, { align: 'center' })

      doc.setFontSize(10)
      doc.text(`${prenotazione.nome.toUpperCase()} ${prenotazione.cognome.toUpperCase()}`, pageWidth / 2, boxY + 20, { align: 'center' })

      // QR Code al centro
      const qrSize = 60
      const qrX = (pageWidth - qrSize) / 2
      const qrY = boxY + 25
      doc.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize)

      // Testo sotto QR
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Scansiona per vedere i dettagli', pageWidth / 2, qrY + qrSize + 8, { align: 'center' })

      doc.setFontSize(8)
      doc.text(`Codice: ${prenotazione.codicePrenotazione}`, pageWidth / 2, qrY + qrSize + 15, { align: 'center' })

      // Footer
      doc.setFontSize(6)
      doc.text('Presenta questo biglietto all\'ingresso', pageWidth / 2, boxY + boxHeight - 5, { align: 'center' })

      // Scarica il biglietto QR
      doc.save(`biglietto-qr-technoroom-${prenotazione.codicePrenotazione}.pdf`)

    } catch (error) {
      console.error("Errore generazione biglietto QR:", error)
      alert("Errore nella generazione del biglietto. Riprova.")
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
              {isGeneratingPDF ? "Generando..." : "Scarica Biglietto QR"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
