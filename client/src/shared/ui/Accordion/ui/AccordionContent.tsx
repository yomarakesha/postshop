import { Accordion as AccordionPrimitive } from 'radix-ui'
import { cn } from '#/shared/utils/cn'

export const AccordionContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) => {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          'pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-text',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}
