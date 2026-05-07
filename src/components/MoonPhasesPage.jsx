import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './MoonPhasesPage.module.css'
import { spaceSFX } from '../utils/audio'
import { playVoice, stopVoice } from '../utils/voice'
import { useLanguage } from '../context/LanguageContext'

export default function MoonPhasesPage({ onBack }) {
  const { t, language } = useLanguage()
  const [journeyActive, setJourneyActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, w: 0, h: 0, active: false, pos: 'right' })
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const heroHeaderRef = useRef(null)
  const reflectionRef = useRef(null)
  const halfLitRef = useRef(null)
  const orbitViewRef = useRef(null)
  const moonExplorerRef = useRef(null)
  const eightPhasesRef = useRef(null)
  const cycleRef = useRef(null)

  const stepRefs = [heroHeaderRef, reflectionRef, halfLitRef, orbitViewRef, moonExplorerRef, eightPhasesRef, cycleRef]
  const stepTexts = [
    t('phasesStep0'),
    t('phasesStep1'),
    t('phasesStep2'),
    t('phasesStep3'),
    t('phasesStep4'),
    t('phasesStep5'),
    t('phasesStep6')
  ]

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

  useEffect(() => {
    if (journeyActive && currentStep >= 0 && currentStep < stepTexts.length) {
      const el = stepRefs[currentStep].current
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el.focus()
        setTimeout(updateSpotlight, 100)
      }

      setIsSpeaking(true)
      playVoice(stepTexts[currentStep], language, () => {
        setIsSpeaking(false)
      })
    }
  }, [journeyActive, currentStep, updateSpotlight, language])

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
  const lastAudioPhase = useRef(0)

  const springRef = useRef({
    target: 0,
    current: 0,
    velocity: 0,
    lastTime: Date.now(),
    rafId: null
  })

  const [visualPhase, setVisualPhase] = useState(0)
  const [faceOffset, setFaceOffset] = useState(0)

  const getPhaseName = (p) => {
    const rounded = Math.round(p)
    if (rounded === 0 || rounded === 100) return t('newMoon')
    if (rounded > 0 && rounded < 25) return t('waxingCrescent')
    if (rounded === 25) return t('firstQuarter')
    if (rounded > 25 && rounded < 50) return t('waxingGibbous')
    if (rounded === 50) return t('fullMoon')
    if (rounded > 50 && rounded < 75) return t('waningGibbous')
    if (rounded === 75) return t('thirdQuarter')
    if (rounded > 75 && rounded < 100) return t('waningCrescent')
    return ''
  }

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
    if (!journeyActive && Math.abs(wrapped - lastAudioPhase.current) >= 1.5) {
      spaceSFX.playTick()
      lastAudioPhase.current = wrapped
    }
    setPhase(wrapped)
    springRef.current.target = newPhase 
    startLoop()
    if (Math.abs(springRef.current.target - Math.round(springRef.current.target)) < 0.1) {
      triggerSparkles(Math.round(wrapped))
    }
  }, [triggerSparkles, startLoop, journeyActive])

  // Auto-spin logic during journey step 4 (Moon Explorer)
  useEffect(() => {
    let intervalId;
    let timeoutId;
    if (journeyActive && currentStep === 4) {
      timeoutId = setTimeout(() => {
        intervalId = setInterval(() => {
          updatePhase(springRef.current.target + 0.5)
        }, 50)
      }, 2000)
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
    const delta = movementX * 0.2
    updatePhase(springRef.current.target + delta)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
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

      {journeyActive && (
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
      )}

      <div ref={heroHeaderRef} {...getStepAttrs(0)}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{t('phasesTitle')}</h1>
        </div>
        <div className={styles.introBox}>
          <h2 className={styles.subTitle}>{t('phasesSub')}</h2>
          <p className={styles.introText}>
            {t('phasesIntro')}
          </p>
        </div>
      </div>
 
      <div className={styles.factsGrid}>
        <div ref={reflectionRef} {...getStepAttrs(1)} className={`${styles.factCard} ${styles.rotate1}`}>
          <img src="/moon_reflection.webp" alt="Friendly Sun reflecting light off the Moon mirror" className={styles.cardImage} loading="lazy" />
          <h3>{t('phasesMirrorTitle')}</h3>
          <p>{t('phasesMirrorDesc')}</p>
        </div>
 
        <div ref={halfLitRef} {...getStepAttrs(2)} className={`${styles.factCard} ${styles.rotate2}`}>
          <img src="/moon_half_lit.webp" alt="Moon with one side lit and one side dark" className={styles.cardImage} loading="lazy" />
          <h3>{t('phasesHalfTitle')}</h3>
          <p>{t('phasesHalfDesc')}</p>
        </div>
 
        <div ref={orbitViewRef} {...getStepAttrs(3)} className={`${styles.factCard} ${styles.rotateNegative1}`}>
          <img src="/moon_phases_cycle.webp" alt="Moon orbiting Earth showing different views" className={styles.cardImage} loading="lazy" />
          <h3>{t('phasesViewTitle')}</h3>
          <p>{t('phasesViewDesc')}</p>
        </div>
      </div>
 
      <section ref={moonExplorerRef} {...getStepAttrs(4)}>
        <div className={styles.wobblyCard}>
          <div className={styles.moonExplorer}>
            <div className={styles.moonGraphicContainer}>
              <div 
                className={`${styles.moonGraphic} ${isDragging ? styles.grabbing : ''}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                tabIndex={0}
                role="slider"
                aria-label="Moon Phase Explorer"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(currentVisualPhase)}
                aria-valuetext={getPhaseName(currentVisualPhase)}
              >
                <div className={styles.moonBase} style={{ '--phase': currentVisualPhase }}>
                  <div className={styles.moonFace} style={{ transform: `translateX(${faceOffset}px) rotate(${faceOffset * 0.5}deg)` }}>
                    {currentVisualPhase < 5 || currentVisualPhase > 95 ? '◡‿◡' : currentVisualPhase > 45 && currentVisualPhase < 55 ? '•◡•' : '•‿•'}
                  </div>
                </div>
                <div className={styles.moonGlow}></div>
                {sparkles.map(s => (
                  <div key={s.id} className={styles.sparkle} style={{ '--angle': `${s.angle}rad`, '--dist': `${s.dist}px` }} />
                ))}
              </div>
              <div className={styles.dragIndicator}>
                <span className={styles.arrowLeft}>←</span>
                <span>{t('spinPhases')}</span>
                <span className={styles.arrowRight}>→</span>
              </div>
            </div>
 
            <div className={styles.controls}>
              <h2 className={styles.phaseLabel}>{getPhaseName(currentVisualPhase)}</h2>
              <div className={styles.phasePresets}>
                {[0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5].map((p) => (
                  <button
                    key={p}
                    className={`${styles.presetButton} ${Math.round(currentVisualPhase) === Math.round(p) ? styles.activePreset : ''}`}
                    onClick={() => updatePhase(p)}
                    title={getPhaseName(p)}
                    style={{ '--p': p }}
                  >
                    <div className={styles.presetMoon}></div>
                  </button>
                ))}
              </div>
              <p className={styles.phaseHint}>{t('howMuchMoon')} <span>{t('tryDragging')}</span></p>
            </div>
          </div>
        </div>
      </section>
 
      <section ref={eightPhasesRef} {...getStepAttrs(5)}>
        <div className={`${styles.wobblyCard} ${styles.scrapbookCard}`}>
          <div className={styles.scrapbookDecoration} aria-hidden="true">📎</div>
          <div className={styles.sideBySide}>
            <div className={styles.imageWrapper}>
              <img src="/moon_eight_phases_grid.webp" alt="The eight phases of the moon" className={styles.largeCardImage} loading="lazy" />
              <div className={styles.sticker}>THE BIG 8</div>
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.sectionTitle}>{t('phasesEightTitle')}</h2>
              <ul className={styles.phaseList}>
                <li>{t('phasesListNew')}</li>
                <li>{t('phasesListWaxCres')}</li>
                <li>{t('phasesListFirst')}</li>
                <li>{t('phasesListWaxGib')}</li>
                <li>{t('phasesListFull')}</li>
                <li>{t('phasesListWanGib')}</li>
                <li>{t('phasesListThird')}</li>
                <li>{t('phasesListWanCres')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
 
      <section ref={cycleRef} {...getStepAttrs(6)}>
        <div className={`${styles.wobblyCard} ${styles.hollowCard}`}>
          <h2 className={styles.sectionTitle}>{t('phasesCycleTitle')}</h2>
          <p className={styles.sectionText}>
            {t('phasesCycleDesc1')}
          </p>
          <p className={styles.sectionText}>
            {t('phasesCycleDesc2')}
          </p>
          <div className={styles.cosmicDoodle} aria-hidden="true">✨</div>
        </div>
      </section>

      {!journeyActive && createPortal(
        <div className={`${styles.journeyControls} ${styles.journeyControlsRight}`}>
          <button className={styles.journeyButton} onClick={toggleJourney}>
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
                <button onClick={prevStep} disabled={currentStep === 0} className={styles.stepButton}>←</button>
                <span className={styles.stepCount}>{currentStep + 1} / {stepTexts.length}</span>
                <button onClick={nextStep} className={`${styles.stepButton} ${styles.primaryStep}`}>
                  {currentStep === stepTexts.length - 1 ? t('finish') : t('next')}
                </button>
              </div>
            </div>
            <div className={styles.narratorIcon}>👨‍🚀</div>
          </div>
          <button className={`${styles.journeyButton} ${styles.active}`} onClick={toggleJourney}>
            <span className={styles.journeyIcon} aria-hidden="true">🛑</span>
            {t('stopJourney')}
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}
