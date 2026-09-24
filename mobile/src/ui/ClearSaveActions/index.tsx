import React from "react";
import Typography from "@/ui/Typography";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Button from "../Button";
import { TFunction } from "i18next";

type Props = {
  onSave: () => void;
  onClear: () => void;
  t: TFunction;
};

const ClearSaveActions = ({ onSave, onClear, t }: Props) => {
  return (
    <View style={styles.container}>
      <Pressable onPress={onClear} style={styles.clearButton}>
        <Typography variant="p3" weight="medium" color="main">
          {t("common.clear")}
        </Typography>
      </Pressable>
      <Button onPress={onSave} title={t("common.save")} variant="primary" />
    </View>
  );
};

export default ClearSaveActions;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(2),
    paddingVertical: theme.spacing(4),
  },
  clearButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing(3),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.blue2,
    flexGrow: 1,
  },
}));
