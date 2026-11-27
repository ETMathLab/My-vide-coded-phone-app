import React from 'react';
import { Check, X } from 'lucide-react';
import type { UnitDef } from '../data/units';

interface UnitSelectorModalProps {
  isOpen: boolean;
  title: string;
  units: UnitDef[];
  selectedUnitId: string;
  onSelect: (unitId: string) => void;
  onClose: () => void;
}

export const UnitSelectorModal: React.FC<UnitSelectorModalProps> = ({
  isOpen,
  title,
  units,
  selectedUnitId,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  const metricUnits = units.filter((u) => u.system === 'metric');
  const usUnits = units.filter((u) => u.system === 'us');

  const renderGroup = (label: string, items: UnitDef[]) => (
    <div className="space-y-1">
      <div className="px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {items.map((unit) => {
          const isSelected = unit.id === selectedUnitId;
          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => {
                onSelect(unit.id);
                onClose();
              }}
              className={`w-full min-h-[50px] px-4 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300'
                  : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/70'
              }`}
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="font-mono text-sm font-semibold w-16 shrink-0">
                  {unit.symbol}
                </span>
                <span className="text-sm font-medium truncate">{unit.name}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full sm:max-w-md max-h-[82vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#F4F4F2] dark:bg-zinc-950 border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 sm:hidden" />
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            aria-label="Close unit selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          {renderGroup('Metric Units', metricUnits)}
          {renderGroup('US Imperial & Customary', usUnits)}
        </div>
      </div>
    </div>
  );
};
