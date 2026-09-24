import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from ".";

const useLogin = () => {
  const mutation = useMutation<
    undefined,
    AxiosError<ApiErrorResponse>,
    User.API.LoginBody
  >({
    mutationKey: ["login"],
    mutationFn: async (data) => {
      const response = await api.req({
        method: "POST",
        url: "/auth/otp/request",
        data,
      });

      return response.data;
    },
  });

  return mutation;
};

const useVerify = () => {
  const mutation = useMutation<
    User.API.VerifyResponse,
    AxiosError<ApiErrorResponse>,
    User.API.VerifyBody
  >({
    mutationKey: ["verify"],
    mutationFn: async (data) => {
      const response = await api.req({
        method: "POST",
        url: "/auth/otp/verify",
        data,
      });

      return response.data;
    },
  });

  return mutation;
};

export const authApi = {
  useLogin,
  useVerify,
};
