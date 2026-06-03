import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppShellProvider, useAppShell } from '../context/AppShellContext'
import { Moon, Sun, Globe, CurrencyDollar, List } from '@phosphor-icons/react'
import Sidebar from './Sidebar'

function getGreeting(t) {
  const hour = new Date().getHours()
  if (hour < 12) return t('greeting.morning', 'Good morning')
  if (hour < 18) return t('greeting.afternoon', 'Good afternoon')
  return t('greeting.evening', 'Good evening')
}

function getSectionLabel(pathname, t) {
  if (pathname.startsWith('/decision-hub')) return t('nav.decisionHub', 'Decision Hub')
  if (pathname.startsWith('/analytics')) return t('nav.analytics', 'Analytics')
  if (pathname.startsWith('/legal')) return t('nav.legal', 'Legal Info')
  if (pathname.startsWith('/red-flags')) return t('nav.redFlags', 'Red Flag Guide')
  if (pathname.startsWith('/settings')) return t('nav.settings', 'Settings')
  if (pathname.startsWith('/logout')) return t('nav.logout', 'Logout')
  if (pathname.startsWith('/about')) return t('nav.about', 'About')
  if (pathname.startsWith('/admin')) return 'Admin'
  if (pathname.startsWith('/programs')) return t('nav.programDetail', 'Program Detail')
  return getGreeting(t)
}

function LayoutFrame() {
  const location = useLocation()
  const { closeSidebar, isSidebarOpen, isSidebarCollapsed, language, theme, currency, cycleLanguage, toggleTheme, toggleCurrency, toggleSidebar, t } =
    useAppShell()
  const sectionLabel = getSectionLabel(location.pathname, t)
  const isHomePage = location.pathname === '/'
  const isSettingsPage = location.pathname.startsWith('/settings')
  const isCostOverviewPage = location.pathname === '/analytics'
  const isAboutPage = location.pathname.startsWith('/about')
  const isLegalPage = location.pathname.startsWith('/legal')
  const isRedFlagPage = location.pathname.startsWith('/red-flags')

  useEffect(() => {
    closeSidebar()
  }, [location.pathname, closeSidebar])

  return (
    <div className={isSidebarCollapsed ? 'dashboard-shell sidebar-collapsed' : 'dashboard-shell'}>
      <aside className={isSidebarOpen ? 'dashboard-sidebar dashboard-sidebar-open' : 'dashboard-sidebar'}>
        <Sidebar />
      </aside>

      {/* Always rendered so CSS opacity transition fires on open AND close.
          pointer-events:none when hidden prevents accidental click interception. */}
      <button
        className={isSidebarOpen ? 'sidebar-overlay sidebar-overlay-visible' : 'sidebar-overlay'}
        type="button"
        onClick={closeSidebar}
        aria-label={t('ui.close', 'Close')}
      />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-inner">
            <div className="topbar-start">
              <button
                className="mobile-menu-button"
                type="button"
                onClick={toggleSidebar}
                aria-label={t('ui.menu', 'Menu')}
                title={t('ui.menu', 'Menu')}
              >
                <List size={20} aria-hidden="true" />
              </button>
              <span className={(isHomePage || isSettingsPage || isAboutPage || isLegalPage || isRedFlagPage) ? 'topbar-section-label topbar-section-greeting' : 'topbar-section-label'}>
                {sectionLabel}
              </span>
            </div>

            {!isSettingsPage ? (
              <div className="topbar-actions">
                {!isCostOverviewPage && !isAboutPage ? (
                  <button
                    className="topbar-toggle-btn"
                    type="button"
                    onClick={toggleCurrency}
                    aria-label={currency === 'USD' ? 'Switch to local currencies' : 'Switch to USD'}
                    title={currency === 'USD' ? 'Switch to local currencies' : 'Switch to USD'}
                  >
                    <CurrencyDollar size={18} weight="bold" aria-hidden="true" />
                    <span className="toggle-label">{currency === 'USD' ? 'USD' : 'Local'}</span>
                  </button>
                ) : null}
                <button
                  className="topbar-toggle-btn"
                  type="button"
                  onClick={cycleLanguage}
                  aria-label={t('ui.language', 'Language')}
                  title={t('ui.language', 'Language')}
                >
                  <Globe size={18} aria-hidden="true" />
                  <span className="toggle-label">{{ en: 'EN', zh: '中文' }[language] ?? language.toUpperCase()}</span>
                </button>
                <button
                  className="topbar-toggle-btn"
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'light' ? t('ui.darkMode', 'Dark mode') : t('ui.lightMode', 'Light mode')}
                  title={theme === 'light' ? t('ui.darkMode', 'Dark mode') : t('ui.lightMode', 'Light mode')}
                >
                  {theme === 'light' ? (
                    <Moon size={18} aria-hidden="true" />
                  ) : (
                    <Sun size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main className="page-shell">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function Layout() {
  return (
    <AppShellProvider>
      <LayoutFrame />
    </AppShellProvider>
  )
}

export default Layout
