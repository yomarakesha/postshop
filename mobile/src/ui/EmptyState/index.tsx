import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Image, ImageSource } from "expo-image";
import { StyleSheet } from "react-native-unistyles";
import Typography from "@/ui/Typography";

type Props = {
  title: string;
  description?: string;
  image?: ImageSource | number;
  /** Компактный вариант — для пустых блоков внутри экрана, а не на весь экран. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Единое «пусто здесь» для списков.
 *
 * До этого один и тот же блок (картинка + заголовок + подпись) был вручную
 * скопирован в семь экранов с разными отступами и размерами картинки, а часть
 * списков не показывала вообще ничего — пустой экран без объяснений.
 */
const EmptyState = ({
  title,
  description,
  image,
  compact = false,
  style,
  children,
}: Props) => {
  return (
    <View style={[styles.container(compact), style]}>
      {image ? (
        <Image source={image} style={styles.image} contentFit="contain" />
      ) : null}
      <View style={styles.texts}>
        <Typography variant="p1" weight="semiBold" isCentered>
          {title}
        </Typography>
        {description ? (
          <Typography variant="t1" weight="medium" color="secondary" isCentered>
            {description}
          </Typography>
        ) : null}
      </View>
      {children}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create((theme) => ({
  container: (compact: boolean) => ({
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(3),
    paddingHorizontal: theme.spacing(6),
    paddingVertical: compact ? theme.spacing(6) : theme.spacing(10),
  }),
  image: {
    width: 120,
    height: 80,
  },
  texts: {
    gap: theme.spacing(2),
  },
}));
