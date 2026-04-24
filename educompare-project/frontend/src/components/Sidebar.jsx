import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BarChart2, ChevronLeft, ChevronRight, Compass, House, Info, Scale, Settings, ShieldAlert } from 'lucide-react'
import { useAppShell } from '../context/AppShellContext'
import logoLight from '../assets/logo/logo_light_without_text.svg'
import logoDark from '../assets/logo/logo_dark_without_text.svg'
import IconImage from './IconImage'

const navConfig = [
  {
    key: 'home',
    type: 'link',
    to: '/',
    end: true,
    label: 'Home',
    icon: House,
  },
  {
    key: 'decision-hub',
    type: 'group',
    label: 'Decision Hub',
    icon: Compass,
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
    icon: BarChart2,
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
    icon: Scale,
  },
  {
    key: 'red-flags',
    type: 'link',
    to: '/red-flags',
    label: 'Red Flag Guide',
    icon: ShieldAlert,
  },
]

const footerLinks = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/about', label: 'About', icon: Info },
]

function Sidebar() {
  const { closeSidebar, isSidebarCollapsed, toggleSidebarCollapsed, theme } = useAppShell()
  const logoSrc = theme === 'dark' ? logoDark : logoLight
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
        <IconImage src={logoSrc} className="sidebar-logo" alt="UniMatch logo" />
        <span className="sidebar-brand-name">UniMatch</span>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navConfig.map((item) => {
          if (item.type === 'link') {
            const Icon = item.icon
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
                <Icon className="sidebar-link-icon" aria-hidden="true" />
                <span className="sidebar-link-label">{item.label}</span>
              </NavLink>
            )
          }

          if (item.type === 'group') {
            const Icon = item.icon
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
                  <Icon className="sidebar-link-icon" aria-hidden="true" />
                  <span className="sidebar-link-label">{item.label}</span>
                  <ChevronRight
                    className={`sidebar-group-chevron${isOpen ? ' sidebar-group-chevron-open' : ''}`}
                    aria-hidden="true"
                  />
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
        {footerLinks.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              title={link.label}
              aria-label={link.label}
              onClick={closeSidebar}
              className={() => getLinkClass(link.to, false)}
            >
              <Icon className="sidebar-link-icon" aria-hidden="true" />
              <span className="sidebar-link-label">{link.label}</span>
            </NavLink>
          )
        })}
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={toggleSidebarCollapsed}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed
            ? <ChevronRight className="sidebar-collapse-icon" aria-hidden="true" />
            : <ChevronLeft className="sidebar-collapse-icon" aria-hidden="true" />
          }
          <span className="sidebar-link-label">Collapse</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
