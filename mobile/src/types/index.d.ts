declare module '*.svg' {
  import React from 'react'
  import { SvgProps } from 'react-native-svg'
  const content: React.FC<SvgProps & { style?: { color: string } }>
  export default content
}

type SvgType = FC<SvgProps & { style?: { color: string } }>

type RNFile = {
  uri: string
  name: string
  type: string
}

declare module '*.png'
declare module '*.webp'
declare module '*.jpeg'

type AppTheme = 'dark' | 'light' | 'system'
type AppLang = 'tk' | 'ru' | 'en' | 'tr'

type ApiErrorResponse = {
  detail: [
    {
      loc: [string, 0]
      msg: string
      type: string
      input: string
      ctx: {}
    },
  ]
}
