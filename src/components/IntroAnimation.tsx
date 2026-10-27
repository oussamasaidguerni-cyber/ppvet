import { useEffect, useState } from 'react'

interface IntroAnimationProps {
  onComplete: () => void
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [stage, setStage] = useState<'paw' | 'wordmark' | 'fade'>('paw')
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      onComplete()
      return
    }

    // Allow skip after a short delay
    const skipTimer = setTimeout(() => setCanSkip(true), 300)
    
    // Stage transitions
    const pawTimer = setTimeout(() => setStage('wordmark'), 400)
    const fadeTimer = setTimeout(() => setStage('fade'), 1200)
    const completeTimer = setTimeout(() => onComplete(), 1500)
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === ' ') && canSkip) {
        e.preventDefault()
        onComplete()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      clearTimeout(skipTimer)
      clearTimeout(pawTimer)
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onComplete, canSkip])

  const handleSkip = () => {
    if (canSkip) {
      onComplete()
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-[200] bg-black flex items-center justify-center transition-opacity duration-300 ${
        stage === 'fade' ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleSkip}
      role="dialog"
      aria-label="P&PVET introduction"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6">
        <div className={`transition-all duration-500 ${
          stage === 'paw' ? 'opacity-0 scale-95' : stage === 'wordmark' || stage === 'fade' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Central pad */}
            <ellipse cx="32" cy="38" rx="12" ry="10" fill="white"/>
            {/* Toe pads */}
            <ellipse cx="20" cy="26" rx="6" ry="8" fill="white" transform="rotate(-20 20 26)"/>
            <ellipse cx="28" cy="22" rx="6" ry="8" fill="white" transform="rotate(-8 28 22)"/>
            <ellipse cx="36" cy="22" rx="6" ry="8" fill="white" transform="rotate(8 36 22)"/>
            <ellipse cx="44" cy="26" rx="6" ry="8" fill="white" transform="rotate(20 44 26)"/>
          </svg>
        </div>
        <div className={`transition-all duration-700 ${
          stage === 'wordmark' || stage === 'fade' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <div className="text-white text-3xl font-light tracking-[0.2em]">P&PVET</div>
          {stage === 'fade' && (
            <div className="text-white/60 text-xs text-center mt-2 tracking-wider">Better care. Clearer records.</div>
          )}
        </div>
      </div>
      {canSkip && stage !== 'fade' && (
        <button 
          className="absolute bottom-8 text-white/40 text-sm hover:text-white/60 transition-colors"
          onClick={handleSkip}
          aria-label="Skip introduction"
        >
          Skip
        </button>
      )}
    </div>
  )
}
