import React, { useMemo } from "react";
import Typography from "@/ui/Typography";
import { Pressable, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import HeaderSheet from "../HeaderSheet";
import { categoryApi } from "@/api/categoryApi";
import useAppStore from "@/store/useAppStore";
import { TFunction } from "i18next";

type Props = {
  onGoBack: () => void;
  onClose: () => void;
  onSelect: (id: number, name: string) => void;
  parentId: number;
  t: TFunction;
};

const SubCategoriesSheet = ({
  onGoBack,
  onClose,
  onSelect,
  parentId,
  t,
}: Props) => {
  const subCategoriesQuery = categoryApi.useGet(parentId);
  const currentLang = useAppStore((s) => s.lang);

  const subCategories = useMemo(() => {
    return subCategoriesQuery.data?.children || [];
  }, [subCategoriesQuery.data]);

  const getTranslation = (translation: Category.Translation[]) => {
    return translation.find((t) => t.language === currentLang)?.name;
  };

  return (
    <>
      <HeaderSheet
        title={
          subCategoriesQuery.data?.translations.find(
            (t) => t.language === currentLang,
          )?.name || t("client.addEditProduct.inputs.category.label")
        }
        onGoBack={onGoBack}
        onClose={onClose}
      />
      <ScrollView
        nestedScrollEnabled
        contentContainerStyle={styles.contentContainer}
      >
        {subCategories.map((subCategory, index) => (
          <Pressable
            key={subCategory.id}
            style={styles.item(index === subCategories.length - 1)}
            onPress={() =>
              onSelect(
                subCategory.id,
                getTranslation(subCategory.translations) ||
                  subCategory.translations[0].name,
              )
            }
          >
            <Typography weight="medium">
              {getTranslation(subCategory.translations) ||
                subCategory.translations[0].name}
            </Typography>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
};

export default SubCategoriesSheet;

const styles = StyleSheet.create((theme) => ({
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
    justifyContent: "space-between",
  }),
}));
