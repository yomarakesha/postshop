import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Control, Controller } from "react-hook-form";
import CustomTextInput from "@/ui/CustomTextInput";
import Typography from "@/ui/Typography";
import { TFunction } from "i18next";

interface Props {
  control: Control<Product.Form.CreateBody>;
  t: TFunction;
}

const ProductInfoSection = ({ control, t }: Props) => (
  <View style={styles.container}>
    <View style={styles.field}>
      <Typography weight="medium">
        {t("inputs.title")} <Typography color="error">*</Typography>
      </Typography>
      <Controller
        control={control}
        name="name"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <CustomTextInput
            placeholder={t("store.addEditProduct.inputs.titlePlaceholder")}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
    </View>
    <View style={styles.field}>
      <Typography weight="medium">
        {t("inputs.description")} <Typography color="error">*</Typography>
      </Typography>
      <Controller
        control={control}
        name="description"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <CustomTextInput
            placeholder={t(
              "store.addEditProduct.inputs.descriptionPlaceholder",
            )}
            multiline
            value={value}
            onChangeText={onChange}
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.textarea}
          />
        )}
      />
    </View>
  </View>
);

export default ProductInfoSection;

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(2),
  },
  field: { gap: theme.spacing(2) },
  textarea: { minHeight: 120 },
}));
