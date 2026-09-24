import i18n from "@/localization";
import useAppStore from "@/store/useAppStore";
import { useUserStore } from "@/store/useUserStore";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";

export class OfflineError extends Error {
  constructor() {
    super("No internet connection (checked via NetInfo)");
    this.name = "OfflineError";
  }
}

export const getIsOnline = (state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}) => {
  return !!state.isConnected && state.isInternetReachable !== false;
};

const setHasInternetConnection = (value: boolean) => {
  if (useAppStore.getState().hasInternetConnection !== value) {
    useAppStore.getState().setHasInternetConnection(value);
  }
};

const isNetworkError = (error: unknown) => {
  if (error instanceof OfflineError) {
    return true;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
    return true;
  }

  if (error.message === "Network Error") {
    return true;
  }

  if (!error.response) {
    return true;
  }

  return false;
};

let networkToastShown = false;

export const showNetworkToast = () => {
  if (networkToastShown) return;

  networkToastShown = true;

  Toast.show({
    type: "error",
    text1: "Internet ýok",
    text2: "Birikmäňizi barlaň",
    visibilityTime: 4000,
    onHide: () => {
      networkToastShown = false;
    },
  });
};

const handlePossibleNetworkError = async (error: unknown) => {
  if (!isNetworkError(error)) {
    return;
  }

  try {
    const netState = await NetInfo.fetch();
    const online = getIsOnline(netState);
    setHasInternetConnection(online);

    if (!online) {
      if (useAppStore.getState().mode === "client") {
        showNetworkToast();
      }
    }
  } catch (e) {
    // Игнорируем возможные ошибки получения статуса сети при VPN зависании
  }
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

const req = axios.create({
  baseURL: useAppStore.getState().apiUrl || BASE_URL,
  timeout: 8000, // Уменьшено до 8 секунд для более быстрой реакции на обрывы/VPN
  paramsSerializer: {
    indexes: null,
  },
});

export const client = new QueryClient({
  queryCache: new QueryCache({
    onError(error) {
      void handlePossibleNetworkError(error);
    },
  }),

  mutationCache: new MutationCache({
    onError(error) {
      void handlePossibleNetworkError(error);
    },
  }),

  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

useAppStore.subscribe((state) => {
  if (state.apiUrl && req.defaults.baseURL !== state.apiUrl) {
    req.defaults.baseURL = state.apiUrl;
    client.invalidateQueries();
  }
});

req.interceptors.request.use(async (config) => {
  const jwt = useUserStore.getState().jwt;

  config.headers["content-language"] = i18n.language;

  if (jwt?.accessToken) {
    config.headers.Authorization = `Bearer ${jwt.accessToken}`;
  } else {
    delete config.headers.Authorization;
  }

  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }

  try {
    const netState = await NetInfo.fetch();
    if (!getIsOnline(netState)) {
      setHasInternetConnection(false);
      return Promise.reject(new OfflineError());
    }
  } catch (e) {
    // В случае сбоя API NetInfo считаем, что соединение есть и пробуем сделать запрос
  }

  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

req.interceptors.response.use(
  (response) => {
    setHasInternetConnection(true);
    return response;
  },

  async (error) => {
    await handlePossibleNetworkError(error);

    const original = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return req(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = useUserStore.getState().jwt?.refreshToken;

      const res = await axios.post<{
        access_token: string;
        refresh_token: string;
      }>(`${useAppStore.getState().apiUrl || BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const token = res.data.access_token;

      useUserStore.setState({
        jwt: {
          accessToken: token,
          refreshToken: res.data.refresh_token,
        },
      });

      processQueue(null, token);

      original.headers.Authorization = `Bearer ${token}`;
      return req(original);
    } catch (err) {
      processQueue(err, null);

      useUserStore.setState({
        jwt: null,
        user: null,
        isGuest: true,
      });

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default {
  client,
  req,
  BASE_URL,
};