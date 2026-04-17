function InfoCard({ title, children, tone = 'default' }) {
  return (
    <section className={`info-card info-card-${tone}`}>
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  )
}

export default InfoCard
