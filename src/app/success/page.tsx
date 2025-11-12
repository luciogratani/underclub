import { Suspense } from "react"
import SuccessContent from "./SuccessContent"

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Caricamento...</div></div>}>
      <SuccessContent />
    </Suspense>
  )
}
