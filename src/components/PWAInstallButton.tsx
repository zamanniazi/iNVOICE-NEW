import React, { useState } from 'react';
import { Download, Smartphone, Monitor, CheckCircle, X, ExternalLink, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // App URL from window
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installed App</span>
      </span>
    );
  }

  return (
    <>
      <button
        id="pwa-install-app-btn"
        type="button"
        onClick={handleTriggerInstall}
        className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        title="Install Invoice Maker on Computer or Mobile Phone"
      >
        <Download className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
        <span>Install App</span>
      </button>

      {/* Guidance Modal when native prompt is not active or for iOS / Computer instructions */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-stone-900 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-950">Install Invoice Maker</h3>
                  <p className="text-xs text-stone-500">Add to your Home Screen or Desktop</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Web Link Box */}
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
              <p className="text-xs font-semibold text-stone-700">Open this app on your phone or PC:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="w-full text-xs font-mono bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-700 select-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Platform Instructions */}
            <div className="space-y-3 text-xs text-stone-600">
              
              {/* Chrome / Edge on Computer */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                <Monitor className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">On Computer (Chrome / Edge / Brave):</p>
                  <p className="mt-0.5 text-stone-600 leading-relaxed">
                    Look for the <strong>Install icon</strong> (<Download className="inline w-3 h-3 mx-0.5 text-stone-700" />) at the right end of the address bar, or click browser menu (<strong>&vellip;</strong>) &rarr; <strong>&ldquo;Install Invoice Maker&rdquo;</strong>.
                  </p>
                </div>
              </div>

              {/* Android Phone */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">On Android (Chrome):</p>
                  <p className="mt-0.5 text-stone-600 leading-relaxed">
                    Tap the three dots (<strong>&vellip;</strong>) menu at top-right &rarr; select <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                  </p>
                </div>
              </div>

              {/* iPhone / iPad */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">On iPhone / iPad (Safari):</p>
                  <p className="mt-0.5 text-stone-600 leading-relaxed">
                    Tap the <strong>Share</strong> button (<span className="border border-stone-300 px-1 py-0.5 rounded text-[10px] font-mono">⎋</span>) at the bottom &rarr; scroll and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Got It
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
