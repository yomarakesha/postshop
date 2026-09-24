import React from "react";
import Typography from "@/ui/Typography";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/Header";
import useProfileLinks from "./_hooks/useProfileLinks";
import { useRouter } from "expo-router";
import HeaderBottom from "./_components/HeaderBottom";
import useShopStore from "@/store/useShopStore";
import SelectableSheet from "@/components/BottomSheet/SelectableSheet";
import { useTranslation } from "react-i18next";
import { langs } from "@/constants/langs";
import useAppStore from "@/store/useAppStore";
import i18n from "@/localization";

const ProfileScreen = () => {
  const router = useRouter();
  const currentLang = useAppStore((s) => s.lang);
  const { t } = useTranslation();
  const { links, langSheetRef } = useProfileLinks(t, currentLang!);
  const shop = useShopStore((s) => s.shop);

  const handleEdit = () => {
    router.push("/(shop-tabs)/(profile)/edit-shop");
  };

  const handleSelectLanguage = (lang: AppLang) => {
    useAppStore.setState({ lang });
    i18n.changeLanguage(lang);
  };

  return (
    <>
      <Header
        title={t("profile.headerTitle")}
        backgroundColor={shop?.color || "white"}
        headerBottom={
          shop ? <HeaderBottom data={shop} onEdit={handleEdit} /> : undefined
        }
      />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.contentContainer}
      >
        {links.map(
          (section, i) =>
            section.isVisible && (
              <View key={i} style={styles.section}>
                <Typography variant="p2" weight="semiBold">
                  {section.title}
                </Typography>
                <View style={styles.linkWrapper}>
                  {section.data.map((link, j) => (
                    <TouchableOpacity
                      key={j}
                      onPress={link.onPress}
                      style={styles.link}
                    >
                      <View style={styles.linkContent}>
                        <link.icon style={styles.icon(link.isDanger)} />
                        <Typography
                          variant="p3"
                          weight="medium"
                          numberOfLines={1}
                          color={link.isDanger ? "error" : undefined}
                        >
                          {link.title}
                        </Typography>
                      </View>
                      {!!link.value && (
                        <Typography
                          variant="p3"
                          weight="medium"
                          color="secondary"
                          numberOfLines={1}
                        >
                          {link.value}
                        </Typography>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ),
        )}
      </ScrollView>
      <SelectableSheet
        ref={langSheetRef}
        title={t("sheets.chooseLanguage.title")}
        data={langs}
        selectedKey={currentLang}
        onSelect={handleSelectLanguage}
      />
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create((theme) => ({
  flex1: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(7),
    paddingBottom: theme.spacing(10),
    gap: theme.spacing(6),
  },
  section: {
    gap: theme.spacing(4),
  },
  link: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(4.5),
    borderRadius: theme.spacing(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
    ...theme.shadows.soft,
  },
  linkWrapper: {
    gap: theme.spacing(1),
  },
  linkContent: {
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing(2),
    alignItems: "center",
  },
  icon: (isDanger?: boolean) => ({
    color: isDanger ? theme.colors.failure : theme.colors.passive2,
  }),
}));
