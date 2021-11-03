import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import styles from '~/../styles/components/NavBar/NavBarLink.module.scss'

type Props = {
  href: string
  text: string
}

export const NavBarLink = ({ href, text }: Props) => {
  return (
    <Link href={href}>
      <a className={styles.link}>
        {text}
      </a>
    </Link>
  )
}
