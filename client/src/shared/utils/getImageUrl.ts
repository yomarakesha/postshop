export const getImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined
  else if (!url.startsWith('http')) {
    return import.meta.env.VITE_BACKEND_API_URL + '/' + url
  }
  return url
}
