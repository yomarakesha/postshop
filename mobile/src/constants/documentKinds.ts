/**
 * Виды документов заявки — по одному на поле формы «Стать продавцом».
 *
 * Сервер принимает документы только вместе с их видом: модератор должен
 * видеть, где паспорт, а где патент, не открывая каждый файл. Порядок здесь
 * совпадает с порядком подписей в переводах
 * (`client.sellerDocs.docs.individual` и `.legal`) — файл и его вид уходят на
 * сервер парой по номеру поля, поэтому порядок менять нельзя, не поменяв
 * подписи во всех четырёх языках.
 */
export const DOCUMENT_KINDS: Record<ShopBase.Type, ShopBase.DocumentKind[]> = {
  individual_entrepreneur: [
    'individual_registration',
    'individual_patent',
    'individual_certificate',
    'individual_passport',
  ],
  legal_entity: [
    'legal_charter',
    'legal_extract',
    'legal_certificate',
    'legal_statistics',
    'legal_power_of_attorney',
  ],
}
