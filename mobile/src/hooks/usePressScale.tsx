import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

/**
 * Отклик на нажатие — ровно как на витрине: `active:scale-[0.97]`
 * (postshop_client/src/shared/ui/Button.tsx). Нажатие подтверждается сразу,
 * пока запрос ещё идёт, и человек не жмёт второй раз.
 */
export const PRESS_SCALE = 0.97;
export const PRESS_DURATION = 120;
/** Отклик для режима «уменьшить движение»: без движения, только прозрачность. */
export const PRESS_OPACITY = 0.8;

/**
 * Живёт отдельно от `ui/Button`, потому что кнопками дело не ограничивается:
 * счётчик «+/−» на странице товара и подобные места собраны из голых
 * `Pressable` и отклика не имели вовсе — нажатие выглядело как промах.
 *
 * Возвращает готовый анимированный стиль и обработчики; вешать их нужно на
 * `Animated.createAnimatedComponent(Pressable)`.
 */
export const usePressScale = (disabled?: boolean) => {
  const reduceMotion = useReducedMotion();
  const isPressed = useSharedValue(false);

  // Элемент часто гасят прямо по нажатию («Сохранить» -> disabled на время
  // запроса). Тогда onPressOut может не прийти, и он залипнет уменьшенным.
  useEffect(() => {
    if (disabled) {
      isPressed.value = false;
    }
  }, [disabled, isPressed]);

  const pressStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      // Набор свойств в обеих ветках одинаковый: Reanimated ругается, если
      // анимированный стиль меняет состав ключей между обновлениями.
      return {
        opacity: isPressed.value ? PRESS_OPACITY : 1,
        transform: [{ scale: 1 }],
      };
    }

    return {
      opacity: 1,
      transform: [
        {
          scale: withTiming(isPressed.value ? PRESS_SCALE : 1, {
            duration: PRESS_DURATION,
            easing: Easing.out(Easing.quad),
          }),
        },
      ],
    };
  });

  return {
    pressStyle,
    onPressIn: () => {
      isPressed.value = true;
    },
    onPressOut: () => {
      isPressed.value = false;
    },
  };
};

export default usePressScale;
