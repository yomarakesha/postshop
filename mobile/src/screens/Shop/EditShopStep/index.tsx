import React, { useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native-unistyles";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ShopAdditionalEditLinkType } from "../EditShop";
import useShopStore from "@/store/useShopStore";
import { shopAdditionalApi } from "@/api/shopAdditionalApi";
import Header from "@/components/Header";
import ScreenFooter from "@/ui/ScreenFooter";
import Button from "@/ui/Button";
import Addresses from "./steps/Addresses";
import NameAndDescription from "./steps/NameAndDescription";
import PhoneNumbers from "./steps/PhoneNumbers";
import StoreColor from "./steps/StoreColor";
import StoreLogo from "./steps/StoreLogo";
import ErrorAlert from "@/utils/errorAlert";
import { useTranslation } from "react-i18next";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export type RefType = {
  getData: () => Partial<ShopAdditional.API.UpdateBody>;
};

const EditShopStepScreen = () => {
  const { step } = useLocalSearchParams<{ step: ShopAdditionalEditLinkType }>();
  const shop = useShopStore((s) => s.shop);
  const router = useRouter();
  const editShopAdditionalMutation = shopAdditionalApi.useUpdate(shop?.id!);
  const [isValid, setIsValid] = useState(true);
  const stepRef = useRef<RefType | null>(null);
  const { t } = useTranslation();
  const [footerHeight, setFooterHeight] = useState<number>(0);

  const renderStep = useMemo(() => {
    if (!step) return null;

    const steps: Record<
      ShopAdditionalEditLinkType,
      React.JSX.Element | string
    > = {
      name: (
        <NameAndDescription
          data={{ name: shop?.name, description: shop?.description }}
          setIsValid={setIsValid}
          ref={stepRef}
          t={t}
        />
      ),
      addresses: (
        <Addresses
          data={shop?.addresses}
          setIsValid={setIsValid}
          ref={stepRef}
          t={t}
        />
      ),
      phones: (
        <PhoneNumbers
          data={shop?.phone_numbers}
          setIsValid={setIsValid}
          ref={stepRef}
          t={t}
        />
      ),
      color: (
        <StoreColor
          data={shop?.color}
          setIsValid={setIsValid}
          ref={stepRef}
          t={t}
        />
      ),
      logo: (
        <StoreLogo
          data={shop?.logo_path}
          setIsValid={setIsValid}
          ref={stepRef}
          t={t}
        />
      ),
    };

    return steps[step];
  }, [step]);

  const headerTitle: Record<ShopAdditionalEditLinkType, string> = {
    addresses: t("store.editShopAdditional.address"),
    color: t("store.editShopAdditional.color"),
    logo: t("store.editShopAdditional.logo"),
    name: t("store.editShopAdditional.baseInfo"),
    phones: t("store.editShopAdditional.phoneNumbers"),
  };

  const onSubmit = async () => {
    const newData = stepRef.current?.getData() ?? {};

    try {
      await editShopAdditionalMutation.mutateAsync(newData);

      router.back();
    } catch (e: any) {
      ErrorAlert(t, e);
    }
  };

  if (!step) return <></>;

  return (
    <>
      <Header title={headerTitle[step]} withGoBack backgroundColor="white" />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content(footerHeight)}
        bottomOffset={footerHeight + 24}
      >
        {renderStep}
      </KeyboardAwareScrollView>
      <ScreenFooter
        onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
      >
        <Button
          title={t("common.save")}
          onPress={onSubmit}
          variant="primary"
          disabled={!isValid || editShopAdditionalMutation.isPending}
        />
      </ScreenFooter>
    </>
  );
};

export default EditShopStepScreen;

const styles = StyleSheet.create((theme) => ({
  // Содержимое шага (например, палитра цвета) уходило под закреплённый футер.
  content: (footerHeight: number) => ({
    flexGrow: 1,
    paddingBottom: theme.spacing(2) + footerHeight,
  }),
}));
