import { create } from "zustand";

export type ConfirmationModalState = {
  isOpen: boolean;
  title: string;
  description: string;
  /** text — то, что ввели в поле (если поле показано). */
  onConfirm?: (text?: string) => void;
  /**
   * Необязательное поле ввода — например, причина отказа. Без него окно
   * только спрашивает «да / нет».
   */
  inputPlaceholder?: string;
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
