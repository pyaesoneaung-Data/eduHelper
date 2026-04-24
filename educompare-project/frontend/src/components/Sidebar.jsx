import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAppShell } from '../context/AppShellContext'
import analyticsIcon from '../assets/icons/analytics.svg'
import decisionHubIcon from '../assets/icons/decision_hub.svg'
import homeIcon from '../assets/icons/home.svg'
import legalIcon from '../assets/icons/legal.svg'
import languageIcon from '../assets/icons/language.svg'
import settingsIcon from '../assets/icons/setting.svg'
import warningIcon from '../assets/icons/warning.svg'
import logoIcon from '../assets/logo/logo.svg'
import IconImage from './IconImage'

const navConfig = [
  {
    key: 'home',
    type: 'link',
    to: '/',
    end: true,
    label: 'Home',
    icon: homeIcon,
  },
  {
    key: 'decision-hub',
    type: 'group',
    label: 'Decision Hub',
    icon: decisionHubIcon,
    basePath: '/decision-hub',
    defaultTo: '/decision-hub/recommendation',
    children: [
      { label: 'Recommendation', to: '/decision-hub/recommendation' },
      { label: 'Compare', to: '/decision-hub/compare' },
      { label: 'Cost Calculator', to: '/decision-hub/cost-calculator' },
    ],
  },
  {
    key: 'analytics',
    type: 'group',
    label: 'Analytics',
    icon: analyticsIcon,
    basePath: '/analytics',
    defaultTo: '/analytics',
    children: [
      { label: 'Cost Overview', to: '/analytics', end: true },
      { label: 'Admission Overview', to: '/analytics/admission' },
      { label: 'Deadline Insights', to: '/analytics/deadlines' },
      { label: 'Ranking Insights', to: '/analytics/ranking' },
    ],
  },
  {
    key: 'legal',
    type: 'link',
    to: '/legal',
    label: 'Legal Info',
    icon: legalIcon,
  },
  {
    key: 'red-flags',
    type: 'link',
    to: '/red-flags',
    label: 'Red Flag Guide',
    icon: warningIcon,
  },
]

const footerLinks = [
  { to: '/settings', label: 'Settings', icon: settingsIcon },
  { to: '/about', label: 'About', icon: languageIcon },
]

function Sidebar() {
  const { closeSidebar, isSidebarCollapsed, toggleSidebarCollapsed } = useAppShell()
  const location = useLocation()
  const navigate = useNavigate()

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = new Set()
    navConfig.forEach((item) => {
      if (item.type === 'group' && location.pathname.startsWith(item.basePath)) {
        initial.add(item.key)
      }
    })
    return initial
  })

  // Auto-expand group when navigating to a child path externally
  useEffect(() => {
    navConfig.forEach((item) => {
      if (item.type === 'group' && location.pathname.startsWith(item.basePath)) {
        setOpenGroups((prev) => {
          if (prev.has(item.key)) return prev
          const next = new Set(prev)
          next.add(item.key)
          return next
        })
      }
    })
  }, [location.pathname])

  function toggleGroup(key) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function handleGroupClick(item) {
    if (isSidebarCollapsed) {
      navigate(item.defaultTo)
      closeSidebar()
    } else {
      toggleGroup(item.key)
    }
  }

  function getLinkClass(to, end) {
    const isActive = end
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(`${to}/`)
    return isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
  }

  return (
    <div className="sidebar-panel">
      <div className="sidebar-brand">
        <IconImage src={logoIcon} className="sidebar-logo" alt="UniMatch logo" />
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navConfig.map((item) => {
          if (item.type === 'link') {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                aria-label={item.label}
                onClick={closeSidebar}
                className={() => getLinkClass(item.to, item.end)}
              >
                <IconImage src={item.icon} className="sidebar-link-icon" alt="" />
                <span className="sidebar-link-label">{item.label}</span>
              </NavLink>
            )
          }

          if (item.type === 'group') {
            const isOpen = openGroups.has(item.key)
            const isActive = location.pathname.startsWith(item.basePath)

            return (
              <div key={item.key} className="sidebar-group">
                <button
                  type="button"
                  className={`sidebar-group-btn${isActive ? ' sidebar-group-btn-active' : ''}`}
                  onClick={() => handleGroupClick(item)}
                  aria-expanded={isOpen && !isSidebarCollapsed}
                  title={item.label}
                >
                  <IconImage src={item.icon} className="sidebar-link-icon" alt="" />
                  <span className="sidebar-link-label">{item.label}</span>
                  <span
                    className={`sidebar-group-chevron${isOpen ? ' sidebar-group-chevron-open' : ''}`}
                    aria-hidden="true"
                  >
                    ›
                  </span>
                </button>

                {isOpen && !isSidebarCollapsed ? (
                  <div className="sidebar-group-children">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end={child.end}
                        onClick={closeSidebar}
                        className={({ isActive: childActive }) =>
                          childActive
                            ? 'sidebar-sub-link sidebar-sub-link-active'
                            : 'sidebar-sub-link'
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}

                {/* Fly-out panel — only visible in collapsed mode on hover (CSS-driven) */}
                <div className="sidebar-flyout" aria-hidden="true">
                  <p className="sidebar-flyout-title">{item.label}</p>
                  <div className="sidebar-flyout-divider" />
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end={child.end}
                      onClick={closeSidebar}
                      className={({ isActive: childActive }) =>
                        childActive
                          ? 'sidebar-flyout-link sidebar-flyout-link-active'
                          : 'sidebar-flyout-link'
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          }

          return null
        })}
      </nav>

      <div className="sidebar-footer">
        {footerLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            title={link.label}
            aria-label={link.label}
            onClick={closeSidebar}
            className={() => getLinkClass(link.to, false)}
          >
            <IconImage src={link.icon} className="sidebar-link-icon" alt="" />
            <span className="sidebar-link-label">{link.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={toggleSidebarCollapsed}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="sidebar-collapse-icon" aria-hidden="true">
            {isSidebarCollapsed ? '›' : '‹'}
          </span>
          <span className="sidebar-link-label">Collapse</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
