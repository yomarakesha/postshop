import { stockApi } from "@/api/stockApi";
import HeaderSheet from "@/components/BottomSheet/HeaderSheet";
import { UniTrueSheet } from "@/ui/BottomSheet";
import Button from "@/ui/Button";
import CustomTextInput from "@/ui/CustomTextInput";
import Typography from "@/ui/Typography";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { AxiosError } from "axios";
import { TFunction } from "i18next";
import React, { RefObject, useEffect, useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";

/** Пересчёт — не тип операции, а свой метод: разницу считает сервер. */
type Mode = Stock.ManualOperation | "set";

const MODES: Mode[] = ["income", "return_to_supplier", "set"];

export type StockTarget = {
  productId: number;
  measureUnitId: number;
  name: string;
  /** Сколько доступно сейчас — показываем над выбором действия. */
  available: number;
};

type Props = {
  ref: RefObject<TrueSheet | null>;
  shopId: number;
  target: StockTarget | null;
  t: TFunction;
};

/** Текст отказа сервера: у HTTPException detail — строка, у ошибок схемы — список. */
const serverMessage = (error: unknown) => {
  const detail = (error as AxiosError<{ detail?: unknown }>)?.response?.data
    ?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  return undefined;
};

/**
 * Изменение остатка прямо из списка товаров — как на витрине
 * (`pages/my-store-products/ui/StockModal`).
 *
 * Три действия. «Приход» и «Возврат поставщику» описывают то, что физически
 * произошло с товаром, а «Указать остаток» — пересчёт: продавец называет итог,
 * разницу записывает сервер. Без пересчёта полку сводили выдуманным приходом
 * или возвратом, которого не было.
 */
const StockSheet = ({ ref, shopId, target, t }: Props) => {
  const [mode, setMode] = useState<Mode>("income");
  const [quantity, setQuantity] = useState("");
  const createOperation = stockApi.useCreateOperation();
  const setStock = stockApi.useSetStock();
  const busy = createOperation.isPending || setStock.isPending;

  // Каждый товар открывается с чистой формой: число от прошлого товара в поле
  // пересчёта — готовая ошибка.
  useEffect(() => {
    setMode("income");
    setQuantity("");
  }, [target?.productId]);

  // Поле ввода остаётся в фокусе и после закрытия окна — тогда первое
  // нажатие на экране уходило на снятие фокуса и терялось. Снимаем сами.
  const close = () => {
    Keyboard.dismiss();
    ref.current?.dismiss();
  };

  const submit = async () => {
    if (!target) return;
    const amount = Number(quantity.replace(",", "."));
    // Пересчёт принимает ноль: «не осталось ничего» — обычный его исход.
    const valid =
      quantity.trim() !== "" &&
      Number.isFinite(amount) &&
      (mode === "set" ? amount >= 0 : amount > 0);
    if (!valid) {
      Toast.show({
        type: "error",
        text1: t(
          mode === "set"
            ? "store.stock.amountRequired"
            : "store.stock.quantityRequired",
        ),
      });
      return;
    }

    const body = {
      shop_id: shopId,
      product_id: target.productId,
      measure_unit_id: target.measureUnitId,
      quantity: amount,
    };
    try {
      if (mode === "set") await setStock.mutateAsync(body);
      else await createOperation.mutateAsync({ ...body, operation_type: mode });
      Toast.show({
        type: "success",
        text1: t(mode === "set" ? "store.stock.setSaved" : "store.stock.saved"),
      });
      close();
    } catch (error) {
      // Причину отказа показываем как есть: «остаток не изменился», «нельзя
      // уйти в минус» — это осмысленные ответы, а не сбой.
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: serverMessage(error),
      });
    }
  };

  return (
    <UniTrueSheet ref={ref} detents={["auto"]} style={styles.wrapper}>
      <HeaderSheet title={t("store.stock.operationTitle")} onClose={close} />
      <View style={styles.content}>
        {target && (
          <View style={styles.target}>
            <Typography variant="p3" weight="medium" numberOfLines={2}>
              {target.name}
            </Typography>
            <Typography variant="t1" color="secondary">
              {t("store.stock.available", { count: target.available })}
            </Typography>
          </View>
        )}

        {/* Действия — переключателями в ряд, пояснение только к выбранному.
            Три карточки с пояснениями были такими высокими, что открытая
            клавиатура закрывала поле количества и кнопку «Записать». */}
        <View style={styles.modes}>
          {MODES.map((value) => (
            <Pressable
              key={value}
              onPress={() => setMode(value)}
              style={styles.mode(mode === value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: mode === value }}
            >
              <Typography
                variant="t1"
                weight="medium"
                isCentered
                color={mode === value ? "main" : undefined}
              >
                {t(`store.stock.operations.${value}`)}
              </Typography>
            </Pressable>
          ))}
        </View>
        <Typography variant="t1" color="secondary">
          {t(`store.stock.operationsHint.${mode}`)}
        </Typography>

        <CustomTextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          // «OK» на клавиатуре записывает сразу. Кнопка «Записать» при открытой
          // клавиатуре на Android срабатывает только со второго нажатия:
          // первое закрывает клавиатуру (причина не найдена).
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
          placeholder={t(
            mode === "set"
              ? "store.stock.amountPlaceholder"
              : "store.stock.quantityPlaceholder",
          )}
        />

        <Button
          title={t("store.stock.save")}
          variant="primary"
          disabled={busy}
          onPress={() => void submit()}
        />
      </View>
    </UniTrueSheet>
  );
};

export default StockSheet;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingTop: 0,
  },
  content: {
    gap: theme.spacing(3),
  },
  target: {
    gap: theme.spacing(1),
  },
  // Три кнопки равной ширины в один ряд. По содержимому Android мерил текст
  // этим шрифтом уже, чем рисовал, и «Указать остаток» обрезался до «Указать».
  modes: {
    flexDirection: "row",
    gap: theme.spacing(2),
  },
  mode: (isActive: boolean) => ({
    flex: 1,
    justifyContent: "center",
    minHeight: theme.spacing(12),
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radius.base,
    borderWidth: 1,
    borderColor: isActive ? theme.colors.blueMain : theme.colors.stroke,
    backgroundColor: isActive ? theme.colors.blue1 : theme.colors.white,
  }),
}));
