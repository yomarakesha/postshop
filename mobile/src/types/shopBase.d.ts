declare namespace ShopBase {
  type Type = 'individual_entrepreneur' | 'legal_entity'

  type Status = 'pending' | 'approved' | 'rejected' | 'suspended'

  type WarehouseType = 'fbs' | 'fbo'

  /** Вид документа заявки: по нему модератор понимает, что за файл. */
  type DocumentKind =
    | 'individual_registration'
    | 'individual_patent'
    | 'individual_certificate'
    | 'individual_passport'
    | 'legal_charter'
    | 'legal_extract'
    | 'legal_certificate'
    | 'legal_statistics'
    | 'legal_power_of_attorney'

  /** Проверка файла антивирусом: сервер отдаёт её вместе с документом. */
  type DocumentScan = 'clean' | 'not_scanned' | 'infected'

  /**
   * Документ заявки.
   *
   * Раньше сервер отдавал просто список путей. Теперь у каждого файла есть
   * вид, исходное имя и отметка антивируса.
   */
  type Document = {
    path: string
    kind: DocumentKind | null
    original_name: string | null
    scan: DocumentScan
    uploaded_at: string | null
  }

  type Item = {
    id: number
    owner_id: number
    legal_entity_type: Type
    documents: Document[]
    is_active: boolean
    /** Закрыт платформой: открыть его владелец не может. */
    blocked_by_staff?: boolean
    registration_status: Status
    created_at: Date
    updated_at: Date
  }

  namespace API {
    type CreateBody = {
      legal_entity_type: Type
      documents: File[]
    }

    type CreateResponse = {
      id: number
      owner_id: number
      legal_entity_type: Type
      documents: Document[]
      is_active: boolean
      registration_status: 'pending'
      created_at: Date
      updated_at: Date
    }

    type UpdateDocumnentBody = {
      files: RNFile[]
      /** Вид каждого файла, в том же порядке, что и files. */
      kinds: DocumentKind[]
    }
  }
}
