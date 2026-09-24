import { FC } from "react";
import { SvgProps } from "react-native-svg";
import { useUnistyles } from "react-native-unistyles";

type IconProps = FC<SvgProps & { style?: { color: string } }>;

type Props = {
  focused: boolean;
  color: string;
  size?: number;
};

const DEFAULT_ICON_SIZE = 20;

/**
 * Фабрика иконок для таб-бара.
 *
 * Раньше здесь возвращалась анонимная стрелочная функция, внутри которой
 * вызывался хук `useUnistyles`. Для eslint это был вызов хука внутри колбэка
 * (react-hooks/rules-of-hooks), а для React DevTools — компонент без имени.
 * Теперь фабрика возвращает именованный компонент с displayName: правило
 * хуков соблюдено, и компонент нормально подписан на смену темы.
 */
const TabBarIcon = (Icon: IconProps) => {
  const TabBarIconComponent = ({ focused, size }: Props) => {
    const { theme } = useUnistyles();

    return (
      <Icon
        color={focused ? theme.colors.blueMain : theme.colors.passive1}
        width={size ?? DEFAULT_ICON_SIZE}
        height={size ?? DEFAULT_ICON_SIZE}
      />
    );
  };

  TabBarIconComponent.displayName = `TabBarIcon(${
    Icon.displayName || Icon.name || "Icon"
  })`;

  return TabBarIconComponent;
};

export default TabBarIcon;
