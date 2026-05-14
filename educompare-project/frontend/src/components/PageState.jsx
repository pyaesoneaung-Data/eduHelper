function PageState({ loading, error }) {
  if (error) {
    return (
      <div className="error-banner" role="alert">
        <p>{error}</p>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="page-loader" aria-label="Loading" aria-busy="true">
        <div className="skeleton-row" />
        <div className="skeleton-row" />
        <div className="skeleton-row" />
        <div className="skeleton-row" />
      </div>
    )
  }
  return null
}

export default PageState
