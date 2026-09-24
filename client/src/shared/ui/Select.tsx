import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../utils/cn'

export interface SelectOption {
  label: string
  value: string
}

interface Props {
  options: Array<SelectOption>
  value?: string
  onChange?: (value: string) => void
  label?: string
  required?: boolean
  placeholder?: string
  className?: string
}

export const Select = ({
  options,
  value,
  onChange,
  label,
  required,
  placeholder = 'Saýlaň',
  className,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={cn('relative flex flex-col gap-1.5', className)}>
      {label && (
        <label className="p3 font-medium">
          {label} {required && <span className="text-failure">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p3 px-3 py-2.5 border border-border rounded-base bg-white hover:border-blue-main transition-colors cursor-pointer"
      >
        <span className={selected ? 'text-(--text)' : 'text-passive1'}>
          {selected?.label ?? placeholder}
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-passive2" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            /* max-h + overflow: список рос по числу вариантов и уходил за низ
               экрана — у магазина с полусотней товаров выбрать нижние было
               нельзя, а страница под ним переставала прокручиваться. */
            className="absolute top-full left-0 mt-1 max-h-60 w-full overflow-y-auto rounded-xl bg-white shadow-base py-1 z-20 border border-stroke"
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange?.(option.value)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex items-center justify-between px-4 py-2.5 p3 cursor-pointer hover:bg-gray2 transition-colors',
                  option.value === value && 'font-medium text-blue-main',
                )}
              >
                {option.label}
                {option.value === value && <Check size={16} />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
