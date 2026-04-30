import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * BackButton — navigates to the previous page in browser history.
 * Falls back to `fallback` prop (default "/") if there is no previous
 * history entry in the current session (e.g. direct URL access).
 *
 * React Router v6 sets window.history.state.idx starting at 0 for the
 * first page visited. idx > 0 means there is a page to go back to.
 */
function BackButton({ fallback = '/' }) {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button type="button" className="back-button" onClick={handleBack}>
      <ArrowLeft size={14} aria-hidden="true" />
      <span>Back</span>
    </button>
  )
}

export default BackButton
