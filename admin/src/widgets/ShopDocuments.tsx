import { FileText, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getErrorMessage } from '@/shared/lib/apiError'
import type { LegalEntityType, ShopDocument } from '@/shared/openapi/requests'
import {
  DocumentKind,
  ScanStatus,
  downloadShopDocumentShopBasesShopIdDocumentsFilenameGet,
} from '@/shared/openapi/requests'
import { Badge } from '@/shared/ui/badge'
import { Label } from '@/shared/ui/label'

/** Из `uploads/documents/20_faf80.jpeg` — только имя файла. */
function getFileName(path: string) {
  const segments = path.split('/')
  return segments[segments.length - 1] || path
}

/** Какие документы нужны каждому виду собственника — как в форме на витрине. */
const KINDS_BY_ENTITY: Record<LegalEntityType, Array<DocumentKind>> = {
  individual_entrepreneur: [
    DocumentKind.INDIVIDUAL_REGISTRATION,
    DocumentKind.INDIVIDUAL_PATENT,
    DocumentKind.INDIVIDUAL_CERTIFICATE,
    DocumentKind.INDIVIDUAL_PASSPORT,
  ],
  legal_entity: [
    DocumentKind.LEGAL_CHARTER,
    DocumentKind.LEGAL_EXTRACT,
    DocumentKind.LEGAL_CERTIFICATE,
    DocumentKind.LEGAL_STATISTICS,
    DocumentKind.LEGAL_POWER_OF_ATTORNEY,
  ],
}

interface ShopDocumentsProps {
  shopId: number
  legalEntityType: LegalEntityType
  documents: Array<ShopDocument>
}

/**
 * Документы магазина: паспорт, свидетельство и прочие сканы.
 *
 * Каждый документ подписан своим видом — раньше в списке стояли имена вида
 * «20_faf80.pdf», и паспорт от патента отличался только после открытия. Рядом
 * отметка антивируса: «не проверен» у файлов, загруженных до проверки или при
 * выключенном антивирусе, — такой файл лучше не открывать на рабочем
 * компьютере без нужды. Внизу — каких документов из обязательных нет.
 *
 * Файл забирается запросом через общий клиент: прямой путь
 * `/uploads/documents/…` закрыт, а обычный `<a>` не несёт заголовок
 * Authorization.
 */
export function ShopDocuments({ shopId, legalEntityType, documents }: ShopDocumentsProps) {
  const { t } = useTranslation()
  const [pending, setPending] = useState<string | null>(null)

  async function openDocument(path: string) {
    if (pending) return

    // Вкладка открывается сразу, внутри обработчика клика: после `await`
    // жест пользователя уже «остыл», и Safari блокирует window.open.
    const tab = window.open('', '_blank')
    setPending(path)

    try {
      const { data } = await downloadShopDocumentShopBasesShopIdDocumentsFilenameGet({
        path: { shop_id: shopId, filename: getFileName(path) },
        parseAs: 'blob',
        throwOnError: true,
      })

      const url = URL.createObjectURL(data as Blob)
      if (tab) {
        tab.location.href = url
      } else {
        // Всплывающие окна запрещены настройками браузера — отдаём файл
        // загрузкой, иначе клик остался бы без всякого результата.
        const link = document.createElement('a')
        link.href = url
        link.download = getFileName(path)
        link.click()
      }
      // URL намеренно не отзывается: вкладка читает его асинхронно, и
      // revokeObjectURL оборвал бы загрузку.
    } catch (error) {
      tab?.close()
      toast.error(getErrorMessage(error))
    } finally {
      setPending(null)
    }
  }

  const required = KINDS_BY_ENTITY[legalEntityType] ?? []
  const present = new Set(documents.map((doc) => doc.kind))
  const missing = required.filter((kind) => !present.has(kind))
  // Сначала — в порядке формы, затем документы без вида (загружены до видов).
  const ordered = [...documents].sort((a, b) => {
    const rank = (doc: ShopDocument) =>
      doc.kind ? required.indexOf(doc.kind) : Number.MAX_SAFE_INTEGER
    return rank(a) - rank(b)
  })

  return (
    <div className="space-y-3 rounded-xl border px-5 py-5">
      <Label className="text-base">{t('becomeStoreRequests.documents')}</Label>
      {ordered.length > 0 ? (
        <ul className="space-y-2">
          {ordered.map((doc, index) => (
            // Путь не уникален у старых заявок: один файл записывался дважды.
            <li key={`${doc.path}-${index}`}>
              <button
                type="button"
                onClick={() => openDocument(doc.path)}
                disabled={pending !== null}
                className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-60"
              >
                {pending === doc.path ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">
                    {doc.kind ? t(`documentKind.${doc.kind}`) : t('documentKind.unknown')}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {doc.original_name ?? getFileName(doc.path)}
                  </span>
                </span>
                {doc.scan === ScanStatus.CLEAN ? (
                  <Badge variant="success" className="shrink-0 gap-1">
                    <ShieldCheck className="size-3.5" />
                    {t('documentScan.clean')}
                  </Badge>
                ) : (
                  <Badge variant="warning" className="shrink-0 gap-1">
                    <ShieldAlert className="size-3.5" />
                    {t('documentScan.notScanned')}
                  </Badge>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t('noResults')}</p>
      )}

      {missing.length > 0 && (
        <div className="space-y-1 rounded-lg bg-yellow-500/10 px-3 py-2 text-sm">
          <p className="font-medium text-yellow-700 dark:text-yellow-400">
            {t('documentKind.missing')}
          </p>
          <ul className="list-inside list-disc text-muted-foreground">
            {missing.map((kind) => (
              <li key={kind}>{t(`documentKind.${kind}`)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
