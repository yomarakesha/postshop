import { UniTrueSheet } from "@/ui/BottomSheet";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import React from "react";
import { StyleSheet } from "react-native-unistyles";
import HeaderSheet from "./HeaderSheet";
import { Pressable, ScrollView, View } from "react-native";
import Typography from "@/ui/Typography";
import { getImageUrl } from "@/utils/getImageUrl";
import { Image } from "expo-image";
import { TFunction } from "i18next";
import ShopIcon from "@assets/icons/shop-main.svg";

type Props = {
  data: User.Shop[];
  ref: React.RefObject<TrueSheet | null>;
  onSelect: (shopBaseId: number) => void;
  t: TFunction;
};

const UserShopsSheet = ({ ref, data, onSelect, t }: Props) => {
  const onClose = () => {
    ref.current?.dismiss();
  };

  return (
    <UniTrueSheet
      ref={ref}
      scrollable
      detents={[0.5, 1]}
      style={styles.wrapper}
    >
      <HeaderSheet title={t("sheets.selectMyShop.title")} onClose={onClose} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {data.map((item, index) => (
          <Pressable
            style={styles.item(index === data.length - 1)}
            key={item.id}
            onPress={() => onSelect(item.id)}
          >
            <View style={styles.logoContainer(!!item.logo_path)}>
              {item.logo_path ? (
                <Image
                  source={getImageUrl(item.logo_path)}
                  contentFit="contain"
                  style={styles.logo}
                />
              ) : (
                <ShopIcon width={30} height={30} style={styles.icon} />
              )}
            </View>
            <Typography weight="medium">
              {item.name || t("noRegistration")}
            </Typography>
          </Pressable>
        ))}
      </ScrollView>
    </UniTrueSheet>
  );
};

export default UserShopsSheet;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    paddingHorizontal: theme.spacing(4),
    paddingTop: 0,
    // Без нижнего отступа последняя строка списка упиралась в край шторки.
    paddingBottom: theme.spacing(4),
  },
  contentContainer: {
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.spacing(4),
    backgroundColor: theme.colors.gray2,
  },
  item: (isLast: boolean) => ({
    paddingVertical: theme.spacing(4),
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.stroke,
    gap: theme.spacing(2),
    flexDirection: "row",
    alignItems: "center",
  }),
  logoContainer: (hasLogo: boolean) => ({
    width: 70,
    height: 40,
    backgroundColor: hasLogo ? theme.colors.white : theme.colors.blue2,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1),
  }),
  logo: {
    width: "100%",
    height: "100%",
  },
  icon: {
    color: theme.colors.blueMain,
    margin: "auto",
  },
}));
