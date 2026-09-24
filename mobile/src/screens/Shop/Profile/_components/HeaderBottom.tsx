import React from "react";
import Typography from "@/ui/Typography";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Image } from "expo-image";
import { getImageUrl } from "@/utils/getImageUrl";
import { isColorDark } from "@/utils/processColor";
import EditIcon from "@assets/icons/pencil.svg";

type Props = {
  data: ShopAdditional.Item;
  onEdit: () => void;
};

const HeaderBottom = ({ data, onEdit }: Props) => {
  // Раньше было isColorDark(data.color ?? ""): у магазина без своего цвета
  // шапка рисуется белой, а processColor("") не парсится и isColorDark
  // возвращал true — название магазина становилось белым на белом фоне.
  // Фолбэк должен совпадать с фоном шапки в Profile/index.tsx.
  const isDark = isColorDark(data?.color || "white");
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.logoContainer}>
          <Image
            source={getImageUrl(data?.logo_path)}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <Typography
          color={isDark ? "white" : undefined}
          variant="p2"
          weight="semiBold"
          numberOfLines={2}
          style={styles.name}
        >
          {data?.name}
        </Typography>
      </View>
      <Pressable onPress={onEdit}>
        <EditIcon width={24} height={24} style={styles.icon(isDark)} />
      </Pressable>
    </View>
  );
};

export default HeaderBottom;

const styles = StyleSheet.create((theme) => ({
  container: {
    marginHorizontal: theme.spacing(2),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(3),
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(4),
  },
  name: {
    flex: 1,
  },
  logoContainer: {
    width: 95,
    height: 55,
    borderRadius: theme.spacing(3),
    overflow: "hidden",
    backgroundColor: theme.colors.white,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  icon: (isDark: boolean) => ({
    color: isDark ? theme.colors.white : theme.colors.text,
  }),
}));
