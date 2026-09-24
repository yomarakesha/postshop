import React, { useEffect } from "react";
import Typography from "@/ui/Typography";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  ConfirmationModalState,
  useConfirmationModal,
} from "@/store/useConfirmationModal";
import Button, { ButtonVariant } from "@/ui/Button";
import { UniTrueSheet } from "@/ui/BottomSheet";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";

const ConfirmationModal = () => {
  const {
    isOpen,
    title,
    onConfirm,
    Icon,
    type,
    description,
    confirmTitle,
    cancelTitle,
    okTitle,
    animation,
  } = useConfirmationModal();
  const trueSheetRef = React.useRef<TrueSheet | null>(null);
  const isPresentedRef = React.useRef(false);
  const { t } = useTranslation();

  const clearData = () => {
    useConfirmationModal.setState({
      isOpen: false,
      title: "",
      description: "",
      onConfirm: () => { },
      type: "danger",
      Icon: null,
      animation: false,
      confirmTitle: "",
      cancelTitle: "",
      okTitle: "",
    });
  };

  // любое действие просто закрывает лист
  const handleConfirm = () => {
    onConfirm?.();
    trueSheetRef.current?.dismiss();
    clearData()
  };

  const handleCancel = () => {
    trueSheetRef.current?.dismiss();
    clearData()
  };

  const handleOk = () => {
    trueSheetRef.current?.dismiss();
    clearData()
  };

  // единственная точка очистки — после реального закрытия
  const handleDidDismiss = () => {
    clearData();
  };

  const buttonVariants: Record<ConfirmationModalState["type"], ButtonVariant> =
  {
    danger: "error",
    warning: "warning",
    success: "success",
    info: "primary",
  };

  useEffect(() => {
    if (isOpen) {
      isPresentedRef.current = true;
      trueSheetRef.current?.present();
    } else if (isPresentedRef.current) {
      isPresentedRef.current = false;
      trueSheetRef.current?.dismiss();
    }
  }, [isOpen]);

  return (
    <UniTrueSheet
      ref={trueSheetRef}
      onDidDismiss={handleDidDismiss}
      detents={["auto"]}
    >
      <View style={styles.container}>
        <View style={styles.iconContainer(type, animation)}>
          {animation ? (
            <LottieView
              source={require("@assets/animations/success.json")}
              autoPlay
              loop={false}
              style={{
                width: 150,
                height: 150,
              }}
            />
          ) : Icon ? (
            <Icon width={32} height={32} style={styles.icon(type)} />
          ) : null}
        </View>
        <Typography variant="p2" weight="semiBold" isCentered>
          {title}
        </Typography>
        <Typography isCentered color="secondary">
          {description}
        </Typography>

        <View style={styles.footer}>
          {onConfirm ? (
            <>
              <Button
                onPress={handleCancel}
                title={cancelTitle ?? t("common.no")}
                variant="secondary"
              />
              <Button
                onPress={handleConfirm}
                title={confirmTitle ?? t("common.yes")}
                variant={type === "info" ? "primary" : buttonVariants[type]}
              />
            </>
          ) : (
            <Button
              variant="primary"
              onPress={handleOk}
              title={okTitle ?? "OK"}
            />
          )}
        </View>
      </View>
    </UniTrueSheet>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create((theme, rt) => {
  const backgorundColor: Record<ConfirmationModalState["type"], string> = {
    danger: theme.colors.failure,
    warning: theme.colors.warning,
    success: theme.colors.success,
    info: theme.colors.blueMain,
  };

  return {
    container: {
      gap: theme.spacing(4),
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing(4),
      paddingTop: theme.spacing(4),
    },
    iconContainer: (
      type: ConfirmationModalState["type"],
      animation: boolean,
    ) => ({
      width: animation ? 84 : 56,
      height: animation ? 84 : 56,
      borderRadius: 56,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: animation ? "transparent" : backgorundColor[type] + "1a", // opacity 10%
    }),
    footer: {
      flexDirection: "row",
      gap: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    icon: (type: ConfirmationModalState["type"]) => ({
      color: backgorundColor[type],
    }),
  };
});
