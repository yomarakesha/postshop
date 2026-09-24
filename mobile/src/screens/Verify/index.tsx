import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/authApi";
import { cartApi } from "@/api/cartApi";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import ActivityIndicator from "@/ui/ActivityIndicator";
import Button from "@/ui/Button";
import OTPInput from "@/ui/OTPInput";
import ScreenFooter from "@/ui/ScreenFooter";
import Typography from "@/ui/Typography";
import ArrowLeft from "@assets/icons/arrow-left.svg";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { createRef, useCallback, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import Timer from "./_components/Timer";
import { useTranslation } from "react-i18next";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import useLayoutHeight from "@/hooks/useLayoutHeight";

const otpLength = 6;

const useArrayOfRefs = (length: number) => {
  return useMemo(
    () => Array.from({ length }, () => createRef<TextInput | null>()),
    [length],
  );
};

const VerifyScreen = () => {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [codes, setCodes] = useState<string[]>(Array(otpLength).fill(""));
  const authMutation = authApi.useLogin();
  const verifyMutation = authApi.useVerify();
  const queryClient = useQueryClient();
  const addToCartMutation = cartApi.useAdd();
  const [isCodeInvalid, setIsCodeInvalid] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const router = useRouter();
  const { height: footerHeight, onLayout: onFooterLayout } = useLayoutHeight();
  const { t } = useTranslation();

  const refs = useArrayOfRefs(otpLength);

  const onChangeCode = (text: string, index: number) => {
    // Несколько цифр сразу — это вставка кода или цифра, набранная поверх уже
    // заполненной первой клетки (только у неё длина больше одной — ради
    // вставки). Раскладываем цифры по клеткам начиная с текущей. Раньше строка
    // целиком становилась новым массивом: «2» + «0» давали массив из двух
    // элементов, и на экране вместо шести клеток оставалось две.
    const digits = text.replace(/\D/g, "");
    if (digits.length > 1) {
      const newCodes = [...codes];
      digits
        .slice(0, otpLength - index)
        .split("")
        .forEach((digit, offset) => {
          newCodes[index + offset] = digit;
        });
      setCodes(newCodes);
      const nextEmpty = newCodes.findIndex((code) => code === "");
      refs[nextEmpty === -1 ? otpLength - 1 : nextEmpty]!.current?.focus();
      return;
    }

    const newCodes = [...codes];
    newCodes[index] = text;
    setCodes(newCodes);

    if (text !== "" && index < otpLength - 1) {
      refs[index + 1]!.current?.focus();
    }
  };

  const onSubmit = useCallback(async () => {
    let loginSuccess = false;
    try {
      const res = await verifyMutation.mutateAsync({
        phone_number: phoneNumber,
        code: codes.join(""),
      });

      useUserStore.setState({
        jwt: {
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
        },
        user: {
          id: res.id,
          phone: res.phone,
          name: res.name,
          surname: res.surname,
          // Магазинов в ответе на код нет: их отдаёт только /auth/me. Пустой
          // список — честное «ещё не знаем»; строкой ниже сразу спрашиваем.
          shops: [],
        },
        isGuest: false,
      });
      loginSuccess = true;
    } catch (e: any) {
      setIsCodeInvalid(true);
      setTimeout(() => {
        setIsCodeInvalid(false);
        setCodes(Array(otpLength).fill(""));
        refs[0]!.current?.focus();
      }, 1000);
      return;
    }

    if (loginSuccess) {
      try {
        if (useCartStore.getState().items.length > 0) {
          const localItems = useCartStore.getState().items;
          await Promise.allSettled(
            localItems.map((item) =>
              addToCartMutation.mutateAsync({
                product_id: item.productId,
                quantity: item.quantity,
              }),
            ),
          );
          useCartStore.getState().clearCart();
        }
      } catch (cartError) {
        console.error("Cart synchronization failed: ", cartError);
      }

      // Магазины подтягиваем до перехода, иначе на главной мгновение видно
      // «станьте продавцом» у человека, у которого магазин есть.
      await queryClient.refetchQueries({ queryKey: ["get-me"] });

      setCodes(Array(otpLength).fill(""));
      router.replace("/(client-tabs)/(home)");
    }
  }, [codes, phoneNumber, router, verifyMutation, addToCartMutation, refs]);

  const onResend = useCallback(async () => {
    await authMutation.mutateAsync({
      phone_number: phoneNumber!,
    });
  }, [phoneNumber]);

  const onGoBack = () => {
    router.back();
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container(insets.top)}
      bottomOffset={footerHeight}
    >
      <View style={styles.content}>
        <Typography variant="p2" weight="bold" color="secondary" isCentered>
          {t("auth.verify.headline")}
        </Typography>
        <View style={styles.inputWrapper}>
          <View style={styles.inputsContainer}>
            {codes.map((item, index) => (
              <OTPInput
                key={index}
                innerRef={refs[index]}
                isError={isCodeInvalid}
                value={item}
                maxLength={index === 0 ? codes.length : 1}
                onChangeText={(text) => onChangeCode(text, index)}
                onKeyPress={({ nativeEvent: { key } }) => {
                  // Назад — только из пустой клетки. В заполненной «Стереть»
                  // убирает её собственную цифру (это делает onChangeText), а
                  // раньше заодно стиралась и предыдущая — две цифры за раз.
                  if (key === "Backspace" && item === "" && index > 0) {
                    onChangeCode("", index - 1);
                    refs[index - 1].current?.focus();
                  }
                }}
                autoFocus={index === 0}
              />
            ))}
          </View>
          <Timer
            initialTime={60}
            onResend={onResend}
            isSending={authMutation.isPending}
          />
        </View>
      </View>
      <ScreenFooter onLayout={onFooterLayout}>
        <View style={styles.footer}>
          <View style={styles.buttonsContainer}>
            <Pressable
              style={styles.goBackButton}
              onPress={onGoBack}
              accessibilityRole="button"
              accessibilityLabel={t("common.back")}
            >
              <ArrowLeft style={styles.arrowLeft} />
            </Pressable>
            <Button
              variant="primary"
              disabled={
                codes.some((code) => code === "") || verifyMutation.isPending
              }
              title={t("common.confirm")}
              onPress={onSubmit}
            >
              {verifyMutation.isPending ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : undefined}
            </Button>
          </View>
          <Typography variant="t1" color="tertiary" weight="medium" isCentered>
            {t("common.authAgreement.prefix")}
            <Typography
              variant="t1"
              color="main"
              weight="medium"
              onPress={() => router.push("/terms-of-use")}
            >
              {t("common.authAgreement.terms")}
            </Typography>
            {t("common.authAgreement.and")}
            <Typography
              variant="t1"
              color="main"
              weight="medium"
              onPress={() => router.push("/privacy-policy")}
            >
              {t("common.authAgreement.privacy")}
            </Typography>
            {t("common.authAgreement.suffix")}
          </Typography>
        </View>
      </ScreenFooter>
    </KeyboardAwareScrollView>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create((theme) => ({
  container: (hh: number) => ({
    flexGrow: 1,
    paddingTop: hh + theme.spacing(6),
  }),
  // Группа стояла по центру свободной высоты — на телефоне это оставляло
  // огромные пустоты сверху и снизу. Прижата к верху, как на экране номера.
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(8),
    gap: theme.spacing(6),
  },
  inputWrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(4),
  },
  inputsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(2),
  },
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
  footer: {
    gap: theme.spacing(4),
  },
  arrowLeft: {
    color: theme.colors.blueMain,
  },
}));
