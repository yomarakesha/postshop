import { Link, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import ArrowIcon from '#/shared/assets/icons/arrow.svg?react'

interface Props {
  href?: string
  title: string
}

export const BackLink = ({ href, title }: Props) => {
  const { t } = useTranslation()
  const router = useRouter()

  if (href) {
    return (
      <Link to={href} className="text-passive2 flex items-center gap-2 mb-4">
        <ArrowIcon width={18} height={18} />
        <p>{t(title)}</p>
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => router.history.back()}
      className="text-passive2 flex items-center gap-2 mb-4"
    >
      <ArrowIcon width={18} height={18} />
      <p>{t(title)}</p>
    </button>
  )
}
