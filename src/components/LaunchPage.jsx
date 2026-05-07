import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './LaunchPage.module.css'
import { spaceSFX } from '../utils/audio'
import { playVoice, stopVoice } from '../utils/voice'
import { useLanguage } from '../context/LanguageContext'

export default function LaunchPage({ onBack }) {
  const { t } = useLanguage()
  const [journeyActive, setJourneyActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, w: 0, h: 0, active: false, pos: 'right' })
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const heroHeaderRef = useRef(null)
  const physicsRef = useRef(null)
  const thrustRef = useRef(null)
  const speedRef = useRef(null)
  const orbitRef = useRef(null)
  const planetsRef = useRef(null)
  const videoRef = useRef(null)

  const stepRefs = [heroHeaderRef, physicsRef, thrustRef, speedRef, orbitRef, planetsRef, videoRef]
  const stepTexts = [
    t('launchStep0'),
    t('launchStep1'),
    t('launchStep2'),
    t('launchStep3'),
    t('launchStep4'),
    t('launchStep5'),
    t('launchStep6')
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
          <h1 className={styles.title}>{t('launchTitle')}</h1>
        </div>
        <div className={styles.introBox}>
          <h2 className={styles.subTitle}>{t('launchSub')}</h2>
          <p className={styles.introText}>
            {t('launchIntro')}
          </p>
        </div>
      </div>
 
      <div className={styles.factsGrid}>
        <div ref={physicsRef} {...getStepAttrs(1)} className={`${styles.factCard} ${styles.rotate1}`}>
          <img src="/launch_rocket_physics.webp" alt="Rocket Action and Reaction" className={styles.cardImage} loading="lazy" />
          <h3>{t('launchPhysicsTitle')}</h3>
          <p>{t('launchPhysicsDesc')}</p>
        </div>
 
        <div ref={thrustRef} {...getStepAttrs(2)} className={`${styles.factCard} ${styles.rotate2}`}>
          <img src="/launch_thrust_gravity.webp" alt="Thrust vs Gravity" className={styles.cardImage} loading="lazy" />
          <h3>{t('launchTugTitle')}</h3>
          <p>{t('launchTugDesc')}</p>
        </div>
 
        <div ref={speedRef} {...getStepAttrs(3)} className={`${styles.factCard} ${styles.rotateNegative1}`}>
          <div className={styles.bigNumber}>17,800</div>
          <h3>{t('launchSpeedTitle')}</h3>
          <p>{t('launchSpeedDesc')}</p>
        </div>
      </div>
 
      <div ref={orbitRef} {...getStepAttrs(4)} className={styles.wobblyCard}>
        <div className={styles.sideBySide}>
          <div className={styles.cardContent}>
            <h2 className={styles.sectionTitle}>{t('launchOrbitTitle')}</h2>
            <p className={styles.sectionText}>{t('launchOrbitDesc1')}</p>
            <p className={styles.sectionText}>{t('launchOrbitDesc2')}</p>
          </div>
          <div className={styles.imageWrapper}>
            <img src="/launch_orbit_balance.webp" alt="Orbit Balance" className={styles.largeCardImage} loading="lazy" />
          </div>
        </div>
      </div>
 
      <div ref={planetsRef} {...getStepAttrs(5)} className={`${styles.wobblyCard} ${styles.scrapbookCard}`}>
        <div className={styles.scrapbookDecoration} aria-hidden="true">📍</div>
        <div className={styles.sideBySide}>
          <div className={styles.imageWrapper}>
            <img src="/launch_mars_window.webp" alt="Mars Launch Window" className={styles.largeCardImage} loading="lazy" />
            <div className={styles.sticker}>PLANET HOP!</div>
          </div>
          <div className={styles.cardContent}>
            <h2 className={styles.sectionTitle}>{t('launchPlanetTitle')}</h2>
            <p className={styles.sectionText}>{t('launchPlanetDesc1')}</p>
            <p className={styles.sectionText}>{t('launchPlanetDesc2')}</p>
          </div>
        </div>
      </div>
 
      <section ref={videoRef} {...getStepAttrs(6)} className={styles.videoSection}>
        <div className={styles.wobblyCard}>
          <h2 className={styles.sectionTitle}>{t('launchActionTitle')}</h2>
          <div className={styles.videoContainer}>
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/gYJsMBabjVY" 
              title="How Do We Launch Things Into Space? | NASA Space Place" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
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
