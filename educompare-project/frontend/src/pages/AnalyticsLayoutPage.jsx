import { NavLink, Outlet } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const analyticsNavItems = [
  { to: '/analytics', label: 'Cost Overview', end: true },
  { to: '/analytics/admission', label: 'Admission Overview' },
  { to: '/analytics/deadlines', label: 'Deadline Insights' },
  { to: '/analytics/ranking', label: 'Ranking Insights' },
]

function AnalyticsLayoutPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Analytics"
        title="Compare study-abroad decisions through clear, verified summaries."
        description="Use analytics views to inspect cost and admission patterns without leaving the main application flow."
      />

      <section className="analytics-shell">
        <nav className="analytics-nav" aria-label="Analytics sections">
          {analyticsNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'analytics-nav-link analytics-nav-link-active' : 'analytics-nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="analytics-content">
          <Outlet />
        </div>
      </section>
    </div>
  )
}

export default AnalyticsLayoutPage
