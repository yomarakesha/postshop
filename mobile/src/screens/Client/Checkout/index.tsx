import Header from "@/components/Header";
import useCartData from "@/hooks/useCartData";
import useAppStore from "@/store/useAppStore";
import Radio from "@/ui/Radio";
import ShopProductsAccordion from "@/ui/ShopProductAccordion";
import TextInput from "@/ui/TextInput";
import Typography from "@/ui/Typography";
import LocationIcon from "@assets/icons/location.svg";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { orderApi } from "@/api/orderApi";
import { useConfirmationModal } from "@/store/useConfirmationModal";
import CustomTextInput from "@/ui/CustomTextInput";
import SelectInput from "@/ui/SelectInput";
import ErrorAlert from "@/utils/errorAlert";
import CircleInfo from "@assets/icons/circle-info.svg";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import PriceSummary from "@/ui/PriceSummary";
import { deliveryMessageApi } from "@/api/deliveryMessageApi";
import { usePickupPointStore } from "@/store/usePickupPointStore";
import ActivityIndicator from "@/ui/ActivityIndicator";
import { pickupPointsApi } from "@/api/pickupPointsApi";
import { useUserStore } from "@/store/useUserStore";
import { MAX_PAGE_SIZE } from "@/constants/pagination";

type InputsType = Pick<Order.API.CreateBody, "comment" | "delivery_address">;

