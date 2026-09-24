import Header from "@/components/Header";
import Button from "@/ui/Button";
import ScreenFooter from "@/ui/ScreenFooter";
import { Image } from "expo-image";
import { TFunction } from "i18next";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import backgroundBlur from "@assets/images/create-shop-onboarging-blur.png";
import createShopOnboardingImage from "@assets/images/create-shop-onboarding.png";
import Typography from "@/ui/Typography";

type Props = {
  onNext: () => void;
  t: TFunction;
};

const Onboarding = ({ onNext, t }: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.wrapper}>
      <Header
        title={t("store.shopAdditional.onboarding.headerTitle")}
        backgroundColor="white"
      />
      <View style={styles.backgroundBlurWrapper}>
        <Image source={backgroundBlur} style={styles.backgroundBlurImage} />
      </View>
      <View style={styles.illustrationWrapper}>
        <Image
          source={createShopOnboardingImage}
          style={styles.illustrationImage}
          contentFit="cover"
        />
      </View>
      <View style={styles.infoCard}>
        <Typography variant="p2" weight="bold" isCentered>
          {t("store.shopAdditional.onboarding.headline")}
        </Typography>
        <Typography isCentered>
          {t("store.shopAdditional.onboarding.description")}
        </Typography>
      </View>
      {/* Карточка с текстом позиционирована абсолютно и имеет zIndex 3 —
          без собственного слоя футер с кнопкой уезжал под неё на Android. */}
      <View style={styles.footerLayer}>
        <ScreenFooter bottomOffset={insets.bottom}>
          <Button
            title={t("store.shopAdditional.onboarding.button")}
            onPress={onNext}
            variant="primary"
          />
        </ScreenFooter>
      </View>
    </View>
  );
};
export default Onboarding;

const styles = StyleSheet.create((theme, rt) => ({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  backgroundBlurWrapper: {
    flex: 1,
  },
  backgroundBlurImage: {
    width: "100%",
    aspectRatio: 1,
  },
  footerLayer: {
    zIndex: 20,
  },
  illustrationWrapper: {
    position: "absolute",
    overflow: "visible",
    width: "100%",
    bottom: rt.screen.height * 0.5,
    zIndex: 10,
  },
  illustrationImage: {
    width: 360,
    height: 245,
    zIndex: 4,
    marginHorizontal: "auto",
  },
  infoCard: {
    position: "absolute",
    bottom: 0,
    left: -128,
    // был захардкожен "white" — цвет должен приходить из темы
    backgroundColor: theme.colors.white,
    height: rt.screen.height * 0.6,
    width: rt.screen.width + 256,
    borderTopLeftRadius: rt.screen.width * 0.75,
    borderTopRightRadius: rt.screen.width * 0.75,
    zIndex: 3,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(8),
    paddingHorizontal: theme.spacing(4) + 128,
  },
}));
