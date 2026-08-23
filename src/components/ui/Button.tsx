import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'soft'
  | 'ghost'
  | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-full text-center font-black transition duration-200 outline-none focus-visible:ring-4 focus-visible:ring-azur-400/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-azur-400 text-slate-950 shadow-lg shadow-azur-500/20 hover:-translate-y-0.5 hover:bg-azur-300',
  secondary:
    'border border-white/10 bg-white/5 text-slate-100 hover:-translate-y-0.5 hover:bg-white/10',
  soft: 'border border-azur-400/20 bg-azur-400/10 text-azur-200 hover:-translate-y-0.5 hover:bg-azur-400/20',
  ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
  danger:
    'border border-red-400/20 bg-red-400/10 text-red-200 hover:-translate-y-0.5 hover:bg-red-400/20',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3',
}

type StyleProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}

type CommonProps = StyleProps & {
  children: ReactNode
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

type ButtonAsLink = CommonProps & {
  to: string
}

export type ButtonProps = ButtonAsButton | ButtonAsLink

function buildClassName({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: StyleProps) {
  return [
    BASE_CLASS,
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export default function Button(props: ButtonProps) {
  if ('to' in props && props.to) {
    const { to, variant, size, fullWidth, className, children } = props

    return (
      <Link
        to={to}
        className={buildClassName({ variant, size, fullWidth, className })}
      >
        {children}
      </Link>
    )
  }

  const { variant, size, fullWidth, className, children, ...buttonProps } =
    props as ButtonAsButton

  return (
    <button
      className={buildClassName({ variant, size, fullWidth, className })}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
