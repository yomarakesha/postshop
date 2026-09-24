import SuccessIcon from "@assets/icons/orderStatus/success.svg";
import PendingIcon from "@assets/icons/orderStatus/pending.svg";
import CancelledIcon from "@assets/icons/orderStatus/cancelled.svg";
import ProcessingIcon from "@assets/icons/orderStatus/processing.svg";
import ClockIcon from "@assets/icons/clock.svg";
import CheckIcon from "@assets/icons/circle-check.svg";
import PackageCheckIcon from "@assets/icons/package-check.svg";
import { UnistylesThemes } from "react-native-unistyles";

const clientIcons: Record<Order.UIStatus, SvgType> = {
  pending: PendingIcon,
  in_progress: ProcessingIcon,
  cancelled: CancelledIcon,
  done: SuccessIcon,
};

const clientLabelKeys: Record<Order.UIStatus, string> = {
  pending: "client.orders.status.pending",
  in_progress: "client.orders.status.in_progress",
  cancelled: "client.orders.status.cancelled",
  done: "client.orders.status.done",
};

const shopLabelKeys: Record<Order.ShopOrderStatus, string> = {
  pending: "store.orders.status.pending",
  ready_to_take: "store.orders.status.ready_to_take",
  approved: "store.orders.status.approved",
  rejected: "store.orders.status.rejected",
};

const shopIcons: Record<Order.ShopOrderStatus, SvgType> = {
  pending: ClockIcon,
  ready_to_take: PackageCheckIcon,
  approved: CheckIcon,
  rejected: CancelledIcon,
};

const clientStatusMap: Record<Order.StatusCode, Order.UIStatus> = {
  pending: "pending",
  approved: "in_progress",
  ready_to_take: "in_progress",
  ready_to_deliver: "in_progress",
  rejected: "cancelled",
  completed: "done",
};

const getClientIcon = (status: Order.UIStatus | undefined) =>
  status ? clientIcons[status] : undefined
const getClientLabelKey = (status: Order.UIStatus | undefined) =>
  status ? clientLabelKeys[status] : "";

const getShopIcon = (status: Order.ShopOrderStatus | undefined) =>
  status ? shopIcons[status] : undefined
const getShopLabelKey = (status: Order.ShopOrderStatus | undefined) =>
  status ? shopLabelKeys[status] : "";

type AppTheme = UnistylesThemes[keyof UnistylesThemes];

const getShopColor = (
  status: Order.ShopOrderStatus | undefined,
  theme: AppTheme,
) => {
  switch (status) {
    case "pending":
      return theme.colors.warning;
    case "ready_to_take":
      return theme.colors.success;
    case "approved":
      return theme.colors.blueMain;
    case "rejected":
      return theme.colors.failure;
    default:
      return theme.colors.warning;
  }
};

export const orderStatus = {
  client: {
    getIcon: getClientIcon,
    getLabelKey: getClientLabelKey,
    map: clientStatusMap,
  },
  shop: {
    getIcon: getShopIcon,
    getLabelKey: getShopLabelKey,
    getColor: getShopColor,
  },
};
