import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { ArrowLeft, ChevronRight } from 'lucide-react'
import type { ModalRef } from '#/shared/ui/Modal'
import type { CategoryResponse, CategoryShort } from '#/shared/openapi/requests/types.gen'
import { getTranslatedName } from '#/shared/utils/getTranslatedName'
import { Modal } from '#/shared/ui/Modal'
import { useGetCategoriesCategoriesGet } from '#/shared/openapi/queries/queries'
import { getImageUrl } from '#/shared/utils/getImageUrl'

interface CategoryModalProps {
  onSelect: (categoryId: number, categoryName: string) => void
}

export const CategoryModal = forwardRef<ModalRef, CategoryModalProps>(({ onSelect }, ref) => {
  const { t, i18n } = useTranslation()
  const modalRef = useRef<ModalRef>(null)
  // Без лимита приходило только 20 категорий из 29, и в выборе при добавлении
  // товара новых просто не было.
  const { data: categories } = useGetCategoriesCategoriesGet({
    query: { is_active: true, limit: 200 },
  })
  const [parentCategory, setParentCategory] = useState<CategoryResponse | null>(null)

  useImperativeHandle(ref, () => ({
    open: () => {
      setParentCategory(null)
      modalRef.current?.open()
    },
    close: () => modalRef.current?.close(),
  }))

  const topCategories = categories?.filter((c) => !c.parent_id && c.is_active) ?? []

  const handleSelectParent = (cat: CategoryResponse) => {
    if (cat.children.length > 0) {
      setParentCategory(cat)
    } else {
      onSelect(cat.id, getName(cat.translations))
      modalRef.current?.close()
    }
  }

  const handleSelectChild = (child: CategoryShort) => {
    onSelect(child.id, getName(child.translations))
    modalRef.current?.close()
  }

  const getName = (translations: Array<{ language: string; name: string }>) =>
    getTranslatedName(translations, i18n.language)

  return (
    <Modal ref={modalRef} className="w-full max-w-110 bg-gray2">
      <div className="p-6">
        <AnimatePresence mode="wait" initial={false}>
          {!parentCategory ? (
            <motion.div
              key="parents"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <h2 className="p1 font-bold text-center mb-5">
                {t('addProduct.categoryModalTitle')}
              </h2>
              <div className="flex flex-col gap-1.5 max-h-96 overflow-y-auto no-scrollbar">
                {topCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectParent(cat)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {cat.image_path && (
                        <img
                          src={getImageUrl(cat.image_path)}
                          alt=""
                          className="size-8 rounded-lg object-cover"
                        />
                      )}
                      <span className="p3 font-medium">{getName(cat.translations)}</span>
                    </div>
                    {cat.children.length > 0 && (
                      <ChevronRight size={18} className="text-passive2" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="children"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setParentCategory(null)}
                  className="text-passive2"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="p1 font-bold">{getName(parentCategory.translations)}</h2>
              </div>
              <div className="flex flex-col gap-1.5 max-h-96 overflow-y-auto no-scrollbar">
                {parentCategory.children
                  .filter((c) => c.is_active)
                  .map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => handleSelectChild(child)}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-white rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      {child.image_path && (
                        <img
                          src={getImageUrl(child.image_path)}
                          alt=""
                          className="size-8 rounded-lg object-cover"
                        />
                      )}
                      <span className="p3 font-medium">{getName(child.translations)}</span>
                    </button>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  )
})

CategoryModal.displayName = 'CategoryModal'
