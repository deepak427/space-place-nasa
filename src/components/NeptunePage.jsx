import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './NeptunePage.module.css'
import { spaceSFX } from '../utils/audio'
import { playVoice, stopVoice } from '../utils/voice'
import { useLanguage } from '../context/LanguageContext'

export default function NeptunePage({ onBack }) {
  const { t } = useLanguage()
  const [journeyActive, setJourneyActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, w: 0, h: 0, active: false, pos: 'right' })
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const heroHeaderRef = useRef(null)
  const structureRef = useRef(null)
  const colorRef = useRef(null)
  const timeRef = useRef(null)
  const windRef = useRef(null)
  const ringsRef = useRef(null)
  const historyRef = useRef(null)

  const stepRefs = [heroHeaderRef, structureRef, colorRef, timeRef, windRef, ringsRef, historyRef]
  const stepTexts = [
    t('neptuneStep0'),
    t('neptuneStep1'),
    t('neptuneStep2'),
    t('neptuneStep3'),
    t('neptuneStep4'),
    t('neptuneStep5'),
    t('neptuneStep6')
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
          <h1 className={styles.title}>{t('neptuneTitle')}</h1>
        </div>
        <div className={styles.introBox}>
          <h2 className={styles.subTitle}>{t('neptuneSub')}</h2>
          <p className={styles.introText}>
            {t('neptuneIntro')}
          </p>
        </div>
      </div>
 
      <div className={styles.factsGrid}>
        <div ref={structureRef} {...getStepAttrs(1)} className={`${styles.factCard} ${styles.rotate1}`}>
          <img src="/neptune_ice_giant.png" alt="Inside Neptune" className={styles.cardImage} loading="lazy" />
          <h3>{t('neptuneIceTitle')}</h3>
          <p>{t('neptuneIceDesc')}</p>
        </div>
 
        <div ref={colorRef} {...getStepAttrs(2)} className={`${styles.factCard} ${styles.rotate2}`}>
          <img src="/neptune_blue_methane.png" alt="Methane Blue" className={styles.cardImage} loading="lazy" />
          <h3>{t('neptuneAtmosphereTitle')}</h3>
          <p>{t('neptuneAtmosphereDesc')}</p>
        </div>
 
        <div ref={timeRef} {...getStepAttrs(3)} className={`${styles.factCard} ${styles.rotateNegative1}`}>
          <img src="/neptune_orbit_years.png" alt="Time on Neptune" className={styles.cardImage} loading="lazy" />
          <h3>{t('neptuneDayTitle')}</h3>
          <p>{t('neptuneDayDesc1')} {t('neptuneDayDesc2')}</p>
        </div>
      </div>
 
      <div ref={windRef} {...getStepAttrs(4)} className={styles.wobblyCard}>
        <div className={styles.sideBySide}>
          <div className={styles.cardContent}>
            <h2 className={styles.sectionTitle}>{t('neptuneWindTitle')}</h2>
            <p className={styles.sectionText}>{t('neptuneWindDesc')}</p>
          </div>
          <div className={styles.imageWrapper}>
            <img src="/neptune_windy_clouds.png" alt="Windy Neptune" className={styles.largeCardImage} loading="lazy" />
          </div>
        </div>
      </div>
 
      <div ref={ringsRef} {...getStepAttrs(5)} className={`${styles.wobblyCard} ${styles.scrapbookCard}`}>
        <div className={styles.scrapbookDecoration} aria-hidden="true">💍</div>
        <div className={styles.cardContent}>
          <h2 className={styles.sectionTitle}>{t('neptuneRingsTitle')}</h2>
          <p className={styles.sectionText}>{t('neptuneRingsDesc')}</p>
          <div className={styles.cosmicDoodle} aria-hidden="true">🪐</div>
        </div>
      </div>
 
      <div ref={historyRef} {...getStepAttrs(6)} className={styles.wobblyCard}>
        <h2 className={styles.sectionTitle}>{t('neptuneVoyagerTitle')}</h2>
        <div className={styles.sideBySide}>
          <div className={styles.cardContent}>
            <p className={styles.sectionText}>{t('neptuneVoyagerDesc')}</p>
          </div>
          <div className={styles.sticker}>VOYAGER 2</div>
        </div>
      </div>

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
