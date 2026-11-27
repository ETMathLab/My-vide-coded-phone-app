import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Copy,
  History,
  Layers,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import {
  CATEGORIES,
  type CategoryId,
  convertUnit,
  getEverydayBreakdown,
} from './data/units';
import {
  evaluateExpression,
  formatConvertedNumber,
  formatRawNumberForDisplay,
} from './utils/calculator';
import { CalculatorKeypad } from './components/CalculatorKeypad';
import { UnitSelectorModal } from './components/UnitSelectorModal';
import {
  EquivalentsAndHistoryPanel,
  type HistoryItem,
} from './components/EquivalentsAndHistoryPanel';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineBanner } from './components/OfflineBanner';

const HISTORY_STORAGE_KEY = 'metricus_history_v1';
const THEME_STORAGE_KEY = 'metricus_theme_v1';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [darkMode]);

  const [categoryId, setCategoryId] = useState<CategoryId>('length');
  const category = useMemo(
    () => CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0],
    [categoryId]
  );

  const [fromUnitId, setFromUnitId] = useState<string>(category.defaultFrom);
  const [toUnitId, setToUnitId] = useState<string>(category.defaultTo);
  const [expression, setExpression] = useState<string>('175');

  const [selectorTarget, setSelectorTarget] = useState<'from' | 'to' | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [desktopSideTab, setDesktopSideTab] = useState<'equivalents' | 'history'>('equivalents');
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'equivalents' | 'history' | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota issues
    }
  }, [history]);

  const fromUnit = useMemo(
    () => category.units.find((u) => u.id === fromUnitId) ?? category.units[0],
    [category, fromUnitId]
  );

  const toUnit = useMemo(
    () => category.units.find((u) => u.id === toUnitId) ?? category.units[1] ?? category.units[0],
    [category, toUnitId]
  );

  const evalResult = useMemo(() => evaluateExpression(expression), [expression]);
  const numericInput = evalResult.value ?? 0;

  const convertedNumeric = useMemo(
    () => convertUnit(numericInput, fromUnit, toUnit),
    [numericInput, fromUnit, toUnit]
  );

  const formattedOutput = useMemo(
    () => formatConvertedNumber(convertedNumeric),
    [convertedNumeric]
  );

  const everydayBreakdown = useMemo(
    () => getEverydayBreakdown(category.id, numericInput, fromUnit, toUnit),
    [category.id, numericInput, fromUnit, toUnit]
  );

  const handleSelectCategory = (nextCatId: CategoryId) => {
    const nextCat = CATEGORIES.find((c) => c.id === nextCatId);
    if (!nextCat) return;
    setCategoryId(nextCatId);
    setFromUnitId(nextCat.defaultFrom);
    setToUnitId(nextCat.defaultTo);
    // Load sensible default starting number for the category
    const firstPreset = nextCat.presets[0];
    if (firstPreset) {
      setFromUnitId(firstPreset.unitId);
      setExpression(String(firstPreset.value));
    } else {
      setExpression('1');
    }
  };

  const handleSwapUnits = () => {
    setFromUnitId(toUnit.id);
    setToUnitId(fromUnit.id);
  };

  const handleCopy = useCallback((text: string, key: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 1500);
  }, []);

  // Keypad handlers
  const handleDigit = useCallback((digit: string) => {
    setExpression((prev) => {
      if (prev === '0' && digit !== '00') return digit;
      if (prev === '0' && digit === '00') return '0';
      if (prev === '-0') return `-${digit}`;
      if (prev.length >= 24) return prev;
      return prev + digit;
    });
  }, []);

  const handleOperator = useCallback((op: '+' | '−' | '×' | '÷') => {
    setExpression((prev) => {
      if (!prev || prev === '-') return prev;
      if (/[+−×÷]$/.test(prev)) {
        return prev.slice(0, -1) + op;
      }
      if (prev.endsWith('.')) {
        return prev.slice(0, -1) + op;
      }
      return prev + op;
    });
  }, []);

  const handleDecimal = useCallback(() => {
    setExpression((prev) => {
      // Find the current number segment after the last operator
      const parts = prev.split(/[+−×÷]/);
      const currentSegment = parts[parts.length - 1] ?? '';
      if (currentSegment.includes('.')) return prev;
      if (currentSegment === '' || currentSegment === '-') {
        return prev + '0.';
      }
      return prev + '.';
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setExpression((prev) => {
      if (prev.length <= 1 || prev === '-0') return '0';
      const next = prev.slice(0, -1);
      return next === '-' ? '0' : next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setExpression('0');
  }, []);

  const handleToggleSign = useCallback(() => {
    setExpression((prev) => {
      // If simple number, flip sign; if expression, evaluate first then flip
      const { value } = evaluateExpression(prev);
      if (value === null) return prev;
      const flipped = -value;
      return formatRawNumberForDisplay(flipped);
    });
  }, []);

  const handleEquals = useCallback(() => {
    const { value } = evaluateExpression(expression);
    if (value === null) return;
    const cleanStr = formatRawNumberForDisplay(value);
    setExpression(cleanStr);

    const outVal = convertUnit(value, fromUnit, toUnit);
    const outFormatted = formatConvertedNumber(outVal);

    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      categoryId: category.id,
      categoryLabel: category.label,
      inputExpr: expression,
      inputValue: value,
      fromUnitId: fromUnit.id,
      fromSymbol: fromUnit.symbol,
      toUnitId: toUnit.id,
      toSymbol: toUnit.symbol,
      outputFormatted: outFormatted,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const deduped = prev.filter(
        (h) =>
          !(
            h.categoryId === item.categoryId &&
            h.inputValue === item.inputValue &&
            h.fromUnitId === item.fromUnitId &&
            h.toUnitId === item.toUnitId
          )
      );
      return [item, ...deduped].slice(0, 25);
    });
  }, [expression, category.id, category.label, fromUnit, toUnit]);

  // Physical keyboard support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (selectorTarget || mobileDrawerTab) {
        if (e.key === 'Escape') {
          setSelectorTarget(null);
          setMobileDrawerTab(null);
        }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('−');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    selectorTarget,
    mobileDrawerTab,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEquals,
    handleBackspace,
    handleClear,
  ]);

  const handleRestoreHistory = (item: HistoryItem) => {
    setCategoryId(item.categoryId as CategoryId);
    setFromUnitId(item.fromUnitId);
    setToUnitId(item.toUnitId);
    setExpression(formatRawNumberForDisplay(item.inputValue));
    setMobileDrawerTab(null);
  };

  const hasExpressionOperators = /[+−×÷]/.test(expression.replace(/^-/, ''));

  return (
    <div className="min-h-dvh flex flex-col bg-[#F4F4F2] dark:bg-[#121214] text-zinc-900 dark:text-zinc-100">
      {/* Compact Top App Bar (< 10% viewport height) */}
      <header className="sticky top-0 z-30 h-14 bg-[#F4F4F2]/90 dark:bg-[#121214]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3 min-w-0">
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0">
              MetricUS
            </span>
            <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400 truncate">
              Metric ↔ US Imperial Calculator
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile quick drawers for All Units & History */}
            <button
              type="button"
              onClick={() => setMobileDrawerTab('equivalents')}
              className="lg:hidden min-h-[40px] px-2.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="View all units"
            >
              <Layers className="w-4 h-4" aria-hidden="true" />
              <span>All Units</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileDrawerTab('history')}
              className="lg:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer"
              aria-label="Conversion history"
            >
              <History className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer"
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 pt-3 pb-5 sm:py-6 flex flex-col gap-3 sm:gap-5">
        {/* Category Selector Strip */}
        <nav
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
          aria-label="Measurement categories"
        >
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === category.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'bg-white/80 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>

        {/* Responsive 2-Column Workspace (Desktop) / Thumb-First Single Stack (Mobile) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Left Column: Calculator Display + Everyday Presets + Keypad */}
          <section className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
            {/* Dual Readout Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
              {/* Source Input Row */}
              <div className="px-4 sm:px-5 pt-4 pb-3.5">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectorTarget('from')}
                    className="min-h-[40px] -ml-2 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0">
                      {fromUnit.symbol}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[150px] sm:max-w-none">
                      {fromUnit.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
                  </button>

                  <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap shrink-0">
                    {fromUnit.system === 'metric' ? 'Metric' : 'US Imperial'}
                  </span>
                </div>

                <div className="mt-1.5 flex items-baseline justify-end gap-2 min-h-[44px]">
                  <div
                    className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums text-right break-all"
                    aria-label="Calculator input"
                  >
                    {expression}
                  </div>
                </div>

                {hasExpressionOperators && (
                  <div className="mt-0.5 text-right font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                    = {formatRawNumberForDisplay(numericInput)} {fromUnit.symbol}
                  </div>
                )}
              </div>

              {/* Divider + Swap Trigger */}
              <div className="relative flex items-center px-4 sm:px-5">
                <div className="flex-1 h-px bg-zinc-200/80 dark:bg-zinc-800" />
                <button
                  type="button"
                  onClick={handleSwapUnits}
                  className="mx-2 min-h-[44px] min-w-[44px] rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 dark:hover:text-orange-400 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  aria-label="Swap input and output units"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
                <div className="flex-1 h-px bg-zinc-200/80 dark:bg-zinc-800" />
              </div>

              {/* Target Output Row */}
              <div className="px-4 sm:px-5 pt-3 pb-4 bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectorTarget('to')}
                    className="min-h-[40px] -ml-2 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-left hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-sm font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap shrink-0">
                      {toUnit.symbol}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 truncate max-w-[150px] sm:max-w-none">
                      {toUnit.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
                  </button>

                  <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap shrink-0">
                    {toUnit.system === 'us' ? 'US Imperial' : 'Metric'}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-3 min-h-[48px]">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(`${formattedOutput} ${toUnit.symbol}`, 'primary-output')
                    }
                    className="min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    aria-label="Copy converted result"
                  >
                    {copiedKey === 'primary-output' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <div
                    className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-orange-600 dark:text-orange-400 tabular-nums text-right break-all"
                    aria-live="polite"
                    aria-label="Converted result"
                  >
                    {formattedOutput}
                  </div>
                </div>

                {everydayBreakdown && (
                  <div className="mt-1 text-right text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 tabular-nums">
                    {everydayBreakdown}
                  </div>
                )}
              </div>
            </div>

            {/* Everyday Quick-Tap Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {category.presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setFromUnitId(preset.unitId);
                    setExpression(String(preset.value));
                  }}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-orange-500/60 text-left transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-baseline gap-1.5"
                >
                  <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {preset.label}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    · {preset.note}
                  </span>
                </button>
              ))}
            </div>

            {/* Tactile Pocket Calculator Keypad */}
            <CalculatorKeypad
              onDigit={handleDigit}
              onOperator={handleOperator}
              onDecimal={handleDecimal}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onToggleSign={handleToggleSign}
              onEquals={handleEquals}
            />
          </section>

          {/* Right Column (Desktop): Live All-Units Matrix & History */}
          <aside className="hidden lg:block lg:col-span-5">
            <EquivalentsAndHistoryPanel
              category={category}
              activeValue={numericInput}
              fromUnit={fromUnit}
              toUnit={toUnit}
              onSelectTargetUnit={(uid) => setToUnitId(uid)}
              onCopyValue={handleCopy}
              copiedKey={copiedKey}
              history={history}
              onRestoreHistory={handleRestoreHistory}
              onClearHistory={() => setHistory([])}
              activeTab={desktopSideTab}
              onTabChange={setDesktopSideTab}
            />
          </aside>
        </div>
      </main>

      {/* Mobile Bottom Sheet for All Units & History */}
      {mobileDrawerTab && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex items-end bg-black/50 backdrop-blur-xs"
          onClick={() => setMobileDrawerTab(null)}
          role="dialog"
          aria-modal="true"
          aria-label="All units and history"
        >
          <div
            className="w-full max-h-[82vh] rounded-t-3xl bg-[#F4F4F2] dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3" />
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {category.label} Reference
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerTab(null)}
                className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-3 pb-4 overflow-y-auto">
              <EquivalentsAndHistoryPanel
                category={category}
                activeValue={numericInput}
                fromUnit={fromUnit}
                toUnit={toUnit}
                onSelectTargetUnit={(uid) => {
                  setToUnitId(uid);
                  setMobileDrawerTab(null);
                }}
                onCopyValue={handleCopy}
                copiedKey={copiedKey}
                history={history}
                onRestoreHistory={handleRestoreHistory}
                onClearHistory={() => setHistory([])}
                activeTab={mobileDrawerTab}
                onTabChange={setMobileDrawerTab}
              />
            </div>
          </div>
        </div>
      )}

      {/* Unit Selector Sheet */}
      <UnitSelectorModal
        isOpen={selectorTarget !== null}
        title={selectorTarget === 'from' ? `Convert From (${category.label})` : `Convert To (${category.label})`}
        units={category.units}
        selectedUnitId={selectorTarget === 'from' ? fromUnit.id : toUnit.id}
        onSelect={(uid) => {
          if (selectorTarget === 'from') {
            setFromUnitId(uid);
          } else if (selectorTarget === 'to') {
            setToUnitId(uid);
          }
        }}
        onClose={() => setSelectorTarget(null)}
      />

      <OfflineBanner />
    </div>
  );
}
