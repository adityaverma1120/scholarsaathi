import type { Metadata, Viewport } from 'next';
import React from 'react';
import '../styles/globals.css';
import RibbonBanner from '../components/RibbonBanner';
import LanguageSwitch from '../components/LanguageSwitch';
import FirstRunModal from '../components/FirstRunModal';
import { LanguageProvider } from '../context/LanguageContext';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ScholarSaathi — Your Complete Scholarship Assistant',
  description: 'Discover scholarships, verify documents, check eligibility, and decode application remarks.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          {/* C-RIBBON: Non-dismissable mandatory independence ribbon */}
          <RibbonBanner />

          {/* S02: First-run boundary and privacy notice modal */}
          <FirstRunModal />

          {/* Global Navigation Header */}
          <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
            <div className="max-w-4xl mx-auto px-4 h-15 flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base sm:text-lg tracking-tight hover:opacity-90 transition-opacity shrink-0"
                aria-label="ScholarSaathi Home"
              >
                <span className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center font-black text-sm shadow-xs">
                  S
                </span>
                <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                  <span className="font-extrabold tracking-tight">ScholarSaathi</span>
                  <span className="text-xs font-semibold text-slate-500 hidden sm:inline">(स्कॉलर साथी)</span>
                </span>
              </Link>

              {/* Responsive Navigation */}
              <nav className="flex items-center gap-1 sm:gap-1.5">
                <LanguageSwitch />
                
                {/* Desktop Nav Items */}
                <div className="hidden lg:flex items-center gap-1">
                  <Link
                    href="/discovery"
                    className="btn btn-sm btn-ghost text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] px-2.5"
                  >
                    Scholarships
                  </Link>
                  <Link
                    href="/eligibility"
                    className="btn btn-sm btn-ghost text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] px-2.5"
                  >
                    Eligibility
                  </Link>
                  <Link
                    href="/readiness"
                    className="btn btn-sm btn-ghost text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] px-2.5"
                  >
                    Readiness
                  </Link>
                  <Link
                    href="/vault"
                    className="btn btn-sm btn-ghost text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] px-2.5"
                  >
                    Vault
                  </Link>
                  <Link
                    href="/tracker"
                    className="btn btn-sm btn-ghost text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] px-2.5"
                  >
                    Tracker
                  </Link>
                  <Link
                    href="/calendar"
                    className="btn btn-sm btn-ghost text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] px-2.5"
                  >
                    Calendar
                  </Link>
                  <Link
                    href="/profile"
                    className="btn btn-sm btn-ghost text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] px-2.5"
                  >
                    Profile
                  </Link>
                </div>

                {/* Mobile / Tablet Quick Shortcuts */}
                <div className="flex lg:hidden items-center gap-1">
                  <Link
                    href="/discovery"
                    className="btn btn-sm btn-ghost text-xs font-semibold text-slate-700 min-h-[44px] px-2"
                  >
                    Schemes
                  </Link>
                  <Link
                    href="/eligibility"
                    className="btn btn-sm btn-primary text-xs font-bold min-h-[44px] px-2.5 rounded-lg"
                  >
                    Eligibility
                  </Link>
                </div>
              </nav>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col overflow-x-clip">
            {children}
          </main>

          {/* Global Footer */}
          <footer className="w-full bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 mt-auto">
            <div className="max-w-2xl mx-auto space-y-2">
              <p className="font-medium text-slate-600">
                ScholarSaathi is an independent student-support platform. Not affiliated with NSP or any government ministry.
              </p>
              <div className="flex justify-center gap-4 text-slate-500 font-semibold">
                <Link href="/about" className="hover:text-slate-900 transition-colors">How It Works</Link>
                <span>•</span>
                <Link href="/about#privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
                <span>•</span>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition-colors"
                >
                  Official NSP Portal ↗
                </a>
              </div>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
