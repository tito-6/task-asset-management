import { createApi } from "@reduxjs/toolkit/query/react";
import type { AssetSummary } from "@assetmanagement/common-types";

import { baseQuery } from "../../services/baseQuery.js";

type AssetsEndpointBuilder = {
  query<TResult, TQueryArg>(definition: {
    query: (arg: TQueryArg) => {
      url: string;
      method: string;
      body?: unknown;
    };
    providesTags?:
      | Array<{ type: "Assets"; id: string | number }>
      | ((
          result: TResult | undefined,
          error: unknown,
          arg: TQueryArg
        ) => Array<{ type: "Assets"; id: string | number }>);
  }): unknown;
  mutation<TResult, TArg>(definition: {
    query: (arg: TArg) => {
      url: string;
      method: string;
      body?: unknown;
    };
    invalidatesTags?:
      | Array<{ type: "Assets"; id: string | number }>
      | ((
          result: TResult | undefined,
          error: unknown,
          arg: TArg
        ) => Array<{ type: "Assets"; id: string | number }>);
  }): unknown;
};

export type CreateAssetPayload = {
  companyId: number;
  type: string;
  url: string;
  username: string;
  password: string;
  responsibleUserId: number;
  email: string;
  status: string;
  twoFactorStatus: string;
  priority: string;
};

export type UpdateAssetPayload = Partial<CreateAssetPayload> & {
  assetId: number;
};

export type AssetListResponse = {
  assets: AssetSummary[];
};

export type AssetDetailsResponse = {
  asset: AssetSummary & { password: string };
};

export const assetsApi = createApi({
  reducerPath: "assetsApi",
  baseQuery,
  tagTypes: ["Assets"],
  endpoints: (builder: AssetsEndpointBuilder) => ({
    getCompanyAssets: builder.query<AssetListResponse, number>({
      query: (companyId: number) => ({
        url: `/assets/companies/${companyId}`,
        method: "GET"
      }),
      providesTags: (result: AssetListResponse | undefined) =>
        result
          ? [
              ...result.assets.map(({ id }) => ({ type: "Assets" as const, id })),
              { type: "Assets" as const, id: "LIST" }
            ]
          : [{ type: "Assets" as const, id: "LIST" }]
    }),
    createAsset: builder.mutation<AssetSummary, CreateAssetPayload>({
      query: (body: CreateAssetPayload) => ({
        url: "/assets",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "Assets", id: "LIST" }]
    }),
    getAssetDetails: builder.query<AssetDetailsResponse, number>({
      query: (assetId: number) => ({
        url: `/assets/${assetId}`,
        method: "GET"
      }),
      providesTags: (result: AssetDetailsResponse | undefined) =>
        result ? [{ type: "Assets", id: result.asset.id }] : []
    }),
    updateAsset: builder.mutation<AssetSummary, UpdateAssetPayload>({
      query: ({ assetId, ...body }: UpdateAssetPayload) => ({
        url: `/assets/${assetId}`,
        method: "PUT",
        body
      }),
      invalidatesTags: (
        _result: AssetSummary | undefined,
        _error: unknown,
        { assetId }: { assetId: number }
      ) => [{ type: "Assets", id: assetId }, { type: "Assets", id: "LIST" }]
    })
  })
});

export const {
  useGetCompanyAssetsQuery,
  useGetAssetDetailsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation
} = assetsApi;
