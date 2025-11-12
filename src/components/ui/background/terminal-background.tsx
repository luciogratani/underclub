"use client"

import FaultyTerminal from '../../FaultyTerminal'

interface TerminalBackgroundProps {
  children: React.ReactNode
}

export function TerminalBackground({ children }: TerminalBackgroundProps) {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 w-full h-full z-0">
      <FaultyTerminal
        scale={2.5}
        gridMul={[2, 1]}
        digitSize={1.2}
        timeScale={1}
        pause={false}
        scanlineIntensity={1}
        glitchAmount={3}
        flickerAmount={3}
        noiseAmp={1}
        chromaticAberration={0}
        dither={0}
        curvature={0.1}
        tint="#EA1F1F"
        mouseReact={false}
        mouseStrength={0.5}
        pageLoadAnimation={true}
        brightness={0.9}
      />
      </div>

      {/* Gradient Overlay - Essential for glassmorphism effects */}
      <div className="fixed inset-0 bg-black/5 z-10" />

      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-2">
        {children}
      </div>
    </div>
  )
}
