import React from 'react';
import { Check, Copy, History, Trash2 } from 'lucide-react';
import type { CategoryDef, UnitDef } from '../data/units';
import { convertUnit } from '../data/units';
import { formatConvertedNumber } from '../utils/calculator';

export interface HistoryItem {
  id: string;
  categoryId: string;
  categoryLabel: string;
  inputExpr: string;
  inputValue: number;
  fromUnitId: string;
  fromSymbol: string;
  toUnitId: string;
  toSymbol: string;
  outputFormatted: string;
  timestamp: number;
}

interface EquivalentsAndHistoryPanelProps {
  category: CategoryDef;
  activeValue: number;
  fromUnit: UnitDef;
  toUnit: UnitDef;
  onSelectTargetUnit: (unitId: string) => void;
  onCopyValue: (text: string, key: string) => void;
  copiedKey: string | null;
  history: HistoryItem[];
  onRestoreHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  activeTab: 'equivalents' | 'history';
  onTabChange: (tab: 'equivalents' | 'history') => void;
}

export const EquivalentsAndHistoryPanel: React.FC<EquivalentsAndHistoryPanelProps> = ({
  category,
  activeValue,
  fromUnit,
  toUnit,
  onSelectTargetUnit,
  onCopyValue,
  copiedKey,
  history,
  onRestoreHistory,
  onClearHistory,
  activeTab,
  onTabChange,
}) => {
  const usUnits = category.units.filter((u) => u.system === 'us');
  const metricUnits = category.units.filter((u) => u.system === 'metric');

  const renderUnitRow = (unit: UnitDef) => {
    const converted = convertUnit(activeValue, fromUnit, unit);
    const formatted = formatConvertedNumber(converted);
    const isTarget = unit.id === toUnit.id;
    const isSource = unit.id === fromUnit.id;
    const copyId = `eq-${unit.id}`;
    const isCopied = copiedKey === copyId;

    return (
      <div
        key={unit.id}
        className={`flex items-center justify-between gap-3 px-4 py-3 min-h-[52px] transition-colors ${
          isTarget
            ? 'bg-orange-50/70 dark:bg-orange-950/25'
            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
        }`}
      >
        <button
          type="button"
          onClick={() => onSelectTargetUnit(unit.id)}
          className="flex-1 flex items-baseline justify-between gap-3 text-left min-w-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
        >
          <div className="min-w-0">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {unit.name}
            </span>
            <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
              {unit.symbol}
              {isSource ? ' · Input' : isTarget ? ' · Active' : ''}
            </span>
          </div>
          <span
            className={`font-mono text-base font-semibold tabular-nums shrink-0 ${
              isTarget
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {formatted}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onCopyValue(`${formatted} ${unit.symbol}`, copyId)}
          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          aria-label={`Copy ${formatted} ${unit.symbol}`}
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden flex flex-col">
      {/* Segmented Switcher */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg">
          <button
            type="button"
            onClick={() => onTabChange('equivalents')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'equivalents'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All {category.label} Units
          </button>
          <button
            type="button"
            onClick={() => onTabChange('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <History className="w-3.5 h-3.5" aria-hidden="true" />
            <span>History{history.length > 0 ? ` (${history.length})` : ''}</span>
          </button>
        </div>

        {activeTab === 'history' && history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 px-2 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {activeTab === 'equivalents' ? (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="px-4 py-2 bg-zinc-50/70 dark:bg-zinc-900/60 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            US Imperial & Customary
          </div>
          {usUnits.map(renderUnitRow)}

          <div className="px-4 py-2 bg-zinc-50/70 dark:bg-zinc-900/60 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Metric
          </div>
          {metricUnits.map(renderUnitRow)}
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[440px] overflow-y-auto">
          {history.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                No saved conversions yet
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Tap the orange = button on the keypad to save a conversion here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onRestoreHistory(item)}
                className="w-full px-4 py-3.5 min-h-[56px] flex items-center justify-between gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.categoryLabel}
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums truncate">
                    {formatConvertedNumber(item.inputValue)} {item.fromSymbol}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-sm font-semibold text-orange-600 dark:text-orange-400 tabular-nums">
                    {item.outputFormatted} {item.toSymbol}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
