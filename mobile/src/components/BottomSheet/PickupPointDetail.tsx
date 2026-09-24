import React from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UniTrueSheet } from "@/ui/BottomSheet";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import HeaderSheet from "./HeaderSheet";
import Typography from "@/ui/Typography";
import LocationIcon from "@assets/icons/location.svg";
import Button from "@/ui/Button";
import { TFunction } from "i18next";

type Props = {
  ref: React.RefObject<TrueSheet | null>;
  data: PickupPoint.Item | null;
  t: TFunction;
  onSave: (data: PickupPoint.Item) => void;
};

type LabeledRowProps = {
  label: string;
  value: string;
};

const LabeledRow = ({ label, value }: LabeledRowProps) => (
  <View style={styles.card}>
    <Typography color="secondary">{label}:</Typography>
    <Typography style={styles.labeledRowValue}>{value}</Typography>
  </View>
);

type IconRowProps = {
  value: string;
  icon: React.ReactNode;
};

const IconRow = ({ value, icon }: IconRowProps) => (
  <View style={[styles.card, styles.iconRow]}>
    <View style={styles.iconWrapper}>{icon}</View>
    <Typography style={styles.iconRowValue}>{value}</Typography>
  </View>
);

const PickupPointDetailSheet = ({ ref, data, onSave, t }: Props) => {
  const handleClose = () => {
    ref.current?.dismiss();
  };

  if (!data) {
    return null;
  }

  return (
    <UniTrueSheet
      onDidDismiss={handleClose}
      dimmed={false}
      ref={ref}
      detents={[0.5, "auto"]}
      style={styles.bottomSheet}
      scrollable
      footer={
        <Button
          variant="primary"
          title={t("common.save")}
          style={styles.footerButton}
          onPress={() => onSave(data)}
        />
      }
    >
      <HeaderSheet
        title={t("sheets.pickupPoint.title")}
        onClose={handleClose}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <LabeledRow label={t("inputs.name")} value={data.name} />
        <IconRow
          value={data.address}
          icon={
            <LocationIcon width={20} height={20} style={styles.locationIcon} />
          }
        />
      </ScrollView>
    </UniTrueSheet>
  );
};

export default PickupPointDetailSheet;

const styles = StyleSheet.create((theme, rt) => ({
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
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: theme.spacing(3.5),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(2),
    ...theme.shadows.soft,
  },
  labeledRowValue: {
    flex: 1,
    flexShrink: 1,
    textAlign: "right",
  },
  iconRow: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
  iconWrapper: {
    flexShrink: 0,
  },
  iconRowValue: {
    flex: 1,
    flexShrink: 1,
    textAlign: "left",
  },
  locationIcon: {
    color: theme.colors.passive2,
  },
  footerButton: {
    marginHorizontal: theme.spacing(4),
    marginBottom: rt.insets.bottom + theme.spacing(4),
  },
}));
