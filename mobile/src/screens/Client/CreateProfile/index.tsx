import React from "react";
import Typography from "@/ui/Typography";
import { Platform, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import Header from "@/components/Header";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import CustomTextInput from "@/ui/CustomTextInput";
import ScreenFooter from "@/ui/ScreenFooter";
import Button from "@/ui/Button";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { userApi } from "@/api/userApi";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ErrorAlert from "@/utils/errorAlert";
import { useTranslation } from "react-i18next";
import useLayoutHeight from "@/hooks/useLayoutHeight";
import { TFunction } from "i18next";

const CreateProfileScreen = () => {
  const { theme } = useUnistyles();
  const user = useUserStore((s) => s.user);
  const updateMutation = userApi.useUpdate(user!.id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: footerHeight, onLayout: onFooterLayout } = useLayoutHeight();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<User.Form.CreateUpdate>({
    mode: "all",
    defaultValues: {
      name: "",
      surname: "",
    },
  });

  const inputs = [
    {
      name: "name",
      placeholder: t("inputs.name"),
      rules: {
        required: true,
        minLength: 2,
        maxLength: 25,
      },
    },
    {
      name: "surname",
      placeholder: t("inputs.surname"),
      rules: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
    },
  ] satisfies {
    name: keyof User.Form.CreateUpdate;
    placeholder: string;
    rules: Record<string, unknown>;
  }[];

  const onSubmit: SubmitHandler<User.Form.CreateUpdate> = async (data) => {
    try {
      await updateMutation.mutateAsync(data);

      useUserStore.setState((s) => ({
        user: {
          ...s.user!,
          ...data,
        },
      }));
      router.replace("/(client-tabs)/(home)");
    } catch (e: any) {
      ErrorAlert(t, e);
    }
  };

  return (
    <>
      <Header
        title={t("client.createProfile.headerTitle")}
        backgroundColor={theme.colors.white}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bottomOffset={footerHeight}
      >
        <View style={styles.formContainer}>
          {inputs.map((item) => (
            <Controller
              key={item.name}
              name={item.name as keyof User.Form.CreateUpdate}
              control={control}
              rules={item.rules}
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <View style={styles.field}>
                  <CustomTextInput
                    placeholder={item.placeholder}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    containerStyle={
                      fieldState.error ? styles.inputError : undefined
                    }
                  />
                  {fieldState.error && (
                    <Typography variant="t2" weight="medium" color="error">
                      {getErrorMessage(t, fieldState.error.type, item.rules)}
                    </Typography>
                  )}
                </View>
              )}
            />
          ))}
        </View>
      </KeyboardAwareScrollView>
      <ScreenFooter bottomOffset={insets.bottom} onLayout={onFooterLayout}>
        <View style={styles.footer}>
          <Button
            disabled={!isValid || updateMutation.isPending}
            variant="primary"
            title={t("common.next")}
            onPress={handleSubmit(onSubmit)}
          />
          <Typography variant="t1" color="tertiary" weight="medium" isCentered>
            {t("common.authAgreement.prefix")}
            <Typography
              variant="t1"
              color="main"
              weight="medium"
              onPress={() => router.push("/(legal)/terms-of-use")}
            >
              {t("common.authAgreement.terms")}
            </Typography>
            {t("common.authAgreement.and")}
            <Typography
              variant="t1"
              color="main"
              weight="medium"
              onPress={() => router.push("/(legal)/privacy-policy")}
            >
              {t("common.authAgreement.privacy")}
            </Typography>
            {t("common.authAgreement.suffix")}
          </Typography>
        </View>
      </ScreenFooter>
    </>
  );
};

// Раньше правила required/minLength/maxLength были заданы, но пользователю
// никак не показывались: кнопка «Сохранить» просто оставалась неактивной без
// объяснения причины.
const getErrorMessage = (
  t: TFunction,
  type: string,
  rules: { minLength: number; maxLength: number },
) => {
  if (type === "minLength") {
    return t("validation.minLength", { min: rules.minLength });
  }
  if (type === "maxLength") {
    return t("validation.maxLength", { max: rules.maxLength });
  }
  return t("validation.required");
};

export default CreateProfileScreen;

const styles = StyleSheet.create((theme) => ({
  contentContainer: {
    padding: theme.spacing(4),
    gap: theme.spacing(4),
    flexGrow: 1,
  },
  field: {
    gap: theme.spacing(1),
  },
  inputError: {
    borderColor: theme.colors.failure,
  },
  imageUploadButton: {
    backgroundColor: theme.colors.blue2,
    paddingVertical: theme.spacing(1.5),
    paddingHorizontal: theme.spacing(3.5),
    borderRadius: theme.spacing(7) + 1,
    flexDirection: "row",
    gap: theme.spacing(2),
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing(3),
    borderRadius: theme.spacing(3),
    gap: theme.spacing(2),
    ...theme.shadows.soft,
  },
  iconColor: {
    color: theme.colors.blueMain,
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
    paddingBottom: Platform.select({
      ios: 0,
      default: theme.spacing(2),
    }),
  },
}));
