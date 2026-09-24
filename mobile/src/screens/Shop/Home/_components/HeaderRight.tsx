import React from "react";
import Typography from "@/ui/Typography";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  user: User.Item;
  onPressProfile: () => void;
};

const HeaderRight = ({ user, onPressProfile }: Props) => {
  return (
    <Pressable onPress={onPressProfile} style={styles.profile}>
      <Typography weight="medium">
        {user.name?.toLocaleLowerCase().charAt(0).toUpperCase()}
      </Typography>
    </Pressable>
  );
};

export default HeaderRight;

const styles = StyleSheet.create((theme) => ({
  profile: {
    width: 33,
    height: 33,
    borderRadius: 999,
    // Белый кружок пропадал на шапке магазина без своего цвета (она белая).
    backgroundColor: theme.colors.gray2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
}));
