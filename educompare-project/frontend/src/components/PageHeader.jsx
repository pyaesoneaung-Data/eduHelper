function PageHeader({ eyebrow, title, description, children }) {
  return (
    <section className="page-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <div className="page-header-copy">
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {children ? <div className="page-actions">{children}</div> : null}
    </section>
  )
}

export default PageHeader
