import { useState, useEffect } from "react";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import ActivityIndicator from "@/ui/ActivityIndicator";
import Typography from "@/ui/Typography";

interface Props {
  initialTime: number;
  onResend: () => void;
  isSending?: boolean;
}

const Timer = ({ initialTime, onResend, isSending }: Props) => {
  const [time, setTime] = useState(initialTime);
  const { t } = useTranslation();

  const handleResend = () => {
    if (isSending) return;
    onResend();
    setTime(initialTime);
  };

  useEffect(() => {
    const myInterval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(myInterval);

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(myInterval);
  }, [time]);

  if (time > 0) {
    return (
      <Typography color="secondary" style={styles.row}>
        {String(Math.floor(time / 60)).padStart(2, "0")}:
        {String(time % 60).padStart(2, "0")}
      </Typography>
    );
  }

  if (isSending) {
    return <ActivityIndicator style={styles.indicator} />;
  }

  return (
    <Pressable onPress={handleResend} hitSlop={8} accessibilityRole="button">
      <Typography weight="medium" color="main" style={styles.row}>
        {t("auth.verify.resend")}
      </Typography>
    </Pressable>
  );
};

export default Timer;

const styles = StyleSheet.create((theme) => ({
  // Одинаковая высота у таймера, индикатора и кнопки «отправить снова» —
  // иначе блок с кодом подпрыгивает в момент, когда отсчёт заканчивается.
  row: {
    height: theme.spacing(6),
    textAlignVertical: "center",
  },
  indicator: {
    height: theme.spacing(6),
  },
}));
