import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: customQuery(BackendURL),
  tagTypes: ["AccountStats", "AccountList"],
  endpoints: (builder) => ({
    getAccountStats: builder.query<GetAccountStatsResponse, void>({
      query: () => ({
        url: "/account/stats",
        method: "GET",
      }),
      providesTags: ["AccountStats"],
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
  })
})

export const {
  useGetAccountStatsQuery,
  useGetAccountListQuery,
  useAddAccountMutation,
} = accountApi;