import styles from './CosmicCard.module.css';

export default function CosmicCard({ children, title, subtitle, image, tint = 'blue', className = '' }) {
  const tintClass = styles[`tint${tint.charAt(0).toUpperCase() + tint.slice(1)}`];

  return (
    <div className={`${styles.card} ${tintClass} ${className}`}>
      {image && (
        <div className={styles.imageWrap}>
          <img src={image} alt={title || 'Cosmic Card'} className={styles.image} />
        </div>
      )}
      {(title || subtitle || children) && (
        <div className={styles.content}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {children}
        </div>
      )}
    </div>
  );
}
