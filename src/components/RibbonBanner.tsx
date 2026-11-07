import React from 'react';

/**
 * C-RIBBON: Mandatory Non-Dismissable Independence Disclaimer
 * Mandated by Principle P1 on EVERY screen in root layout.
 * MUST NOT use government emblems, Ashoka lions, or flag-imitating color combinations.
 */
export default function RibbonBanner() {
  return (
    <aside
      aria-label="Independence Disclaimer"
      className="w-full bg-slate-900 text-slate-200 text-xs sm:text-sm py-2 px-4 text-center border-b border-slate-800 font-medium tracking-wide"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
        <p>Independent prototype. Not a government service. Not affiliated with NSP.</p>
      </div>
    </aside>
  );
}

