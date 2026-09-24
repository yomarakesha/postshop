import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Image, ImageProps } from "expo-image";
import { useRouter } from "expo-router";

type Props = {
  image: ImageProps["source"];
  onPress?: () => void;
};

const LogoTile = ({ image, onPress }: Props) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image source={image} style={styles.image} contentFit="contain" />
    </Pressable>
  );
};

export default LogoTile;

const styles = StyleSheet.create((theme, unistyles) => ({
  container: {
    width: (unistyles.screen.width - 44) / 3,
    aspectRatio: 3 / 2,
    borderRadius: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(3),
    overflow: "hidden",
    backgroundColor: theme.colors.white,
  },
  image: {
    width: "100%",
    height: "100%",
  },
}));
