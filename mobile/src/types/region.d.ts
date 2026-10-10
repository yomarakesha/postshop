declare namespace Region {
  type Translation = {
    language: string
    name: string
  }

  type Item = {
    id: number
    translations: Translation[]
    country_id: number
    country: {
      id: number
      iso_code: string
      translations: Region.Translation[]
    }
    is_active: boolean
    created_at: Date
    updated_at: Date
  }

  type Short = Pick<Item, 'id' | 'translations'>
}
