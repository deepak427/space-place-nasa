import { useState, useEffect } from 'react'
import styles from './ArtChallenge.module.css'
import { useLanguage } from '../context/LanguageContext'

const artSubmissions = [
  {
    src: '/art/mariner-4_josefa-10.jpg',
    alt: 'Drawing of Mariner 4 by Josefa, age 10',
    credit: 'Josefa, 10',
  },
  {
    src: '/art/mariner-4_sofia-14.jpg',
    alt: 'Mariner 4 artwork by Sofia, age 14',
    credit: 'Sofia, 14',
  },
  {
    src: '/art/mariner-4_roberto-10.jpg',
    alt: 'Mariner 4 artwork by Roberto, age 10',
    credit: 'Roberto, 10',
  },
  {
    src: '/art/mariner-4_ryan-5.jpg',
    alt: 'Mariner 4 artwork by Ryan, age 5',
    credit: 'Ryan, 5',
  },
  {
    src: '/art/mariner-4_mirial-4.jpg',
    alt: 'Mariner 4 artwork by Mirial, age 4',
    credit: 'Mirial, 4',
  },
]

export default function ArtChallenge() {
  const { t, language } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const prev = () => {
    setCurrent((c) => (c - 1 + artSubmissions.length) % artSubmissions.length)
    setIsAnimating(true)
  }
  const next = () => {
    setCurrent((c) => (c + 1) % artSubmissions.length)
    setIsAnimating(true)
  }

  // Reset animation state after duration
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  const goTo = (index) => {
    if (index !== current) {
      setCurrent(index)
      setIsAnimating(true)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }

  // NASA uses /sp/ for Spanish art challenge
  const artChallengeUrl = `https://spaceplace.nasa.gov/art-challenge/${language === 'es' ? 'sp' : 'en'}/`

  return (
    <section className={styles.section} aria-label={t('artChallenge') || 'Art Challenge'}>
      <div className={styles.banner}>
        <div className={styles.bannerText}>
          <h2 className={styles.bannerTitle}>{t('cosmicArtTitle')}</h2>
          <a
            href={artChallengeUrl}
            className={styles.bannerLink}
            target="_blank"
            rel="noreferrer"
          >
            {t('joinChallenge')}
          </a>
        </div>
      </div>

      <div className={styles.gallery}>
        <div className={styles.galleryInfo}>
          <h3 className={styles.galleryTitle}>
            <span className="wavy-text">{t('hallOfFame').split(' ')[0]} {t('hallOfFame').split(' ')[1]}</span> {t('hallOfFame').split(' ').slice(2).join(' ')}
          </h3>
          <p className={styles.galleryPrompt}>{t('marsPrompt')}</p>
        </div>

        <div className={styles.carouselContainer}>
          <div 
            className={`${styles.carousel} ${isAnimating ? styles.carouselBoing : ''}`} 
            role="region" 
            aria-label="Art submissions carousel"
            onKeyDown={handleKeyDown}
            tabIndex="0"
          >
            <button
              className={styles.carouselBtn}
              onClick={prev}
              aria-label="Previous artwork"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.btnIcon}>
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 18L9 12L14 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              </svg>
            </button>

            <div className={styles.carouselImgWrap}>
              <img
                key={current}
                src={artSubmissions[current].src}
                alt={artSubmissions[current].alt}
                className={styles.carouselImg}
                loading="lazy"
              />
            </div>

            <button
              className={styles.carouselBtn}
              onClick={next}
              aria-label="Next artwork"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.btnIcon}>
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 6L15 12L10 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              </svg>
            </button>
          </div>

          <div className={styles.creditWrap}>
            <span className={styles.creditLabel}>{t('artistLabel')}</span>
            <p className={styles.creditText}>{artSubmissions[current].credit}</p>
          </div>

          <div className={styles.dots} role="tablist" aria-label="Artwork navigation">
            {artSubmissions.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Artwork ${i + 1}`}
                className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
