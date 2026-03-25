import styles from './ResetViewButton.module.css';

interface ResetViewButtonProps {
  onReset: () => void;
}

export default function ResetViewButton({ onReset }: ResetViewButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      aria-label="Reset camera view"
      onClick={onReset}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2 8a6 6 0 1 0 1.5-3.9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <polyline
          points="2,4 2,8 6,8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Reset view</span>
    </button>
  );
}
