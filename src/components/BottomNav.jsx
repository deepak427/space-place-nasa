import { Link } from 'react-router-dom'
import styles from './BottomNav.module.css'
import { useLanguage } from '../context/LanguageContext'

export default function BottomNav() {
  const { t, language } = useLanguage()

  const items = [
    {
      label: t('playZone'),
      emoji: '🎮',
      color: '#4caf50',
      borderColor: '#2e7d32',
      href: `/menu/play/${language}`,
    },
    {
      label: t('handsOnLab'),
      emoji: '✂️',
      color: '#ff9800',
      borderColor: '#e65100',
      href: `/menu/do/${language}`,
    },
    {
      label: t('scienceFun'),
      emoji: '🧪',
      color: '#ff5722',
      borderColor: '#bf360c',
      href: `/menu/activities/${language}`,
    },
    {
      label: t('quickBites'),
      emoji: '▶️',
      color: '#9c27b0',
      borderColor: '#6a1b9a',
      href: `/menu/watch/${language}`,
    },
    {
      label: t('spaceWords'),
      emoji: '📖',
      color: '#1565c0',
      borderColor: '#0d47a1',
      href: `/menu/glossary/${language}`,
    },
    {
      label: t('secretLab'),
      emoji: '❓',
      color: '#f44336',
      borderColor: '#b71c1c',
      href: `/neptune/${language}`,
    },
  ]
  return (
    <nav aria-label="Activity categories" className={styles.nav}>
      {items.map((item) => {
        const isInternal = item.href.startsWith('/')
        const Component = isInternal ? Link : 'a'
        return (
          <Component
            key={item.label}
            to={isInternal ? item.href : undefined}
            href={!isInternal ? item.href : undefined}
            className={styles.item}
            target={!isInternal ? "_blank" : undefined}
            rel={!isInternal ? "noreferrer" : undefined}
          >
            <span className={styles.emoji} aria-hidden="true">{item.emoji}</span>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.externalArrow}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H9M17 7V15" />
              </svg>
            </span>
            {!isInternal && <span className="sr-only">(opens in new window)</span>}
          </Component>
        )
      })}
    </nav>
  )
}
