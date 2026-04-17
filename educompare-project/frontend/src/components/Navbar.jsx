import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/recommend', label: 'Recommendation' },
  { to: '/compare', label: 'Compare' },
  { to: '/cost-calculator', label: 'Cost Calculator' },
  { to: '/legal', label: 'Legal Info' },
  { to: '/red-flags', label: 'Red Flag Guide' },
  { to: '/admin/login', label: 'Admin' },
]

function Navbar() {
  return (
    <header className="site-header">
      <div className="brand-block">
        <p className="eyebrow">UniMatch / EduCompare</p>
        <h1>Verified study-abroad comparison for real student decisions.</h1>
      </div>
      <nav className="nav-row" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default Navbar
