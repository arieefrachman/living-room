import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo} aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 8V6a6 6 0 0 1 12 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="2" />
          <line x1="8" y1="22" x2="8" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="22" x2="20" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className={styles.brand}>3D Chair Showcase</h1>
    </header>
  );
}
