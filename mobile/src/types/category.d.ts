declare namespace Category {
  type Translation = {
    language: AppLang
    name: string
  }

  type Short = {
    id: number
    translations: Translation[]
    image_path: string
    is_active: boolean
  }

  type Item = {
    id: number
    translations: Translation[]
    parent_id?: number
    parent?: Short
    children?: Short[]
    image_path?: string
    created_at: string
    updated_at: string
  }

  namespace API {
    type GetAllVars = {
      skip: number
      limit: number
      only_parents?: boolean
      is_active?: boolean
    }
  }
}
