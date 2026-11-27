import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        aria-label="Install app on phone"
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{isInstallable ? 'Install App' : 'Get Phone App'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setShowGuide(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-600/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 id="pwa-guide-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {isIOS ? 'Add to iPhone Home Screen' : 'Install on Android Phone'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="min-h-[40px] min-w-[40px] -mr-2 -mt-2 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                aria-label="Close install instructions"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                <li>1. Open this page in Safari and tap the <strong>Share</strong> icon in the toolbar.</li>
                <li>2. Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                <li>3. Tap <strong>Add</strong> — MetricUS works offline anytime.</li>
              </ol>
            ) : (
              <ol className="mt-4 space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                <li>1. Open this app in <strong>Chrome</strong> on your Android phone{isAndroid ? '' : ' (not inside an embedded preview)'}.</li>
                <li>2. Tap the <strong>three-dot menu (⋮)</strong> in the top-right corner of Chrome.</li>
                <li>3. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>. It runs full-screen and offline.</li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
