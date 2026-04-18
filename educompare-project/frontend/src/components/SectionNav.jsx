import { NavLink } from 'react-router-dom'

function SectionNav({ items, label, className = 'section-nav', linkClassName = 'section-nav-link' }) {
  return (
    <nav className={className} aria-label={label}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            isActive ? `${linkClassName} ${linkClassName}-active` : linkClassName
          }
        >
          <span className="section-nav-link-title">{item.label}</span>
          {item.description ? <span className="section-nav-link-copy">{item.description}</span> : null}
        </NavLink>
      ))}
    </nav>
  )
}

export default SectionNav
