import CustomTextInput from "@/ui/CustomTextInput";
import Typography from "@/ui/Typography";
import React, { Ref, useEffect, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { RefType } from "..";
import { TFunction } from "i18next";

type Inputs = Pick<ShopAdditional.Item, "name" | "description">;

type Props = {
  data: Pick<ShopAdditional.Item, "name" | "description">;
  setIsValid: (value: boolean) => void;
  ref: Ref<RefType>;
  t: TFunction;
};

const NameAndDescription = ({ data, setIsValid, ref, t }: Props) => {
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: {
      name: data?.name,
      description: data?.description,
    },
  });

  useEffect(() => {
    setIsValid(isValid);
  }, [isValid]);

  useImperativeHandle(ref, () => ({
    getData: () => getValues(),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Typography variant="t1" weight="semiBold">
          {t("store.shopAdditional.storeName")}
        </Typography>
        <Controller
          control={control}
          name="name"
          rules={{
            required: true,
            minLength: 2,
            maxLength: 32,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomTextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
      </View>
      <View style={styles.inputWrapper}>
        <Typography variant="t1" weight="semiBold">
          {t("inputs.description")}
        </Typography>
        <Controller
          control={control}
          rules={{
            required: true,
            minLength: 2,
          }}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomTextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline={true}
            />
          )}
        />
      </View>
    </View>
  );
};

export default NameAndDescription;

const styles = StyleSheet.create((theme) => ({
  container: {
    margin: theme.spacing(4),
    padding: theme.spacing(4),
    gap: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
  },
  inputWrapper: {
    gap: theme.spacing(2),
  },
}));
