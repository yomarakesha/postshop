import { useTranslation } from 'react-i18next'
import { Button } from '#/shared/ui/Button'
import { SuccessScreen } from '#/shared/ui/SuccessScreen'

interface Props {
  onClose: () => void
}

export const Success = ({ onClose }: Props) => {
  const { t } = useTranslation()

  return (
    <SuccessScreen
      title={t('services.success.title')}
      description={t('services.success.description')}
    >
      <Button className="w-full" onClick={onClose}>
        {t('services.success.close')}
      </Button>
    </SuccessScreen>
  )
}
