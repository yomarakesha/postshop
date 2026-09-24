import CustomTextInput from "@/ui/CustomTextInput";
import Typography from "@/ui/Typography";
import TrashIcon from "@assets/icons/trash.svg";
import React, { Ref, useEffect, useImperativeHandle } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { RefType } from "..";
import { TFunction } from "i18next";

type Inputs = {
  addresses: { value: string }[];
};

type Props = {
  data: ShopAdditional.Item["addresses"];
  setIsValid: (value: boolean) => void;
  ref: Ref<RefType>;
  t: TFunction;
};

const Addresses = ({ data, setIsValid, ref, t }: Props) => {
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: {
      addresses: data?.length
        ? data.map((value) => ({ value }))
        : [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  useEffect(() => {
    setIsValid(isValid);
  }, [isValid]);

  useImperativeHandle(ref, () => ({
    getData: () => ({
      addresses: getValues("addresses").map((a) => a.value),
    }),
  }));

  return (
    <View style={styles.container}>
      {fields.map((field, index) => (
        <View style={styles.inputWrapper} key={field.id}>
          <Controller
            control={control}
            name={`addresses.${index}.value`}
            rules={{ required: true, minLength: 2 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomTextInput
                flex
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={t("store.shopAdditional.addressPlaceholder", {
                  index: index + 1,
                })}
              />
            )}
          />
          {fields.length > 1 && (
            <Pressable onPress={() => remove(index)}>
              <TrashIcon style={styles.trashIcon} />
            </Pressable>
          )}
        </View>
      ))}
      <Pressable onPress={() => append({ value: "" })} style={styles.addButton}>
        <Typography variant="p3" color="main">
          + {t("store.shopAdditional.addAddress")}
        </Typography>
      </Pressable>
    </View>
  );
};

export default Addresses;

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
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    paddingVertical: theme.spacing(3),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.gray2,
    borderRadius: theme.spacing(3),
  },
  trashIcon: {
    color: theme.colors.failure,
  },
}));
