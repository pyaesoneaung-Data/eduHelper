import { useState } from 'react'

function IconImage({ src, alt = '', className = '' }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const hasError = failedSrc === src

  if (hasError) {
    return <span className={`${className} icon-fallback`} aria-hidden={alt ? undefined : true} />
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      onError={() => setFailedSrc(src)}
    />
  )
}

export default IconImage
