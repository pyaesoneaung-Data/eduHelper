function InfoCard({ title, children, tone = 'default', eyebrow }) {
  return (
    <section className={`info-card info-card-${tone}`}>
      <div className="info-card-head">
        {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
        <h3>{title}</h3>
      </div>
      <div>{children}</div>
    </section>
  )
}

export default InfoCard
