import { createApi } from "@reduxjs/toolkit/query/react";
import { customQuery } from "./custom";
import { BackendURL } from "@/lib/server";

export const dataApi = createApi({
  reducerPath: "dataApi",
  baseQuery: customQuery(BackendURL),
  tagTypes: ["Prompts"],
  endpoints: (builder) => ({
    getDataStats: builder.query<GetDataStatsResponse, void>({
      query: () => ({
        url: "/data/stats",
        method: "GET",
      }),
    }),
    getDataHistory: builder.query<GetDataHistoryResponse, number>({
      query: (categoryId) => ({
        url: `/data/chart/timeseries?category_id=${categoryId}`,
        method: "GET",
      }),
    }),
    getScoreDistribution: builder.query<GetScoreDistributionResponse, number>({
      query: (categoryId) => ({
        url: `/data/chart/scores?category_id=${categoryId}`,
        method: "GET",
      }),
    }),
    getDataSummary: builder.query<GetDataSummaryResponse, number>({
      query: (categoryId) => ({
        url: `/data/chart/dashboard?category_id=${categoryId}`,
        method: "GET",
      }),
    }),
    getAllPrompts: builder.query<GetAllPromptsResponse, QueryRequestWithPage>({
      query: () => ({
        url: "/data/prompt/list",
        method: "GET",
      }),
      providesTags: ["Prompts"],
    }),
    createPrompt: builder.mutation<void, CreatePromptRequest>({
      query: (body) => ({
        url: "/data/prompt/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Prompts"],
    }),
    deletePrompt: builder.mutation<void, DeletePromptRequest>({
      query: (body) => ({
        url: "/data/prompt/delete",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Prompts"],
    }),
    rollbackPrompt: builder.mutation<void, RollbackPromptRequest>({
      query: (body) => ({
        url: "/data/prompt/rollback",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Prompts"],
    }),
    getLogs: builder.query<GetLogsResponse, QueryRequestWithPage>({
      query: (params) => ({
        url: "/data/log/list",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useGetDataStatsQuery,
  useGetDataHistoryQuery,
  useGetScoreDistributionQuery,
  useGetDataSummaryQuery,
  useGetAllPromptsQuery,
  useDeletePromptMutation,
  useRollbackPromptMutation,
  useCreatePromptMutation,
  useGetLogsQuery,
} = dataApi;
