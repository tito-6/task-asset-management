import { createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit";

import type { UserSafe } from "@assetmanagement/common-types";

import { authApi } from "./authApi.js";

type AuthState = {
  token: string | null;
  user: UserSafe | null;
};

const readPersistedState = (): AuthState => {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  try {
    const token = window.localStorage.getItem("auth_token");
    const userRaw = window.localStorage.getItem("auth_user");
    const user = userRaw ? (JSON.parse(userRaw) as UserSafe) : null;
    return { token, user };
  } catch (error) {
    console.warn("Failed to read persisted auth state", error);
    return { token: null, user: null };
  }
};

const persistState = (state: AuthState): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (state.token) {
    window.localStorage.setItem("auth_token", state.token);
  } else {
    window.localStorage.removeItem("auth_token");
  }

  if (state.user) {
    window.localStorage.setItem("auth_user", JSON.stringify(state.user));
  } else {
    window.localStorage.removeItem("auth_user");
  }
};

const initialState: AuthState = readPersistedState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state: AuthState) {
      state.token = null;
      state.user = null;
      persistState(state);
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      persistState(state);
    });

    builder.addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      persistState(state);
    });

    builder.addMatcher(authApi.endpoints.me.matchFulfilled, (state, action) => {
      state.user = action.payload.user;
      persistState(state);
    });
  }
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
