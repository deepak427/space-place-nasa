import { useParams, useNavigate } from 'react-router-dom'
import { menuData } from '../data/menuData'
import styles from './MenuListingPage.module.css'
import { useLanguage } from '../context/LanguageContext'

export default function MenuListingPage() {
  const { category, lang } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const currentLang = lang || language
  const data = menuData[currentLang]?.[category] || menuData['en'][category]

  if (!data) {
    return (
      <div className={styles.error}>
        <h2>{t('oopsCosmicCorner')}</h2>
        <button onClick={() => navigate(`/${language}/`)}>{t('goBackHome')}</button>
      </div>
    )
  }

  const localizedUrl = (url) => {
    if (language === 'es' && url.includes('/en/')) {
      return url.replace('/en/', '/sp/');
    }
    return url;
  };

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(`/${language}/`)} className={styles.backButton}>
        🚀 {t('blastBack')}
      </button>

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{data.title}</h1>
          <h2 className={styles.subtitle}>{data.subtitle}</h2>
          <p className={styles.description}>{data.description}</p>
        </div>
        <div className={styles.heroImageWrap}>
          <img src={data.heroImage} alt="" className={styles.heroImage} />
        </div>
      </header>

      <div className={styles.grid}>
        {data.items.map((item, index) => (
          <a 
            key={index} 
            href={localizedUrl(item.url)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.card}
            style={{ '--i': index }}
          >
            <div className={styles.cardIcon}>{item.icon}</div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </a>
        ))}
      </div>
    </div>
  )
}
