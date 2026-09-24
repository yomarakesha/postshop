import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  ChevronRight,
  Circle,
  CircleCheckBig,
  Image as ImageIcon,
  MapPin,
  Palette,
  Phone,
  Store,
  Warehouse,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import type { ModalRef } from '#/shared/ui/Modal'
import { useShopAdditional } from '#/shared/hooks/useShopAdditional'
import { useFeatures } from '#/shared/hooks/useFeatures'
import { useCreateShopAdditionalShopAdditionalsPost } from '#/shared/openapi/queries'
import { WarehouseType } from '#/shared/openapi/requests'
import { AddressesModal } from '#/pages/my-store-activate/ui/AddressesModal'
import { CityModal } from '#/pages/my-store-activate/ui/CityModal'
import { ColorModal } from '#/pages/my-store-activate/ui/ColorModal'
import { LogoModal } from '#/pages/my-store-activate/ui/LogoModal'
import { NameModal } from '#/pages/my-store-activate/ui/NameModal'
import { PhoneNumbersModal } from '#/pages/my-store-activate/ui/PhoneNumbersModal'
import { WarehouseTypeModal } from '#/pages/my-store-activate/ui/WarehouseTypeModal'
import { cn } from '#/shared/utils/cn'
import { Spinner } from '#/shared/ui/Spinner'
import { useRefreshProfile } from '#/shared/hooks/useRefreshProfile'
import { getImageUrl } from '#/shared/utils/getImageUrl'
import { settled } from '#/shared/lib/settled'

interface Todo {
  id: string
  titleKey: string
  descriptionKey: string
  icon: LucideIcon
}

const todos: Array<Todo> = [
  // Шаг стоит первым и создаёт профиль магазина: тип склада обязателен, и без
  // него остальные шаги записывать некуда. Раньше шаг был закомментирован, а
  // FBS прошит в коде — тип не выбирал никто.
  {
    id: 'warehouse_type',
    titleKey: 'storeActivate.todos.warehouseType',
    descriptionKey: 'storeActivate.todos.warehouseTypeDesc',
    icon: Warehouse,
  },
  {
    id: 'city',
    titleKey: 'storeActivate.todos.city',
    descriptionKey: 'storeActivate.todos.cityDesc',
    icon: Building2,
  },
  {
    id: 'name',
    titleKey: 'storeActivate.todos.name',
    descriptionKey: 'storeActivate.todos.nameDesc',
    icon: Store,
  },
  {
    id: 'addresses',
    titleKey: 'storeActivate.todos.addresses',
    descriptionKey: 'storeActivate.todos.addressesDesc',
    icon: MapPin,
  },
  {
    id: 'phone_numbers',
    titleKey: 'storeActivate.todos.phoneNumbers',
    descriptionKey: 'storeActivate.todos.phoneNumbersDesc',
    icon: Phone,
  },
  {
    id: 'color',
    titleKey: 'storeActivate.todos.color',
    descriptionKey: 'storeActivate.todos.colorDesc',
    icon: Palette,
  },
  {
    id: 'logo',
    titleKey: 'storeActivate.todos.logo',
    descriptionKey: 'storeActivate.todos.logoDesc',
    icon: ImageIcon,
  },
]

interface StoreTodoListProps {
  storeId: number
  title?: string
  subtitle?: string
  showHeader?: boolean
  showStatus?: boolean
  disableWarehouseType?: boolean
  footer?: (allCompleted: boolean) => React.ReactNode
}

