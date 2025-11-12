"use client"

import FaultyTerminal from '../../FaultyTerminal'

interface TerminalBackgroundProps {
  children: React.ReactNode
}

export function TerminalBackground({ children }: TerminalBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 w-full h-full z-0">
        <FaultyTerminal
          scale={1.2}
          gridMul={[2, 1]}
          digitSize={1.1}
          timeScale={0.8}
          pause={false}
          scanlineIntensity={0.8}
          glitchAmount={0.7}
          flickerAmount={0.6}
          noiseAmp={0.8}
          chromaticAberration={0.1}
          dither={0.2}
          curvature={0.1}
          tint="#9333ea"
          mouseReact={true}
          mouseStrength={0.3}
          pageLoadAnimation={true}
          brightness={0.4}
          className="opacity-60"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-purple-900/60 to-black/80 z-10" />

      {/* Content Layer */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}
