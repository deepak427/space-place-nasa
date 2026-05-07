import { Link } from 'react-router-dom'
import styles from './NavCategories.module.css'

import iconEarth from '../assets/icon-earth.png'
import iconSun from '../assets/icon-sun.png'
import iconSolarSystem from '../assets/icon-solar-system.png'
import iconUniverse from '../assets/icon-universe.png'
import iconScience from '../assets/icon-science.png'
import iconEducators from '../assets/icon-educators.png'

import { useLanguage } from '../context/LanguageContext'

const categories = [
  {
    key: 'earth',
    icon: iconEarth,
    href: '/topic/earth',
    color: 'var(--cosmic-earth)',
  },
  {
    key: 'sun',
    icon: iconSun,
    href: '/topic/sun',
    color: 'var(--cosmic-sun)',
  },
  {
    key: 'solarSystem',
    icon: iconSolarSystem,
    href: '/topic/solar-system',
    color: 'var(--cosmic-system)',
  },
  {
    key: 'universe',
    icon: iconUniverse,
    href: '/topic/universe',
    color: 'var(--cosmic-universe)',
  },
  {
    key: 'scienceTech',
    icon: iconScience,
    href: '/topic/tech',
    color: 'var(--cosmic-science)',
  },
  {
    key: 'educators',
    icon: iconEducators,
    href: '/topic/educators',
    color: 'var(--cosmic-educator)',
  },
]

export default function NavCategories({ onMoonClick }) {
  const { t, language } = useLanguage()
  const allCategories = [
    {
      label: t('moon'),
      icon: '/moon_cartoon.png',
      href: `/all-about-the-moon/${language}/`,
      color: 'var(--amber-soft)',
    },
    ...categories.map(cat => ({
      ...cat,
      label: t(cat.key)
    })),
  ]

  return (
    <nav aria-label="Topic categories" className={styles.nav}>
      {allCategories.map((cat, idx) => {
        const isInternal = cat.href?.startsWith('/')
        const Component = isInternal ? Link : 'a'
        
        return (
          <Component
            key={cat.label}
            to={isInternal ? cat.href : undefined}
            href={!isInternal ? (cat.href || '#') : undefined}
            className={styles.pill}
            target={!isInternal && cat.href ? "_blank" : undefined}
            rel={!isInternal && cat.href ? "noreferrer" : undefined}
            onClick={(e) => {
              if (cat.onClick) {
                e.preventDefault();
                cat.onClick();
              }
            }}
            style={{ 
              '--cat-color': cat.color,
              '--idx': idx 
            }}
          >
            <img 
              src={cat.icon} 
              alt="" 
              className={styles.icon} 
              aria-hidden="true" 
              loading="lazy"
              decoding="async"
            />
            <span className={styles.label}>{cat.label}</span>
            {cat.href && !isInternal && <span className="sr-only">(opens in new window)</span>}
          </Component>
        )
      })}
    </nav>
  )
}
