import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Header from "@/components/Header";
import Button from "@/ui/Button";
import ScreenFooter from "@/ui/ScreenFooter";
import TextInput from "@/ui/TextInput";
import Typography from "@/ui/Typography";
import useAppStore from "@/store/useAppStore";

/** Адрес вида http://192.168.1.50:7002 — протокол, хост и порт. */
const normalize = (raw: string) => {
  const value = raw.trim().replace(/\/+$/, "");
  if (!value) return "";
  // Без протокола адрес не разберётся, а вводить его руками каждый раз — лишнее.
  return /^https?:\/\//i.test(value) ? value : `http://${value}`;
};

const isValidUrl = (raw: string) => {
  const value = normalize(raw);
  if (!value) return false;
  try {
    const url = new URL(value);
    return Boolean(url.hostname);
  } catch {
    return false;
  }
};

/**
 * Первый экран: куда приложению ходить за данными.
 *
 * Адрес сервера был прибит в сборке: он приходил из EXPO_PUBLIC_API_URL и
 * поменять его без пересборки было нельзя. Проверять приложение на другом
 * сервере — на локальном стеке, на тестовом, на новом боевом — означало
 * собирать APK заново.
 *
 * Экран показывается, пока адрес не задан, и доступен потом в любой момент,
 * чтобы переключиться между серверами.
 */
export const ServerSetupScreen = () => {
  const router = useRouter();
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const canGoBack = router.canGoBack();

  const apiUrl = useAppStore((s) => s.apiUrl);
  const setApiUrl = useAppStore((s) => s.setApiUrl);
  const setRefetch = useAppStore((s) => s.setRefetch);

  const [value, setValue] = useState(apiUrl);
  const valid = isValidUrl(value);

  const onSave = () => {
    setApiUrl(normalize(value));
    // Заставляем приложение заново проверить доступность сервера: без этого
    // оно осталось бы на прежнем мнении о старом адресе.
    setRefetch(true);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={t("serverSetup.title")}
        withGoBack={canGoBack}
        backgroundColor={theme.colors.white}
      />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Typography variant="p3" color="secondary">
            {t("serverSetup.subtitle")}
          </Typography>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={t("serverSetup.placeholder")}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input(!!value && !valid)}
          />

          {!!value && !valid && (
            <Typography variant="t1" color="error">
              {t("serverSetup.invalid")}
            </Typography>
          )}

          <Typography variant="t1" color="secondary">
            {t("serverSetup.example")}
          </Typography>
        </View>
      </KeyboardAwareScrollView>

      <ScreenFooter>
        <Button
          variant="primary"
          title={t("serverSetup.save")}
          disabled={!valid}
          onPress={onSave}
        />
      </ScreenFooter>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  // Экран собран как остальные: серый фон, шапка приложения, содержимое в
  // белой карточке и общий липкий футер. Раньше он был единственным белым
  // экраном без шапки, с отступами, набранными числами мимо темы.
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: theme.spacing(4),
  },
  card: {
    gap: theme.spacing(3),
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
  },
  input: (isInvalid: boolean) => ({
    borderWidth: 1,
    borderColor: isInvalid ? theme.colors.failure : theme.colors.stroke,
    borderRadius: theme.spacing(3),
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
    color: theme.colors.text,
    fontSize: 16,
  }),
}));

export default ServerSetupScreen;
