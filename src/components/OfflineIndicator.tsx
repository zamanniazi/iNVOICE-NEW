import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="no-print fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-stone-900 text-stone-100 border border-stone-700 px-3.5 py-2 text-xs font-medium shadow-xl">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Offline Mode &bull; Working locally with cached data</span>
    </div>
  );
};
