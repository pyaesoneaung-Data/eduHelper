import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppShellProvider, useAppShell } from '../context/AppShellContext'
import { Moon, Sun, Globe, CurrencyDollar, List } from '@phosphor-icons/react'
import Sidebar from './Sidebar'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getSectionLabel(pathname) {
  if (pathname.startsWith('/decision-hub')) return 'Decision Hub'
  if (pathname.startsWith('/analytics')) return 'Analytics'
  if (pathname.startsWith('/legal')) return 'Legal Info'
  if (pathname.startsWith('/red-flags')) return 'Red Flag Guide'
  if (pathname.startsWith('/settings')) return 'Settings'
  if (pathname.startsWith('/logout')) return 'Logout'
  if (pathname.startsWith('/about')) return 'About'
  if (pathname.startsWith('/admin')) return 'Admin'
  if (pathname.startsWith('/programs')) return 'Program Detail'
  return getGreeting()
}

function LayoutFrame() {
  const location = useLocation()
  const { closeSidebar, isSidebarOpen, isSidebarCollapsed, language, theme, currency, cycleLanguage, toggleTheme, toggleCurrency, toggleSidebar, t } =
    useAppShell()
  const sectionLabel = getSectionLabel(location.pathname)
  const isHomePage = location.pathname === '/'
  const isSettingsPage = location.pathname.startsWith('/settings')
  const isCostOverviewPage = location.pathname === '/analytics'
  const isAboutPage = location.pathname.startsWith('/about')

  useEffect(() => {
    closeSidebar()
  }, [location.pathname, closeSidebar])

  return (
    <div className={isSidebarCollapsed ? 'dashboard-shell sidebar-collapsed' : 'dashboard-shell'}>
      <aside className={isSidebarOpen ? 'dashboard-sidebar dashboard-sidebar-open' : 'dashboard-sidebar'}>
        <Sidebar />
      </aside>

      {isSidebarOpen ? (
        <button
          className="sidebar-overlay"
          type="button"
          onClick={closeSidebar}
          aria-label={t('ui.close', 'Close')}
        />
      ) : null}

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
              <span className={isHomePage ? 'topbar-section-label topbar-section-greeting' : 'topbar-section-label'}>
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
                  <span className="toggle-label">{language.toUpperCase()}</span>
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
