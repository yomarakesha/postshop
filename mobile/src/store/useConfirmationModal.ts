import { create } from "zustand";

export type ConfirmationModalState = {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm?: () => void;
  animation: boolean;
  type: "danger" | "warning" | "success" | "info";
  Icon: SvgType | null;
  confirmTitle?: string;
  cancelTitle?: string;
  okTitle?: string;
};

export const useConfirmationModal = create<ConfirmationModalState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  onConfirm: () => {},
  type: "danger",
  Icon: null,
  animation: false,
}));
