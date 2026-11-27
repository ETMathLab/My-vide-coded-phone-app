import React from 'react';
import { Delete } from 'lucide-react';

interface CalculatorKeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: '+' | '−' | '×' | '÷') => void;
  onDecimal: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onToggleSign: () => void;
  onEquals: () => void;
}

function hapticTap() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(8);
    } catch {
      // Ignore on unsupported browsers
    }
  }
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  onDigit,
  onOperator,
  onDecimal,
  onBackspace,
  onClear,
  onToggleSign,
  onEquals,
}) => {
  const baseKeyClass =
    'min-h-[52px] sm:min-h-[56px] rounded-xl font-mono text-lg sm:text-xl font-semibold select-none flex items-center justify-center transition-transform duration-100 active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500';

  const digitKeyClass = `${baseKeyClass} bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-800`;

  const utilityKeyClass = `${baseKeyClass} bg-zinc-200/75 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border border-zinc-300/60 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/60`;

  const operatorKeyClass = `${baseKeyClass} bg-zinc-900/5 dark:bg-zinc-700/60 text-orange-700 dark:text-orange-400 border border-zinc-300/70 dark:border-zinc-600/60 hover:bg-orange-500/10`;

  const equalsKeyClass = `${baseKeyClass} bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 shadow-sm`;

  const tap = (fn: () => void) => () => {
    hapticTap();
    fn();
  };

  return (
    <div
      className="grid grid-cols-4 gap-2 sm:gap-2.5"
      role="group"
      aria-label="Calculator keypad"
    >
      {/* Row 1 */}
      <button type="button" onClick={tap(onClear)} className={utilityKeyClass} aria-label="Clear">
        C
      </button>
      <button type="button" onClick={tap(onToggleSign)} className={utilityKeyClass} aria-label="Toggle plus or minus">
        ±
      </button>
      <button type="button" onClick={tap(onBackspace)} className={utilityKeyClass} aria-label="Backspace">
        <Delete className="w-5 h-5" aria-hidden="true" />
      </button>
      <button type="button" onClick={tap(() => onOperator('÷'))} className={operatorKeyClass} aria-label="Divide">
        ÷
      </button>

      {/* Row 2 */}
      <button type="button" onClick={tap(() => onDigit('7'))} className={digitKeyClass}>
        7
      </button>
      <button type="button" onClick={tap(() => onDigit('8'))} className={digitKeyClass}>
        8
      </button>
      <button type="button" onClick={tap(() => onDigit('9'))} className={digitKeyClass}>
        9
      </button>
      <button type="button" onClick={tap(() => onOperator('×'))} className={operatorKeyClass} aria-label="Multiply">
        ×
      </button>

      {/* Row 3 */}
      <button type="button" onClick={tap(() => onDigit('4'))} className={digitKeyClass}>
        4
      </button>
      <button type="button" onClick={tap(() => onDigit('5'))} className={digitKeyClass}>
        5
      </button>
      <button type="button" onClick={tap(() => onDigit('6'))} className={digitKeyClass}>
        6
      </button>
      <button type="button" onClick={tap(() => onOperator('−'))} className={operatorKeyClass} aria-label="Subtract">
        −
      </button>

      {/* Row 4 */}
      <button type="button" onClick={tap(() => onDigit('1'))} className={digitKeyClass}>
        1
      </button>
      <button type="button" onClick={tap(() => onDigit('2'))} className={digitKeyClass}>
        2
      </button>
      <button type="button" onClick={tap(() => onDigit('3'))} className={digitKeyClass}>
        3
      </button>
      <button type="button" onClick={tap(() => onOperator('+'))} className={operatorKeyClass} aria-label="Add">
        +
      </button>

      {/* Row 5 */}
      <button type="button" onClick={tap(() => onDigit('00'))} className={digitKeyClass}>
        00
      </button>
      <button type="button" onClick={tap(() => onDigit('0'))} className={digitKeyClass}>
        0
      </button>
      <button type="button" onClick={tap(onDecimal)} className={digitKeyClass} aria-label="Decimal point">
        .
      </button>
      <button type="button" onClick={tap(onEquals)} className={equalsKeyClass} aria-label="Equals and save">
        =
      </button>
    </div>
  );
};
