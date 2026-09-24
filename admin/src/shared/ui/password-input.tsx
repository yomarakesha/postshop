import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { useState } from 'react'

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './input-group'
import { cn } from '@/shared/lib/utils'

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <InputGroup className={cn('h-10', className)}>
      <InputGroupAddon>
        <InputGroupText>
          <KeyRound className="size-4 text-muted-foreground" />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput className="h-10" type={visible ? 'text' : 'password'} {...props} />
      <InputGroupAddon align="inline-end">
        <button
          type="button"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setVisible(!visible)}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <span className="block">
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </span>
        </button>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
