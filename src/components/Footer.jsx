import styles from './Footer.module.css'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
  const { t, language } = useLanguage()

  return (
    <footer className={styles.footer}>
      <div className={styles.characterDoodle}>
        <img src="/footer_doodle.webp" alt="" aria-hidden="true" />
      </div>
      <div className={styles.crateLabel}>{t('missionCrate')}</div>
      <nav aria-label="Footer links" className={styles.links}>
        <a href={`https://spaceplace.nasa.gov/about-us/${language === 'es' ? 'sp' : 'en'}/`} target="_blank" rel="noreferrer" className={styles.sticker}>{t('aboutUs')}</a>
        <a href="https://www.nasa.gov/privacy/" target="_blank" rel="noreferrer" className={styles.sticker}>{t('privacy')}</a>
        <a href={`https://spaceplace.nasa.gov/image-use/${language === 'es' ? 'sp' : 'en'}/`} target="_blank" rel="noreferrer" className={styles.sticker}>{t('imageUse')}</a>
        <a href="https://www.nasa.gov/general/accessibility/" target="_blank" rel="noreferrer" className={styles.sticker}>{t('accessibility')}</a>
        <a href="mailto:info@spaceplace.nasa.gov" className={styles.sticker}>{t('contactNasa')}</a>
      </nav>
      <div className={styles.logEntry}>
        <span className={styles.logIcon}>📋</span>
        <p>{t('logEntry')}</p>
      </div>
    </footer>
  )
}
