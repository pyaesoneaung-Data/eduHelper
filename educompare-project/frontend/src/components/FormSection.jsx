function FormSection({ title, description, children }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="form-grid">{children}</div>
    </section>
  )
}

export default FormSection
