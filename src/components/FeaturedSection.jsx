import styles from './FeaturedSection.module.css'

import iconTelescope from '../assets/icon-telescope.png'
import iconRocket from '../assets/icon-rocket.png'
import iconSatellite from '../assets/icon-satellite.png'

import { useLanguage } from '../context/LanguageContext'

export default function FeaturedSection({ onMoonClick, onPhasesClick, onDistanceClick, onLaunchClick }) {
  const { t, language } = useLanguage()

  const moonCards = [
    {
      title: t('allAboutMoon'),
      key: 'allAboutMoon',
      img: '/moon_cartoon.png',
      href: `https://spaceplace.nasa.gov/all-about-the-moon/${language}/`,
    },
    {
      title: t('moonPhases'),
      key: 'moonPhases',
      img: '/moon_phases_simple.png',
      href: `https://spaceplace.nasa.gov/moon-phases/${language}/`,
    },
    {
      title: t('moonDistance'),
      key: 'moonDistance',
      img: '/earth_moon.png',
      href: `https://spaceplace.nasa.gov/moon-distance/${language}/`,
    },
  ]

  return (
    <section className={styles.section} aria-label="Featured articles">
      <div className={styles.moonGrid}>
        {moonCards.map((card) => (
          <a
            key={card.key}
            href={card.href}
            className={styles.moonCard}
            onClick={(e) => {
              if (card.key === 'allAboutMoon') {
                e.preventDefault();
                onMoonClick();
              } else if (card.key === 'moonPhases') {
                e.preventDefault();
                onPhasesClick();
              } else if (card.key === 'moonDistance') {
                e.preventDefault();
                onDistanceClick();
              }
            }}
          >
            <div className={styles.moonImgWrap}>
              <img src={card.img} alt={card.title} className={styles.moonImg} loading="lazy" />
            </div>
            <p className={styles.moonTitle}>{card.title}</p>
          </a>
        ))}
      </div>

      <div className={styles.sidebar}>
        <a
          href="https://science.nasa.gov/skywatching/whats-up/"
          className={styles.skywatchCard}
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.skywatchHeader}>
            <img src={iconTelescope} alt="" className={styles.sidebarIcon} aria-hidden="true" loading="lazy" />
            <h2 className={styles.skywatchTitle}>{t('skywatchingTips')}</h2>
          </div>
          <p className={`${styles.skywatchBody} drop-cap`}>
            {t('nightSkyMonth')}
          </p>
          <span className={styles.skywatchLink}>
            {t('checkNasaTips')}
          </span>
        </a>

        <a
          href={`https://spaceplace.nasa.gov/launching-into-space/${language}/`}
          className={styles.launchCard}
          onClick={(e) => {
            e.preventDefault();
            onLaunchClick();
          }}
        >
          <div className={styles.launchContent}>
            <img
              src={iconRocket}
              alt=""
              className={styles.sidebarIcon}
              aria-hidden="true"
              loading="lazy"
            />
            <div className={styles.launchText}>
              <h2 className={styles.launchTitle}>{t('launchIntoSpace')}</h2>
              <p className={styles.launchSub}>{t('learnRockets')}</p>
            </div>
          </div>
        </a>
      </div>

      <a
        href={`https://spaceplace.nasa.gov/dsn-game/${language}/`}
        className={styles.dsnCard}
        target="_blank"
        rel="noreferrer"
        aria-label={`${t('playDsn')} (opens in a new tab)`}
      >
        <div className={styles.dsnControlsLeft} aria-hidden="true">
          <div className={styles.dpad}>
            <div className={styles.dpadVertical}></div>
            <div className={styles.dpadHorizontal}></div>
          </div>
        </div>

        <div className={styles.dsnScreen}>
          <img
            src={iconSatellite}
            alt=""
            className={styles.dsnLogo}
            aria-hidden="true"
            loading="lazy"
          />
          <div className={styles.dsnText}>
            <p className={styles.dsnPlay}>{t('playDsn')}</p>
            <p className={styles.dsnDesc}>
              {t('useAntennas')}
            </p>
          </div>
          <div className={styles.dsnPlayPulse}>{t('start')}</div>
        </div>

        <div className={styles.dsnControlsRight} aria-hidden="true">
          <div className={styles.actionButtons}>
            <div className={styles.actionBtn}>A</div>
            <div className={styles.actionBtn}>B</div>
          </div>
        </div>
      </a>
    </section>
  )
}
