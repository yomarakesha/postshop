import { RefreshControl as ReactNativeRefreshControl } from 'react-native-gesture-handler';
import { withUnistyles } from 'react-native-unistyles';

const RefreshControl = withUnistyles(ReactNativeRefreshControl, theme => ({
  progressBackgroundColor: theme.colors.white,
  colors: [theme.colors.blueMain],
  tintColor: theme.colors.blueMain,
}));

export default RefreshControl;
