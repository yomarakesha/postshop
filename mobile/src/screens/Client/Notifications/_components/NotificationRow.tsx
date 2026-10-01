import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Typography from "@/ui/Typography";
import CloseIcon from "@assets/icons/close.svg";
import { TFunction } from "i18next";
import { STATUS_COMMENT_KINDS } from "@/utils/notificationTarget";
import { orderStatus } from "@/utils/orderStatus";
import { formatApiDate } from "@/utils/formatDate";

type Props = {
  data: Notification.Item;
  /** Есть ли куда вести: без адреса строка не выглядит нажимаемой. */
  hasTarget: boolean;
  onPress: () => void;
  onDismiss: () => void;
  language: string;
  t: TFunction;
};

/**
 * Одно уведомление.
 *
 * Непрочитанное отличается фоном, а не точкой сбоку: точку легко не заметить,
 * а список читается сверху вниз одним взглядом.
 */
const NotificationRow = ({
  data,
  hasTarget,
  onPress,
  onDismiss,
  language,
  t,
}: Props) => {
  // У части видов в comment лежит код статуса заказа («ready_to_deliver»), а
  // не текст человека. Переводить его напрямую нельзя — на экран попал бы сам
  // ключ. Подпись та же, что в «Моих заказах», но способа получения в
  // уведомлении нет, поэтому последние шаги нейтральные: «Готов к получению»
  // вместо «Ждёт в пункте выдачи» / «Передан в доставку».
  const statusLabelKey =
    data.comment && data.comment in orderStatus.client.map
      ? orderStatus.buyer.getLabelKey(data.comment as Order.StatusCode, null)
      : "";

  const detail = data.comment
    ? STATUS_COMMENT_KINDS.has(data.kind)
      ? statusLabelKey
        ? t(statusLabelKey)
        : null
      : data.comment
    : null;

  // Без даты лучше пустая строка, чем 01.01.1970: у старых уведомлений
  // сервер отдаёт created_at пустым.
  // Время — по Ашхабаду, а не по поясу телефона (см. utils/formatDate).
  const date = formatApiDate(data.created_at, language, {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <View style={styles.container(data.is_read)}>
      <Pressable
        style={styles.main}
        onPress={onPress}
        disabled={!hasTarget && data.is_read}
      >
        <Typography variant="p3" weight="medium">
          {t(`notifications.kind.${data.kind}`)}
        </Typography>
        {detail ? (
          <Typography variant="t1" color="secondary">
            {detail}
          </Typography>
        ) : null}
        <Typography variant="t2" color="tertiary">
          {date}
        </Typography>
      </Pressable>

      {/* Крестик — сосед основной области, а не её содержимое: вложенное
          нажатие внутри нажатия достаётся то одному, то другому. */}
      <Pressable
        onPress={onDismiss}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t("notifications.dismiss")}
        style={styles.dismiss}
      >
        <CloseIcon width={16} height={16} style={styles.dismissIcon} />
      </Pressable>
    </View>
  );
};

export default NotificationRow;

const styles = StyleSheet.create((theme) => ({
  container: (isRead: boolean) => ({
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing(2),
    padding: theme.spacing(4),
    borderRadius: theme.radius.base,
    backgroundColor: isRead ? theme.colors.white : theme.colors.blue1,
  }),
  main: {
    flex: 1,
    gap: theme.spacing(1),
  },
  dismiss: {
    padding: theme.spacing(1),
  },
  dismissIcon: {
    color: theme.colors.passive2,
  },
}));
