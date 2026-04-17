function PageHeader({ eyebrow, title, description, children }) {
  return (
    <section className="page-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      <p className="page-description">{description}</p>
      {children ? <div className="page-actions">{children}</div> : null}
    </section>
  )
}

export default PageHeader
