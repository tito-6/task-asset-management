import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { RootState } from "../app/store.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
// eslint-disable-next-line no-console
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL, "Effective API_BASE_URL:", API_BASE_URL);

export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (
    headers: Headers,
    { getState }: { getState: () => unknown }
  ): Headers => {
    const state = getState() as RootState;
    const token = state.auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  }
});
