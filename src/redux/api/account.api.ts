import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: customQuery(BackendURL),
  tagTypes: ["AccountStats", "AccountList", "SingleStats"],
  endpoints: (builder) => ({
    getAccountStats: builder.query<GetAccountStatsResponse, void>({
      query: () => ({
        url: "/account/stats",
        method: "GET",
      }),
      providesTags: ["AccountStats"],
    }),
    getAccountInfo: builder.query<GetAccountInfoResponse, GetAccountDTO>({
      query: (params) => ({
        url: "/account/info",
        method: "GET",
        params,
      }),
      providesTags: ["SingleStats"],
    }),
    getAccountList: builder.query<GetAccountListResponse, GetAccountListRequest>({
      query: (params) => ({
        url: "/account/list",
        method: "GET",
        params,
      }),
      providesTags: ["AccountList"],
    }),
    addAccount: builder.mutation<void, AddAccountRequest>({
      query: (body) => ({
        url: "/account/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AccountStats", "AccountList"],
    }),
    deleteAccounts: builder.mutation<void, RequestWithIDs>({
      query: (body) => ({
        url: "/account/delete",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["AccountStats", "AccountList"],
    }),
    renewAccountsToken: builder.mutation<RenewAccessTokenResponse, RequestWithIDs>({
      query: (body) => ({
        url: "/account/token/gen",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AccountList", "AccountStats"],
    }),
    updateAccountCredentials: builder.mutation<void, UpdateAccountCredentialsRequest>({
      query: (body) => ({
        url: "/account/update/credentials",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SingleStats", "AccountList"],
    }),
  })
})

export const {
  useGetAccountStatsQuery,
  useGetAccountListQuery,
  useAddAccountMutation,
  useDeleteAccountsMutation,
  useRenewAccountsTokenMutation,
  useGetAccountInfoQuery,
  useUpdateAccountCredentialsMutation,
} = accountApi;