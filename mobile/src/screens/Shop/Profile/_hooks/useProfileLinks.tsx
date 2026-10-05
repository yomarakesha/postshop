import { router } from "expo-router";
import { useMemo, useRef } from "react";
import TranslateIcon from "@assets/icons/translate.svg";
import ListChecksIcon from "@assets/icons/list-checks.svg";
import BellSimpleIcon from "@assets/icons/bell-simple-outline.svg";
import SignOut from "@assets/icons/sign-out.svg";
import { useUserStore } from "@/store/useUserStore";
import useAppStore from "@/store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirmationModal } from "@/store/useConfirmationModal";
import useShopStore from "@/store/useShopStore";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { TFunction } from "i18next";
import { langs } from "@/constants/langs";
import DoorOpenIcon from "@assets/icons/door-open.svg";
import StoreFrontIcon from "@assets/icons/store-front.svg";
import PackageCheckIcon from "@assets/icons/package-check.svg";
import CubeIcon from "@assets/icons/cube.svg";
import PlusIcon from "@assets/icons/plus.svg";
import { shopBaseApi } from "@/api/shopBaseApi";
import useFeatures from "@/hooks/useFeatures";
import ErrorAlert from "@/utils/errorAlert";
import Toast from "react-native-toast-message";

type Link = {
  title: string;
  icon: SvgType;
  onPress: () => void;
  isDanger?: boolean;
  value?: string;
};

type Section = {
  title: string;
  data: Link[];
  isVisible: boolean;
};

const useProfileLinks = (t: TFunction, language: AppLang) => {
  const queryClient = useQueryClient();
  const langSheetRef = useRef<TrueSheet>(null);
  const shopBaseId = useShopStore((s) => s.activeShopBaseId);
  const shopBaseQuery = shopBaseApi.useGet(shopBaseId!, {
    enabled: !!shopBaseId,
  });
  const setOpen = shopBaseApi.useSetOpen(shopBaseId!);
  const isClosed = shopBaseQuery.data?.is_active === false;
  // Закрытый платформой магазин владелец не открывает — сервер ответит 403.
  const isClosedByStaff = isClosed && !!shopBaseQuery.data?.blocked_by_staff;
  const shop = useShopStore((s) => s.shop);
  const { fboEnabled } = useFeatures();
  // FBS и FBO — разные способы работы, и у каждого свои разделы, как на
  // витрине. Магазин FBS хранит товар сам: ему «Остатки» и «Приём товара».
  // Магазин FBO держит товар на складе Postshop: ему «Склад» — и только пока
  // платформа принимает товар на хранение.
  const isFbs = shop?.warehouse_type === "fbs";
  const hasWarehouse = fboEnabled && shop?.warehouse_type === "fbo";

  // Закрыть или снова открыть магазин — как на витрине (/my-store/…/close).
  // Закрытый магазин пропадает с витрины, но остаётся у владельца, и открыть
  // его можно здесь же или плашкой на главной кабинета.
  const onToggleOpen = () => {
    const run = (open: boolean) =>
      setOpen.mutate(open, {
        onSuccess: () =>
          Toast.show({
            type: "success",
            text1: t(open ? "store.close.reopened" : "store.close.closed"),
          }),
        // 409 — открытые заказы или незавершённые возвраты: текст сервера
        // английский и со счётчиками, продавцу нужен понятный.
        onError: (error) =>
          error.response?.status === 409
            ? Toast.show({ type: "error", text1: t("store.close.hasOpenWork") })
            : ErrorAlert(t, error),
      });

    if (isClosed) {
      run(true);
      return;
    }
    useConfirmationModal.setState({
      isOpen: true,
      title: t("store.close.confirmTitle"),
      description: t("store.close.confirmText"),
      confirmTitle: t("store.close.confirm"),
      cancelTitle: t("store.close.cancel"),
      type: "danger",
      Icon: DoorOpenIcon,
      onConfirm: () => run(false),
    });
  };

  const handleLangChange = () => {
    langSheetRef.current?.present();
  };

  const onLogOut = () => {
    useConfirmationModal.setState({
      isOpen: true,
      title: t("profile.logoutConfirm.title"),
      description: t("profile.logoutConfirm.description"),
      confirmTitle: t("common.yes"),
      cancelTitle: t("common.no"),
      type: "danger",
      Icon: SignOut,
      onConfirm: () => {
        useUserStore.setState({
          jwt: null,
          user: null,
          isGuest: true,
        });
        useShopStore.setState({
          activeShopBaseId: null,
          shop: null,
        });
        useAppStore.setState({ mode: "client" });
        queryClient.clear();
      },
    });
  };

  const links = useMemo<Section[]>(
    () => [
      {
        title: t("profile.sections.settings"),
        data: [
          {
            title: t("profile.links.language"),
            icon: TranslateIcon,
            onPress: handleLangChange,
            value: langs.find((l) => l.key === language)?.value,
          },
          {
            title: t("profile.links.termsOfUse"),
            icon: ListChecksIcon,
            onPress: () => router.push("/(legal)/terms-of-use"),
          },
          {
            title: t("profile.links.notifications"),
            icon: BellSimpleIcon,
            onPress: () => {},
          },
        ],
        isVisible: true,
      },
      {
        title: t("profile.sections.others"),
        data: [
          ...(isFbs
            ? [
                {
                  title: t("store.stock.title"),
                  icon: CubeIcon,
                  onPress: () => router.push("/(shop-tabs)/(profile)/stock"),
                },
                {
                  title: t("store.intake.title"),
                  icon: PlusIcon,
                  onPress: () => router.push("/(shop-tabs)/(profile)/intake"),
                },
              ]
            : []),
          ...(hasWarehouse
            ? [
                {
                  title: t("store.warehouse.title"),
                  icon: PackageCheckIcon,
                  onPress: () =>
                    router.push("/(shop-tabs)/(profile)/warehouse"),
                },
              ]
            : []),
          {
            title: t("store.returns.title"),
            icon: PackageCheckIcon,
            onPress: () => router.push("/(shop-tabs)/(profile)/returns"),
          },
          ...(isClosedByStaff
            ? []
            : [
                {
                  title: t(isClosed ? "store.close.reopen" : "store.close.close"),
                  icon: StoreFrontIcon,
                  onPress: onToggleOpen,
                  isDanger: !isClosed,
                },
              ]),
          {
            title: t("profile.links.logout"),
            icon: SignOut,
            onPress: onLogOut,
            isDanger: true,
          },
          // {
          //   title: t("profile.links.deleteAccount"),
          //   icon: TrashIcon,
          //   onPress: () => { },
          //   isDanger: true,
          // },
        ],
        isVisible: true,
      },
    ],
    [language, isClosed, isClosedByStaff, isFbs, hasWarehouse],
  );

  return { links, langSheetRef };
};

export default useProfileLinks;
