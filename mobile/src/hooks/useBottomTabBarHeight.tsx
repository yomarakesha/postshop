import { useBottomTabBarHeight as useRNBottomTabBarHeight } from "expo-router/js-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const useBottomTabBarHeight = () => {
  const insets = useSafeAreaInsets();
  try {
    return useRNBottomTabBarHeight();
  } catch {
    return insets.bottom;
  }
};

export default useBottomTabBarHeight;
