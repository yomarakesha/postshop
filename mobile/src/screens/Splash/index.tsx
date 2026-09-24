import { Image } from "expo-image";
import React from "react";
import { StatusBar, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import splashBackground from "@assets/images/splash-background.png";
import postshopBanner from "@assets/images/postshop-banner.png";

const SplashScreen = ({}) => {
  return (
    <>
      <StatusBar barStyle={"light-content"} />
      <View style={styles.container}>
        <Image
          source={splashBackground}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <Image
          source={postshopBanner}
          style={styles.banner}
          contentFit="contain"
        />
      </View>
    </>
  );
};

export default SplashScreen;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: theme.colors.blueMain,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
  banner: {
    width: 200,
    height: 60,
  },
}));
