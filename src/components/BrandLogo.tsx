import { useState } from 'react'

const LOGO_SRC = '/logo.png'

type BrandLogoProps = {
  /** Taille / forme du logo (ex. `h-12 w-12`). */
  className?: string
  /** Classes du repli (tuile azur) si l'image n'est pas encore déposée. */
  fallbackClassName?: string
  alt?: string
}

/**
 * Logo de marque de Carnet de sport (avatar rond « Chloé »). Tant que
 * `/logo.png` n'est pas déposé, on affiche une tuile azur avec un éclair —
 * rien ne casse.
 */
export default function BrandLogo({
  className = '',
  fallbackClassName = '',
  alt = 'Carnet de sport',
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false)

  if (!failed) {
    return (
      <img
        src={LOGO_SRC}
        alt={alt}
        onError={() => setFailed(true)}
        className={`object-contain ${className}`}
      />
    )
  }

  return (
    <span
      className={`flex items-center justify-center rounded-2xl border border-azur-400/30 bg-gradient-to-br from-azur-400/25 to-azur-600/10 text-2xl shadow-lg shadow-azur-500/10 ${className} ${fallbackClassName}`}
    >
      ⚡
    </span>
  )
}