export const StoreTodoList = ({
  storeId,
  title,
  subtitle,
  showHeader = true,
  showStatus = true,
  disableWarehouseType = false,
  footer,
}: StoreTodoListProps) => {
  const { t } = useTranslation()
  const warehouseTypeModalRef = useRef<ModalRef>(null)
  const cityModalRef = useRef<ModalRef>(null)
  const nameModalRef = useRef<ModalRef>(null)
  const addressesModalRef = useRef<ModalRef>(null)
  const phoneNumbersModalRef = useRef<ModalRef>(null)
  const colorModalRef = useRef<ModalRef>(null)
  const logoModalRef = useRef<ModalRef>(null)
  const [pendingTodo, setPendingTodo] = useState<string | null>(null)

  // Тип склада — выбор между FBS и FBO. Пока склад платформы выключен
  // (FBO_ENABLED=false), выбирать нечего: платформа товар не хранит, и
  // магазин может работать только по FBS. Шаг скрыт, а профиль создаётся с FBS.
  const { fboEnabled } = useFeatures()
  const createShopAdditional = useCreateShopAdditionalShopAdditionalsPost()

  const { data: additional, isLoading, refetch } = useShopAdditional(storeId)

  const completed: Record<string, boolean> = {
    warehouse_type: !!additional?.warehouse_type,
    city: !!additional?.city_id,
    name: !!additional?.name && !!additional.description,
    addresses: !!additional?.addresses?.length,
    phone_numbers: !!additional?.phone_numbers?.length,
    color: !!additional?.color,
    logo: !!additional?.logo_path,
  }

  // Пока складской учёт выключен, шага с типом склада в списке нет — иначе он
  // висел бы невыполненным и не давал довести подготовку магазина до конца.
  // В информации о магазине шаг остаётся всегда: там он показывает, какой тип
  // выбран, — магазину FBO это важно знать и при выключенном складе.
  const visibleTodos =
    fboEnabled || disableWarehouseType
      ? todos
      : todos.filter((todo) => todo.id !== 'warehouse_type')

  const completedCount = visibleTodos.filter((todo) => completed[todo.id]).length
  const totalCount = visibleTodos.length
  const allCompleted = completedCount === totalCount
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const openTodoModal = (id: string) => {
    if (id === 'warehouse_type') warehouseTypeModalRef.current?.open()
    if (id === 'city') cityModalRef.current?.open()
    if (id === 'name') nameModalRef.current?.open()
    if (id === 'addresses') addressesModalRef.current?.open()
    if (id === 'phone_numbers') phoneNumbersModalRef.current?.open()
    if (id === 'color') colorModalRef.current?.open()
    if (id === 'logo') logoModalRef.current?.open()
  }

  const handleTodoClick = async (id: string) => {
    if (id === 'warehouse_type' && disableWarehouseType) return

    // Профиля ещё нет — а создать его без типа склада нельзя. Раньше он
    // создавался молча с прошитым FBS, каким бы шагом ни начинали. Теперь любой
    // шаг сначала уводит к выбору типа: он же и создаёт профиль.
    if (!additional) {
      // При выключенном складе платформы выбирать нечего: создаём профиль FBS
      // и сразу открываем тот шаг, на который нажали.
      if (!fboEnabled) {
        const created = await settled(
          createShopAdditional.mutateAsync({
            body: { shop_base_id: storeId, warehouse_type: WarehouseType.FBS },
          }),
        )
        if (!created?.data) return
        refetch()
        setPendingTodo(id)
        return
      }

      setPendingTodo(id === 'warehouse_type' ? null : id)
      warehouseTypeModalRef.current?.open()
      return
    }
    openTodoModal(id)
  }

  useEffect(() => {
    if (pendingTodo && additional) {
      openTodoModal(pendingTodo)
      setPendingTodo(null)
    }
  }, [pendingTodo, additional])

  const refreshProfile = useRefreshProfile()

  const handleSave = () => {
    refetch()
    // Название и логотип магазина живут ещё и в профиле: из него их берут
    // шапка и выбор магазина. Без этого переименованный магазин оставался под
    // старым именем везде, кроме этой страницы.
    refreshProfile()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {showHeader && (
        <section className="bg-white rounded-base shadow-base p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-semibold">{title}</h3>
            <p className="p3 text-passive2">{subtitle}</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="t1 font-medium text-passive2">{t('storeActivate.completedSteps')}</p>
              <p className="t1 font-semibold">
                {completedCount} / {totalCount}
              </p>
            </div>
            <div className="h-2 w-full bg-gray3 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-main rounded-full transition-[width] duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>
      )}

      <ul className="flex flex-col gap-3">
        {visibleTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            completed={completed[todo.id]}
            showStatus={showStatus}
            disabled={todo.id === 'warehouse_type' && disableWarehouseType}
            description={
              // Выбранный тип после активации меняет только администратор —
              // вместо призыва «выберите» показываем, что выбрано.
              todo.id === 'warehouse_type' && disableWarehouseType && additional?.warehouse_type
                ? t('storeActivate.todos.warehouseTypeLocked', {
                    type: t(`storeActivate.warehouseTypeModal.${additional.warehouse_type}.name`),
                  })
                : undefined
            }
            onClick={() => handleTodoClick(todo.id)}
          />
        ))}
      </ul>

      {footer?.(allCompleted)}

      {/* Вне блока «если профиль есть»: именно эта модалка профиль и создаёт. */}
      <WarehouseTypeModal
        ref={warehouseTypeModalRef}
        storeId={storeId}
        shopAdditionalId={additional?.id}
        initialType={additional?.warehouse_type}
        onSave={handleSave}
      />

      {additional && (
        <>
          <CityModal
            ref={cityModalRef}
            shopAdditionalId={additional.id}
            initialCityId={additional.city_id}
            onSave={handleSave}
          />
          <NameModal
            ref={nameModalRef}
            shopAdditionalId={additional.id}
            initialName={additional.name ?? ''}
            initialDescription={additional.description ?? ''}
            onSave={handleSave}
          />
          <AddressesModal
            ref={addressesModalRef}
            shopAdditionalId={additional.id}
            initialAddresses={additional.addresses ?? []}
            onSave={handleSave}
          />
          <PhoneNumbersModal
            ref={phoneNumbersModalRef}
            shopAdditionalId={additional.id}
            initialPhoneNumbers={additional.phone_numbers ?? []}
            onSave={handleSave}
          />
          <ColorModal
            ref={colorModalRef}
            shopAdditionalId={additional.id}
            initialColor={additional.color}
            initialColorText={additional.color_text}
            storeName={additional.name ?? ''}
            storeLogo={getImageUrl(additional.logo_path)}
            onSave={handleSave}
          />
          <LogoModal
            ref={logoModalRef}
            shopAdditionalId={additional.id}
            initialLogoPath={getImageUrl(additional.logo_path)}
            onSave={handleSave}
          />
        </>
      )}
    </div>
  )
}

