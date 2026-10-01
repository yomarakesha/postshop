/**
 * Единая точка показа дат и времени из API — всегда по времени Ашхабада.
 *
 * Зачем: сервер отдаёт даты в UTC с зоной ("…Z"), а экраны форматировали их
 * через `new Date()`/`dayjs()`/`Intl` в часовом поясе телефона. У телефона с
 * неверным поясом (или у тестировщика не в Туркменистане) заказ «от 10:00»
 * показывался как 05:00, а под полночь — ещё и другим днём/месяцем. Все
 * пользователи в Туркменистане, поэтому время показываем по Ашхабаду,
 * независимо от настроек устройства.
 *
 * Как: если движок (Hermes) честно поддерживает `timeZone: "Asia/Ashgabat"`,
 * форматируем через него. Иначе сдвигаем момент на +5 ч и форматируем как
 * UTC — в Туркменистане нет перехода на летнее время, смещение постоянное.
 * Поддержку проверяем по результату, а не по отсутствию исключения: старые
 * сборки Hermes молча игнорировали неизвестную опцию `timeZone`.
 */

export const ASHGABAT_TIME_ZONE = "Asia/Ashgabat";

/** UTC+5 круглый год: DST в Туркменистане нет. */
const ASHGABAT_OFFSET_MS = 5 * 60 * 60 * 1000;

export type ApiDateValue = string | number | Date | null | undefined;

/** "2026-09-30" — календарная дата без времени: её не сдвигаем по поясу. */
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
/** Строка со временем, но без зоны ("…T10:00:00") — сервер пишет в UTC. */
const NAIVE_DATETIME_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

type Parsed = { date: Date; dateOnly: boolean };

const parse = (value: ApiDateValue): Parsed | null => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : { date: value, dateOnly: false };
  }
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : { date, dateOnly: false };
  }
  const raw = value.trim();
  let date: Date;
  let dateOnly = false;
  if (DATE_ONLY_RE.test(raw)) {
    // По спецификации "YYYY-MM-DD" разбирается как полночь UTC — ниже такую
    // дату форматируем в UTC, чтобы день не «уехал».
    date = new Date(`${raw}T00:00:00Z`);
    dateOnly = true;
  } else if (NAIVE_DATETIME_RE.test(raw)) {
    // Без зоны `new Date` понял бы строку как местное время телефона.
    date = new Date(`${raw.replace(" ", "T")}Z`);
  } else {
    date = new Date(raw);
  }
  return Number.isNaN(date.getTime()) ? null : { date, dateOnly };
};

/** Разбирает дату из API; `null` для пустых и битых значений. */
export const parseApiDate = (value: ApiDateValue): Date | null =>
  parse(value)?.date ?? null;

const supportsAshgabatTimeZone = (() => {
  try {
    // Полночь UTC — в Ашхабаде это 05 часов. Если опцию проигнорировали,
    // получим час по поясу телефона.
    const hour = new Intl.DateTimeFormat("en-US", {
      timeZone: ASHGABAT_TIME_ZONE,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date(Date.UTC(2020, 0, 1, 0, 0, 0)));
    return hour.replace(/\D/g, "") === "05";
  } catch {
    return false;
  }
})();

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const key = `${locale ?? ""}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    try {
      formatter = new Intl.DateTimeFormat(locale, options);
    } catch {
      // Неизвестная движку локаль (например, tk) — берём системную.
      formatter = new Intl.DateTimeFormat(undefined, options);
    }
    formatterCache.set(key, formatter);
  }
  return formatter;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Настенные часы Ашхабада для момента из API. Для календарной даты
 * ("YYYY-MM-DD") — сама эта дата, 00:00.
 */
export const getAshgabatParts = (value: ApiDateValue) => {
  const parsed = parse(value);
  if (!parsed) return null;
  const shifted = parsed.dateOnly
    ? parsed.date
    : new Date(parsed.date.getTime() + ASHGABAT_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    /** 1–12 */
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
};

/**
 * Локализованная дата/время по Ашхабаду через `Intl.DateTimeFormat`.
 * Пустое/битое значение даёт пустую строку, а не «01.01.1970» или «Invalid Date».
 */
export const formatApiDate = (
  value: ApiDateValue,
  locale: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string => {
  const parsed = parse(value);
  if (!parsed) return "";
  const lang = locale ?? undefined;
  try {
    if (parsed.dateOnly) {
      return getFormatter(lang, { ...options, timeZone: "UTC" }).format(
        parsed.date,
      );
    }
    if (supportsAshgabatTimeZone) {
      return getFormatter(lang, {
        ...options,
        timeZone: ASHGABAT_TIME_ZONE,
      }).format(parsed.date);
    }
    return getFormatter(lang, { ...options, timeZone: "UTC" }).format(
      new Date(parsed.date.getTime() + ASHGABAT_OFFSET_MS),
    );
  } catch {
    return formatApiDateTimeNumeric(value);
  }
};

/** "30.09.2026 • 14:05" по Ашхабаду — формат списков заказов. */
export const formatApiDateTimeNumeric = (value: ApiDateValue): string => {
  const p = getAshgabatParts(value);
  if (!p) return "";
  return `${pad(p.day)}.${pad(p.month)}.${p.year} • ${pad(p.hour)}:${pad(p.minute)}`;
};
