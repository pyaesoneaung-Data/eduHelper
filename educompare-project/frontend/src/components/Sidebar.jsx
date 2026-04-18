import { NavLink } from 'react-router-dom'
import { useAppShell } from '../context/AppShellContext'
import analyticsIcon from '../assets/icons/analytics.svg'
import decisionHubIcon from '../assets/icons/decision_hub.svg'
import homeIcon from '../assets/icons/home.svg'
import languageIcon from '../assets/icons/langauge.svg'
import legalIcon from '../assets/icons/legal.svg'
import logoutIcon from '../assets/icons/logout.svg'
import moonIcon from '../assets/icons/moon.svg'
import settingsIcon from '../assets/icons/setting.svg'
import warningIcon from '../assets/icons/warning.svg'
import logoIcon from '../assets/logo/logo.svg'
import IconImage from './IconImage'

const navItems = [
  { to: '/', labelKey: 'nav.home', fallback: 'Home', icon: homeIcon, end: true },
  {
    to: '/decision-hub/recommendation',
    labelKey: 'nav.decisionHub',
    fallback: 'Decision Hub',
    icon: decisionHubIcon,
  },
  { to: '/analytics', labelKey: 'nav.analytics', fallback: 'Analytics', icon: analyticsIcon },
  { to: '/legal', labelKey: 'nav.legal', fallback: 'Legal Info', icon: legalIcon },
  { to: '/red-flags', labelKey: 'nav.redFlags', fallback: 'Red Flag Guide', icon: warningIcon },
  { to: '/settings', labelKey: 'nav.settings', fallback: 'Settings', icon: settingsIcon },
  { to: '/logout', labelKey: 'nav.logout', fallback: 'Logout', icon: logoutIcon },
]

function Sidebar() {
  const { t, theme, toggleTheme, language, cycleLanguage, closeSidebar } = useAppShell()

  return (
    <div className="sidebar-panel">
      <div className="sidebar-brand">
        <IconImage src={logoIcon} className="sidebar-logo" />
        <div>
          <p className="sidebar-brand-name">{t('app.name', 'UniMatch / EduCompare')}</p>
          <p className="sidebar-brand-copy">{t('app.tagline', 'Study-abroad decisions built on verified data.')}</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={closeSidebar}
            className={({ isActive }) => (isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link')}
          >
            <IconImage src={item.icon} className="sidebar-link-icon" />
            <span>{t(item.labelKey, item.fallback)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-tools">
        <button className="sidebar-tool-button" type="button" onClick={toggleTheme}>
          <IconImage src={moonIcon} className="sidebar-link-icon" />
          <span>{theme === 'light' ? t('ui.darkMode', 'Dark mode') : t('ui.lightMode', 'Light mode')}</span>
        </button>
        <button className="sidebar-tool-button" type="button" onClick={cycleLanguage}>
          <IconImage src={languageIcon} className="sidebar-link-icon" />
          <span>{`${t('ui.language', 'Language')}: ${language.toUpperCase()}`}</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