interface TodoItemProps {
  todo: Todo
  completed: boolean
  showStatus: boolean
  disabled?: boolean
  /** Текст вместо описания шага по умолчанию. */
  description?: string
  onClick: () => void
}

const TodoItem = ({
  todo,
  completed,
  showStatus,
  disabled = false,
  description,
  onClick,
}: TodoItemProps) => {
  const { t } = useTranslation()
  const Icon = todo.icon

  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'group w-full bg-white rounded-base shadow-base p-4 text-left',
          'flex items-center gap-4 transition-colors',
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray1',
        )}
      >
        <div
          className={cn(
            'size-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            completed ? 'bg-blue2 text-blue-main' : 'bg-gray2 text-passive2',
          )}
        >
          <Icon size={22} strokeWidth={2} />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="p3 font-semibold">{t(todo.titleKey)}</p>
          </div>
          <p className="t1 text-passive2 truncate">{description ?? t(todo.descriptionKey)}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {showStatus &&
            (completed ? (
              <CircleCheckBig size={22} strokeWidth={1.5} className="text-blue-main" />
            ) : (
              <Circle size={22} strokeWidth={1.5} className="text-passive1" />
            ))}
          {!disabled && (
            <ChevronRight
              size={20}
              className="text-passive1 transition-transform group-hover:translate-x-0.5"
            />
          )}
        </div>
      </button>
    </li>
  )
}
