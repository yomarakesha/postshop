import React from "react";
import Typography from "@/ui/Typography";
import { StyleSheet } from "react-native-unistyles";
import Button from "@/ui/Button";
import PlusIcon from "@assets/icons/plus.svg";
import { useRouter } from "expo-router";
import { TFunction } from "i18next";

type Props = {
  t: TFunction;
};

const HeaderBottom = ({ t }: Props) => {
  const router = useRouter();

  const handleAddProduct = () => {
    router.push("/(shop-tabs)/(my-products)/create-product");
  };

  return (
    <Button variant="primary" onPress={handleAddProduct} style={styles.button}>
      <PlusIcon width={20} height={20} style={styles.icon} />
      <Typography variant="p2" weight="semiBold" color="white">
        {t("store.add")}
      </Typography>
    </Button>
  );
};

export default HeaderBottom;

const styles = StyleSheet.create((theme) => ({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    marginHorizontal: theme.spacing(4),
  },
  icon: {
    color: theme.colors.white,
  },
}));
