import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppShellProvider, useAppShell } from '../context/AppShellContext'
import { Languages, Moon } from 'lucide-react'
import Sidebar from './Sidebar'

function getSectionLabel(pathname) {
  if (pathname.startsWith('/decision-hub')) return 'Decision Hub'
  if (pathname.startsWith('/analytics')) return 'Analytics'
  if (pathname.startsWith('/legal')) return 'Legal Info'
  if (pathname.startsWith('/red-flags')) return 'Red Flag Guide'
  if (pathname.startsWith('/settings')) return 'Settings'
  if (pathname.startsWith('/logout')) return 'Logout'
  return 'Home'
}

function LayoutFrame() {
  const location = useLocation()
  const { closeSidebar, isSidebarOpen, isSidebarCollapsed, language, theme, currency, cycleLanguage, toggleTheme, toggleCurrency, toggleSidebar, t } =
    useAppShell()
  const sectionLabel = getSectionLabel(location.pathname)
  const isSettingsPage = location.pathname.startsWith('/settings')

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
          <div className="topbar-start">
            <button className="mobile-menu-button" type="button" onClick={toggleSidebar}>
              {t('ui.menu', 'Menu')}
            </button>
            <span className="topbar-section-label">{sectionLabel}</span>
          </div>

          {!isSettingsPage ? <div className="topbar-actions">
            <div className="topbar-utility-copy">
              <span className="topbar-utility-label">Currency</span>
              <span className="topbar-utility-value">{currency === 'USD' ? 'USD' : 'Local'}</span>
            </div>
            <button
              className="topbar-icon-button"
              type="button"
              onClick={toggleCurrency}
              aria-label={currency === 'USD' ? 'Switch to local currencies' : 'Switch to USD'}
              title={currency === 'USD' ? 'Switch to local currencies' : 'Switch to USD'}
            >
              <span className="topbar-currency-symbol" aria-hidden="true">$</span>
            </button>
            <div className="topbar-utility-copy">
              <span className="topbar-utility-label">{t('ui.language', 'Language')}</span>
              <span className="topbar-utility-value">{language.toUpperCase()}</span>
            </div>
            <button
              className="topbar-icon-button"
              type="button"
              onClick={cycleLanguage}
              aria-label={t('ui.language', 'Language')}
              title={t('ui.language', 'Language')}
            >
              <Languages className="topbar-icon" aria-hidden="true" />
            </button>
            <div className="topbar-utility-copy">
              <span className="topbar-utility-label">Theme</span>
              <span className="topbar-utility-value">
                {theme === 'light' ? t('ui.darkMode', 'Dark mode') : t('ui.lightMode', 'Light mode')}
              </span>
            </div>
            <button
              className="topbar-icon-button"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? t('ui.darkMode', 'Dark mode') : t('ui.lightMode', 'Light mode')}
              title={theme === 'light' ? t('ui.darkMode', 'Dark mode') : t('ui.lightMode', 'Light mode')}
            >
              <Moon className="topbar-icon" aria-hidden="true" />
            </button>
          </div> : null}
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
