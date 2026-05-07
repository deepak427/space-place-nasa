import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './Header.module.css'
import { useLanguage } from '../context/LanguageContext'

export default function Header({ onLogoClick }) {
  const { language, toggleLanguage, t, setLanguage } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const [isError, setIsError] = useState(false)
  const [query, setQuery] = useState('')

  const handleToggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en'
    toggleLanguage()

    // Sync URL if it contains language
    const pathParts = location.pathname.split('/')
    
    // Check if any part matches current language
    const langIndex = pathParts.findIndex(part => part === 'en' || part === 'es')
    
    if (langIndex !== -1) {
      pathParts[langIndex] = newLang
      navigate(pathParts.join('/'))
    } else if (location.pathname === '/') {
      // For home page, navigate to /:lang/
      navigate(`/${newLang}/`)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) {
      setIsError(true)
      setTimeout(() => setIsError(false), 400) // Match animation duration
      return
    }
    // Handle actual search
  }

  return (
    <header className={styles.header}>
      <button
        className={styles.brand}
        onClick={onLogoClick}
        aria-label="Go to Space Place Home"
      >
        <img
          src="https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg"
          alt="NASA logo"
          className={styles.nasaLogo}
          aria-hidden="true"
        />
        <div className={styles.titleBlock} aria-hidden="true">
          <span className={styles.nasaScience}>{t('nasaScience')}</span>
          <h1 className={styles.spacePlace}>{t('spacePlace')}</h1>
          <span className={styles.tagline}>{t('tagline')}</span>
        </div>
      </button>

      <div className={styles.controls}>
        <div className={styles.topLinks}>
          <button
            onClick={handleToggleLanguage}
            className={styles.spanishLink}
            aria-label={language === 'en' ? t('viewInSpanish') : t('viewInEnglish')}
          >
            {language === 'en' ? t('viewInSpanish') : t('viewInEnglish')}
          </button>
        </div>
        <form
          className={styles.searchForm}
          onSubmit={handleSearch}
          role="search"
          data-error={isError}
        >
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>
            {t('search')}
          </button>
        </form>
      </div>
    </header>
  )
}
