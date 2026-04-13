import type { ValidationResult as ValidationResultType } from '../../shared/types';
import './ValidationResult.css';

interface ValidationResultProps {
  result: ValidationResultType | null;
}

function CheckCircleIcon() {
  return (
    <svg
      className="validation-result-icon validation-result-icon--valid"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg
      className="validation-result-icon validation-result-icon--invalid"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6" />
      <path d="M9 9l6 6" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg
      className="validation-result-icon validation-result-icon--error"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const statusIcons = {
  valid: CheckCircleIcon,
  invalid: XCircleIcon,
  error: AlertTriangleIcon,
};

export function ValidationResult({ result }: ValidationResultProps) {
  if (!result) {
    return null;
  }

  const Icon = statusIcons[result.status];

  return (
    <div
      className={`validation-result validation-result--${result.status}`}
      aria-live="polite"
      role="status"
    >
      <Icon />
      <div className="validation-result-content">
        <span className="validation-result-provider">{result.provider}</span>
        <p className="validation-result-message">{result.message}</p>
        {result.tier ? (
          <span className="validation-result-tier">{result.tier}</span>
        ) : (
          <span className="validation-result-tier validation-result-tier--unavailable">
            Tier info unavailable
          </span>
        )}
      </div>
    </div>
  );
}
