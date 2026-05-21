import React, { useState } from 'react';

/**
 * Reusable print button that shows loading / success / error state inline
 * and degrades gracefully when the local print bridge is unreachable.
 *
 * Pass a `printFn` that returns a Promise<{ ok, error?, mode? }>.
 */
export default function PrintButton({
  printFn,
  label = 'Imprimir',
  loadingLabel = 'Imprimiendo…',
  successLabel = 'Impreso',
  className = '',
  variant = 'primary',
}) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setStatus('loading');
    setError(null);
    const result = await printFn();
    if (result.ok) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
    } else {
      setStatus('error');
      setError(result.error || 'No se pudo imprimir.');
    }
  };

  const baseClasses = 'py-2 px-4 rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-pink-500 text-white hover:bg-pink-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    success: 'bg-green-500 text-white hover:bg-green-600',
  };

  const buttonClass = `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`;

  return (
    <div className="flex flex-col">
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className={buttonClass}
      >
        {status === 'loading' && (
          <span className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {loadingLabel}
          </span>
        )}
        {status === 'idle' && label}
        {status === 'success' && (
          <span className="inline-flex items-center">
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successLabel}
          </span>
        )}
        {status === 'error' && 'Reintentar'}
      </button>
      {status === 'error' && error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
