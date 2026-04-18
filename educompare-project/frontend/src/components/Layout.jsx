import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppShellProvider, useAppShell } from '../context/AppShellContext'
import languageIcon from '../assets/icons/langauge.svg'
import moonIcon from '../assets/icons/moon.svg'
import IconImage from './IconImage'
import Sidebar from './Sidebar'

function LayoutFrame() {
  const location = useLocation()
  const { closeSidebar, isSidebarOpen, language, theme, cycleLanguage, toggleTheme, toggleSidebar, t } =
    useAppShell()

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
          <button className="mobile-menu-button" type="button" onClick={toggleSidebar}>
            {t('ui.menu', 'Menu')}
          </button>

          <div className="topbar-actions">
            <button className="topbar-icon-button" type="button" onClick={toggleTheme}>
              <IconImage src={moonIcon} className="topbar-icon" />
              <span>{theme === 'light' ? t('ui.darkMode', 'Dark mode') : t('ui.lightMode', 'Light mode')}</span>
            </button>
            <button className="topbar-icon-button" type="button" onClick={cycleLanguage}>
              <IconImage src={languageIcon} className="topbar-icon" />
              <span>{`${t('ui.language', 'Language')}: ${language.toUpperCase()}`}</span>
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
