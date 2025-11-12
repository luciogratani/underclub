"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { prenotazioneSchema, type PrenotazioneForm } from "@/lib/validations"
import { TRANCHE_CONFIG, EVENTO_CONFIG } from "@/lib/types"
import { generateCodicePrenotazione } from "@/lib/utils"

interface PrenotazioneFormProps {
  onSuccess: (data: any) => void
  isLoading: boolean
}

export function PrenotazioneForm({ onSuccess, isLoading }: PrenotazioneFormProps) {
  const [selectedTranche, setSelectedTranche] = useState<string>("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PrenotazioneForm>({
    resolver: zodResolver(prenotazioneSchema),
  })

  const watchedTranche = watch("tranche")

  const onSubmit = async (data: PrenotazioneForm) => {
    try {
      const prenotazioneData = {
        ...data,
        codicePrenotazione: generateCodicePrenotazione(),
        timestamp: new Date().toISOString(),
        stato: 'confermata' as const,
      }

      onSuccess(prenotazioneData)
    } catch (error) {
      console.error("Errore durante la prenotazione:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 sm:border bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg border-cyan-400/30">
      <CardHeader className="text-center pb-4 sm:pb-6">
        <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          🎟️ Prenota il tuo posto
        </CardTitle>
        <CardDescription className="text-base sm:text-lg text-cyan-200 font-medium">
          {EVENTO_CONFIG.data} • {EVENTO_CONFIG.apertura}
        </CardDescription>
        <CardDescription className="text-sm sm:text-base text-gray-200 font-medium">
          {EVENTO_CONFIG.lineup}
        </CardDescription>
        <CardDescription className="font-semibold text-purple-300 text-sm sm:text-base">
          {EVENTO_CONFIG.locale} • {EVENTO_CONFIG.location}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          {/* Informazioni Personali */}
          <div className="space-y-5 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white drop-shadow-sm">👤 Informazioni Personali</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm sm:text-base font-medium text-cyan-200">Nome *</Label>
                <Input
                  id="nome"
                  {...register("nome")}
                  placeholder="Il tuo nome"
                  className="h-12 sm:h-10 text-base sm:text-sm touch-manipulation"
                />
                {errors.nome && (
                  <p className="text-sm text-red-600 font-medium">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cognome" className="text-sm sm:text-base font-medium text-cyan-200">Cognome *</Label>
                <Input
                  id="cognome"
                  {...register("cognome")}
                  placeholder="Il tuo cognome"
                  className="h-12 sm:h-10 text-base sm:text-sm touch-manipulation"
                />
                {errors.cognome && (
                  <p className="text-sm text-red-600 font-medium">{errors.cognome.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataNascita" className="text-sm sm:text-base font-medium text-cyan-200">Data di Nascita *</Label>
              <Input
                id="dataNascita"
                type="date"
                {...register("dataNascita")}
                max={format(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")}
                className="h-12 sm:h-10 text-base sm:text-sm touch-manipulation [&::-webkit-date-and-time-value]:text-base"
              />
              {errors.dataNascita && (
                <p className="text-sm text-red-600 font-medium">{errors.dataNascita.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base font-medium text-cyan-200">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="tua@email.com"
                className="h-12 sm:h-10 text-base sm:text-sm touch-manipulation"
                inputMode="email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Selezione Tranche */}
          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg sm:text-xl font-semibold text-white drop-shadow-sm">🎯 Seleziona la tua tranche</h3>

            <RadioGroup
              value={watchedTranche}
              onValueChange={(value) => setValue("tranche", value as any)}
              className="space-y-3 sm:space-y-4"
            >
              {Object.entries(TRANCHE_CONFIG).slice(0, 2).map(([key, config]) => (
                <div key={key} className="flex items-start space-x-3 p-4 sm:p-5 border-2 border-cyan-400/40 rounded-xl hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-200 touch-manipulation backdrop-blur-sm">
                  <RadioGroupItem
                    value={key}
                    id={key}
                    className="mt-1 sm:mt-0.5 w-5 h-5 sm:w-4 sm:h-4"
                  />
                  <Label htmlFor={key} className="flex-1 cursor-pointer py-1">
                    <div className="font-semibold text-base sm:text-lg text-white mb-1 drop-shadow-sm">
                      {config.descrizione}
                    </div>
                    <div className="text-sm text-cyan-200 font-medium">
                      {config.maxPosti} posti disponibili
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {errors.tranche && (
              <p className="text-sm text-red-600 font-medium">{errors.tranche.message}</p>
            )}
          </div>

          {/* Privacy Policy */}
          <div className="space-y-3 sm:space-y-2">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy"
                {...register("privacy")}
                className="mt-1 w-5 h-5 sm:w-4 sm:h-4 touch-manipulation"
              />
              <Label htmlFor="privacy" className="text-sm sm:text-base leading-relaxed cursor-pointer text-gray-100">
                🔒 Accetto la{" "}
                <a
                  href="#"
                  className="text-cyan-300 underline font-medium hover:text-cyan-200"
                  onClick={(e) => e.preventDefault()}
                >
                  privacy policy
                </a>{" "}
                e acconsento al trattamento dei miei dati personali per la gestione della prenotazione *
              </Label>
            </div>
            {errors.privacy && (
              <p className="text-sm text-red-600 font-medium">{errors.privacy.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 sm:h-12 text-lg sm:text-base font-semibold touch-manipulation bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 border-0 shadow-lg"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 sm:mr-2 sm:h-4 sm:w-4 animate-spin" />
                🚀 Prenotazione in corso...
              </>
            ) : (
              "🎫 Conferma Prenotazione"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
