import React from "react";
import { View } from "react-native";
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
import prettyPhoneNumber from "@/utils/prettyPhoneNumber";
import ErrorAlert from "@/utils/errorAlert";
import { useTranslation } from "react-i18next";
import useLayoutHeight from "@/hooks/useLayoutHeight";
import Typography from "@/ui/Typography";
import { TFunction } from "i18next";

const EditProfileScreen = () => {
  const { theme } = useUnistyles();
  const user = useUserStore((s) => s.user);
  const updateMutation = userApi.useUpdate(user!.id);
  const { height: footerHeight, onLayout: onFooterLayout } = useLayoutHeight();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<User.Form.CreateUpdate>({
    mode: "all",
    defaultValues: {
      name: user!.name,
      surname: user!.surname,
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
      router.back();
    } catch (e: any) {
      ErrorAlert(t, e);
    }
  };

  return (
    <>
      <Header
        withGoBack
        title={t("client.editProfile.headerTitle")}
        backgroundColor={theme.colors.white}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bottomOffset={footerHeight + 24}
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
          <CustomTextInput
            placeholder={t("inputs.phoneNumber")}
            value={String(prettyPhoneNumber(Number(user?.phone)))}
            disabled
          />
        </View>
      </KeyboardAwareScrollView>
      <ScreenFooter onLayout={onFooterLayout}>
        <Button
          disabled={!isValid || !isDirty || updateMutation.isPending}
          title={t("common.save")}
          onPress={handleSubmit(onSubmit)}
          variant="primary"
        />
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

export default EditProfileScreen;

const styles = StyleSheet.create((theme) => ({
  contentContainer: {
    padding: theme.spacing(4),
    gap: theme.spacing(4),
    // Был flex: 1 на contentContainerStyle скролла — контент не мог быть выше
    // экрана, и при открытой клавиатуре форма схлопывалась.
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
}));
