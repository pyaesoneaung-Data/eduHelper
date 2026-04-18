import { NavLink, useLocation } from 'react-router-dom'
import { useAppShell } from '../context/AppShellContext'
import analyticsIcon from '../assets/icons/analytics.svg'
import decisionHubIcon from '../assets/icons/decision_hub.svg'
import homeIcon from '../assets/icons/home.svg'
import legalIcon from '../assets/icons/legal.svg'
import logoutIcon from '../assets/icons/logout.svg'
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
]

const footerItems = [
  { to: '/settings', labelKey: 'nav.settings', fallback: 'Settings', icon: settingsIcon },
  { to: '/logout', labelKey: 'nav.logout', fallback: 'Logout', icon: logoutIcon },
]

function Sidebar() {
  const { t, closeSidebar } = useAppShell()
  const location = useLocation()

  function getLinkClassName(item) {
    const isActive =
      item.end
        ? location.pathname === item.to
        : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

    return isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
  }

  return (
    <div className="sidebar-panel">
      <div className="sidebar-brand">
        <IconImage src={logoIcon} className="sidebar-logo" alt="UniMatch logo" />
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={t(item.labelKey, item.fallback)}
            aria-label={t(item.labelKey, item.fallback)}
            onClick={closeSidebar}
            className={() => getLinkClassName(item)}
          >
            <IconImage src={item.icon} className="sidebar-link-icon" alt="" />
            <span className="sidebar-link-label">{t(item.labelKey, item.fallback)}</span>
          </NavLink>
        ))}
      </nav>

      <nav className="sidebar-footer" aria-label="Sidebar utilities">
        {footerItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={t(item.labelKey, item.fallback)}
            aria-label={t(item.labelKey, item.fallback)}
            onClick={closeSidebar}
            className={() => getLinkClassName(item)}
          >
            <IconImage src={item.icon} className="sidebar-link-icon" alt="" />
            <span className="sidebar-link-label">{t(item.labelKey, item.fallback)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
