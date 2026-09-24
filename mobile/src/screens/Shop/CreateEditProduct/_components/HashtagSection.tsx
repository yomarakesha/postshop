import React, { useCallback } from "react";
import { Switch, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Control, Controller } from "react-hook-form";
import CustomTextInput from "@/ui/CustomTextInput";
import Typography from "@/ui/Typography";
import { TFunction } from "i18next";

interface Props {
  control: Control<Product.Form.CreateBody>;
  hasHashtag: boolean;
  onToggle: () => void;
  t: TFunction;
}

const HashtagSection = ({ control, hasHashtag, onToggle, t }: Props) => {
  const handleChangeHashtag = useCallback(
    (text: string, onChange: (value: string) => void) => {
      onChange(text.length === 0 ? `#${text}` : text);
    },
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.switchRow}>
        <Typography weight="medium">
          {t("store.addEditProduct.hashtag")}
        </Typography>
        <Switch
          ios_backgroundColor={styles.gray3.color}
          trackColor={{
            false: styles.gray3.color,
            true: styles.blueMain.color,
          }}
          onValueChange={onToggle}
          thumbColor={styles.white.color}
          value={hasHashtag}
        />
      </View>
      {hasHashtag && (
        <Controller
          name="hashtag"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              placeholder="#"
              value={value ?? undefined}
              onChangeText={(v) => handleChangeHashtag(v, onChange)}
              maxLength={10}
            />
          )}
        />
      )}
    </View>
  );
};

export default HashtagSection;

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(2),
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gray3: { color: theme.colors.gray3 },
  white: { color: theme.colors.white },
  blueMain: { color: theme.colors.blueMain },
}));
