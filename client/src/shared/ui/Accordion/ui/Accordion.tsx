import { Accordion as AccordionPrimitive } from 'radix-ui'
import { cn } from '#/shared/utils/cn'

export const Accordion = ({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) => {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  )
}
