import Header from "@/components/Header";
import CustomTextInput from "@/ui/CustomTextInput";
import Typography from "@/ui/Typography";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { runOnJS } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import ColorPicker, {
  HueSlider,
  Panel1,
  Preview,
  Swatches,
} from "reanimated-color-picker";
import { StepsProps } from "..";

const PRESET_COLORS = [
  "#1E6FFF",
  "#4B6FFF",
  "#00B4D8",
  "#00C9A7",
  "#00B96B",
  "#4CAF50",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#F44336",
  "#E91E96",
  "#A855F7",
  "#7C3AED",
  "#374151",
  "#9CA3AF",
];

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;

const StoreColor = ({
  ref,
  setIsValid,
  t,
  footerHeight,
}: StepsProps & { footerHeight: number }) => {
  const [selectedColor, setSelectedColor] = useState("#A855F7");
  const [inputValue, setInputValue] = useState("#A855F7");
  const [inputError, setInputError] = useState(false);

  useEffect(() => {
    setIsValid(!!selectedColor);
  }, [selectedColor]);

  useImperativeHandle(ref, () => ({
    getData: () => ({ color: selectedColor }),
    isValid: !!selectedColor,
  }));

  const handleColorSelect = (hex: string) => {
    setSelectedColor(hex);
    setInputValue(hex);
    setInputError(false);
  };

  const onColorSelect = ({ hex }: { hex: string }) => {
    "worklet";
    runOnJS(handleColorSelect)(hex);
  };

  const handleInputChange = (text: string) => {
    // Добавляем # если не написал
    const value = text.startsWith("#") ? text : `#${text}`;
    setInputValue(value);

    if (HEX_REGEX.test(value)) {
      setSelectedColor(value);
      setInputError(false);
    } else {
      setInputError(true);
    }
  };

  return (
    <>
      <Header
        title={t("store.shopAdditional.storeColor")}
        backgroundColor="white"
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        bottomOffset={footerHeight}
      >
        <View style={styles.container}>
          <ColorPicker
            value={selectedColor}
            onComplete={onColorSelect}
            style={styles.picker}
          >
            <Preview style={styles.preview} />
            <Panel1 style={styles.panel} />
            <HueSlider style={styles.slider} />
            <Swatches colors={PRESET_COLORS} style={styles.swatches} />
          </ColorPicker>

          {/* Ручной ввод hex */}
          <View style={styles.inputWrapper}>
            <View
              style={[styles.colorDot, { backgroundColor: selectedColor }]}
            />
            <CustomTextInput
              flex
              value={inputValue}
              onChangeText={handleInputChange}
              placeholder="#000000"
              autoCapitalize="characters"
              maxLength={7}
            />
          </View>
          {inputError && (
            <Typography variant="t1" color="error">
              {t("store.shopAdditional.colorInvalid")}
            </Typography>
          )}
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

export default StoreColor;

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing(4),
  },
  container: {
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
    gap: theme.spacing(4),
  },
  picker: {
    gap: theme.spacing(4),
  },
  preview: {
    height: 56,
    borderRadius: theme.spacing(3),
  },
  panel: {
    height: 200,
    borderRadius: theme.spacing(3),
  },
  slider: {
    borderRadius: theme.spacing(3),
  },
  swatches: {
    paddingTop: theme.spacing(2),
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
}));
