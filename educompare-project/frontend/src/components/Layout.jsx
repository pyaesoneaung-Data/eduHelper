import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppShellProvider, useAppShell } from '../context/AppShellContext'
import languageIcon from '../assets/icons/language.svg'
import moonIcon from '../assets/icons/moon.svg'
import IconImage from './IconImage'
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
  const { closeSidebar, isSidebarOpen, language, theme, cycleLanguage, toggleTheme, toggleSidebar, t } =
    useAppShell()
  const sectionLabel = getSectionLabel(location.pathname)

  useEffect(() => {
    closeSidebar()
  }, [location.pathname, closeSidebar])

  return (
    <div className="dashboard-shell">
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

          <div className="topbar-actions">
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
              <IconImage src={languageIcon} className="topbar-icon" alt="" />
            </button>
            <div className="topbar-utility-copy">
              <span className="topbar-utility-label">Mode</span>
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
              <IconImage src={moonIcon} className="topbar-icon" alt="" />
            </button>
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
