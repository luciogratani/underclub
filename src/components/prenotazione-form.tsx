"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Loader2, Users, MapPin } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPrenotazioneSchema, type PrenotazioneForm } from "@/lib/validations"
import { TRANCHE_CONFIG, EVENTO_CONFIG, type Disponibilita } from "@/lib/types"
import { generateCodicePrenotazione } from "@/lib/utils"

interface PrenotazioneFormProps {
  onSuccess: (data: any) => void
  isLoading: boolean
}

type Step = 1 | 2 | 3

export function PrenotazioneForm({ onSuccess, isLoading }: PrenotazioneFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [disponibilita, setDisponibilita] = useState<Disponibilita | null>(null)
  const [isLoadingDisponibilita, setIsLoadingDisponibilita] = useState(false)

  const [formSchema, setFormSchema] = useState(() => createPrenotazioneSchema(null))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PrenotazioneForm>({
    resolver: zodResolver(formSchema),
  })

  const watchedTranche = watch("tranche")

  // Recupera disponibilità al mount del componente e aggiorna lo schema
  useEffect(() => {
    const loadDisponibilita = async () => {
      setIsLoadingDisponibilita(true)
      try {
        const { getDisponibilita } = await import('@/lib/supabase-functions')
        const data = await getDisponibilita()
        setDisponibilita(data)
        // Aggiorna lo schema con i dati di disponibilità
        setFormSchema(createPrenotazioneSchema(data))
      } catch (error) {
        console.error('Errore nel caricamento disponibilità:', error)
        // Fallback ai valori di default
        const fallbackDisponibilita = { tranche1: 50, tranche2: 150 }
        setDisponibilita(fallbackDisponibilita)
        setFormSchema(createPrenotazioneSchema(fallbackDisponibilita))
      } finally {
        setIsLoadingDisponibilita(false)
      }
    }

    loadDisponibilita()
  }, [])

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

  const nextStep = async () => {
    if (currentStep === 1) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Validate personal info fields before proceeding
      const isValid = await trigger(['nome', 'cognome', 'email'])
      if (isValid) {
        setCurrentStep(3)
      }
    }
  }

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else if (currentStep === 3) {
      setCurrentStep(2)
    }
  }

  const handleStepSubmit = async () => {
    if (currentStep === 3) {
      const isValid = await trigger()
      if (isValid) {
        handleSubmit(onSubmit)()
      }
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Card Container */}
      <div className="w-[80vw] h-[70vh] backdrop-blur-[14px] shadow-2xl rounded-3xl overflow-hidden">
        <Card className="w-full h-full border-0 bg-black/5 border border-white/20 flex flex-col rounded-3xl overflow-hidden">

        <CardContent className="flex-1 flex flex-col px-6 py-6 overflow-hidden">
          {/* Step 1: Event Info - Glassmorphism */}
          {currentStep === 1 && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="text-center">
                <div className="mb-2 flex justify-center drop-shadow-lg">
                  <svg
                    className="w-64 sm:w-80 h-auto"
                    viewBox="0 0 523.49 52.91"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g>
                      <path fill="white" d="M12.85,51.59V17.12l-12.85.45V1.16h48.2v16.41l-12.85-.45v34.48H12.85Z"/>
                      <path fill="white" d="M41.96,51.59V1.16h42.53v13.84h-19.66v4.69h17.86v13.23h-17.86v4.84h20.23v13.84h-43.1Z"/>
                      <path fill="white" d="M127.12,50.69c-5.95,1.81-12.95,2.04-15.88,2.04-8.22,0-17.01-2.34-23.25-7.33-5.95-4.69-9.17-11.49-9.17-18.6,0-7.79,3.69-14.44,9.45-19.13C92.71,4.11,100.27.03,112.09.03c4.73,0,10.02.6,15.03,1.97l.66,19.2c-2.65-2.12-7.56-4.99-13.33-4.99-3.59,0-6.9,1.13-9.17,3.1-2.17,1.89-3.31,4.54-3.31,7.18s1.23,5.37,3.69,7.26c1.89,1.44,4.82,2.87,9.36,2.87,6.43,0,10.87-3.1,12.76-4.76l-.66,18.83Z"/>
                      <path fill="white" d="M123.81,51.59V1.16h22.02v17.09h13.99V1.16h22.02v50.43h-22.02v-17.54h-13.99v17.54h-22.02Z"/>
                      <path fill="white" d="M168.04,51.59V1.16h21.83l14.65,19.05c2.36,3.02,3.88,4.99,5.95,8.92h.66c-.94-3.18-1.98-8.24-1.98-11.95V1.16h21.93v50.43h-21.93l-15.69-19.88c-1.42-1.81-3.12-4.46-4.35-6.58h-.66c.66,2.72,1.42,7.03,1.42,9.3v17.16h-21.83Z"/>
                      <path fill="white" d="M288.76,44.61c-5.39,4.39-14.18,8.09-26.18,8.09s-20.79-3.71-26.18-8.09c-4.91-4.01-8.79-10.21-8.79-18.3s3.88-14.21,8.79-18.22c5.39-4.39,14.18-8.09,26.18-8.09s20.79,3.7,26.18,8.09c4.92,4.01,8.79,10.21,8.79,18.22s-3.88,14.29-8.79,18.3ZM254.36,18.83c-2.27,1.89-3.59,4.84-3.59,7.56,0,2.87,1.32,5.67,3.59,7.49,1.89,1.51,4.73,2.57,8.22,2.57s6.33-1.06,8.22-2.57c2.08-1.66,3.59-4.31,3.59-7.49s-1.32-5.82-3.59-7.56c-1.7-1.36-4.44-2.57-8.22-2.57-4.06,0-6.71,1.29-8.22,2.57Z"/>
                      <path fill="white" d="M322.09,1.16c8.7,0,13.14,1.81,16.07,3.78,4.82,3.25,6.24,7.56,6.24,11.34,0,4.91-2.46,9.22-7.37,11.87-1.61.91-3.88,1.74-6.9,2.19l19.66,21.25h-15.31l-16.82-20.26h-1.51v20.26h-12.29V1.16h18.24ZM316.13,24.38h3.5c2.36,0,12.1-.23,12.1-7.64s-9.64-7.56-11.91-7.56h-3.69v15.2Z"/>
                      <path fill="white" d="M345.24,26.82c0-15.05,14.65-26.08,32.8-26.08s32.8,11.04,32.8,26.08-14.55,26.08-32.8,26.08-32.8-11.11-32.8-26.08ZM352.42,26.82c0,11.57,11.44,20.79,25.61,20.79s25.61-9.22,25.61-20.79-11.44-20.79-25.61-20.79-25.61,9.22-25.61,20.79Z"/>
                      <path fill="white" d="M386.26,26.82c0-15.05,14.65-26.08,32.8-26.08s32.8,11.04,32.8,26.08-14.55,26.08-32.8,26.08-32.8-11.11-32.8-26.08ZM393.44,26.82c0,11.57,11.44,20.79,25.61,20.79s25.61-9.22,25.61-20.79-11.44-20.79-25.61-20.79-25.61,9.22-25.61,20.79Z"/>
                      <path fill="white" d="M460.92,1.57h8.88l16.73,32.06L504.02,1.57h8.88l10.59,50.43h-12.48l-5.67-31.07-16.92,31.07h-4.16l-16.16-31.07-6.43,31.07h-12.48l11.72-50.43Z"/>
                    </g>
                  </svg>
                </div>
                <p className="text-lg text-white/90 mb-4 font-medium">{EVENTO_CONFIG.data} • {EVENTO_CONFIG.apertura}</p>

                {/* Separatore */}
                <div className="flex items-center my-4">
                  <div className="flex-1 h-px  bg-white/20"></div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-white/80" />
                  <div className="w-px h-5 bg-white/20"></div>
                  <p className="text-xs text-white/80 font-mono">{EVENTO_CONFIG.lineup}</p>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-white/70" />
                  <div className="w-px h-5 bg-white/20"></div>
                  <p className="text-xs text-white/70 font-mono px-2">{EVENTO_CONFIG.locale} • {EVENTO_CONFIG.location}</p>
                </div>
              </div>

              <div className="max-w-[200px]">
                <Image
                  src="/locandina.jpg"
                  alt="Locandina Technoroom"
                  width={350}
                  height={525}
                  className="w-full rounded-xl shadow-2xl border-2 border-white/20 backdrop-blur-sm"
                  priority
                />
              </div>

            </div>
          )}

          {/* Step 2: Personal Info - Glassmorphism */}
          {currentStep === 2 && (
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Informazioni Personali</h3>
                <p className="text-sm text-white/70">Compila i tuoi dati per continuare</p>
              </div>

              <form className="space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm font-medium text-white/80">Nome</Label>
                    <Input
                      id="nome"
                      {...register("nome")}
                      placeholder="Il tuo nome"
                      className={`h-12 text-base touch-manipulation bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm ${errors.nome ? 'border-red-400' : 'border-white/20'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cognome" className="text-sm font-medium text-white/80">Cognome</Label>
                    <Input
                      id="cognome"
                      {...register("cognome")}
                      placeholder="Il tuo cognome"
                      className={`h-12 text-base touch-manipulation bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm ${errors.cognome ? 'border-red-400' : 'border-white/20'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white/80">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="tua@email.com"
                    className={`h-12 text-base touch-manipulation bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm ${errors.email ? 'border-red-400' : 'border-white/20'}`}
                    inputMode="email"
                    autoComplete="email"
                  />
                </div>
              </form>

              <div className="mt-4 px-4 text-center">
                <p className="text-[10px] text-white/45 font-mono">
                  Proseguendo dichiari di avere l'età legale per accedere all'evento.
                </p>
              </div>

            </div>
          )}

          {/* Step 3: Tranche Selection & Privacy */}
          {currentStep === 3 && (
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Seleziona la tua tranche</h3>
                <p className="text-sm text-white">Scegli il prezzo che preferisci</p>
              </div>

              <div className="space-y-4 flex-1">
                <div className="space-y-3">
                  {/* Tranche prenotabili online */}
                  {['tranche1', 'tranche2'].map((key) => {
                    const config = TRANCHE_CONFIG[key as keyof typeof TRANCHE_CONFIG]
                    const postiDisponibili = disponibilita ? disponibilita[key as keyof Disponibilita] : config.maxPosti
                    const isEsaurita = postiDisponibili <= 0

                    return (
                      <div
                        key={key}
                        onClick={() => !isEsaurita && setValue("tranche", key as any)}
                        className={`p-4 border-2 rounded-xl transition-all duration-200 touch-manipulation ${
                          isEsaurita
                            ? 'border-gray-500 bg-gray-500/10 cursor-not-allowed opacity-50'
                            : watchedTranche === key
                            ? 'border-red-500 bg-white/5 shadow-lg cursor-pointer'
                            : 'border-white/20 bg-black/20 hover:border-red-400 hover:bg-red-500/10 cursor-pointer'
                        }`}
                      >
                        <div className="font-semibold text-lg text-white mb-1 drop-shadow-sm">
                          {config.descrizione}
                        </div>
                        <div className={`text-sm font-medium ${
                          isEsaurita ? 'text-gray-400' : 'text-red-500/85'
                        }`}>
                          {isLoadingDisponibilita ? (
                            <span>Caricamento...</span>
                          ) : (
                            <span>{postiDisponibili} posti disponibili</span>
                          )}
                        </div>
                        {isEsaurita && (
                          <div className="text-xs text-gray-400 mt-1">
                            Esaurita
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Separatore */}
                  <div className="flex items-center my-4">
                    <div className="flex-1 h-px bg-white/20"></div>
                  </div>

                  {/* Tranche solo in cassa */}
                  <div className="p-4 border-2 border-white/20 rounded-xl bg-black/5 backdrop-blur-sm">
                    <div className="font-semibold text-lg text-white mb-1 drop-shadow-sm">
                      {TRANCHE_CONFIG.tranche3.descrizione}
                    </div>
                    <div className="text-sm text-red-500/85 font-medium">
                      Acquistabile in cassa
                    </div>
                  </div>
                </div>


                </div>

                <div className="px-4 text-center">
                  <p className="text-[10px] text-white/45 font-mono">
                    Proseguendo accetti la{" "}
                    <a
                      href="#"
                      className="text-red-500/90 underline font-medium hover:text-red-400"
                      onClick={(e) => e.preventDefault()}
                    >
                      privacy policy
                    </a>{" "}
                    e acconsenti al trattamento dei tuoi dati personali
                  </p>
                </div>
              </div>
          )}

        </CardContent>
      </Card>
      </div>

      {/* Step Indicator - Global Revolutionary Dots */}
      <div className="flex justify-center items-center space-x-4 ">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`rounded-full transition-all duration-300 backdrop-blur-sm cursor-pointer border border-white/20 ${
                step === currentStep
                  ? 'w-6 h-6 bg-white/5 shadow-lg'
                  : step < currentStep
                  ? 'w-4 h-4 bg-white/5'
                  : 'w-4 h-4 bg-black/5'
              }`}
              onClick={() => step <= currentStep && setCurrentStep(step as Step)}
            />
          </div>
        ))}

        {/* Action button for step 1 */}
        {(currentStep === 1 || currentStep === 2) && (
          <>
            <button
              onClick={nextStep}
              className="w-9 h-9 rounded-full bg-red-500/85 hover:bg-red-600/90 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {/* Submit button for step 3 */}
        {currentStep === 3 && (
          <>
            <button
              onClick={handleStepSubmit}
              disabled={isLoading}
              className="w-12 h-12 rounded-full bg-red-500/90 hover:bg-red-600/90 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M5 13L9 17L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </>
        )}

        {/* Back button for steps 2-3 - Hidden to prevent going back due to form simplicity */}
        {/* {currentStep > 1 && (
          <>
            <button
              onClick={prevStep}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M15 19L8 12L15 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )} */}
      </div>
    </div>
  )
}
