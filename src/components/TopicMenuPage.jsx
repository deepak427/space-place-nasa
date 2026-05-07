import { useParams, useNavigate } from 'react-router-dom'
import { topicData } from '../data/topicData'
import styles from './TopicMenuPage.module.css'
import { useLanguage } from '../context/LanguageContext'

export default function TopicMenuPage() {
  const { topic, lang } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const currentLang = lang || language
  const data = topicData[currentLang]?.[topic] || topicData['en'][topic]

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
    <div className={styles.container} style={{ '--topic-color': data.color }}>
      <button onClick={() => navigate(`/${language}/`)} className={styles.backButton}>
        🚀 {t('backMissionControl')}
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

      {data.sections.map((section, sIdx) => (
        <section key={sIdx} className={styles.section}>
          <h2 className={styles.sectionHeading}>{section.title}</h2>
          <div className={styles.grid}>
            {section.items.map((item, iIdx) => (
              <a 
                key={iIdx} 
                href={localizedUrl(item.url)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.card}
                style={{ '--i': iIdx }}
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
        </section>
      ))}
    </div>
  )
}
