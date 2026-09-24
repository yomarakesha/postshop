import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useUserStore } from "@/store/useUserStore";
import Typography from "@/ui/Typography";
import prettyPhoneNumber from "@/utils/prettyPhoneNumber";
import Button from "@/ui/Button";
import HeaderRight from "./HeaderRight";
import { useRouter } from "expo-router";
import { TFunction } from "i18next";

type Props = {
  t: TFunction;
};

const HeaderBottom = ({ t }: Props) => {
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  const onPressAuth = () => {
    router.push("/(auth)");
  };

  if (user) {
    return (
      <View style={styles.container}>
        {/* Аватара здесь больше нет: своей картинки у профиля не бывает, и
            кружок с типовым значком занимал 64px высоты, ничего не сообщая. */}
        <View style={styles.infoContainer}>
          {/* Имя и номер стояли друг под другом по центру и занимали две
              строки. В одну строку — имя слева, номер справа — шапка ниже
              ещё вдвое. */}
          <Typography variant="p2" weight="medium" numberOfLines={1}>
            {user.name} {user.surname}
          </Typography>
          <View style={styles.rightGroup}>
            <Typography variant="p3" weight="medium" color="secondary">
              {prettyPhoneNumber(Number(user.phone))}
            </Typography>
            <HeaderRight />
          </View>
        </View>
      </View>
    );
  }

  return (
    <Button
      title={t("profile.logIn")}
      onPress={onPressAuth}
      variant="secondary"
      style={styles.loginButton}
    />
  );
};

export default HeaderBottom;

const styles = StyleSheet.create((theme) => ({
  // Блок рисуется прямо в шапке, у которой своих боковых отступов нет:
  // без них имя и номер прилипали к краям экрана.
  container: {
    paddingHorizontal: theme.spacing(3),
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
  },
  loginButton: {
    marginHorizontal: theme.spacing(4),
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
}));
