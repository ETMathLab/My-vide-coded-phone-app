import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-2 text-xs font-medium shadow-md"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />
      <span>Offline Ready — All conversions work locally</span>
    </div>
  );
};
