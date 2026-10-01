import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

type Axis = 'latitude' | 'longitude'

const LIMIT: Record<Axis, number> = { latitude: 90, longitude: 180 }

/**
 * Проверка координаты для валидатора поля формы.
 *
 * Раньше проверялось только «не пусто», а координаты задавались лишь щелчком
 * по карте. Без VITE_MAP_TILES_URL карта не рисуется, полей ввода не было —
 * и создать пункт выдачи было невозможно вообще: сервер требует обе
 * координаты. Теперь их можно ввести руками, поэтому нужен и диапазон.
 */
export const validateCoordinate = (value: string, axis: Axis, t: (key: string) => string) => {
  const raw = value.trim()
  if (!raw) return t(`pickupPoints.${axis}Required`)
  const number = Number(raw)
  if (!Number.isFinite(number) || Math.abs(number) > LIMIT[axis]) {
    return t(`pickupPoints.${axis}Invalid`)
  }
  return undefined
}

interface CoordinateField {
  value: string
  errors: readonly unknown[]
  onChange: (value: string) => void
  onBlur: () => void
}

/**
 * Широта и долгота — всегда видимые поля рядом с картой.
 *
 * Карта пишет в те же поля формы: щелчок по ней заполняет оба числа, а
 * введённые вручную числа переносят маркер.
 */
export function CoordinateFields({
  latitude,
  longitude,
  t,
}: {
  latitude: CoordinateField
  longitude: CoordinateField
  t: (key: string) => string
}) {
  const fields: [Axis, CoordinateField][] = [
    ['latitude', latitude],
    ['longitude', longitude],
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map(([axis, field]) => (
        <div key={axis} className="space-y-1.5">
          <Label htmlFor={axis}>
            {t(`pickupPoints.${axis}`)} <span className="text-destructive">*</span>
          </Label>
          {/* step="any": у числового поля шаг по умолчанию 1, и браузер
            отказывал в отправке любой дробной координаты. Диапазон проверяет
            валидатор формы — своим текстом, а не подсказкой браузера. */}
          <Input
            id={axis}
            type="number"
            step="any"
            inputMode="decimal"
            placeholder={t(`pickupPoints.${axis}Placeholder`)}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            aria-invalid={field.errors.length > 0}
          />
          {field.errors.length > 0 ? (
            <p className="text-destructive text-xs">{String(field.errors[0])}</p>
          ) : (
            <p className="text-muted-foreground text-xs">{t(`pickupPoints.${axis}Hint`)}</p>
          )}
        </div>
      ))}
    </div>
  )
}
