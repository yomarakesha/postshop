import { shopAdditionalApi } from "@/api/shopAdditionalApi";
import useShopStore from "@/store/useShopStore";
import ActivityIndicator from "@/ui/ActivityIndicator";
import Button from "@/ui/Button";
import ScreenFooter from "@/ui/ScreenFooter";
import Typography from "@/ui/Typography";
import ArrowLeft from "@assets/icons/arrow-left.svg";
import React, { Ref, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import Addresses from "./steps/Addresses";
import NameAndDescription from "./steps/NameAndDescription";
import Onboarding from "./steps/Onboarding";
import PhoneNumbers from "./steps/PhoneNumbers";
import StoreColor from "./steps/StoreColor";
import StoreLogo from "./steps/StoreLogo";
import ErrorAlert from "@/utils/errorAlert";
import City from "./steps/City";
import WarehouseType from "./steps/WarehouseType";
import useFeatures from "@/hooks/useFeatures";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type RefType = {
  getData: () => Partial<ShopAdditional.API.CreateBody>;
  isValid: boolean;
};

export type StepsProps = {
  setIsValid: (isValid: boolean) => void;
  ref: Ref<RefType>;
  t: TFunction;
};

const CreateShopAdditionalScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pagerViewRef = useRef<PagerView>(null);
  const [isValid, setIsValid] = useState(false);
  const [shopAdditional, setShopAdditional] =
    useState<Partial<ShopAdditional.API.CreateBody>>();
  const shopBaseId = useShopStore((state) => state.activeShopBaseId);
  const insets = useSafeAreaInsets();
  const mutation = shopAdditionalApi.useCreate();
  const stepRefs = useRef<(RefType | null)[]>([]);
  const { t } = useTranslation();
  const [footerHeight, setFooterHeight] = useState<number>(0);
  // Пока флаг не пришёл, fboEnabled = false: раньше мастер собирался без шага
  // склада, а через миг шаг появлялся — страницы сдвигались под продавцом, и
  // успевший пройти мастер создавал магазин FBS по умолчанию. Ждём ответ.
  const { fboEnabled, isLoading: isFeaturesLoading } = useFeatures();

  /**
   * Шаги мастера по порядку. Массивом, а не набором вложенных страниц с
   * номерами вручную: шаг выбора склада есть не всегда, и при вставке или
   * пропуске номера разъезжались — данные шага уходили в чужую ячейку.
   *
   * Тип склада спрашивается только там, где склад платформы включён: иначе
   * выбор из одного варианта, да ещё и того, который сервер всё равно
   * отклонит. Поменять тип позже продавец не может — это делает сотрудник
   * платформы, — поэтому шаг стоит здесь, при активации.
   */
  const steps: ((
    props: StepsProps & { footerHeight: number },
  ) => React.ReactNode)[] = [
    (props) => <City {...props} />,
    ...(fboEnabled
      ? [(props: StepsProps) => <WarehouseType {...props} />]
      : []),
    (props) => <NameAndDescription {...props} />,
    (props) => <Addresses {...props} />,
    (props) => <PhoneNumbers {...props} />,
    (props) => <StoreColor {...props} />,
    (props) => <StoreLogo {...props} />,
  ];
  const stepsCount = steps.length;

  const handleStart = () => {
    setShopAdditional({ shop_base_id: shopBaseId! });
    pagerViewRef.current?.setPageWithoutAnimation(1);
    setCurrentIndex((prev) => prev + 1);
  };

  const onNext = () => {
    const data = stepRefs.current[currentIndex]?.getData();
    if (!data) return;
    setShopAdditional((prev) => ({ ...(prev || {}), ...data }));
    setIsValid(stepRefs.current[currentIndex + 1]?.isValid || false);
    setCurrentIndex((prev) => prev + 1);
    pagerViewRef.current?.setPage(currentIndex + 1);
  };

  const onSubmit = async () => {
    const data = stepRefs.current[currentIndex]?.getData();
    if (!data) return;

    const collected = { ...(shopAdditional || {}), ...data };
    const payload = {
      ...collected,
      // Шага выбора склада могло не быть: при выключенном складе платформы
      // остаётся единственный вариант — магазин хранит товар у себя.
      warehouse_type: collected.warehouse_type ?? "fbs",
    } as ShopAdditional.API.CreateBody;

    setShopAdditional((prev) => ({ ...(prev || {}), ...data }));

    try {
      await mutation.mutateAsync(payload);
    } catch (e: any) {
      ErrorAlert(t, e);
    }
  };

  const onGoBack = () => {
    setIsValid(true);
    pagerViewRef.current?.setPage(currentIndex - 1);
    setCurrentIndex((prev) => prev - 1);
  };

  if (isFeaturesLoading) return <ActivityIndicator isFullScreen />;

  return (
    <>
      <PagerView
        ref={pagerViewRef}
        initialPage={0}
        style={styles.flex1}
        overScrollMode="never"
        scrollEnabled={false}
      >
        <Onboarding key="onboarding" onNext={handleStart} t={t} />
        {steps.map((render, index) => (
          <View key={index} style={styles.flex1}>
            {render({
              ref: (ref: RefType | null) => {
                stepRefs.current[index + 1] = ref;
              },
              t,
              setIsValid,
              footerHeight,
            })}
          </View>
        ))}
      </PagerView>
      {currentIndex > 0 && (
        <ScreenFooter
          bottomOffset={insets.bottom}
          onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
        >
          <View style={styles.footer}>
            <View style={styles.indicatorView}>
              <View style={styles.indicatorHeader}>
                <Typography variant="p3" color="secondary">
                  {`${currentIndex} / ${stepsCount}`}
                </Typography>
              </View>
              <View style={styles.indicatorContainer}>
                <View style={styles.indicator(currentIndex / stepsCount)} />
              </View>
            </View>
            <View style={styles.buttonsContainer}>
              {currentIndex !== 1 && (
                <Pressable style={styles.goBackButton} onPress={onGoBack}>
                  <ArrowLeft style={styles.arrowLeft} />
                </Pressable>
              )}
              <Button
                title={
                  currentIndex === stepsCount
                    ? t("common.confirm")
                    : t("common.next")
                }
                onPress={currentIndex === stepsCount ? onSubmit : onNext}
                disabled={!isValid || mutation.isPending}
                variant="primary"
              />
            </View>
          </View>
        </ScreenFooter>
      )}
    </>
  );
};

export default CreateShopAdditionalScreen;

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  footer: {
    gap: theme.spacing(4),
  },
  indicatorView: {
    gap: theme.spacing(2),
  },
  indicatorHeader: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  indicatorContainer: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gray3,
    overflow: "hidden",
  },
  // Ширина прогресса задавалась инлайновым объектом стилей на каждый рендер.
  indicator: (progress: number) => ({
    width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.blueMain,
  }),
  buttonsContainer: {
    flexDirection: "row",
    gap: theme.spacing(4),
  },
  goBackButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.blue2,
  },
  arrowLeft: {
    color: theme.colors.blueMain,
  },
}));
