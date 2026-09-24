import React, { useState, useEffect, useCallback } from 'react';

/**
 * Calculadora de mostrador. Se monta POR ENCIMA del módulo activo (nunca lo
 * desmonta), así abrirla y cerrarla no pierde la venta en curso.
 *
 * Funciona con el teclado numérico de la caja además del mouse: la caja no es
 * táctil y la cajera ya tiene las manos en el teclado.
 */
export default function CalculatorModal({ open, onClose }) {
  const [display, setDisplay] = useState('0');
  const [accumulator, setAccumulator] = useState(null);
  const [pendingOp, setPendingOp] = useState(null);
  // Tras un "=" o un operador, el siguiente dígito empieza un número nuevo
  const [startFresh, setStartFresh] = useState(true);

  const inputDigit = useCallback((digit) => {
    setDisplay(prev => {
      if (startFresh) return digit;
      if (prev === '0' && digit !== '.') return digit;
      if (prev.length >= 14) return prev;
      return prev + digit;
    });
    setStartFresh(false);
  }, [startFresh]);

  const inputDot = useCallback(() => {
    setDisplay(prev => {
      if (startFresh) return '0.';
      return prev.includes('.') ? prev : prev + '.';
    });
    setStartFresh(false);
  }, [startFresh]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setAccumulator(null);
    setPendingOp(null);
    setStartFresh(true);
  }, []);

  const backspace = useCallback(() => {
    setDisplay(prev => {
      if (startFresh) return prev;
      const next = prev.slice(0, -1);
      return next === '' || next === '-' ? '0' : next;
    });
  }, [startFresh]);

  const compute = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      // Dividir entre cero no debe dejar "Infinity" en pantalla de una caja
      case '/': return b === 0 ? null : a / b;
      default: return b;
    }
  };

  const applyOperator = useCallback((op) => {
    const current = parseFloat(display) || 0;

    if (pendingOp !== null && accumulator !== null && !startFresh) {
      const result = compute(accumulator, current, pendingOp);
      if (result === null) {
        setDisplay('No se puede dividir entre 0');
        setAccumulator(null);
        setPendingOp(null);
        setStartFresh(true);
        return;
      }
      const rounded = Math.round(result * 1e6) / 1e6;
      setDisplay(String(rounded));
      setAccumulator(op === '=' ? null : rounded);
    } else {
      setAccumulator(op === '=' ? null : current);
    }

    setPendingOp(op === '=' ? null : op);
    setStartFresh(true);
  }, [display, pendingOp, accumulator, startFresh]);

  // Soporte de teclado. Solo mientras el modal está abierto.
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      const k = e.key;
      if (k >= '0' && k <= '9') { inputDigit(k); e.preventDefault(); }
      else if (k === '.' || k === ',') { inputDot(); e.preventDefault(); }
      else if (['+', '-', '*', '/'].includes(k)) { applyOperator(k); e.preventDefault(); }
      else if (k === 'Enter' || k === '=') { applyOperator('='); e.preventDefault(); }
      else if (k === 'Backspace') { backspace(); e.preventDefault(); }
      else if (k === 'Escape') { onClose(); }
      else if (k.toLowerCase() === 'c' || k === 'Delete') { clearAll(); e.preventDefault(); }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, inputDigit, inputDot, applyOperator, backspace, clearAll, onClose]);

  // Reiniciar al cerrar, para que la próxima apertura empiece limpia
  useEffect(() => {
    if (!open) clearAll();
  }, [open, clearAll]);

  if (!open) return null;

  const keyClass = 'py-3 rounded text-lg font-medium transition-colors';
  const numKey = `${keyClass} bg-gray-100 hover:bg-gray-200 text-gray-800`;
  const opKey = `${keyClass} bg-pink-100 hover:bg-pink-200 text-pink-700`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Calculadora"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-800">🧮 Calculadora</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar calculadora"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-4">
          <div className="bg-gray-900 text-white rounded px-3 py-3 text-right">
            <div className="h-4 text-xs text-gray-400">
              {accumulator !== null && pendingOp ? `${accumulator} ${pendingOp}` : ''}
            </div>
            <div className="text-2xl font-mono break-all">{display}</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 p-4">
          <button onClick={clearAll} className={`${keyClass} bg-red-100 hover:bg-red-200 text-red-700`}>C</button>
          <button onClick={backspace} className={`${keyClass} bg-gray-200 hover:bg-gray-300 text-gray-700`}>←</button>
          <button onClick={() => applyOperator('/')} className={opKey}>÷</button>
          <button onClick={() => applyOperator('*')} className={opKey}>×</button>

          {['7', '8', '9'].map(d => (
            <button key={d} onClick={() => inputDigit(d)} className={numKey}>{d}</button>
          ))}
          <button onClick={() => applyOperator('-')} className={opKey}>−</button>

          {['4', '5', '6'].map(d => (
            <button key={d} onClick={() => inputDigit(d)} className={numKey}>{d}</button>
          ))}
          <button onClick={() => applyOperator('+')} className={opKey}>+</button>

          {['1', '2', '3'].map(d => (
            <button key={d} onClick={() => inputDigit(d)} className={numKey}>{d}</button>
          ))}
          <button
            onClick={() => applyOperator('=')}
            className={`${keyClass} bg-pink-500 hover:bg-pink-600 text-white row-span-2`}
          >
            =
          </button>

          <button onClick={() => inputDigit('0')} className={`${numKey} col-span-2`}>0</button>
          <button onClick={inputDot} className={numKey}>.</button>
        </div>

        <p className="px-4 pb-3 text-xs text-gray-400 text-center">
          Puedes usar el teclado numérico · Esc para cerrar
        </p>
      </div>
    </div>
  );
}
