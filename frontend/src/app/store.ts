import type {
  CurriedGetDefaultMiddleware,
  MiddlewareArray
} from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";

import { authApi } from "../features/auth/authApi.js";
import authReducer from "../features/auth/authSlice.js";
import { assetsApi } from "../features/assets/assetsApi.js";
import { tasksApi } from "../features/tasks/tasksApi.js";
import { usersApi } from "../features/users/usersApi.js";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [assetsApi.reducerPath]: assetsApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware: CurriedGetDefaultMiddleware): MiddlewareArray =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      assetsApi.middleware,
      tasksApi.middleware,
      usersApi.middleware
    ) as MiddlewareArray
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
