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
    getAccountInfo: builder.query<GetAccountInfoResponse, GetAccountRequest>({
      query: (params) => ({
        url: "/account/info",
        method: "GET",
        params,
      }),
      providesTags: ["SingleStats"],
    }),
    getAccountList: builder.query<GetAccountListResponse, QueryRequestWithPage>(
      {
        query: (params) => ({
          url: "/account/list",
          method: "GET",
          params,
        }),
        providesTags: ["AccountList"],
      },
    ),
    getGroupsByAccountID: builder.query<
      GetGroupsByAccountResponse,
      GetGroupsByAccountRequest
    >({
      query: (params) => ({
        url: "/account/group/list",
        method: "GET",
        params,
      }),
      providesTags: ["SingleStats"],
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
    renewAccountsToken: builder.mutation<
      RenewAccessTokenResponse,
      RequestWithIDs
    >({
      query: (body) => ({
        url: "/account/token/gen",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AccountList", "AccountStats"],
    }),
    loginAccount: builder.mutation<void, LoginAccountRequest>({
      query: (body) => ({
        url: "/account/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SingleStats", "AccountList", "AccountStats"],
    }),
    updateAccountCredentials: builder.mutation<
      void,
      UpdateAccountCredentialsRequest
    >({
      query: (body) => ({
        url: "/account/update/credentials",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SingleStats", "AccountList"],
    }),
    addGroup: builder.mutation<void, AddGroupRequest>({
      query: (body) => ({
        url: "/account/group/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SingleStats"],
    }),
    joinGroup: builder.mutation<void, JoinGroupRequest>({
      query: (body) => ({
        url: "/account/group/join",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SingleStats", "AccountList"],
    }),
    deleteGroup: builder.mutation<void, DeleteGroupRequest>({
      query: (body) => ({
        url: "/account/group/delete",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["SingleStats", "AccountList"],
    }),
  }),
});

export const {
  useGetAccountStatsQuery,
  useGetAccountListQuery,
  useGetGroupsByAccountIDQuery,
  useAddAccountMutation,
  useDeleteAccountsMutation,
  useRenewAccountsTokenMutation,
  useLoginAccountMutation,
  useGetAccountInfoQuery,
  useUpdateAccountCredentialsMutation,
  useAddGroupMutation,
  useJoinGroupMutation,
  useDeleteGroupMutation,
} = accountApi;
