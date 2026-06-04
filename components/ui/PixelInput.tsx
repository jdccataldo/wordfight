import styles from './PixelInput.module.css'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function PixelInput({ className, ...rest }: Props) {
  return (
    <input
      className={[styles.input, className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}
