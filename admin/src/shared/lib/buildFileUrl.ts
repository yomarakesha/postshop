import { BACKEND_URL } from '@/shared/constants/backendUrl'

export function buildFileUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  return `${BACKEND_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
