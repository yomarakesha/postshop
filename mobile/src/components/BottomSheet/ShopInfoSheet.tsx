import React from "react";
import Typography from "@/ui/Typography";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { UniTrueSheet } from "@/ui/BottomSheet";
import HeaderSheet from "./HeaderSheet";
import StoreFrontIcon from "@assets/icons/store-front.svg";
import CallIcon from "@assets/icons/call.svg";
import prettyPhoneNumber from "@/utils/prettyPhoneNumber";
import { ScrollView } from "react-native-gesture-handler";
import { TFunction } from "i18next";

type Props = {
  phoneNumber: number
  description: string;
  ref: React.RefObject<TrueSheet | null>;
  t: TFunction;
};

const ICON_SIZE = 18;

const ShopInfoSheet = ({ phoneNumber, description, ref, t }: Props) => {
  const onClose = () => ref.current?.dismiss();

  return (
    <UniTrueSheet
      onDidDismiss={onClose}
      ref={ref}
      detents={[0.5, "auto"]}
      style={styles.bottomSheet}
      scrollable
    >
      <HeaderSheet title={t("sheets.aboutShop.title")} onClose={onClose} />
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.phoneNumberContainer}>
            <View style={styles.contentHeader}>
              <CallIcon
                style={styles.passive2}
                width={ICON_SIZE}
                height={ICON_SIZE}
              />
              <Typography color="secondary" variant="t1" weight="medium">
                {t("sheets.aboutShop.phoneNumber")}
              </Typography>
            </View>
            <Typography variant="p2">
              {prettyPhoneNumber(
                phoneNumber
              )}
            </Typography>
          </View>
          <View style={styles.descriptionContainer}>
            <View style={styles.contentHeader}>
              <StoreFrontIcon
                style={styles.passive2}
                width={ICON_SIZE}
                height={ICON_SIZE}
              />
              <Typography color="secondary" variant="t1" weight="medium">
                {t("sheets.aboutShop.description")}
              </Typography>
            </View>
            <Typography>{description}</Typography>
          </View>
        </ScrollView>
    </UniTrueSheet>
  );
};

export default ShopInfoSheet;

const styles = StyleSheet.create((theme) => ({
  bottomSheet: {
    paddingHorizontal: theme.spacing(4),
    paddingTop: 0,
    paddingBottom: theme.spacing(4),
  },
  container: {
    padding: theme.spacing(4),
    borderRadius: theme.spacing(4),
    backgroundColor: theme.colors.gray2,
    gap: theme.spacing(2),
  },
  phoneNumberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing(3.5),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
    ...theme.shadows.soft,
  },
  contentHeader: {
    flexDirection: "row",
    gap: theme.spacing(2),
    alignItems: "center",
  },
  descriptionContainer: {
    paddingVertical: theme.spacing(3.5),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(3),
    ...theme.shadows.soft,
  },
  passive2: {
    color: theme.colors.passive2,
  },
}));
