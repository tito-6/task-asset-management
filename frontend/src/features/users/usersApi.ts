import { createApi } from "@reduxjs/toolkit/query/react";
import type { UserSafe } from "@assetmanagement/common-types";

import { baseQuery } from "../../services/baseQuery.js";

export type CompanyUsersResponse = {
  users: UserSafe[];
};

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getCompanyUsers: builder.query<CompanyUsersResponse, number>({
      query: (companyId) => ({
        url: `/users/companies/${companyId}`,
        method: "GET"
      })
    })
  })
});

export const { useGetCompanyUsersQuery } = usersApi;
