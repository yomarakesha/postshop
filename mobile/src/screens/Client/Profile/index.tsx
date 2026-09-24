import SelectableSheet from "@/components/BottomSheet/SelectableSheet";
import Header from "@/components/Header";
import { langs } from "@/constants/langs";
import i18n from "@/localization";
import useAppStore from "@/store/useAppStore";
import Typography from "@/ui/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import RightChevronIcon from "@assets/icons/right-chevron.svg";
import HeaderBottom from "./_components/HeaderBottom";
import useProfileLinks from "./_hooks/useProfileLinks";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const currentLanguage = useAppStore((s) => s.lang);
  const { links, langSheetRef } = useProfileLinks(t, currentLanguage!);

  const handleSelectLanguage = (lang: AppLang) => {
    useAppStore.setState({ lang });
    i18n.changeLanguage(lang);
  };

  return (
    <>
      {/* Карандаш «редактировать» стоял отдельной строкой над именем: строка
          плюс зазор под ней добавляли шапке высоты вдвое больше, чем сам
          блок с именем. Он переехал в ту же строку. */}
      <Header headerBottom={<HeaderBottom t={t} />} />
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
                      disabled={link.isComingSoon}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: !!link.isComingSoon }}
                    >
                      <View style={styles.linkContent}>
                        <link.icon
                          style={styles.icon(link.isDanger, link.isComingSoon)}
                        />
                        <Typography
                          variant="p3"
                          weight="medium"
                          numberOfLines={1}
                          style={styles.linkTitle}
                          color={
                            link.isDanger
                              ? "error"
                              : link.isComingSoon
                                ? "tertiary"
                                : undefined
                          }
                        >
                          {link.title}
                        </Typography>
                      </View>

                      <View style={styles.linkTrailing}>
                        {link.value && (
                          <Typography
                            variant="p3"
                            weight="medium"
                            color="secondary"
                            numberOfLines={1}
                          >
                            {link.value}
                          </Typography>
                        )}
                        {link.isComingSoon && (
                          <View style={styles.soonBadge}>
                            <Typography
                              variant="t2"
                              weight="medium"
                              color="secondary"
                            >
                              {t("common.comingSoon")}
                            </Typography>
                          </View>
                        )}
                        {link.hasChevron && (
                          <RightChevronIcon
                            width={20}
                            height={20}
                            style={styles.chevron}
                          />
                        )}
                      </View>
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
        selectedKey={currentLanguage}
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
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(6),
    // Раньше снизу было ровно столько же, сколько сверху, и последняя карточка
    // почти упиралась в таб-бар.
    paddingBottom: theme.spacing(10),
    gap: theme.spacing(6),
  },
  section: {
    gap: theme.spacing(3),
  },
  link: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(4),
    borderRadius: theme.spacing(3),
    flexDirection: "row",
    justifyContent: "space-between",
    // Без этого правая часть строки растягивалась по высоте и текст значения
    // («Русский») вставал не по центру относительно иконки слева.
    alignItems: "center",
    gap: theme.spacing(3),
    ...theme.shadows.soft,
  },
  linkWrapper: {
    gap: theme.spacing(1),
  },
  linkContent: {
    flexDirection: "row",
    gap: theme.spacing(2),
    alignItems: "center",
    flexShrink: 1,
  },
  linkTitle: {
    flexShrink: 1,
  },
  linkTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    flexShrink: 0,
  },
  soonBadge: {
    backgroundColor: theme.colors.gray2,
    borderRadius: theme.spacing(5),
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(0.5),
  },
  chevron: {
    color: theme.colors.passive1,
  },
  icon: (isDanger?: boolean, isComingSoon?: boolean) => ({
    color: isDanger
      ? theme.colors.failure
      : isComingSoon
        ? theme.colors.passive1
        : theme.colors.passive2,
  }),
}));
