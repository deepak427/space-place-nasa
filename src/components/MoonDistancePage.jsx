import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './MoonDistancePage.module.css'
import { spaceSFX } from '../utils/audio'
import { playVoice, stopVoice } from '../utils/voice'
import { useLanguage } from '../context/LanguageContext'

export default function MoonDistancePage({ onBack }) {
  const { t } = useLanguage()
  const [journeyActive, setJourneyActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, w: 0, h: 0, active: false, pos: 'right' })
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const heroHeaderRef = useRef(null)
  const distanceRef = useRef(null)
  const thirtyEarthsRef = useRef(null)
  const orbitRef = useRef(null)
  const minMaxRef = useRef(null)
  const scaleExplorerRef = useRef(null)
  const activityRef = useRef(null)

  const stepRefs = [heroHeaderRef, distanceRef, thirtyEarthsRef, orbitRef, minMaxRef, scaleExplorerRef, activityRef]
  const stepTexts = [
    t('distStep0'),
    t('distStep1'),
    t('distStep2'),
    t('distStep3'),
    t('distStep4'),
    t('distStep5'),
    t('distStep6')
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
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
        setTimeout(updateSpotlight, 100)
      }

      setIsSpeaking(true)
      playVoice(stepTexts[currentStep], () => {
        setIsSpeaking(false)
      })
    }
  }, [journeyActive, currentStep, updateSpotlight])

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

  const [distanceScale, setDistanceScale] = useState(10) // 0 to 100
  const [isDragging, setIsDragging] = useState(false)
  const [tension, setTension] = useState(0)
  
  const dragStartX = useRef(0)
  const dragStartScale = useRef(10)
  const scaleVisualRef = useRef(null)
  
  // Physics engine refs
  const physicsRef = useRef({ val: 10, vel: 0, target: 10, animId: null })

  const updatePhysics = useCallback(() => {
    // If currently dragging, don't run physics loop
    // But we use a ref check to avoid stale closures if needed
    
    let { val, vel, target } = physicsRef.current
    
    // Spring physics constants
    const stiffness = 0.15
    const damping = 0.65
    
    const force = (target - val) * stiffness
    vel = (vel + force) * damping
    val += vel
    
    physicsRef.current.val = val
    physicsRef.current.vel = vel
    
    setDistanceScale(val)
    
    if (Math.abs(vel) > 0.05 || Math.abs(target - val) > 0.05) {
      physicsRef.current.animId = requestAnimationFrame(updatePhysics)
    } else {
      setDistanceScale(target) // Snap to exact target when resting
      physicsRef.current.vel = 0
    }
  }, [])

  const handlePointerDown = (e) => {
    setIsDragging(true)
    cancelAnimationFrame(physicsRef.current.animId)
    physicsRef.current.val = distanceScale
    physicsRef.current.vel = 0
    dragStartX.current = e.clientX
    dragStartScale.current = distanceScale
    e.target.setPointerCapture(e.pointerId)
    spaceSFX.playPop()
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartX.current
    const visualWidth = scaleVisualRef.current?.offsetWidth || 400
    const maxPixels = visualWidth * 0.8
    const deltaScale = (deltaX / maxPixels) * 100
    
    let nextScale = Math.max(5, Math.min(100, dragStartScale.current + deltaScale))
    
    if (Math.abs(nextScale - distanceScale) > 1) {
       if (Math.floor(nextScale) !== Math.floor(distanceScale) && nextScale < 95) {
           spaceSFX.playTick()
       }
    }
    
    physicsRef.current.val = nextScale
    physicsRef.current.target = nextScale
    setDistanceScale(nextScale)
    
    // Calculate tension for visual effects (peaks at 70, drops to 0 at 80+)
    let currentTension = 0
    if (nextScale > 20 && nextScale < 80) {
      currentTension = (nextScale - 20) / 60
    }
    setTension(currentTension)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    setTension(0)
    
    if (distanceScale < 80) {
      // Snap back
      physicsRef.current.target = 10
      spaceSFX.playWhoosh()
      physicsRef.current.animId = requestAnimationFrame(updatePhysics)
    } else {
      // Snap to goal
      physicsRef.current.target = 100
      spaceSFX.playPop()
      physicsRef.current.animId = requestAnimationFrame(updatePhysics)
    }
  }

  // Generate some random stars for the background
  const [stars] = useState(() => 
    Array.from({length: 20}).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1
    }))
  )

  return (
    <div className={`${styles.container} ${journeyActive ? styles.journeyMode : ''}`}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="wiggle" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
      </svg>
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
          className={`${styles.spotlightOverlay}`}
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
          <h1 className={styles.title}>{t('distTitle')}</h1>
        </div>
        <div className={styles.introBox}>
          <h2 className={styles.subTitle}>{t('distSub')}</h2>
          <p className={styles.introText}>
            {t('distIntro')}
          </p>
        </div>
      </div>
 
      <div className={styles.factsGrid}>
        <div ref={distanceRef} {...getStepAttrs(1)} className={`${styles.factCard} ${styles.rotate1}`}>
          <div className={styles.bigNumber}>238,855</div>
          <h3>{t('distMilesTitle')}</h3>
          <p>{t('distMilesDesc')}</p>
        </div>
 
        <div ref={thirtyEarthsRef} {...getStepAttrs(2)} className={`${styles.factCard} ${styles.rotate2}`}>
          <img src="/moon_distance_30_earths.png" alt="30 Earths lined up between Earth and Moon" className={styles.cardImage} loading="lazy" />
          <h3>{t('distThirtyTitle')}</h3>
          <p>{t('distThirtyDesc')}</p>
        </div>
 
        <div ref={orbitRef} {...getStepAttrs(3)} className={`${styles.factCard} ${styles.rotateNegative1}`}>
          <img src="/moon_distance_orbit.png" alt="Elliptical orbit of the Moon" className={styles.cardImage} loading="lazy" />
          <h3>{t('distOrbitTitle')}</h3>
          <p>{t('distOrbitDesc')}</p>
        </div>
      </div>
 
      <div ref={minMaxRef} {...getStepAttrs(4)} className={styles.wobblyCard}>
        <h2 className={styles.sectionTitle}>{t('distChangesTitle')}</h2>
        <div className={styles.minMaxGrid}>
          <div className={styles.minMaxBox}>
            <span className={styles.minMaxLabel}>{t('distClosest')}</span>
            <span className={styles.minMaxValue}>225,623 miles</span>
          </div>
          <div className={styles.minMaxBox}>
            <span className={styles.minMaxLabel}>{t('distFarthest')}</span>
            <span className={styles.minMaxValue}>252,088 miles</span>
          </div>
        </div>
      </div>
 
      <section ref={scaleExplorerRef} {...getStepAttrs(5)}>
        <div className={styles.wobblyCard}>
          <h2 className={styles.sectionTitle}>{t('distScaleTitle')}</h2>
          <div className={styles.scaleExplorer}>
            <div 
              className={`${styles.scaleVisual} ${distanceScale >= 80 ? styles.goalReached : ''}`} 
              ref={scaleVisualRef}
              style={{
                '--tension': tension,
                '--scale': distanceScale / 100
              }}
            >
              {/* Dynamic space background */}
              <div className={styles.spaceBackground}>
                {stars.map((star, i) => (
                  <div key={i} className={styles.bgStar} style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: star.opacity,
                    transform: `translateX(${distanceScale * -0.2}px)`
                  }} />
                ))}
              </div>
 
              <div className={`${styles.earthFixed} ${tension > 0.5 ? styles.earthStraining : ''}`}>
                {tension > 0.7 ? '🌎💦' : '🌍'}
              </div>
              
              <svg className={styles.rubberBand} preserveAspectRatio="none">
                <path 
                  className={styles.rubberPath}
                  d={`M 40 50 Q ${(distanceScale * 4 + 80) / 2} ${50 + (isDragging ? tension * 30 : 0)} ${distanceScale * 4 + 80} 50`}
                  filter="url(#wiggle)"
                />
              </svg>
 
              <div 
                className={`${styles.moonMoving} ${isDragging ? styles.grabbing : ''}`}
                style={{ 
                  left: `calc(20px + ${distanceScale * 0.8}%)`, // Make responsive to container width
                  transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.15) rotate(5deg)' : 'scale(1)'}`
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div className={`${styles.moonWrapper} ${isDragging ? styles.moonGlowActive : ''}`}>
                  {distanceScale >= 80 ? '😎' : (tension > 0.5 ? '😬' : '🌕')}
                  {isDragging && <div className={styles.speedLinesWrap}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={styles.speedLine} style={{ '--i': i, '--t': tension }}></div>
                    ))}
                  </div>}
                </div>
              </div>
            </div>
            
            <div className={styles.scaleControls}>
              <p className={styles.pullHint}>
                {isDragging ? t('distKeepPulling') : t('distGripMoon')}
              </p>
              <p className={styles.scaleText}>
                {distanceScale < 20 ? t('distTooClose') : 
                 distanceScale < 80 ? t('distGettingThere') : 
                 t('distRealScale')}
              </p>
            </div>
          </div>
        </div>
      </section>
 
      <section ref={activityRef} {...getStepAttrs(6)}>
        <div className={`${styles.wobblyCard} ${styles.scrapbookCard}`}>
          <div className={styles.scrapbookDecoration} aria-hidden="true">📎</div>
          <div className={styles.sideBySide}>
            <div className={styles.imageWrapper}>
              <img src="/moon_distance_activity.png" alt="Basketball Earth and Tennis Ball Moon activity" className={styles.largeCardImage} loading="lazy" />
              <div className={styles.sticker}>TRY THIS!</div>
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.sectionTitle}>{t('distHomeTitle')}</h2>
              <p className={styles.sectionText}>{t('distHomeDesc1')}</p>
              <p className={styles.sectionText}>{t('distHomeDesc2')}</p>
              <div className={styles.cosmicDoodle} aria-hidden="true">🔭</div>
            </div>
          </div>
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
