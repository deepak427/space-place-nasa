import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './MoonPage.module.css'
import { spaceSFX } from '../utils/audio'
import { playVoice, stopVoice } from '../utils/voice'
import { useLanguage } from '../context/LanguageContext'

export default function MoonPage({ onBack }) {
  const { t, language } = useLanguage()
  const [journeyActive, setJourneyActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, w: 0, h: 0, active: false, pos: 'right' })
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const heroHeaderRef = useRef(null)
  const moonExplorerRef = useRef(null)
  const factGlowRef = useRef(null)
  const factDarkSideRef = useRef(null)
  const factFormationRef = useRef(null)
  const studyMoonRef = useRef(null)
  const whatWeKnowRef = useRef(null)

  const stepRefs = [heroHeaderRef, heroHeaderRef, moonExplorerRef, factGlowRef, factDarkSideRef, factFormationRef, studyMoonRef, whatWeKnowRef]
  const stepTexts = [
    t('moonStep0'),
    t('moonStep1'),
    t('moonStep2'),
    t('moonStep3'),
    t('moonStep4'),
    t('moonStep5'),
    t('moonStep6'),
    t('moonStep7')
  ]

  const [showFlyingMoon, setShowFlyingMoon] = useState(false)

  const safeTransition = (cb) => {
    if (document.startViewTransition) {
      try {
        document.startViewTransition(cb)
      } catch (e) {
        cb()
      }
    } else {
      cb()
    }
  }

  const toggleJourney = () => {
    if (journeyActive) {
      setJourneyActive(false)
      setCurrentStep(-1)
      setSpotlight(s => ({ ...s, active: false }))
      stopVoice()
      setIsSpeaking(false)
    } else {
      safeTransition(() => {
        setJourneyActive(true)
        setCurrentStep(0)
      })
    }
  }

  const nextStep = () => {
    if (currentStep < stepTexts.length - 1) {
      safeTransition(() => {
        setCurrentStep(prev => prev + 1)
      })
    } else {
      toggleJourney()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      safeTransition(() => {
        setCurrentStep(prev => prev - 1)
      })
    }
  }

  // Coordinate tracking for spotlight
  const updateSpotlight = useCallback(() => {
    if (!journeyActive || currentStep < 0) return

    const el = stepRefs[currentStep].current
    if (el) {
      const rect = el.getBoundingClientRect()
      const scrollX = window.scrollX
      const scrollY = window.scrollY
      
      const centerX = rect.left + rect.width / 2
      const isRight = centerX > window.innerWidth / 2
      
      setSpotlight({
        x: rect.left + scrollX + rect.width / 2,
        y: rect.top + scrollY + rect.height / 2,
        w: rect.width + 40,
        h: rect.height + 40,
        active: true,
        pos: isRight ? 'left' : 'right'
      })
    }
  }, [journeyActive, currentStep])

  // Handle focus and voice for journey steps
  useEffect(() => {
    if (journeyActive && currentStep >= 0 && currentStep < stepTexts.length) {
      const el = stepRefs[currentStep].current
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
        
        // Brief delay to allow scroll to settle before updating spotlight
        setTimeout(updateSpotlight, 100)
      }

      setIsSpeaking(true)
      playVoice(stepTexts[currentStep], language, () => {
        setIsSpeaking(false)
        // Auto-advance removed for P1 accessibility compliance
      })
    }
  }, [journeyActive, currentStep, updateSpotlight, language])

  // Flying Moon Effect
  useEffect(() => {
    if (journeyActive && currentStep === 1) {
      setShowFlyingMoon(true)
      const timer = setTimeout(() => setShowFlyingMoon(false), 5000)
      return () => clearTimeout(timer)
    } else {
      setShowFlyingMoon(false)
    }
  }, [journeyActive, currentStep])

  // Update spotlight on resize
  useEffect(() => {
    window.addEventListener('resize', updateSpotlight)
    return () => window.removeEventListener('resize', updateSpotlight)
  }, [updateSpotlight])

  useEffect(() => {
    return () => {
      stopVoice()
    }
  }, [])

  const getStepAttrs = (index) => {
    const isActive = journeyActive && currentStep === index
    return {
      className: `${styles.journeyStep} ${isActive ? styles.activeStep : ''}`,
      'aria-hidden': journeyActive && !isActive ? 'true' : 'false',
      tabIndex: journeyActive ? (isActive ? 0 : -1) : undefined
    }
  }
  const [phase, setPhase] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [sparkles, setSparkles] = useState([])
  
  // Audio state
  const lastAudioPhase = useRef(0)

  // Spring physics state
  const springRef = useRef({
    target: 0,
    current: 0,
    velocity: 0,
    lastTime: Date.now(),
    rafId: null
  })

  const [visualPhase, setVisualPhase] = useState(0)
  const [faceOffset, setFaceOffset] = useState(0)

  // 0 to 100 slider. 0 = New Moon, 50 = Full Moon, 100 = New Moon again.
  const getPhaseName = (p) => {
    const rounded = Math.round(p)
    if (rounded === 0 || rounded === 100) return language === 'en' ? 'New Moon' : 'Luna Nueva'
    if (rounded > 0 && rounded < 25) return language === 'en' ? 'Waxing Crescent' : 'Luna Creciente'
    if (rounded === 25) return language === 'en' ? 'First Quarter' : 'Cuarto Creciente'
    if (rounded > 25 && rounded < 50) return language === 'en' ? 'Waxing Gibbous' : 'Gibosa Creciente'
    if (rounded === 50) return language === 'en' ? 'Full Moon' : 'Luna Llena'
    if (rounded > 50 && rounded < 75) return language === 'en' ? 'Waning Gibbous' : 'Gibosa Menguante'
    if (rounded === 75) return language === 'en' ? 'Third Quarter' : 'Cuarto Menguante'
    if (rounded > 75 && rounded < 100) return language === 'en' ? 'Waning Crescent' : 'Luna Menguante'
    return ''
  }

  // Celebrate major phases
  const triggerSparkles = useCallback((p) => {
    const major = [0, 25, 50, 75, 100]
    if (major.includes(Math.round(p))) {
      spaceSFX.playPop()
      const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        angle: (i / 8) * Math.PI * 2,
        dist: 50 + Math.random() * 50
      }))
      setSparkles(s => [...s, ...newSparkles].slice(-24))
      setTimeout(() => {
        setSparkles(s => s.filter(spark => !newSparkles.find(n => n.id === spark.id)))
      }, 1000)
    }
  }, [])

  // Spring animation loop
  const startLoop = useCallback(() => {
    if (springRef.current.rafId) return
    
    springRef.current.lastTime = Date.now()
    
    const step = () => {
      const now = Date.now()
      const dt = (now - springRef.current.lastTime) / 1000
      springRef.current.lastTime = now

      if (dt > 0.1) {
        springRef.current.rafId = requestAnimationFrame(step)
        return
      }

      const springK = 180
      const damping = 12

      const fSpring = springK * (springRef.current.target - springRef.current.current)
      const fDamping = damping * springRef.current.velocity
      const accel = fSpring - fDamping

      springRef.current.velocity += accel * dt
      springRef.current.current += springRef.current.velocity * dt

      setVisualPhase(springRef.current.current)
      setFaceOffset(springRef.current.velocity * 0.05)

      // Check if settled
      const dist = Math.abs(springRef.current.target - springRef.current.current)
      const vel = Math.abs(springRef.current.velocity)
      
      if (dist < 0.001 && vel < 0.001) {
        springRef.current.current = springRef.current.target
        springRef.current.velocity = 0
        springRef.current.rafId = null
        return
      }

      springRef.current.rafId = requestAnimationFrame(step)
    }

    springRef.current.rafId = requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    startLoop()
    return () => {
      if (springRef.current.rafId) {
        cancelAnimationFrame(springRef.current.rafId)
        springRef.current.rafId = null
      }
    }
  }, [startLoop])

  const updatePhase = useCallback((newPhase) => {
    const wrapped = ((newPhase % 100) + 100) % 100
    
    // Play tick on phase change, but mute it during the Journey so it doesn't interrupt the voiceover
    if (!journeyActive && Math.abs(wrapped - lastAudioPhase.current) >= 1.5) {
      spaceSFX.playTick()
      lastAudioPhase.current = wrapped
    }

    setPhase(wrapped)
    springRef.current.target = newPhase 
    startLoop()

    // Check for major phase trigger
    if (Math.abs(springRef.current.target - Math.round(springRef.current.target)) < 0.1) {
      triggerSparkles(Math.round(wrapped))
    }
  }, [triggerSparkles, startLoop, journeyActive])

  // Auto-spin logic during journey step 2
  useEffect(() => {
    let intervalId;
    let timeoutId;

    if (journeyActive && currentStep === 2) {
      // Delay the spin by 6.5 seconds so it perfectly aligns with the narrator saying "I'll give it a spin for you now"
      timeoutId = setTimeout(() => {
        intervalId = setInterval(() => {
          updatePhase(springRef.current.target + 0.5)
        }, 50)
      }, 6500)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [journeyActive, currentStep, updatePhase])

  const handlePointerDown = (e) => {
    setIsDragging(true)
    e.target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    const movementX = e.movementX || 0
    // Sensitivity: 5px movement = 1% phase change
    const delta = movementX * 0.2
    updatePhase(springRef.current.target + delta)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    // Snap to nearest integer for target to settle cleanly
    springRef.current.target = Math.round(springRef.current.target)
  }

  const currentVisualPhase = ((visualPhase % 100) + 100) % 100

  return (
    <div className={`${styles.container} ${journeyActive ? styles.journeyMode : ''}`}>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {journeyActive && currentStep >= 0 ? `Step ${currentStep + 1} of ${stepTexts.length}: ${stepTexts[currentStep]}` : ''}
      </div>

      <button
        onClick={onBack}
        className={`${styles.backButton} ${journeyActive ? styles.backButtonFixed : ''}`}
        aria-label={t('blastBack')}
      >
        <span className={styles.backIcon} aria-hidden="true">🚀</span> {t('blastBack')}
      </button>

      {/* Overdrive Spotlight Mask */}
      {journeyActive && (
        <>
          <div 
            className={styles.spotlightOverlay}
            style={{
              '--x': `${spotlight.x}px`,
              '--y': `${spotlight.y}px`,
              '--w': `${spotlight.w}px`,
              '--h': `${spotlight.h}px`,
              opacity: spotlight.active ? 1 : 0
            }}
          >
            <div className={styles.spotlightHole}></div>
          </div>
          <div className={styles.warpFlash}></div>
        </>
      )}

      {/* Flying Moon Interjection Animation */}
      {showFlyingMoon && (
        <div className={styles.flyingMoonContainer} aria-hidden="true">
          <div className={styles.flyingMoon}>🌕</div>
          <div className={styles.shootingStar}></div>
        </div>
      )}

      <div ref={heroHeaderRef} {...getStepAttrs(0)}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{t('moonTitle')}</h1>
        </div>
        <div className={styles.introBox}>
          <h2 className={styles.subTitle}>{t('moonSub')}</h2>
          <p className={styles.introText}>
            {t('moonIntro')}
          </p>
        </div>
      </div>

      <section ref={moonExplorerRef} {...getStepAttrs(2)}>
        <div className={styles.wobblyCard}>
          <div className={styles.moonExplorer}>
            <div className={styles.moonGraphicContainer}>
              <div 
                className={`${styles.moonGraphic} ${isDragging ? styles.grabbing : ''}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                tabIndex={journeyActive && currentStep !== 1 ? -1 : 0}
                role="slider"
                aria-label="Moon Phase Explorer"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(currentVisualPhase)}
                aria-valuetext={getPhaseName(currentVisualPhase)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') updatePhase(springRef.current.target + 2);
                  if (e.key === 'ArrowLeft') updatePhase(springRef.current.target - 2);
                  if (e.key === 'Home') updatePhase(0);
                  if (e.key === 'End') updatePhase(50);
                }}
              >
                <div
                  className={styles.moonBase}
                  style={{
                    '--phase': currentVisualPhase
                  }}
                >
                  <div 
                    className={styles.moonFace}
                    style={{
                      transform: `translateX(${faceOffset}px) rotate(${faceOffset * 0.5}deg)`
                    }}
                  >
                    {currentVisualPhase < 5 || currentVisualPhase > 95 ? '◡‿◡' : currentVisualPhase > 45 && currentVisualPhase < 55 ? '•◡•' : '•‿•'}
                  </div>
                </div>
                <div className={styles.moonGlow}></div>

                {sparkles.map(s => (
                  <div 
                    key={s.id}
                    className={styles.sparkle}
                    style={{
                      '--angle': `${s.angle}rad`,
                      '--dist': `${s.dist}px`
                    }}
                  />
                ))}
              </div>
              <div className={styles.dragIndicator}>
                <span className={styles.arrowLeft}>←</span>
                <span>{t('grabSpin')}</span>
                <span className={styles.arrowRight}>→</span>
              </div>
            </div>

            <div className={styles.controls}>
              <h2 className={styles.phaseLabel} id="moon-phase-name">{getPhaseName(currentVisualPhase)}</h2>

              <div className={styles.phasePresets}>
                {[0, 25, 50, 75].map((p) => (
                  <button
                    key={p}
                    className={`${styles.presetButton} ${Math.round(currentVisualPhase) === p ? styles.activePreset : ''}`}
                    onClick={() => updatePhase(p)}
                    title={getPhaseName(p)}
                    aria-label={`Jump to ${getPhaseName(p)}`}
                    style={{ '--p': p }}
                    tabIndex={journeyActive && currentStep !== 1 ? -1 : 0}
                  >
                    <div className={styles.presetMoon}></div>
                  </button>
                ))}
              </div>

              <p className={styles.phaseHint}>Spin the Moon with your finger! <span>(It's like a cosmic puppet!)</span></p>
            </div>
          </div>
        </div>
      </section>
      <div className={styles.factsGrid}>
        <div ref={factGlowRef} {...getStepAttrs(3)}>
          <img src="/moon_glow.webp" alt="A diagram showing that the Moon doesn't make its own light—it reflects the Sun's light like a giant space mirror!" className={`${styles.cardImage} ${journeyActive && currentStep === 3 ? styles.glowImage : ''}`} loading="lazy" />
          <h3>{t('moonGlowTitle')}</h3>
          <p>{t('moonGlowDesc')}</p>
        </div>

        <div ref={factDarkSideRef} {...getStepAttrs(4)}>
          <img src="/moon_dark_side.webp" alt="A view of the Moon from space showing that both sides get sunlight at different times, even though we only see one side from Earth." className={styles.cardImage} loading="lazy" />
          <h3>{t('moonDarkSideTitle')}</h3>
          <p>{t('moonDarkSideDesc')}</p>
        </div>

        <div ref={factFormationRef} {...getStepAttrs(5)}>
          <img src="/moon_formation.webp" alt="A massive space rock the size of Mars crashing into the young Earth, sending chunks into space to form our Moon." className={styles.cardImage} loading="lazy" />
          <h3>{t('moonFormationTitle')}</h3>
          <p>{t('moonFormationDesc')}</p>
        </div>
      </div>

      <section ref={studyMoonRef} {...getStepAttrs(6)}>
        <div className={`${styles.wobblyCard} ${styles.scrapbookCard}`}>
          <div className={styles.scrapbookDecoration} aria-hidden="true">📎</div>
          <div className={styles.sideBySide}>
            <div className={styles.imageWrapper}>
              <img src="/moon_study.webp" alt="Astronauts working on the Moon's dusty surface next to their lunar lander spacecraft." className={styles.largeCardImage} loading="lazy" />
              <div className={styles.sticker}>TOP SECRET</div>
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.sectionTitle}>{t('moonStudyTitle')}</h2>
              <p className={styles.sectionText}>{t('moonStudyDesc1')}</p>
              <p className={styles.sectionText}>{t('moonStudyDesc2')}</p>
            </div>
          </div>
          <div className={styles.cosmicDoodle} aria-hidden="true">✨</div>
        </div>
      </section>

      <section ref={whatWeKnowRef} {...getStepAttrs(7)}>
        <div className={`${styles.wobblyCard} ${styles.hollowCard} ${styles.rotateNegative1}`}>
          <div className={`${styles.sideBySide} ${styles.reverse}`}>
            <div className={styles.imageWrapper}>
              <img src="/moon_craters.webp" alt="A close-up of the Moon showing deep craters from space rock impacts and dark lava plains called maria." className={styles.largeCardImage} loading="lazy" />
            </div>
            <div className={styles.cardContent}>
              <h2 className={`${styles.sectionTitle} ${styles.darkTitle}`}>{t('moonKnowledgeTitle')}</h2>
              <p className={styles.sectionText}>{t('moonKnowledgeDesc1')}</p>
              <p className={styles.sectionText}>{t('moonKnowledgeDesc2')}</p>
            </div>
          </div>
          <div className={`${styles.cosmicDoodle} ${styles.bottomRight}`} aria-hidden="true">🔭</div>
        </div>
      </section>

      {!journeyActive && createPortal(
        <div className={`${styles.journeyControls} ${styles.journeyControlsRight}`}>
          <button 
            className={styles.journeyButton}
            onClick={toggleJourney}
            aria-label={t('startJourney')}
          >
            <span className={styles.journeyIcon} aria-hidden="true">✨</span>
            {t('startJourney')}
          </button>
        </div>,
        document.body
      )}

      {journeyActive && createPortal(
        <div className={`${styles.journeyControls} ${styles.journeyControlsActive} ${spotlight.pos === 'left' ? styles.journeyControlsLeft : styles.journeyControlsRight}`}>
          <div className={styles.cosmicNarrator}>
            <div className={`${styles.speechBubble} ${isSpeaking ? styles.pulse : ''} ${spotlight.pos === 'left' ? styles.bubbleLeft : styles.bubbleRight}`}>
              <p className={styles.speechText}>{stepTexts[currentStep]}</p>
              <div className={styles.speechTail}></div>
              
              <div className={styles.stepActions}>
                <button 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                  className={styles.stepButton}
                  aria-label="Previous Discovery"
                >
                  ←
                </button>
                <span className={styles.stepCount}>{currentStep + 1} / {stepTexts.length}</span>
                <button 
                  onClick={nextStep}
                  className={`${styles.stepButton} ${styles.primaryStep}`}
                  aria-label={currentStep === stepTexts.length - 1 ? t('finish') : t('next')}
                >
                  {currentStep === stepTexts.length - 1 ? t('finish') : t('next')}
                </button>
              </div>
            </div>
            <div className={styles.narratorIcon}>👨‍🚀</div>
          </div>

          <button 
            className={`${styles.journeyButton} ${styles.active}`}
            onClick={toggleJourney}
            aria-label={t('stopJourney')}
          >
            <span className={styles.journeyIcon} aria-hidden="true">🛑</span>
            {t('stopJourney')}
          </button>
        </div>,
        document.body
      )}

    </div>
  )
}
