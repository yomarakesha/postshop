import { useRef } from 'react'
import Lottie from 'lottie-react'
import { motion } from 'motion/react'
import type { LottieRefCurrentProps } from 'lottie-react'
import successAnimation from '#/shared/assets/lotties/success.json'

interface SuccessScreenProps {
  title: string
  description?: string
  /** Кнопки под текстом: одна «Закрыть» или несколько вариантов действия. */
  children?: React.ReactNode
}

/**
 * Экран «получилось» с галочкой: заявка продавца, оформленный заказ, вход.
 *
 * Раньше эта разметка была скопирована в двух местах с разными задержками,
 * а появление занимало 1.2 с — до появления кнопки приходилось ждать, и это
 * читалось как подвисание. Здесь анимация ускорена (Lottie быстрее, задержки
 * короче), а сам экран стал общим, чтобы подтверждения выглядели одинаково.
 */
export const SuccessScreen = ({ title, description, children }: SuccessScreenProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  return (
    <div className="flex flex-col items-center p-8 text-center">
      <div className="size-40">
        <Lottie
          lottieRef={lottieRef}
          animationData={successAnimation}
          loop={false}
          // Скорость задаётся только через ref: пропса speed у Lottie нет.
          onDOMLoaded={() => lottieRef.current?.setSpeed(1.6)}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.22 }}
        className="flex flex-col gap-3"
      >
        <p className="p1 font-semibold">{title}</p>
        {description && <p className="p3 text-passive2">{description}</p>}
      </motion.div>

      {children && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.22 }}
          className="mt-6 flex w-full gap-3"
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}