const CheckoutScreen = () => {
  const { groups, discountPrice, total, price, isLoading, isError } =
    useCartData();

  const queryClient = useQueryClient();
  const selectedPickupPoint = usePickupPointStore((s) => s.selectedPickupPoint);
  const createOrderMutation = orderApi.useCreate();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<InputsType>({
    defaultValues: {
      comment: undefined,
      delivery_address: undefined,
    },
    mode: "onChange",
  });

  const currentLang = useAppStore((s) => s.lang);

  // Текст условий доставки пишет админ; пока он не заполнен, показывать
  // ссылку не на что.
  const deliveryMessageQuery = deliveryMessageApi.useGet();
  const hasDeliveryMessage = !!deliveryMessageQuery.data?.translations?.some(
    (item) => item.language === currentLang && !!item.text?.trim(),
  );
  // Валюта из данных корзины вместо захардкоженного «TMT».
  const currency = groups[0]?.products[0]?.currency;
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [paymentMethod, setPaymentMethod] = useState<Order.PaymentType>("card");

  /**
   * Пункты выдачи выбранного города — те же параметры, что у карты
   * (`/pickup-map`), поэтому запрос общий. Раньше самовывоз стоял по
   * умолчанию всегда: в городе без пунктов карта открывалась пустой, кнопка
   * «Оформить» не включалась, и покупатель не понимал почему.
   */
  const cityId = useUserStore((s) => s.cityId);
  const pickupPointsQuery = pickupPointsApi.useGetAll(
    { limit: MAX_PAGE_SIZE, skip: 0, city_id: cityId!, is_active: true },
    { enabled: !!cityId },
  );
  const noPickupPoints =
    !cityId ||
    (pickupPointsQuery.isSuccess && pickupPointsQuery.data.length === 0);

  useEffect(() => {
    if (noPickupPoints) setDeliveryMethod("delivery");
  }, [noPickupPoints]);

  // Пункт, выбранный раньше, мог остаться от другого города или быть с тех
  // пор выключен — такой заказ сервер не примет.
  useEffect(() => {
    if (!selectedPickupPoint || !pickupPointsQuery.isSuccess) return;
    const stillAvailable = pickupPointsQuery.data.some(
      (point) => point.id === selectedPickupPoint.id,
    );
    if (!stillAvailable) usePickupPointStore.getState().selectPickupPoint(null);
  }, [
    selectedPickupPoint,
    pickupPointsQuery.isSuccess,
    pickupPointsQuery.data,
  ]);

  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useTranslation();

  const handlePressSelectPickupPoint = () => {
    router.push("/pickup-map");
  };

  const onSubmit: SubmitHandler<InputsType> = async (data) => {
    if (deliveryMethod === "delivery" && !isValid) return;
    if (deliveryMethod === "pickup" && selectedPickupPoint === null) return;

    try {
      await createOrderMutation.mutateAsync({
        payment_type: paymentMethod,
        comment: data.comment,
        delivery_address:
          deliveryMethod === "delivery" ? data.delivery_address : undefined,
        pickup_point_id:
          deliveryMethod === "pickup" ? selectedPickupPoint?.id : undefined,
      });
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["get-all-carts"] });
      router.back();
      router.replace("/(client-tabs)/(home)");
      useConfirmationModal.setState({
        isOpen: true,
        title: t("client.checkout.success.title"),
        description: t("client.checkout.success.description"),
        okTitle: t("common.close"),
        type: "info",
        Icon: undefined,
        onConfirm: () => {
          queryClient.invalidateQueries({
            queryKey: ["get-all-my-orders"],
          });
          router.replace(`/(client-tabs)/(orders)`);
        },
        animation: true,
        confirmTitle: t("client.checkout.success.showOrder"),
        cancelTitle: t("common.close"),
      });

      usePickupPointStore.getState().selectPickupPoint(null);
    } catch (e: any) {
      ErrorAlert(t, e);
    }
  };

  const isDisabled =
    (deliveryMethod === "delivery" && !isValid) ||
    createOrderMutation.isPending ||
    (deliveryMethod === "pickup" && !selectedPickupPoint);

  useEffect(() => {
    // Пока корзина ещё грузится, groups временно пуст — нельзя считать это
    // поводом закрыть экран оформления заказа.
    if (isLoading) return;
    if (groups.length === 0 && !isSuccess && !createOrderMutation.isPending) {
      router.back();
    }
  }, [groups, isSuccess, createOrderMutation.isPending, isLoading]);

  if (isLoading) {
    return (
      <>
        <Header
          title={t("client.checkout.headerTitle")}
          withGoBack
          backgroundColor="white"
        />
        <ActivityIndicator isFullScreen />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header
          title={t("client.checkout.headerTitle")}
          withGoBack
          backgroundColor="white"
        />
        <View style={styles.center}>
          <Typography variant="p1" weight="semiBold" style={styles.centerText}>
            {t("networkError.title")}
          </Typography>
          <Typography
            variant="t1"
            weight="medium"
            color="secondary"
            style={styles.centerText}
          >
            {t("networkError.description")}
          </Typography>
        </View>
      </>
    );
  }

  return (
    <>
      <Header
        title={t("client.checkout.headerTitle")}
        withGoBack
        backgroundColor="white"
      />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          {groups.map((group) => (
            <ShopProductsAccordion
              key={group.shopBaseId}
              data={group}
              language={currentLang!}
              t={t}
            />
          ))}
          <View style={styles.container}>
            <Typography variant="p2" weight="medium">
              {t("deliveryMethod.title")}
            </Typography>
            <Pressable
              style={[
                styles.switcherButton,
                noPickupPoints && styles.switcherDisabled,
              ]}
              onPress={() => setDeliveryMethod("pickup")}
              disabled={noPickupPoints}
            >
              <Typography color={noPickupPoints ? "secondary" : undefined}>
                {t("deliveryMethod.pickup")}
              </Typography>
              <Radio isActive={deliveryMethod === "pickup"} />
            </Pressable>
            {noPickupPoints && (
              <Typography variant="t1" color="secondary">
                {t("deliveryMethod.noPickupPoints")}
              </Typography>
            )}
            <Pressable
              style={styles.switcherButton}
              onPress={() => setDeliveryMethod("delivery")}
            >
              <Typography>{t("deliveryMethod.delivery")}</Typography>
              <Radio isActive={deliveryMethod === "delivery"} />
            </Pressable>
            {deliveryMethod === "delivery" ? (
              <View style={styles.input}>
                <LocationIcon width={20} height={20} style={styles.passive2} />
                <View style={styles.verticalDivider} />
                <Controller
                  control={control}
                  name="delivery_address"
                  rules={{ required: deliveryMethod === "delivery" }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value ?? ""}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder={t("deliveryMethod.addressPlaceholder")}
                      style={styles.addressInput}
                    />
                  )}
                />
              </View>
            ) : (
              <SelectInput
                value={selectedPickupPoint?.name}
                placeholder={t("deliveryMethod.selectPickupPoint")}
                onPress={handlePressSelectPickupPoint}
              />
            )}
          </View>
          <View style={styles.container}>
            <Typography variant="p2" weight="medium">
              {t("paymentMethod.title")}
            </Typography>
            <Pressable
              style={styles.switcherButton}
              onPress={() => setPaymentMethod("card")}
            >
              <Typography>{t("paymentMethod.card")}</Typography>
              <Radio isActive={paymentMethod === "card"} />
            </Pressable>
            <Pressable
              style={styles.switcherButton}
              onPress={() => setPaymentMethod("cash")}
            >
              <Typography>{t("paymentMethod.cash")}</Typography>
              <Radio isActive={paymentMethod === "cash"} />
            </Pressable>
            <Pressable
              style={styles.switcherButton}
              onPress={() => setPaymentMethod("cash_and_card")}
            >
              <Typography>{t("paymentMethod.cashAndCard")}</Typography>
              <Radio isActive={paymentMethod === "cash_and_card"} />
            </Pressable>
          </View>
          <View style={styles.container}>
            <View style={[styles.row, styles.rowBaseline]}>
              <Typography variant="p2" weight="medium" style={styles.label}>
                {t("inputs.note")}
              </Typography>
              <View style={[styles.rowCenter, styles.noteHint]}>
                <CircleInfo width={16} height={16} style={styles.passive2} />
                <Typography variant="t1" color="secondary">
                  {t("inputs.notRequired")}
                </Typography>
              </View>
            </View>
            <Controller
              name="comment"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextInput
                  multiline={true}
                  placeholder={t("inputs.notePlaceholder")}
                  value={value ?? ""}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>
        <PriceSummary
          price={price}
          discountPrice={discountPrice}
          total={total}
          onSubmit={handleSubmit(onSubmit)}
          buttonDisabled={isDisabled}
          // Сумма к оплате — на кнопке, как в корзине и как на витрине
          // (`pages/checkout`). Иначе последний экран перед заказом
          // единственный показывал итог строкой, а кнопка была без числа.
          totalInButton
          // Ссылка появляется, только если условия доставки заполнены в
          // админке. Раньше она стояла всегда, а при незаполненном тексте
          // ручка отвечает 404 — человек нажимал и попадал в пустой экран.
          onPressDeliveryDetail={
            hasDeliveryMessage
              ? () => router.push("/delivery-detail")
              : undefined
          }
          style={styles.footerContainer}
          currency={currency}
          t={t}
        />
      </ScrollView>
    </>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing(8),
    gap: theme.spacing(2),
  },
  centerText: {
    textAlign: "center",
  },
  contentContainer: {
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    flex: 1,
  },
  container: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    gap: theme.spacing(2),
  },
  switcherDisabled: {
    opacity: 0.5,
  },
  switcherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    // Было 8px по всем сторонам — строка выбора не дотягивала до
    // минимальной высоты нажимаемой области.
    paddingVertical: theme.spacing(3),
    paddingHorizontal: theme.spacing(3),
    borderRadius: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },
  rowBaseline: {
    alignItems: "baseline",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  label: {
    flexShrink: 1,
  },
  noteHint: {
    flexShrink: 0,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  passive2: {
    color: theme.colors.passive2,
  },
  verticalDivider: {
    width: 1,
    // height: "100%" внутри строки с alignItems: "center" разрешалась в 0
    // и разделитель пропадал; растягиваем по высоте строки явно.
    alignSelf: "stretch",
    marginVertical: theme.spacing(2),
    backgroundColor: theme.colors.stroke,
    borderRadius: 1,
  },
  addressInput: {
    flex: 1,
    paddingVertical: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  footerContainer: {
    padding: theme.spacing(4),
    borderTopLeftRadius: theme.spacing(6),
    borderTopRightRadius: theme.spacing(6),
  },
}));
