import { returnApi } from "@/api/returnApi";
import HeaderSheet from "@/components/BottomSheet/HeaderSheet";
import { UniTrueSheet } from "@/ui/BottomSheet";
import Button from "@/ui/Button";
import CustomTextInput from "@/ui/CustomTextInput";
import Typography from "@/ui/Typography";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { AxiosError } from "axios";
import { TFunction } from "i18next";
import React, { RefObject, useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";

export type ReturnTarget = {
  orderItemId: number;
  name: string;
  /** Сколько куплено — больше вернуть сервер не даст. */
  purchased: number;
  /** Цена покупки — для суммы к возврату. */
  price: number;
};

type Props = {
  ref: RefObject<TrueSheet | null>;
  target: ReturnTarget | null;
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
 * Заявка на возврат одного товара из завершённого заказа.
 *
 * Сервер принимал возвраты давно, а в приложении попросить возврат было
 * негде: тестировщик так и не нашёл, как это сделать. Решение по заявке
 * принимает платформа — здесь только количество и причина.
 */
const ReturnSheet = ({ ref, target, t }: Props) => {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const createReturn = returnApi.useCreate();

  // Каждый товар открывается с чистой формой; по умолчанию — всё купленное
  // количество: чаще всего возвращают товар целиком.
  useEffect(() => {
    setQuantity(target ? String(target.purchased) : "");
    setReason("");
    // Сбрасываем только при смене товара, а не при каждом новом объекте.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.orderItemId]);

  // Поле остаётся в фокусе и после закрытия окна — первое нажатие на экране
  // ушло бы на снятие фокуса. Снимаем сами.
  const close = () => {
    Keyboard.dismiss();
    ref.current?.dismiss();
  };

  const submit = async () => {
    if (!target) return;
    const amount = Number(quantity.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0 || amount > target.purchased) {
      Toast.show({
        type: "error",
        text1: t("client.order.returns.quantityInvalid", {
          count: target.purchased,
        }),
      });
      return;
    }
    if (!reason.trim()) {
      Toast.show({
        type: "error",
        text1: t("client.order.returns.reasonRequired"),
      });
      return;
    }
    try {
      await createReturn.mutateAsync({
        order_item_id: target.orderItemId,
        quantity: amount,
        reason: reason.trim(),
      });
      Toast.show({ type: "success", text1: t("client.order.returns.sent") });
      close();
    } catch (error) {
      // «Возврат уже в работе», «больше, чем куплено» — осмысленные ответы,
      // показываем их как есть.
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: serverMessage(error),
      });
    }
  };

  return (
    <UniTrueSheet ref={ref} detents={["auto"]} style={styles.wrapper}>
      <HeaderSheet
        title={t("client.order.returns.sheetTitle")}
        onClose={close}
      />
      <View style={styles.content}>
        {target && (
          <Typography variant="p3" weight="medium" numberOfLines={2}>
            {target.name}
          </Typography>
        )}

        <View style={styles.field}>
          <Typography variant="t1" color="secondary">
            {t("client.order.returns.quantityLabel", {
              count: target?.purchased ?? 0,
            })}
          </Typography>
          <CustomTextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Сумма к возврату — по цене покупки, как её посчитает сервер. */}
        {target && Number(quantity) > 0 ? (
          <Typography variant="p3" weight="medium">
            {t("client.order.returns.amount", {
              amount: (target.price * Number(quantity)).toFixed(2),
            })}
          </Typography>
        ) : null}

        <View style={styles.field}>
          <Typography variant="t1" color="secondary">
            {t("client.order.returns.reasonLabel")}
          </Typography>
          <CustomTextInput
            value={reason}
            onChangeText={setReason}
            placeholder={t("client.order.returns.reasonPlaceholder")}
            multiline
            maxLength={1000}
          />
        </View>

        <Button
          title={t("client.order.returns.submit")}
          variant="primary"
          disabled={createReturn.isPending}
          onPress={() => void submit()}
        />
      </View>
    </UniTrueSheet>
  );
};

export default ReturnSheet;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingTop: 0,
  },
  content: {
    gap: theme.spacing(3),
  },
  field: {
    gap: theme.spacing(1),
  },
}));
