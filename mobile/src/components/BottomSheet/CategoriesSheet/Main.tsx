import React, { useMemo } from "react";
import Typography from "@/ui/Typography";
import { Pressable, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import HeaderSheet from "../HeaderSheet";
import { categoryApi } from "@/api/categoryApi";
import ChevronRight from "@assets/icons/right-chevron.svg";
import useAppStore from "@/store/useAppStore";
import { TFunction } from "i18next";

type Props = {
  onClose: () => void;
  onSelect: (id: number) => void;
  t: TFunction
};

const CategoriesSheetMain = ({ onClose, onSelect, t }: Props) => {
  const currentLang = useAppStore((state) => state.lang);
  const categoriesQuery = categoryApi.useGetAll({
    skip: 0,
    limit: 10,
    only_parents: true,
  });

  const categories = useMemo(() => {
    return categoriesQuery.data || [];
  }, [categoriesQuery.data]);

  const getTranslation = (translation: Category.Translation[]) => {
    return translation.find((t) => t.language === currentLang)?.name;
  };

  return (
    <>
      <HeaderSheet title={t("category")} onClose={onClose} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {categories.map((category, index) => (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={styles.item(index === categories.length - 1)}
          >
            <Typography weight="medium">
              {getTranslation(category.translations) ||
                category.translations[0].name}
            </Typography>
            <ChevronRight style={styles.passive1} width={20} height={20} />
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
};

export default CategoriesSheetMain;

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
  passive1: {
    color: theme.colors.passive1,
  },
}));
