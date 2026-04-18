function IconImage({ src, alt = '', className = '' }) {
  return <img className={className} src={src} alt={alt} aria-hidden={alt ? undefined : true} />
}

export default IconImage
