import api from "@/api";
import useAppStore from "@/store/useAppStore";

export const getImageUrl = (path: string | null | undefined) => {
  if (!path) {
    return "";
  }
  const apiUrl = useAppStore.getState().apiUrl || api.BASE_URL;
  return apiUrl + "/" + path;
};
