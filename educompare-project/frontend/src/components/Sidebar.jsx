import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  House,
  Compass,
  ChartBar,
  Scales,
  ShieldWarning,
  Gear,
  Info,
  CaretRight,
  CaretLeft,
} from '@phosphor-icons/react'
import { useAppShell } from '../context/AppShellContext'
import logoLight from '../assets/logo/logo_nexa_light.png'
import logoDark from '../assets/logo/logo_nexa_dark.png'
import IconImage from './IconImage'

const navConfig = [
  {
    key: 'home',
    type: 'link',
    to: '/',
    end: true,
    labelKey: 'nav.home',
    label: 'Home',
    icon: House,
  },
  {
    key: 'decision-hub',
    type: 'group',
    labelKey: 'nav.decisionHub',
    label: 'Decision Hub',
    icon: Compass,
    basePath: '/decision-hub',
    defaultTo: '/decision-hub/recommendation',
    children: [
      { labelKey: 'nav.recommendation', label: 'Recommendation', to: '/decision-hub/recommendation' },
      { labelKey: 'nav.compare',        label: 'Compare',         to: '/decision-hub/compare' },
      { labelKey: 'nav.costCalculator', label: 'Cost Calculator', to: '/decision-hub/cost-calculator' },
    ],
  },
  {
    key: 'analytics',
    type: 'group',
    labelKey: 'nav.analytics',
    label: 'Analytics',
    icon: ChartBar,
    basePath: '/analytics',
    defaultTo: '/analytics',
    children: [
      { labelKey: 'nav.costOverview',       label: 'Cost Overview',       to: '/analytics',            end: true },
      { labelKey: 'nav.admissionOverview',  label: 'Admission Overview',  to: '/analytics/admission' },
      { labelKey: 'nav.deadlineInsights',   label: 'Deadline Insights',   to: '/analytics/deadlines' },
      { labelKey: 'nav.rankingInsights',    label: 'Ranking Insights',    to: '/analytics/ranking' },
    ],
  },
  {
    key: 'legal',
    type: 'link',
    to: '/legal',
    labelKey: 'nav.legal',
    label: 'Legal Info',
    icon: Scales,
  },
  {
    key: 'red-flags',
    type: 'link',
    to: '/red-flags',
    labelKey: 'nav.redFlags',
    label: 'Red Flag Guide',
    icon: ShieldWarning,
  },
]

const footerLinks = [
  { to: '/settings', labelKey: 'nav.settings', label: 'Settings', icon: Gear },
  { to: '/about',    labelKey: 'nav.about',    label: 'About',    icon: Info },
]

function Sidebar() {
  const { closeSidebar, isSidebarCollapsed, toggleSidebarCollapsed, theme, t } = useAppShell()
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
      next.has(key) ? next.delete(key) : next.add(key)
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

  function isLinkActive(to, end) {
    return end
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  function getLinkClass(to, end) {
    return isLinkActive(to, end) ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
  }

  return (
    <div className="sidebar-panel">
      <Link to="/" className="sidebar-brand" onClick={closeSidebar} aria-label="Go to home page">
        <IconImage src={logoSrc} className="sidebar-logo sidebar-logo-nexa" alt="NexA Education logo" />
      </Link>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navConfig.map((item) => {
          const itemLabel = t(item.labelKey, item.label)

          if (item.type === 'link') {
            const active = isLinkActive(item.to, item.end)
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={itemLabel}
                aria-label={itemLabel}
                onClick={closeSidebar}
                className={() => getLinkClass(item.to, item.end)}
              >
                <Icon className="sidebar-link-icon" weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                <span className="sidebar-link-label">{itemLabel}</span>
              </NavLink>
            )
          }

          if (item.type === 'group') {
            const isOpen = openGroups.has(item.key)
            const isActive = location.pathname.startsWith(item.basePath)
            const Icon = item.icon

            return (
              <div key={item.key} className="sidebar-group">
                <button
                  type="button"
                  className={`sidebar-group-btn${isActive ? ' sidebar-group-btn-active' : ''}`}
                  onClick={() => handleGroupClick(item)}
                  aria-expanded={isOpen && !isSidebarCollapsed}
                  title={itemLabel}
                >
                  <Icon className="sidebar-link-icon" weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                  <span className="sidebar-link-label">{itemLabel}</span>
                  <CaretRight
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
                          childActive ? 'sidebar-sub-link sidebar-sub-link-active' : 'sidebar-sub-link'
                        }
                      >
                        {t(child.labelKey, child.label)}
                      </NavLink>
                    ))}
                  </div>
                ) : null}

                <div className="sidebar-flyout" aria-hidden="true">
                  <p className="sidebar-flyout-title">{itemLabel}</p>
                  <div className="sidebar-flyout-divider" />
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end={child.end}
                      onClick={closeSidebar}
                      className={({ isActive: childActive }) =>
                        childActive ? 'sidebar-flyout-link sidebar-flyout-link-active' : 'sidebar-flyout-link'
                      }
                    >
                      {t(child.labelKey, child.label)}
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
          const active = isLinkActive(link.to, false)
          const Icon = link.icon
          const linkLabel = t(link.labelKey, link.label)
          return (
            <NavLink
              key={link.to}
              to={link.to}
              title={linkLabel}
              aria-label={linkLabel}
              onClick={closeSidebar}
              className={() => getLinkClass(link.to, false)}
            >
              <Icon className="sidebar-link-icon" weight={active ? 'fill' : 'regular'} aria-hidden="true" />
              <span className="sidebar-link-label">{linkLabel}</span>
            </NavLink>
          )
        })}
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={toggleSidebarCollapsed}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : t('nav.collapse', 'Collapse')}
          title={isSidebarCollapsed ? 'Expand sidebar' : t('nav.collapse', 'Collapse')}
        >
          {isSidebarCollapsed
            ? <CaretRight className="sidebar-collapse-icon" aria-hidden="true" />
            : <CaretLeft  className="sidebar-collapse-icon" aria-hidden="true" />
          }
          <span className="sidebar-link-label">{t('nav.collapse', 'Collapse')}</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
