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
            onPress: () => { },
          },
        ],
        isVisible: true,
      },
      {
        title: t("profile.sections.others"),
        data: [
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
    [language],
  );

  return { links, langSheetRef };
};

export default useProfileLinks;
