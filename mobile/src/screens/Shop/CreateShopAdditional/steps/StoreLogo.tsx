import Header from "@/components/Header";
import Typography from "@/ui/Typography";
import UploadIcon from "@assets/icons/upload-solid.svg";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { Image, Platform, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { StepsProps } from "..";

const StoreLogo = ({ ref, setIsValid, t }: StepsProps) => {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  useEffect(() => {
    setIsValid(!!image);
  }, [image]);

  useImperativeHandle(ref, () => ({
    getData: () => ({
      logo: image
        ? {
            uri:
              Platform.OS === "ios"
                ? image.uri.replace("file://", "")
                : image.uri,
            name: image.fileName ?? image.uri.split("/").pop() ?? "logo.jpg",
            type: image.mimeType ?? "image/jpeg",
          }
        : undefined,
    }),
    isValid: !!image,
  }));

  const handlePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  return (
    <>
      <Header
        title={t("store.shopAdditional.storeLogo")}
        backgroundColor="white"
      />
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <Pressable onPress={handlePick} style={styles.uploadArea}>
            {image ? (
              <Image
                source={{ uri: image.uri }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <>
                <UploadIcon width={32} height={32} style={styles.uploadIcon} />
                <Typography variant="p3" color="main" isCentered>
                  {t("store.shopAdditional.logo.upload")}
                </Typography>
              </>
            )}
          </Pressable>

          {image && (
            <Pressable
              onPress={() => setImage(null)}
              style={styles.removeButton}
            >
              <Typography variant="p3" color="error">
                {t("store.shopAdditional.logo.remove")}
              </Typography>
            </Pressable>
          )}

          <Typography variant="t1" color="tertiary" isCentered>
            {t("store.shopAdditional.logo.notice")}
          </Typography>
        </View>
      </View>
    </>
  );
};

export default StoreLogo;

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flex: 1,
    padding: theme.spacing(4),
  },
  container: {
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(4),
    alignItems: "center",
  },
  uploadArea: {
    width: "100%",
    height: 160,
    borderRadius: theme.spacing(3),
    borderWidth: 2,
    borderColor: theme.colors.gray2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(2),
    backgroundColor: theme.colors.white,
  },
  uploadIcon: {
    color: theme.colors.blueMain,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: theme.spacing(3),
  },
  removeButton: {
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.colors.gray3,
  },
}));
