import Typography from "@/ui/Typography";
import UploadIcon from "@assets/icons/upload-solid.svg";
import { getImageUrl } from "@/utils/getImageUrl";
import { File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { downscaleImage, LOGO_IMAGE_MAX_SIDE } from "@/utils/downscaleImage";
import React, { Ref, useEffect, useImperativeHandle, useState } from "react";
import { Image, Platform, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ErrorAlert from "@/utils/errorAlert";
import { RefType } from "..";
import { TFunction } from "i18next";

type Props = {
  data: ShopAdditional.Item["logo_path"];
  setIsValid: (value: boolean) => void;
  ref: Ref<RefType>;
  t: TFunction;
};

const StoreLogo = ({ data, setIsValid, ref, t }: Props) => {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  useEffect(() => {
    setIsValid(!!image);
  }, [image]);

  useEffect(() => {
    if (!data) return;

    let cancelled = false;

    (async () => {
      try {
        const stamp = Date.now();
        const fileName = `shop-logo-${stamp}.jpg`;
        const dest = new File(Paths.cache, fileName);
        if (dest.exists) dest.delete();

        const file = await File.downloadFileAsync(getImageUrl(data), dest);

        if (cancelled) {
          if (file.exists) file.delete();
          return;
        }

        setImage({
          uri: file.uri,
          fileName,
          mimeType: "image/jpeg",
          width: 0,
          height: 0,
          type: "image",
          assetId: null,
        } as unknown as ImagePicker.ImagePickerAsset);
      } catch (e: any) {
        ErrorAlert(t, e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data]);

  const handlePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      // Было quality: 1 — логотип уходил несжатым снимком камеры в несколько
      // мегабайт и на слабой связи не загружался.
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(await downscaleImage(result.assets[0], LOGO_IMAGE_MAX_SIDE));
    }
  };

  const handleRemove = () => {
    if (image && image.uri.includes(Paths.cache.uri)) {
      try {
        const f = new File(image.uri);
        if (f.exists) f.delete();
      } catch {}
    }
    setImage(null);
  };

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

  return (
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
          <Pressable onPress={handleRemove} style={styles.removeButton}>
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
