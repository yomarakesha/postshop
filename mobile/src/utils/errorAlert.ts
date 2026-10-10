import { AxiosError } from 'axios'
import Toast from 'react-native-toast-message'
import { TFunction } from 'i18next'

const ErrorAlert = (t?: TFunction, error?: AxiosError<ApiErrorResponse, unknown> | null) => {
  const isNetworkError = error?.message === 'Network Error'

  return Toast.show({
    type: 'error',
    text1: t ? t('error') : 'Error',
    text2: isNetworkError ? 'Network Error' : undefined,
  })
}

export default ErrorAlert
