import Header from "@/components/Header";
import Typography from "@/ui/Typography";
import ShopMainIcon from "@assets/icons/shop-main.svg";
import ShopNeutralIcon from "@assets/icons/shop-neutral.svg";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { StepsProps } from "..";

const WarehouseType = ({ setIsValid, ref, t }: StepsProps) => {
  const [selectedType, setSelectedType] = useState<
    ShopAdditional.WarehouseType | undefined
  >(undefined);

  useEffect(() => {
    setIsValid(!!selectedType);
  }, [selectedType]);

  useImperativeHandle(ref, () => ({
    getData: () => ({
      warehouse_type: selectedType,
    }),
    isValid: !!selectedType,
  }));

  const typeData: {
    key: ShopAdditional.WarehouseType;
    title: string;
    description: string;
  }[] = [
    {
      key: "fbs",
      title: t("store.shopAdditional.warehouseType.fbs.title"),
      description: t("store.shopAdditional.warehouseType.fbs.description"),
    },
    {
      key: "fbo",
      title: t("store.shopAdditional.warehouseType.fbo.title"),
      description: t("store.shopAdditional.warehouseType.fbo.description"),
    },
  ];

  const handleSelectType = (type: ShopAdditional.WarehouseType) => {
    setSelectedType(type);
  };
  return (
    <>
      <Header
        title={t("store.shopAdditional.warehouseType.headerTitle")}
        backgroundColor="white"
      />
      <View style={styles.wrapper}>
        <View style={styles.container}>
          {typeData.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handleSelectType(item.key)}
              style={styles.card(item.key === selectedType)}
            >
              <View style={styles.badge(item.key === selectedType)}>
                {item.key === selectedType ? (
                  <ShopNeutralIcon
                    width={32}
                    height={32}
                    style={styles.shopSolid}
                  />
                ) : (
                  <ShopMainIcon
                    width={32}
                    height={32}
                    style={styles.shopOutline}
                  />
                )}
              </View>
              <View style={styles.cardTextContainer}>
                <Typography variant="p2" weight="semiBold" isCentered>
                  {item.title}
                </Typography>
                <Typography variant="p3" color="secondary" isCentered>
                  {item.description}
                </Typography>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
};

export default WarehouseType;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flex: 1,
  },
  container: {
    margin: theme.spacing(4),
    padding: theme.spacing(4),
    gap: theme.spacing(6),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
  },
  card: (isActive: boolean) => ({
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    borderRadius: theme.spacing(3),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: isActive ? theme.colors.blueMain : theme.colors.stroke,
  }),
  cardTextContainer: {
    gap: theme.spacing(2),
  },
  badge: (isActive: boolean) => ({
    backgroundColor: isActive ? theme.colors.blue2 : theme.colors.gray2,
    width: 56,
    height: 56,
    borderRadius: "100%",
    justifyContent: "center",
    alignItems: "center",
  }),
  shopOutline: {
    color: theme.colors.passive2,
  },
  shopSolid: {
    color: theme.colors.blueMain,
  },
}));
