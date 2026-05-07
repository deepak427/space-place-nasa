import { useState, useEffect, useRef } from 'react'
import { spaceSFX } from '../utils/audio'
import onboardingRocket from '../assets/onboarding-rocket.webp'
import onboardingCloud from '../assets/onboarding-cloud.webp'
import styles from './Onboarding.module.css'
import { useLanguage } from '../context/LanguageContext'

export default function Onboarding() {
  const { t } = useLanguage()
  const [stage, setStage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nasa_onboarding_complete') ? 'complete' : 'countdown';
    }
    return 'countdown';
  });
  const [count, setCount] = useState(3);
  const overlayRef = useRef(null);

  const handleSkip = () => {
    spaceSFX.playPop();
    localStorage.setItem('nasa_onboarding_complete', 'true');
    setStage('complete');
  };

  useEffect(() => {
    if (stage === 'complete') return;

    // Focus the overlay when it mounts to prevent tabbing into underlying content
    if (overlayRef.current) {
      overlayRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        // Simple focus trap: if there's only one button, keep focus on it
        const focusableElements = overlayRef.current.querySelectorAll('button');
        if (focusableElements.length === 1) {
          e.preventDefault();
          focusableElements[0].focus();
        }
      }
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'countdown') return;

    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
        spaceSFX.playTick();
      }, 800);
      return () => clearTimeout(timer);
    } else if (stage === 'countdown') {
      spaceSFX.playRumble();
      setStage('blastoff');
      spaceSFX.playWhoosh();
      localStorage.setItem('nasa_onboarding_complete', 'true');
      setTimeout(() => setStage('complete'), 1200);
    }
  }, [count, stage]);

  if (stage === 'complete') return null;

  return (
    <div 
      ref={overlayRef}
      className={`
        ${styles.overlay} 
        ${stage === 'blastoff' ? styles.fade : ''} 
        ${stage === 'blastoff' ? styles.shake : ''}
      `}
      role="dialog"
      aria-modal="true"
      aria-label="Blastoff countdown"
      tabIndex="-1"
    >
      {stage === 'countdown' && (
        <button className={styles.skipButton} onClick={handleSkip}>
          {t('skipIntro')}
        </button>
      )}

      {/* Speed Lines */}
      {stage === 'blastoff' && (
        <div className={styles.speedLines} aria-hidden="true">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={styles.line} style={{ '--i': i }}></div>
          ))}
        </div>
      )}

      {/* Onomatopoeia */}
      {stage === 'blastoff' && <div className={styles.whoosh} aria-live="assertive">{t('whoosh')}</div>}
      {count === 0 && stage === 'countdown' && <div className={styles.rumble} aria-live="polite">{t('rumble')}</div>}
      {stage === 'blastoff' && <div className={styles.flash} aria-hidden="true"></div>}

      <div className={styles.rocketWrapper}>
        <img 
          src={onboardingRocket} 
          alt="Friendly cartoon rocket preparing for launch" 
          className={`${styles.rocket} ${stage === 'blastoff' ? styles.launch : ''}`} 
        />
        {/* Exhaust Puffs */}
        {stage === 'blastoff' && (
          <div className={styles.exhaust} aria-hidden="true">
            <div className={styles.puff}></div>
            <div className={styles.puff}></div>
            <div className={styles.puff}></div>
          </div>
        )}
      </div>

      {stage === 'countdown' && (
        <div 
          className={styles.counter} 
          key={count}
          aria-live="polite"
          aria-atomic="true"
          style={{ 
            '--count-color': count === 3 ? 'var(--cosmic-science)' : 
                             count === 2 ? 'var(--cosmic-sun)' : 
                             count === 1 ? 'var(--cosmic-earth)' : 
                             'var(--cosmic-universe)'
          }}
        >
          {count > 0 ? count : t('go')}
        </div>
      )}


      <img src={onboardingCloud} alt="" className={`${styles.cloud} ${styles.cloud1}`} aria-hidden="true" />
      <img src={onboardingCloud} alt="" className={`${styles.cloud} ${styles.cloud2}`} aria-hidden="true" />
    </div>
  );
}
