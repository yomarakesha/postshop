import { useTranslation } from 'react-i18next'
import { LogIn } from 'lucide-react'
import { Button } from '#/shared/ui/Button'
import { useProfileStore } from '#/shared/stores/profileStore'

interface Props {
  onClose: () => void
  description: string
}

export const LoginRequired = ({ onClose, description }: Props) => {
  const { t } = useTranslation()
  const openLoginModal = useProfileStore((store) => store.openLoginModal)

  // Окно сообщало о проблеме и не давало её решить: единственная кнопка
  // «Закрыть» возвращала человека туда же. Теперь оно ведёт прямо к входу.
  const handleLogin = () => {
    onClose()
    openLoginModal()
  }

  return (
    <div className="p-6 flex flex-col items-center gap-6 text-center">
      <div className="size-32 rounded-full bg-blue2 flex items-center justify-center text-blue-main">
        <LogIn size={56} strokeWidth={2} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="p1 font-bold">{t('services.loginRequired.title')}</h3>
        <p className="p3 text-passive2">{description}</p>
      </div>
      <Button className="w-full" onClick={handleLogin}>
        {t('services.loginRequired.login')}
      </Button>
    </div>
  )
}
