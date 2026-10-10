declare namespace City {
  type Translation = {
    language: string
    name: string
  }

  type Item = {
    id: number
    translations: Translation[]
    region_id: number
    region: Region.Short
    is_active: boolean
    created_at: Date
  }

  namespace API {
    type GetAllVars = {
      skip: number
      limit: number
      region_id?: number
      country_id?: number
    }
  }
}
