import { DocumentKind, LegalEntityType } from '#/shared/openapi/requests'

export interface DocumentSlot {
  /** Подпись поля в форме. */
  labelKey: string
  /** Вид документа на сервере: по нему модератор видит, что это за файл. */
  kind: DocumentKind
}

/**
 * Поля загрузки документов — по одному на вид.
 *
 * Раньше поля знали только подпись, и на сервер уходил безымянный список
 * файлов: в админке они выглядели как «20_faf80.pdf», и понять, где паспорт,
 * а где патент, можно было, только открыв каждый.
 */
export const DOCUMENT_SLOTS: Record<LegalEntityType, Array<DocumentSlot>> = {
  [LegalEntityType.INDIVIDUAL_ENTREPRENEUR]: [
    { labelKey: 'doc.individual.registration', kind: DocumentKind.INDIVIDUAL_REGISTRATION },
    { labelKey: 'doc.individual.patent', kind: DocumentKind.INDIVIDUAL_PATENT },
    { labelKey: 'doc.individual.certificate', kind: DocumentKind.INDIVIDUAL_CERTIFICATE },
    { labelKey: 'doc.individual.passport', kind: DocumentKind.INDIVIDUAL_PASSPORT },
  ],
  [LegalEntityType.LEGAL_ENTITY]: [
    { labelKey: 'doc.legal.charter', kind: DocumentKind.LEGAL_CHARTER },
    { labelKey: 'doc.legal.extract', kind: DocumentKind.LEGAL_EXTRACT },
    { labelKey: 'doc.legal.certificate', kind: DocumentKind.LEGAL_CERTIFICATE },
    { labelKey: 'doc.legal.statistics', kind: DocumentKind.LEGAL_STATISTICS },
    { labelKey: 'doc.legal.powerOfAttorney', kind: DocumentKind.LEGAL_POWER_OF_ATTORNEY },
  ],
}
