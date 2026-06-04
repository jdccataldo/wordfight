import styles from './PixelButton.module.css'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'love' | 'garbage' | 'ghost'
}

export default function PixelButton({ children, variant = 'primary', className, ...rest }: Props) {
  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(' ')
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}
