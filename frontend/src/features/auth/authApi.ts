import { createApi } from "@reduxjs/toolkit/query/react";

import type { LoginResponse, UserSafe } from "@assetmanagement/common-types";

import { baseQuery } from "../../services/baseQuery.js";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
  phone: string;
  role?: string;
  companyId: number;
};

export type MeResponse = {
  user: UserSafe;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body
      })
    }),
    register: builder.mutation<LoginResponse, RegisterPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body
      })
    }),
    me: builder.query<MeResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET"
      })
    })
  })
});

export const { useLoginMutation, useRegisterMutation, useMeQuery } = authApi;
