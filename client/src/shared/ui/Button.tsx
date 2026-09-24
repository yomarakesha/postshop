import { cn } from '../utils/cn'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'lg',
  className,
  leftIcon,
  children,
  ...rest
}: Props) => {
  return (
    <button
      /*
       * active:scale — отклик на нажатие для КАЖДОЙ кнопки витрины.
       * Раньше его не было нигде: кнопка не подтверждала нажатие, и на
       * медленном ответе сервера человек жал второй раз. Одна строка здесь
       * закрывает это во всём интерфейсе.
       *
       * transition-[transform,background-color] вместо transition-all: all
       * анимирует и размеры, из-за чего кнопки с меняющимся текстом
       * («Сохранить» → «Сохранение…») уезжают шириной.
       */
      className={cn(
        'flex gap-2 items-center transition-[transform,background-color,color] duration-150 ease-out',
        'active:scale-[0.97] disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {leftIcon}
      {children}
    </button>
  )
}

const variants = {
  primary:
    'bg-blue-main text-white p3 font-medium px-6 flex items-center justify-center rounded-base disabled:bg-gray-200 disabled:text-gray-400',
  secondary:
    'bg-white text-blue-main border border-blue-main p3 font-medium px-6 flex items-center justify-center rounded-base disabled:border-gray-200 disabled:text-gray-400',
  tertiary:
    'bg-gray2 p3 font-medium px-6 flex items-center justify-center rounded-base disabled:text-passive1',
  danger: 'bg-failure text-white rounded-base p3 font-medium px-6 flex items-center justify-center',
}

const sizes = {
  sm: 'min-h-7.5',
  md: 'min-h-10',
  lg: 'min-h-12',
}
