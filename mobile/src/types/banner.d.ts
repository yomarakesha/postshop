declare namespace Banner {
  /** Место на странице; порядок объявления задаёт порядок показа. */
  type Position = 'home_top' | 'home_middle' | 'home_bottom'

  type Image = {
    language: string
    image_path: string
  }

  type Item = {
    id: number
    name: string
    position: Position
    link?: string
    is_active: boolean
    priority: number
    start_date: string
    end_date: string
    images: Image[]
    created_at: string
    updated_at: string
  }

  namespace API {
    type GetAllVars = {
      skip?: number
      limit?: number
      only_active?: boolean
      /** Без него придут баннеры всех трёх мест сразу. */
      position?: Position
    }
  }
}
